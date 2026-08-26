const db = require('../db/connection');

const SORT_SQL = {
  relevance: 'rating DESC, review_count DESC',
  price_asc: 'price ASC',
  price_desc: 'price DESC',
  rating_desc: 'rating DESC, review_count DESC',
  newest: 'created_at DESC',
  name_asc: 'name COLLATE NOCASE ASC',
};

/**
 * Builds the shared WHERE clause + params for a filter set.
 * Category is intentionally excluded when `excludeCategory` is true so we
 * can compute "how many results would each category chip yield" (faceted
 * counts) without the current category selection collapsing the count.
 */
function buildWhere(filters, { excludeCategory = false } = {}) {
  const clauses = [];
  const params = {};

  if (!excludeCategory && filters.categories.length > 0) {
    const placeholders = filters.categories.map((_, i) => `@cat${i}`);
    filters.categories.forEach((c, i) => {
      params[`cat${i}`] = c;
    });
    clauses.push(`category IN (${placeholders.join(', ')})`);
  }

  if (filters.minPrice > 0) {
    clauses.push('price >= @minPrice');
    params.minPrice = filters.minPrice;
  }
  if (Number.isFinite(filters.maxPrice)) {
    clauses.push('price <= @maxPrice');
    params.maxPrice = filters.maxPrice;
  }
  if (filters.minRating > 0) {
    clauses.push('rating >= @minRating');
    params.minRating = filters.minRating;
  }
  if (filters.search) {
    clauses.push('(name LIKE @search OR brand LIKE @search OR description LIKE @search)');
    params.search = `%${filters.search}%`;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

function findProducts(filters) {
  const { where, params } = buildWhere(filters);
  const orderBy = SORT_SQL[filters.sort] || SORT_SQL.relevance;

  const total = db.prepare(`SELECT COUNT(*) AS c FROM products ${where}`).get(params).c;

  const offset = (filters.page - 1) * filters.pageSize;
  const rows = db
    .prepare(
      `SELECT id, name, brand, category, price, rating, review_count AS reviewCount,
              in_stock AS inStock, image_seed AS imageSeed, description, created_at AS createdAt
       FROM products
       ${where}
       ORDER BY ${orderBy}
       LIMIT @limit OFFSET @offset`,
    )
    .all({ ...params, limit: filters.pageSize, offset });

  return {
    rows: rows.map((r) => ({ ...r, inStock: !!r.inStock })),
    total,
  };
}

/** Faceted category counts computed with every filter EXCEPT category applied. */
function findCategoryFacets(filters) {
  const { where, params } = buildWhere(filters, { excludeCategory: true });
  const rows = db
    .prepare(
      `SELECT category, COUNT(*) AS count
       FROM products
       ${where}
       GROUP BY category
       ORDER BY category ASC`,
    )
    .all(params);
  return rows;
}

function getPriceBounds() {
  const row = db.prepare('SELECT MIN(price) AS min, MAX(price) AS max FROM products').get();
  return { min: Math.floor(row.min ?? 0), max: Math.ceil(row.max ?? 0) };
}

module.exports = { findProducts, findCategoryFacets, getPriceBounds };
