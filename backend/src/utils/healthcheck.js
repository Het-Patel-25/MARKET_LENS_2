/**
 * Utility used by CI healthcheck to verify the module tree loads cleanly.
 * Run: node -e "require('./src/utils/healthcheck'); console.log('Backend healthcheck OK');"
 */

// Verify core route modules are importable
require('../routes/market');
require('../routes/screener');
require('../routes/news');
require('../routes/ai');

module.exports = { ok: true };
