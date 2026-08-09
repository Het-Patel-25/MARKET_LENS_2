const YahooProvider = require('./YahooProvider');
const CoinGeckoProvider = require('./CoinGeckoProvider');

class MarketDataFactory {
  static getProvider(marketType) {
    if (marketType === 'crypto') {
      return new CoinGeckoProvider();
    }
    // Indian, US, Forex, Commodity use Yahoo by default
    return new YahooProvider();
  }
}
module.exports = MarketDataFactory;
