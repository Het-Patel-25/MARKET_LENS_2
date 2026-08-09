const axios = require('axios');
const pool = require('../db/pool');
const { rsi, sma, volumeRatio, dailyReturns, volatility, maxDrawdown, beta } = require('../utils/indicators');
const parquet = require('parquetjs-lite');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MarketDataFactory = require('./providers/MarketDataFactory');



async function getOrFetchOHLCV(symbol, marketType) {
  // Check cache first (last 3 months in DB)
  const [rows] = await pool.query(
    `SELECT o.*, a.id as asset_id FROM ohlcv o
     JOIN assets a ON a.id = o.asset_id
     WHERE a.symbol = ? ORDER BY o.fetched_at DESC LIMIT 90`,
    [symbol]
  );
  if (rows.length > 10) return rows.reverse();

  // Fetch fresh
  let freshRows = [];
  try {
    const provider = MarketDataFactory.getProvider(marketType);
    freshRows = await provider.getOHLCV(symbol);
  } catch (e) {
    console.error(`Fetch failed for ${symbol}, trying Parquet fallback...`);
  }

  const parquetFile = path.join(DATA_DIR, `cache_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}.parquet`);

  // Fallback to Parquet if fetch failed or returned empty
  if (!freshRows.length && fs.existsSync(parquetFile)) {
    try {
      let reader = await parquet.ParquetReader.openFile(parquetFile);
      let cursor = reader.getCursor();
      let record = null;
      while (record = await cursor.next()) {
        freshRows.push(record);
      }
      await reader.close();
      console.log(`Loaded ${freshRows.length} rows for ${symbol} from Parquet cache`);
    } catch (e) {
      console.error(`Failed to read Parquet cache for ${symbol}:`, e.message);
    }
  }

  if (!freshRows.length) return [];

  // Save to Parquet cache for future fallback
  try {
    const schema = new parquet.ParquetSchema({
      date: { type: 'UTF8' },
      open: { type: 'DOUBLE' },
      high: { type: 'DOUBLE' },
      low: { type: 'DOUBLE' },
      close: { type: 'DOUBLE' },
      volume: { type: 'DOUBLE' }
    });
    const writer = await parquet.ParquetWriter.openFile(schema, parquetFile);
    for (const r of freshRows) {
      await writer.appendRow({
        date: String(r.date || r.fetched_at),
        open: Number(r.open || r.open_price),
        high: Number(r.high || r.high_price),
        low: Number(r.low || r.low_price),
        close: Number(r.close || r.close_price),
        volume: Number(r.volume || 0)
      });
    }
    await writer.close();
  } catch (e) {
    console.error(`Failed to write Parquet cache for ${symbol}:`, e.message);
  }

  // Get asset_id
  const [[asset]] = await pool.query('SELECT id FROM assets WHERE symbol = ?', [symbol]);
  if (!asset) return [];

  // Upsert
  for (const r of freshRows) {
    await pool.query(
      `INSERT INTO ohlcv (asset_id, fetched_at, open_price, high_price, low_price, close_price, volume)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE close_price=VALUES(close_price)`,
      [asset.id, r.date || r.fetched_at, r.open || r.open_price, r.high || r.high_price, r.low || r.low_price, r.close || r.close_price, r.volume]
    );
  }
  return freshRows;
}

async function computeAndStoreIndicators(symbol) {
  const ohlcv = await getOrFetchOHLCV(symbol, '');
  if (ohlcv.length < 20) return null;

  const closes = ohlcv.map(r => parseFloat(r.close_price || r.close));
  const volumes = ohlcv.map(r => parseFloat(r.volume || 0));

  const indicators = {
    rsi_14: rsi(closes),
    sma_20: sma(closes, 20),
    sma_50: sma(closes, 50),
    volume_ratio: volumeRatio(volumes),
  };

  const [[asset]] = await pool.query('SELECT id FROM assets WHERE symbol = ?', [symbol]);
  if (!asset) return indicators;

  const today = new Date().toISOString().split('T')[0];
  await pool.query(
    `INSERT INTO indicators (asset_id, date, rsi_14, sma_20, sma_50, volume_ratio)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE rsi_14=VALUES(rsi_14), sma_20=VALUES(sma_20),
     sma_50=VALUES(sma_50), volume_ratio=VALUES(volume_ratio)`,
    [asset.id, today, indicators.rsi_14, indicators.sma_20, indicators.sma_50, indicators.volume_ratio]
  );

  return indicators;
}

async function computeRisk(symbol) {
  const ohlcv = await getOrFetchOHLCV(symbol, '');
  if (ohlcv.length < 30) return null;

  const closes = ohlcv.map(r => parseFloat(r.close_price || r.close));
  // Use Nifty 50 as benchmark
  const provider = MarketDataFactory.getProvider('equity');
  const benchRows = await provider.getOHLCV('^NSEI', '3mo', '1d');
  const benchCloses = benchRows.map(r => r.close);

  const assetRet = dailyReturns(closes);
  const benchRet = dailyReturns(benchCloses);

  let b, vol, dd, risk_label, idioRisk;

  try {
    const mlUrl = process.env.ML_URL || 'http://localhost:8000';
    const res = await axios.post(`${mlUrl}/predict/risk`, {
      asset_returns: assetRet,
      benchmark_returns: benchRet
    }, { timeout: 4000 });
    b = res.data.beta;
    vol = res.data.volatility;
    dd = res.data.max_drawdown;
    idioRisk = res.data.idio_risk;
    risk_label = res.data.risk_label;
  } catch (e) {
    console.warn(`[Risk] ML service failed for ${symbol}, falling back to local JS calculation:`, e.message);
    b = beta(assetRet, benchRet);
    vol = volatility(closes);
    dd = maxDrawdown(closes);
    idioRisk = 0; // Local fallback doesn't have idio_risk implementation
    risk_label = vol > 40 ? 'High' : vol > 20 ? 'Medium' : 'Low';
  }

  const [[asset]] = await pool.query('SELECT id FROM assets WHERE symbol = ?', [symbol]);
  if (asset) {
    await pool.query(
      `INSERT INTO risk_scores (asset_id, computed_at, beta, idio_risk, volatility_30d, max_drawdown, risk_label)
       VALUES (?, NOW(), ?, ?, ?, ?, ?)`,
      [asset.id, b, idioRisk, vol, dd, risk_label]
    );
  }
  return { beta: b, volatility: vol, maxDrawdown: dd, idio_risk: idioRisk, risk_label };
}

async function getAllAssets() {
  const [rows] = await pool.query('SELECT * FROM assets ORDER BY market_type, symbol');
  return rows;
}

module.exports = { getOrFetchOHLCV, computeAndStoreIndicators, computeRisk, getAllAssets };
