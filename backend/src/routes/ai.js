const express = require('express');
const router = express.Router();

// ── Canned AI responses for common financial queries ──────────────────────────
const CANNED = [
  {
    keywords: ['rsi', 'oversold'],
    response: 'Assets with RSI below 30 are considered oversold. Use the screener with RSI Max = 30 to find them. Consider combining with volume confirmation before entering a position.',
  },
  {
    keywords: ['sma', 'golden cross', 'moving average'],
    response: 'A Golden Cross occurs when the 50-day SMA crosses above the 200-day SMA — a classic bullish signal. Use the Screener → SMA Signal = "Above SMA 20" filter as a starting point.',
  },
  {
    keywords: ['bitcoin', 'btc'],
    response: 'Bitcoin is currently the dominant cryptocurrency by market cap. Watch for resistance around psychological levels ($100K, $150K). Institutions continue to accumulate via spot ETFs.',
  },
  {
    keywords: ['nvda', 'nvidia'],
    response: 'NVIDIA remains a top AI infrastructure play. Its data-center revenue grew 400%+ YoY driven by H100/H200 GPU demand. Key risk: export controls and valuation at ~35× forward sales.',
  },
  {
    keywords: ['screener', 'filter', 'find stocks'],
    response: 'Use the Screener module to filter by RSI, SMA crossover, volume ratio and P/E. Combine RSI < 40 + Price > SMA20 for a momentum-reversal setup, or RSI > 60 + Volume Ratio > 1.5 for breakout candidates.',
  },
  {
    keywords: ['forex', 'eur', 'usd', 'gbp'],
    response: 'Forex pairs are influenced by interest rate differentials, macro data (CPI, NFP) and central bank guidance. Watch Fed vs ECB divergence for EUR/USD direction.',
  },
  {
    keywords: ['portfolio', 'diversify', 'allocation'],
    response: 'A balanced portfolio typically allocates 60-70% to equities, 10-20% to crypto, and 10-20% to cash/bonds. Use the Portfolio module to track your current exposure and P&L.',
  },
];

function generateResponse(query) {
  const lower = query.toLowerCase();
  for (const entry of CANNED) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return `Based on your query: "${query}" — I recommend reviewing the Screener for technical signals, checking the News feed for sentiment, and using the Economic Calendar for upcoming macro events that may impact volatility. Always apply proper risk management.`;
}

/**
 * POST /api/ai/query
 * Body: { query: string }
 * Returns: { success: true, data: { response: string, timestamp: string } }
 */
router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'query field is required' });
    }

    // If a Gemini or OpenAI key is configured, proxy to the LLM
    if (process.env.GEMINI_API_KEY) {
      try {
        const { default: axios } = await import('axios');
        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `You are MarketLens AI, a professional financial market assistant. Answer concisely and practically.\n\nUser: ${query}`,
                  },
                ],
              },
            ],
          },
          { timeout: 15000 }
        );
        const text = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return res.json({ success: true, data: { response: text, timestamp: new Date().toISOString(), source: 'gemini' } });
        }
      } catch (llmErr) {
        console.warn('Gemini API failed, falling back to canned response:', llmErr.message);
      }
    }

    // Canned / rule-based fallback
    const response = generateResponse(query);
    res.json({ success: true, data: { response, timestamp: new Date().toISOString(), source: 'local' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
