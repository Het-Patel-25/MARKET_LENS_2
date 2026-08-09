const pool = require('./src/db/pool');

const newAssets = [
  // US Equities
  { symbol: 'AAPL', name: 'Apple Inc.', market_type: 'equity', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', market_type: 'equity', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', market_type: 'equity', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla Inc.', market_type: 'equity', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', market_type: 'equity', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', market_type: 'equity', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'META', name: 'Meta Platforms Inc.', market_type: 'equity', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', market_type: 'equity', exchange: 'NYSE', currency: 'USD' },
  
  // Forex
  { symbol: 'EURUSD=X', name: 'EUR/USD', market_type: 'forex', exchange: 'FOREX', currency: 'USD' },
  { symbol: 'GBPUSD=X', name: 'GBP/USD', market_type: 'forex', exchange: 'FOREX', currency: 'USD' },
  { symbol: 'USDJPY=X', name: 'USD/JPY', market_type: 'forex', exchange: 'FOREX', currency: 'JPY' },
  { symbol: 'AUDUSD=X', name: 'AUD/USD', market_type: 'forex', exchange: 'FOREX', currency: 'USD' },
];

async function seed() {
  console.log('Seeding new assets...');
  for (const asset of newAssets) {
    try {
      await pool.query(
        'INSERT IGNORE INTO assets (symbol, name, market_type, exchange, currency) VALUES (?, ?, ?, ?, ?)',
        [asset.symbol, asset.name, asset.market_type, asset.exchange, asset.currency]
      );
      console.log(`Inserted ${asset.symbol}`);
    } catch (e) {
      console.error(`Failed to insert ${asset.symbol}:`, e.message);
    }
  }
  console.log('Done.');
  process.exit(0);
}

seed();
