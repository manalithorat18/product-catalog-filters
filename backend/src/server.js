require('dotenv').config();
const createApp = require('./app');
const { seed } = require('./db/seed');
const db = require('./db/connection');

const PORT = process.env.PORT || 4000;

// Auto-seed on first boot so `npm start` works out of the box on a fresh
// clone with an empty database, without requiring a separate manual step.
const productCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
if (productCount === 0) {
  console.log('No products found — seeding mock catalog...');
  seed();
}

const app = createApp();

app.listen(PORT, () => {
  console.log(`Product Catalog API listening on http://localhost:${PORT}`);
});
