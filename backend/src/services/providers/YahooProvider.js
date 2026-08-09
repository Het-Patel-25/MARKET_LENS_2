const BaseProvider = require('./BaseProvider');
const axios = require('axios');

class YahooProvider extends BaseProvider {
  async getOHLCV(symbol, range = '3mo', interval = '1d') {
    const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
    try {
      const url = `${YAHOO_BASE}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
      const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
      const result = data.chart.result[0];
      const timestamps = result.timestamp;
      const q = result.indicators.quote[0];
      const rows = timestamps.map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        open: q.open[i], high: q.high[i], low: q.low[i],
        close: q.close[i], volume: q.volume[i] || 0,
      })).filter(r => r.close != null);
      return rows;
    } catch (e) {
      console.error(`Yahoo fetch failed for ${symbol}:`, e.message);
      return [];
    }
  }
}
module.exports = YahooProvider;
