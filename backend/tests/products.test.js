const request = require('supertest');
const fs = require('fs');
const path = require('path');

const TEST_DB_PATH = path.join(__dirname, '..', 'src', 'db', 'catalog.test.sqlite');

let app;
let db;

beforeAll(() => {
  // Fresh DB file per test run.
  [TEST_DB_PATH, `${TEST_DB_PATH}-wal`, `${TEST_DB_PATH}-shm`].forEach((f) => {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  });

  db = require('../src/db/connection'); // eslint-disable-line global-require
  const { seed } = require('../src/db/seed'); // eslint-disable-line global-require
  seed();

  const createApp = require('../src/app'); // eslint-disable-line global-require
  app = createApp();
});

afterAll(() => {
  db.close();
  [TEST_DB_PATH, `${TEST_DB_PATH}-wal`, `${TEST_DB_PATH}-shm`].forEach((f) => {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  });
});

describe('GET /api/health', () => {
  it('reports ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/products', () => {
  it('returns a paginated envelope with data, pagination, facets and appliedFilters', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toEqual(
      expect.objectContaining({ page: 1, pageSize: 12, total: expect.any(Number) }),
    );
    expect(res.body.facets.categories.length).toBeGreaterThan(0);
    expect(res.body.data.length).toBeLessThanOrEqual(12);
  });

  it('filters by a single category', async () => {
    const res = await request(app).get('/api/products').query({ category: 'Audio', pageSize: 48 });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((p) => expect(p.category).toBe('Audio'));
  });

  it('filters by multiple categories (comma separated)', async () => {
    const res = await request(app)
      .get('/api/products')
      .query({ category: 'Audio,Gaming', pageSize: 48 });
    expect(res.status).toBe(200);
    res.body.data.forEach((p) => expect(['Audio', 'Gaming']).toContain(p.category));
  });

  it('searches product names and brands', async () => {
    const res = await request(app).get('/api/products').query({ search: 'Wavelen', pageSize: 48 });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((p) => {
      expect(`${p.name} ${p.brand}`.toLowerCase()).toContain('wavelen');
    });
  });

  it('combines category, search and price filters', async () => {
    const res = await request(app).get('/api/products').query({
      category: 'Audio',
      search: 'Wavelen',
      minPrice: 50,
      maxPrice: 200,
      pageSize: 48,
    });
    expect(res.status).toBe(200);
    res.body.data.forEach((p) => {
      expect(p.category).toBe('Audio');
      expect(p.price).toBeGreaterThanOrEqual(50);
      expect(p.price).toBeLessThanOrEqual(200);
      expect(`${p.name} ${p.brand}`.toLowerCase()).toContain('wavelen');
    });
  });

  it('ignores empty category entries in comma-separated filters', async () => {
    const res = await request(app).get('/api/products').query({ category: ',,Audio,', pageSize: 48 });
    expect(res.status).toBe(200);
    expect(res.body.appliedFilters.categories).toEqual(['Audio']);
    res.body.data.forEach((p) => expect(p.category).toBe('Audio'));
  });

  it('applies min/max price range', async () => {
    const res = await request(app)
      .get('/api/products')
      .query({ minPrice: 50, maxPrice: 200, pageSize: 48 });
    expect(res.status).toBe(200);
    res.body.data.forEach((p) => {
      expect(p.price).toBeGreaterThanOrEqual(50);
      expect(p.price).toBeLessThanOrEqual(200);
    });
  });

  it('applies a minimum rating filter', async () => {
    const res = await request(app).get('/api/products').query({ minRating: 4.5, pageSize: 48 });
    expect(res.status).toBe(200);
    res.body.data.forEach((p) => expect(p.rating).toBeGreaterThanOrEqual(4.5));
  });

  it('sorts by price ascending', async () => {
    const res = await request(app).get('/api/products').query({ sort: 'price_asc', pageSize: 48 });
    const prices = res.body.data.map((p) => p.price);
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  it('sorts by rating descending', async () => {
    const res = await request(app).get('/api/products').query({ sort: 'rating_desc', pageSize: 48 });
    const ratings = res.body.data.map((p) => p.rating);
    const sorted = [...ratings].sort((a, b) => b - a);
    expect(ratings).toEqual(sorted);
  });

  it('matches the example scenario: Audio + $50-$200 + sort by rating', async () => {
    const res = await request(app).get('/api/products').query({
      category: 'Audio',
      minPrice: 50,
      maxPrice: 200,
      sort: 'rating_desc',
      pageSize: 48,
    });
    expect(res.status).toBe(200);
    res.body.data.forEach((p) => {
      expect(p.category).toBe('Audio');
      expect(p.price).toBeGreaterThanOrEqual(50);
      expect(p.price).toBeLessThanOrEqual(200);
    });
    const ratings = res.body.data.map((p) => p.rating);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
  });

  it('paginates without overlapping or dropping items, and preserves the filter across pages', async () => {
    const shared = { minPrice: 0, maxPrice: 100000, pageSize: 5 };
    const page1 = await request(app).get('/api/products').query({ ...shared, page: 1 });
    const page2 = await request(app).get('/api/products').query({ ...shared, page: 2 });

    const ids1 = page1.body.data.map((p) => p.id);
    const ids2 = page2.body.data.map((p) => p.id);
    expect(ids1.some((id) => ids2.includes(id))).toBe(false);
    expect(page1.body.pagination.total).toBe(page2.body.pagination.total);
  });

  it('returns an empty data array (not an error) when filters match nothing', async () => {
    const res = await request(app)
      .get('/api/products')
      .query({ category: 'Audio', minPrice: 999999 });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
    expect(res.body.pagination.totalPages).toBe(1);
  });

  it('rejects an invalid sort value with a 400 and details', async () => {
    const res = await request(app).get('/api/products').query({ sort: 'not_a_real_sort' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
    expect(res.body.details).toHaveProperty('sort');
  });

  it('rejects minPrice greater than maxPrice', async () => {
    const res = await request(app).get('/api/products').query({ minPrice: 500, maxPrice: 10 });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('minPrice');
  });

  it('rejects a minRating outside 0-5', async () => {
    const res = await request(app).get('/api/products').query({ minRating: 9 });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('minRating');
  });

  it('caps pageSize at MAX_PAGE_SIZE instead of erroring', async () => {
    const res = await request(app).get('/api/products').query({ pageSize: 999 });
    expect(res.status).toBe(200);
    expect(res.body.pagination.pageSize).toBe(48);
  });
});

describe('GET /api/products/meta', () => {
  it('returns price bounds and the full category list', async () => {
    const res = await request(app).get('/api/products/meta');
    expect(res.status).toBe(200);
    expect(res.body.priceBounds).toEqual(
      expect.objectContaining({ min: expect.any(Number), max: expect.any(Number) }),
    );
    expect(res.body.categories.length).toBeGreaterThan(0);
  });
});

describe('404 handling', () => {
  it('returns a structured 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NotFound');
  });
});
