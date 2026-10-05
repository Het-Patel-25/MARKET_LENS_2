const express = require('express');
const router = express.Router();
const axios = require('axios');

// ── Fallback article pool ─────────────────────────────────────────────────────
const FALLBACK_ARTICLES = [
  {
    id: 'ml-1',
    title: 'NVIDIA Announces Major AI Infrastructure Expansion',
    description: 'Nvidia Corp. plans to expand its global data center footprint by partnering with leading regional telecom operators.',
    source: 'Reuters',
    url: 'https://reuters.com',
    publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    category: 'Technology',
    sentiment: 'positive',
    symbols: ['NVDA'],
  },
  {
    id: 'ml-2',
    title: 'Fed Signals Potential Rate Cut as Inflation Cools',
    description: 'Federal Reserve officials indicated they may lower borrowing costs if inflation continues returning to the 2% target.',
    source: 'Bloomberg',
    url: 'https://bloomberg.com',
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    category: 'Economy',
    sentiment: 'neutral',
    symbols: [],
  },
  {
    id: 'ml-3',
    title: 'Bitcoin Surges Past Key Resistance Level',
    description: 'BTC broke out of its month-long consolidation range amid strong institutional buying pressure.',
    source: 'CoinDesk',
    url: 'https://coindesk.com',
    publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    category: 'Crypto',
    sentiment: 'positive',
    symbols: ['BTC/USD'],
  },
  {
    id: 'ml-4',
    title: 'Global Markets Dip Amid Geopolitical Tensions',
    description: 'Equities slid across Asia and Europe as investors fled to safe-haven assets like gold.',
    source: 'WSJ',
    url: 'https://wsj.com',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    category: 'Markets',
    sentiment: 'negative',
    symbols: ['GOLD'],
  },
  {
    id: 'ml-5',
    title: 'Apple Reports Record Services Revenue in Q3',
    description: 'Apple Inc. posted services revenue of $24.2B, beating analyst forecasts by 8%.',
    source: 'CNBC',
    url: 'https://cnbc.com',
    publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    category: 'Earnings',
    sentiment: 'positive',
    symbols: ['AAPL'],
  },
  {
    id: 'ml-6',
    title: 'EUR/USD Hits 3-Month High on Dollar Weakness',
    description: 'The euro gained ground as weak US jobs data weighed on the dollar index.',
    source: 'FX Street',
    url: 'https://fxstreet.com',
    publishedAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    category: 'Forex',
    sentiment: 'neutral',
    symbols: ['EUR/USD'],
  },
  {
    id: 'ml-7',
    title: 'Ethereum ETF Inflows Hit $500M in Single Day',
    description: 'Spot Ethereum ETFs recorded their strongest single-day inflows since launch.',
    source: 'The Block',
    url: 'https://theblock.co',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    category: 'Crypto',
    sentiment: 'positive',
    symbols: ['ETH/USD'],
  },
  {
    id: 'ml-8',
    title: 'Tesla Cybertruck Production Ramp Faces New Delays',
    description: 'Supply chain disruptions in battery cell production have pushed Cybertruck deliveries back by six weeks.',
    source: 'Electrek',
    url: 'https://electrek.co',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    category: 'Automotive',
    sentiment: 'negative',
    symbols: ['TSLA'],
  },
];

const TRENDING = [
  { symbol: 'NVDA',    mentions: 128, sentiment: 'Bullish' },
  { symbol: 'BTC/USD', mentions: 96,  sentiment: 'Neutral' },
  { symbol: 'TSLA',    mentions: 81,  sentiment: 'Bearish' },
  { symbol: 'AAPL',    mentions: 64,  sentiment: 'Bullish' },
  { symbol: 'ETH/USD', mentions: 45,  sentiment: 'Bullish' },
];

// ── Helper: try NewsAPI, fall back to pool ────────────────────────────────────
async function fetchFromNewsAPI(queryParams) {
  const key = process.env.NEWS_API_KEY;
  if (!key) throw new Error('No NEWS_API_KEY');

  const q = queryParams.get('search') || queryParams.get('market') || 'finance market stocks';
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&pageSize=20&apiKey=${key}`;
  const { data } = await axios.get(url, { timeout: 5000 });

  return (data.articles || []).map((a, i) => ({
    id: `na-${i}`,
    title: a.title,
    description: a.description,
    source: a.source?.name || 'NewsAPI',
    url: a.url,
    imageUrl: a.urlToImage,
    publishedAt: a.publishedAt,
    category: queryParams.get('category') || 'Markets',
    sentiment: 'neutral',
    symbols: [],
  }));
}

/**
 * GET /api/news
 * Optional: ?search=&category=&market=
 */
router.get('/', async (req, res) => {
  try {
    const qp = new URLSearchParams(req.query);
    let articles;
    try {
      articles = await fetchFromNewsAPI(qp);
    } catch {
      articles = [...FALLBACK_ARTICLES];
    }

    // Local category / market filter on fallback pool
    const category = req.query.category;
    const market = req.query.market;
    const search = req.query.search?.toLowerCase();

    if (category && category !== 'All') articles = articles.filter((a) => a.category === category);
    if (market && market !== 'All') {
      articles = articles.filter((a) =>
        a.symbols?.some((s) => {
          if (market === 'Crypto') return s.includes('/USD') && ['BTC', 'ETH', 'SOL', 'XRP', 'BNB', 'ADA'].some((c) => s.startsWith(c));
          if (market === 'Forex') return s.includes('/') && !['BTC','ETH','SOL','XRP','BNB','ADA'].some((c) => s.startsWith(c));
          return true;
        })
      );
    }
    if (search) articles = articles.filter((a) => a.title?.toLowerCase().includes(search) || a.description?.toLowerCase().includes(search));

    res.json({ success: true, data: articles, count: articles.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/news/trending
 */
router.get('/trending', (_req, res) => {
  res.json({ success: true, data: TRENDING });
});

/**
 * GET /api/news/sentiment
 */
router.get('/sentiment', (_req, res) => {
  res.json({ success: true, data: { bullish: 47, neutral: 31, bearish: 22 } });
});

module.exports = router;
