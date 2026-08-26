/**
 * Deterministic mock-data seeder.
 *
 * The task spec allows a "static or mocked dataset" — we generate one
 * programmatically (rather than committing a giant JSON blob) so it stays
 * easy to read, resize, and regenerate. A fixed PRNG seed keeps results
 * reproducible across machines and test runs.
 */
const db = require('./connection');

// --- tiny seeded PRNG (mulberry32) so the catalog is reproducible ---------
function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260214);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => min + rand() * (max - min);
const round2 = (n) => Math.round(n * 100) / 100;

const CATEGORIES = {
  Audio: {
    brands: ['Wavelen', 'Sonora', 'Bassline', 'Aether Audio', 'Muteki'],
    nouns: ['Wireless Headphones', 'Earbuds', 'Soundbar', 'Bookshelf Speaker', 'Turntable', 'DAC/Amp'],
    price: [25, 900],
  },
  Wearables: {
    brands: ['Pulsewear', 'Northgear', 'Chronotech', 'Fitloop', 'Orbiq'],
    nouns: ['Smartwatch', 'Fitness Band', 'Sleep Ring', 'GPS Running Watch', 'Hybrid Watch'],
    price: [40, 650],
  },
  Laptops: {
    brands: ['Nimbus', 'Coreforge', 'Vantek', 'Slatebook', 'Ironloop'],
    nouns: ['Ultrabook 13"', 'Creator Laptop 16"', 'Budget Notebook', '2-in-1 Convertible', 'Gaming Laptop 15"'],
    price: [350, 2800],
  },
  Cameras: {
    brands: ['Lumaris', 'Focalpoint', 'Shutterworks', 'Grainlight', 'Apex Optics'],
    nouns: ['Mirrorless Camera', 'Action Camera', 'Instant Camera', 'DSLR Body', 'Vlogging Camera'],
    price: [60, 3200],
  },
  Gaming: {
    brands: ['Rendercore', 'Pixelforge', 'Nova Input', 'Frameworks', 'Vertexon'],
    nouns: ['Mechanical Keyboard', 'Wireless Controller', 'Gaming Mouse', 'Handheld Console', 'Capture Card'],
    price: [20, 700],
  },
  Home: {
    brands: ['Ambient Co.', 'Hearth+Loop', 'Domuslight', 'Cloverstead', 'Quietform'],
    nouns: ['Smart Speaker', 'Robot Vacuum', 'Air Purifier', 'Smart Thermostat', 'Video Doorbell'],
    price: [25, 950],
  },
  Phones: {
    brands: ['Signalis', 'Orbita', 'Fluxmobile', 'Halcyon', 'Driftline'],
    nouns: ['Flagship Phone', 'Budget Phone 5G', 'Foldable Phone', 'Rugged Phone', 'Compact Phone'],
    price: [120, 1600],
  },
  Accessories: {
    brands: ['Carryon', 'Gripline', 'Anchorpoint', 'Loopcase', 'Traypack'],
    nouns: ['USB-C Hub', 'Laptop Sleeve', 'Wireless Charger', 'Phone Case', 'Travel Adapter', 'Cable Kit'],
    price: [8, 180],
  },
};

const ADJECTIVES = ['Pro', 'Air', 'Max', 'Lite', 'Studio', 'Go', 'Plus', 'SE', 'X', 'Mini'];

const DESCRIPTION_TEMPLATES = [
  'Balanced everyday pick with dependable build quality and a comfortable feature set.',
  'Tuned for enthusiasts who want top-tier performance without cutting corners.',
  'A budget-friendly option that still covers the essentials well.',
  'Compact and travel-ready, built for people who move a lot.',
  'Feature-packed flagship aimed at power users who want it all.',
  'Minimalist design with a focus on reliability over flash.',
];

function generateProducts() {
  const products = [];
  let id = 1;
  Object.entries(CATEGORIES).forEach(([category, cfg]) => {
    // Vary count per category so facet counts feel realistic, not uniform.
    const count = Math.floor(between(9, 16));
    for (let i = 0; i < count; i += 1) {
      const brand = pick(cfg.brands);
      const noun = pick(cfg.nouns);
      const adj = rand() > 0.4 ? ` ${pick(ADJECTIVES)}` : '';
      const price = round2(between(cfg.price[0], cfg.price[1]));
      // Skew ratings toward 3.5-4.8 like a real marketplace, with some outliers.
      const rating = round2(Math.min(5, Math.max(1, between(3.2, 4.9))));
      const reviewCount = Math.floor(between(3, 4200));
      const daysAgo = Math.floor(between(0, 540));
      products.push({
        id: id++,
        name: `${brand} ${noun}${adj}`,
        brand,
        category,
        price,
        rating,
        review_count: reviewCount,
        in_stock: rand() > 0.12 ? 1 : 0,
        image_seed: `${category}-${id}`.toLowerCase().replace(/\s+/g, '-'),
        description: pick(DESCRIPTION_TEMPLATES),
        created_at: `datetime('now', '-${daysAgo} days')`,
      });
    }
  });
  return products;
}

function seed() {
  const products = generateProducts();

  db.exec('DELETE FROM products;');
  db.exec("DELETE FROM sqlite_sequence WHERE name='products';");

  // Build created_at via raw SQL expression per row (better-sqlite3 doesn't
  // support mixing bound params with raw SQL fragments in one statement),
  // so we insert in a transaction using individual prepared calls instead.
  const insertRow = db.prepare(`
    INSERT INTO products
      (name, brand, category, price, rating, review_count, in_stock, image_seed, description, created_at)
    VALUES
      (@name, @brand, @category, @price, @rating, @review_count, @in_stock, @image_seed, @description,
       datetime('now', @offset))
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insertRow.run({
        name: row.name,
        brand: row.brand,
        category: row.category,
        price: row.price,
        rating: row.rating,
        review_count: row.review_count,
        in_stock: row.in_stock,
        image_seed: row.image_seed,
        description: row.description,
        offset: row.created_at.match(/'(-\d+ days)'/)[1],
      });
    }
  });

  insertMany(products);

  const total = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
  console.log(`Seeded ${total} products across ${Object.keys(CATEGORIES).length} categories.`);
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
