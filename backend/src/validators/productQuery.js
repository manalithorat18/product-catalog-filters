const SORT_OPTIONS = new Set([
  'relevance',
  'price_asc',
  'price_desc',
  'rating_desc',
  'newest',
  'name_asc',
]);

class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.details = details;
  }
}

/**
 * Parses and validates raw Express query params into a clean filter object.
 * Throws ValidationError with a field-level breakdown on bad input, which
 * the error middleware turns into a 400 response instead of a 500 crash.
 */
function parseProductQuery(query, { defaultPageSize, maxPageSize }) {
  const errors = {};

  // --- categories (comma separated list of chips) ---
  let categories = [];
  if (query.category) {
    categories = String(query.category)
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
  }

  // --- price range ---
  const minPrice = query.minPrice !== undefined ? Number(query.minPrice) : 0;
  const maxPrice = query.maxPrice !== undefined ? Number(query.maxPrice) : Number.POSITIVE_INFINITY;
  if (query.minPrice !== undefined && (Number.isNaN(minPrice) || minPrice < 0)) {
    errors.minPrice = 'minPrice must be a non-negative number';
  }
  if (query.maxPrice !== undefined && (Number.isNaN(maxPrice) || maxPrice < 0)) {
    errors.maxPrice = 'maxPrice must be a non-negative number';
  }
  if (!errors.minPrice && !errors.maxPrice && minPrice > maxPrice) {
    errors.minPrice = 'minPrice cannot be greater than maxPrice';
  }

  // --- rating ---
  const minRating = query.minRating !== undefined ? Number(query.minRating) : 0;
  if (query.minRating !== undefined && (Number.isNaN(minRating) || minRating < 0 || minRating > 5)) {
    errors.minRating = 'minRating must be between 0 and 5';
  }

  // --- sort ---
  const sort = query.sort ? String(query.sort) : 'relevance';
  if (!SORT_OPTIONS.has(sort)) {
    errors.sort = `sort must be one of: ${[...SORT_OPTIONS].join(', ')}`;
  }

  // --- search ---
  const search = query.search ? String(query.search).trim().slice(0, 100) : '';

  // --- pagination ---
  const page = query.page !== undefined ? parseInt(query.page, 10) : 1;
  if (query.page !== undefined && (Number.isNaN(page) || page < 1)) {
    errors.page = 'page must be a positive integer';
  }

  let pageSize = query.pageSize !== undefined ? parseInt(query.pageSize, 10) : defaultPageSize;
  if (query.pageSize !== undefined && (Number.isNaN(pageSize) || pageSize < 1)) {
    errors.pageSize = 'pageSize must be a positive integer';
  } else if (pageSize > maxPageSize) {
    pageSize = maxPageSize;
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Invalid query parameters', errors);
  }

  return {
    categories,
    minPrice,
    maxPrice,
    minRating,
    sort,
    search,
    page: page || 1,
    pageSize: pageSize || defaultPageSize,
  };
}

module.exports = { parseProductQuery, ValidationError, SORT_OPTIONS };
