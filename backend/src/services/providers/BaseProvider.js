class BaseProvider {
  async getOHLCV(symbol, days) { throw new Error('Not implemented'); }
  async getQuote(symbol) { throw new Error('Not implemented'); }
}
module.exports = BaseProvider;
