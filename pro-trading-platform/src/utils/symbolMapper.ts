export function getTradingViewSymbol(market: string, exchange: string, symbol: string): string {
  // Normalize internal DB symbols to TradingView symbols
  
  if (market === 'crypto') {
    // For crypto, it's usually BINANCE:BTCUSDT
    return `BINANCE:${symbol.replace('-', '')}T`; // e.g. BTC-USD -> BINANCE:BTCUSDT
  }
  
  if (market === 'forex') {
    // e.g. EURUSD=X -> FX:EURUSD
    return `FX:${symbol.replace('=X', '')}`;
  }

  if (market === 'metal') {
    // e.g. GC=F -> COMEX:GC1! (Gold futures continuous)
    if (symbol === 'GC=F') return 'COMEX:GC1!';
    if (symbol === 'SI=F') return 'COMEX:SI1!';
    return `COMEX:${symbol}`;
  }

  // Default equities (e.g. NSE)
  // e.g. RELIANCE.NS -> NSE:RELIANCE
  const ticker = symbol.split('.')[0];
  if (exchange) {
    return `${exchange}:${ticker}`;
  }
  
  return ticker;
}
