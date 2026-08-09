CREATE DATABASE IF NOT EXISTS marketlens;
USE marketlens;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255),
  market_type ENUM('equity','forex','crypto','metal') NOT NULL,
  exchange VARCHAR(50),
  currency VARCHAR(10) DEFAULT 'INR'
);

CREATE TABLE IF NOT EXISTS ohlcv (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL,
  fetched_at DATETIME NOT NULL,
  open_price DECIMAL(20,6),
  high_price DECIMAL(20,6),
  low_price DECIMAL(20,6),
  close_price DECIMAL(20,6),
  volume BIGINT,
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  UNIQUE KEY unique_asset_time (asset_id, fetched_at)
);

CREATE TABLE IF NOT EXISTS indicators (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL,
  date DATE NOT NULL,
  rsi_14 DECIMAL(10,4),
  sma_20 DECIMAL(20,6),
  sma_50 DECIMAL(20,6),
  volume_ratio DECIMAL(10,4),
  pe_ratio DECIMAL(10,4),
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  UNIQUE KEY unique_asset_date (asset_id, date)
);

CREATE TABLE IF NOT EXISTS risk_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL,
  computed_at DATETIME NOT NULL,
  beta DECIMAL(10,4),
  idio_risk DECIMAL(10,4),
  volatility_30d DECIMAL(10,4),
  max_drawdown DECIMAL(10,4),
  risk_label ENUM('Low','Medium','High'),
  FOREIGN KEY (asset_id) REFERENCES assets(id)
);

CREATE TABLE IF NOT EXISTS watchlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  asset_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  UNIQUE KEY unique_watch (user_id, asset_id)
);

CREATE TABLE IF NOT EXISTS filter_presets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255),
  filters JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS nl_query_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  raw_query TEXT,
  parsed_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed assets
INSERT IGNORE INTO assets (symbol, name, market_type, exchange, currency) VALUES
('RELIANCE.NS','Reliance Industries','equity','NSE','INR'),
('TCS.NS','Tata Consultancy Services','equity','NSE','INR'),
('INFY.NS','Infosys','equity','NSE','INR'),
('HDFCBANK.NS','HDFC Bank','equity','NSE','INR'),
('ICICIBANK.NS','ICICI Bank','equity','NSE','INR'),
('WIPRO.NS','Wipro','equity','NSE','INR'),
('BAJFINANCE.NS','Bajaj Finance','equity','NSE','INR'),
('SBIN.NS','State Bank of India','equity','NSE','INR'),
('ADANIENT.NS','Adani Enterprises','equity','NSE','INR'),
('HINDUNILVR.NS','Hindustan Unilever','equity','NSE','INR'),
('EURINR=X','EUR/INR','forex','FOREX','INR'),
('USDINR=X','USD/INR','forex','FOREX','INR'),
('GBPINR=X','GBP/INR','forex','FOREX','INR'),
('JPYINR=X','JPY/INR','forex','FOREX','INR'),
('BTC-USD','Bitcoin','crypto','CRYPTO','USD'),
('ETH-USD','Ethereum','crypto','CRYPTO','USD'),
('SOL-USD','Solana','crypto','CRYPTO','USD'),
('BNB-USD','BNB','crypto','CRYPTO','USD'),
('GC=F','Gold Futures','metal','COMEX','USD'),
('SI=F','Silver Futures','metal','COMEX','USD');
