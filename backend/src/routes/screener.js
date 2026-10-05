const express = require('express');
const router = express.Router();

// ── Helpers ───────────────────────────────────────────────────────────────────
function seededRandom(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function computeIndicators(symbol) {
  const seed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const price = +(((seed % 900) + 10) * (1 + (seededRandom(seed) - 0.5) * 0.2)).toFixed(2);
  const rsi = +(30 + seededRandom(seed + 1) * 50).toFixed(1); // 30-80
  const sma20 = +(price * (0.95 + seededRandom(seed + 2) * 0.1)).toFixed(2);
  const sma50 = +(price * (0.90 + seededRandom(seed + 3) * 0.15)).toFixed(2);
  const volume_ratio = +(0.5 + seededRandom(seed + 4) * 2).toFixed(2); // 0.5-2.5
  const pe_ratio = seededRandom(seed + 5) > 0.5 ? +(10 + seededRandom(seed + 6) * 60).toFixed(1) : null;

  return { price, rsi, sma20, sma50, volume_ratio, pe_ratio };
}

// ── Screener asset pool (mirrors market/assets) ───────────────────────────────
const SCREENER_ASSETS = [
  { symbol: 'AAPL',    name: 'Apple Inc.',       market_type: 'Stock',  exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'MSFT',    name: 'Microsoft Corp.',   market_type: 'Stock',  exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'NVDA',    name: 'NVIDIA Corp.',      market_type: 'Stock',  exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'GOOGL',   name: 'Alphabet Inc.',     market_type: 'Stock',  exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'AMZN',    name: 'Amazon.com Inc.',   market_type: 'Stock',  exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'TSLA',    name: 'Tesla Inc.',        market_type: 'Stock',  exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'META',    name: 'Meta Platforms',    market_type: 'Stock',  exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'JPM',     name: 'JPMorgan Chase',    market_type: 'Stock',  exchange: 'NYSE',   currency: 'USD' },
  { symbol: 'BTC/USD', name: 'Bitcoin',           market_type: 'Crypto', exchange: 'Binance', currency: 'USD' },
  { symbol: 'ETH/USD', name: 'Ethereum',          market_type: 'Crypto', exchange: 'Binance', currency: 'USD' },
  { symbol: 'SOL/USD', name: 'Solana',            market_type: 'Crypto', exchange: 'Binance', currency: 'USD' },
  { symbol: 'XRP/USD', name: 'XRP',               market_type: 'Crypto', exchange: 'Binance', currency: 'USD' },
  { symbol: 'EUR/USD', name: 'Euro / USD',         market_type: 'Forex',  exchange: 'FX',     currency: 'USD' },
  { symbol: 'GBP/USD', name: 'Pound / USD',        market_type: 'Forex',  exchange: 'FX',     currency: 'USD' },
];

/**
 * POST /api/screener/run
 * Body: { filters: { market_type, rsi_min, rsi_max, sma_signal, volume_ratio_min, pe_max } }
 */
router.post('/run', (req, res) => {
  const filters = req.body?.filters || {};

  let results = SCREENER_ASSETS.map((asset) => {
    const { price, rsi, sma20, sma50, volume_ratio, pe_ratio } = computeIndicators(asset.symbol);
    return {
      ...asset,
      close_price: price,
      rsi_14: rsi,
      sma_20: sma20,
      sma_50: sma50,
      volume_ratio,
      pe_ratio,
    };
  });

  // ── Apply filters ─────────────────────────────────────────────────────────
  if (filters.market_type && filters.market_type !== 'All') {
    results = results.filter((a) => a.market_type === filters.market_type);
  }
  if (filters.rsi_min !== undefined) {
    results = results.filter((a) => a.rsi_14 >= Number(filters.rsi_min));
  }
  if (filters.rsi_max !== undefined) {
    results = results.filter((a) => a.rsi_14 <= Number(filters.rsi_max));
  }
  if (filters.volume_ratio_min !== undefined) {
    results = results.filter((a) => a.volume_ratio >= Number(filters.volume_ratio_min));
  }
  if (filters.pe_max !== undefined) {
    results = results.filter((a) => a.pe_ratio === null || a.pe_ratio <= Number(filters.pe_max));
  }
  if (filters.sma_signal === 'above') {
    results = results.filter((a) => a.close_price > a.sma_20);
  } else if (filters.sma_signal === 'below') {
    results = results.filter((a) => a.close_price < a.sma_20);
  }

  res.json({ success: true, data: results, count: results.length });
});

/**
 * GET /api/screener/assets
 * Returns all screener assets with computed indicators (no filtering).
 */
router.get('/assets', (_req, res) => {
  const data = SCREENER_ASSETS.map((asset) => {
    const { price, rsi, sma20, sma50, volume_ratio, pe_ratio } = computeIndicators(asset.symbol);
    return { ...asset, close_price: price, rsi_14: rsi, sma_20: sma20, sma_50: sma50, volume_ratio, pe_ratio };
  });
  res.json({ success: true, data, count: data.length });
});

module.exports = router;
