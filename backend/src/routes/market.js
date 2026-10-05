const express = require('express');
const router = express.Router();

// ── Symbols catalogue ─────────────────────────────────────────────────────────
// A curated list covering stocks, crypto and forex used by the watchlist / screener.
const ASSETS = [
  // ── Stocks ──
  { symbol: 'AAPL',  name: 'Apple Inc.',           market_type: 'Stock',  exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'MSFT',  name: 'Microsoft Corp.',       market_type: 'Stock',  exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'NVDA',  name: 'NVIDIA Corp.',          market_type: 'Stock',  exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.',         market_type: 'Stock',  exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'AMZN',  name: 'Amazon.com Inc.',       market_type: 'Stock',  exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'TSLA',  name: 'Tesla Inc.',            market_type: 'Stock',  exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'META',  name: 'Meta Platforms',        market_type: 'Stock',  exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'JPM',   name: 'JPMorgan Chase',        market_type: 'Stock',  exchange: 'NYSE',   currency: 'USD' },
  { symbol: 'V',     name: 'Visa Inc.',             market_type: 'Stock',  exchange: 'NYSE',   currency: 'USD' },
  { symbol: 'WMT',   name: 'Walmart Inc.',          market_type: 'Stock',  exchange: 'NYSE',   currency: 'USD' },
  // ── Crypto ──
  { symbol: 'BTC/USD', name: 'Bitcoin',            market_type: 'Crypto', exchange: 'Binance', currency: 'USD' },
  { symbol: 'ETH/USD', name: 'Ethereum',           market_type: 'Crypto', exchange: 'Binance', currency: 'USD' },
  { symbol: 'BNB/USD', name: 'BNB',                market_type: 'Crypto', exchange: 'Binance', currency: 'USD' },
  { symbol: 'SOL/USD', name: 'Solana',             market_type: 'Crypto', exchange: 'Binance', currency: 'USD' },
  { symbol: 'XRP/USD', name: 'XRP',                market_type: 'Crypto', exchange: 'Binance', currency: 'USD' },
  { symbol: 'ADA/USD', name: 'Cardano',            market_type: 'Crypto', exchange: 'Binance', currency: 'USD' },
  // ── Forex ──
  { symbol: 'EUR/USD', name: 'Euro / US Dollar',   market_type: 'Forex',  exchange: 'FX',     currency: 'USD' },
  { symbol: 'GBP/USD', name: 'Pound / US Dollar',  market_type: 'Forex',  exchange: 'FX',     currency: 'USD' },
  { symbol: 'USD/JPY', name: 'US Dollar / Yen',    market_type: 'Forex',  exchange: 'FX',     currency: 'JPY' },
  { symbol: 'USD/INR', name: 'US Dollar / Rupee',  market_type: 'Forex',  exchange: 'FX',     currency: 'INR' },
];

/**
 * GET /api/market/assets
 * Optional query params: market_type, exchange, search
 */
router.get('/assets', (req, res) => {
  let results = [...ASSETS];

  if (req.query.market_type) {
    results = results.filter(
      (a) => a.market_type.toLowerCase() === req.query.market_type.toLowerCase()
    );
  }
  if (req.query.exchange) {
    results = results.filter(
      (a) => a.exchange.toLowerCase() === req.query.exchange.toLowerCase()
    );
  }
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    results = results.filter(
      (a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, data: results, count: results.length });
});

/**
 * GET /api/market/quote/:symbol
 * Returns a simulated OHLCV quote for the given symbol.
 */
router.get('/quote/:symbol', (req, res) => {
  const { symbol } = req.params;
  // Seeded random so the same symbol always gives a realistic-ish price
  const seed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const basePrice = (seed % 900) + 10; // $10 – $910
  const change = ((seed % 21) - 10) / 100; // -10% to +10%

  res.json({
    success: true,
    data: {
      symbol,
      price: +(basePrice * (1 + change)).toFixed(2),
      open: +basePrice.toFixed(2),
      high: +(basePrice * (1 + Math.abs(change) + 0.005)).toFixed(2),
      low: +(basePrice * (1 - Math.abs(change) - 0.003)).toFixed(2),
      volume: Math.floor((seed * 12345) % 10_000_000),
      change_pct: +(change * 100).toFixed(2),
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
