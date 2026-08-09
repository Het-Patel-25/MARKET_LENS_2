const router = require('express').Router();
const pool = require('../db/pool');
const { computeAndStoreIndicators } = require('../services/marketData');

// POST /api/screener/run
router.post('/run', async (req, res) => {
  try {
    const { market, exchange, filters } = req.body;

    // Get matching assets
    let assetQuery = 'SELECT * FROM assets WHERE 1=1';
    const assetParams = [];
    if (market) { 
      // Map 'INDIA' to 'equity' for backwards compatibility or match exactly
      const mType = market === 'INDIA' ? 'equity' : market.toLowerCase();
      assetQuery += ' AND market_type = ?'; 
      assetParams.push(mType); 
    }
    if (exchange) {
      assetQuery += ' AND exchange = ?';
      assetParams.push(exchange);
    }
    const [assets] = await pool.query(assetQuery, assetParams);

    const results = [];
    for (const asset of assets) {
      const ind = await computeAndStoreIndicators(asset.symbol);
      if (!ind) continue;
      
      let passed = true;
      if (filters && Array.isArray(filters)) {
        for (const f of filters) {
          let fieldVal;
          if (f.indicator === 'RSI') fieldVal = ind.rsi_14;
          else if (f.indicator === 'SMA_20') fieldVal = ind.sma_20;
          else if (f.indicator === 'SMA_50') fieldVal = ind.sma_50;
          else if (f.indicator === 'RELATIVE_VOLUME') fieldVal = ind.volume_ratio;
          else if (f.indicator === 'PE') fieldVal = ind.pe_ratio;
          else if (f.indicator === 'PRICE') fieldVal = ind.close_price;
          
          if (fieldVal === undefined || fieldVal === null) {
            passed = false;
            break;
          }

          if (f.operator === '>') {
            if (!(fieldVal > f.value)) { passed = false; break; }
          } else if (f.operator === '<') {
            if (!(fieldVal < f.value)) { passed = false; break; }
          } else if (f.operator === '>=') {
            if (!(fieldVal >= f.value)) { passed = false; break; }
          } else if (f.operator === '<=') {
            if (!(fieldVal <= f.value)) { passed = false; break; }
          } else if (f.operator === '==') {
            if (!(fieldVal == f.value)) { passed = false; break; }
          }
        }
      }

      if (passed) {
        results.push({ ...asset, ...ind });
      }
    }

    res.json({ count: results.length, results });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/screener/presets — user saved presets (auth optional)
router.get('/presets', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json([]);
    const jwt = require('jsonwebtoken');
    const { id } = jwt.verify(token, process.env.JWT_SECRET || 'marketlens_secret');
    const [rows] = await pool.query('SELECT * FROM filter_presets WHERE user_id = ?', [id]);
    res.json(rows);
  } catch { res.json([]); }
});

// POST /api/screener/presets
router.post('/presets', require('../middleware/auth'), async (req, res) => {
  try {
    const { name, filters } = req.body;
    await pool.query(
      'INSERT INTO filter_presets (user_id, name, filters) VALUES (?, ?, ?)',
      [req.user.id, name, JSON.stringify(filters)]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
