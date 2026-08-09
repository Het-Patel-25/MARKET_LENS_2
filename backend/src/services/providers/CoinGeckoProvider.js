const BaseProvider = require('./BaseProvider');
const axios = require('axios');

const CRYPTO_IDS = {
  'BTC-USD': 'bitcoin', 'ETH-USD': 'ethereum',
  'SOL-USD': 'solana',  'BNB-USD': 'binancecoin',
};

class CoinGeckoProvider extends BaseProvider {
  async getOHLCV(symbol, days = 90) {
    const coinId = CRYPTO_IDS[symbol];
    if (!coinId) return [];
    try {
      const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;
      const { data } = await axios.get(url, { timeout: 10000 });
      return data.map(([ts, open, high, low, close]) => ({
        date: new Date(ts).toISOString().split('T')[0],
        open, high, low, close, volume: 0,
      }));
    } catch (e) {
      console.error(`CoinGecko fetch failed for ${symbol}:`, e.message);
      return [];
    }
  }
}
module.exports = CoinGeckoProvider;
