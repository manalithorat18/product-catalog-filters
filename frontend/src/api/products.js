const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(path) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`);
  } catch {
    // fetch() throws on DNS failure / connection refused / offline.
    throw new ApiError('Could not reach the catalog service. Check your connection and try again.', {
      status: 0,
    });
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    // Non-JSON error page (e.g. proxy 502) — fall through with body=null.
  }

  if (!res.ok) {
    throw new ApiError(body?.message || `Request failed with status ${res.status}`, {
      status: res.status,
      details: body?.details,
    });
  }

  return body;
}

/**
 * @param {object} filters
 * @param {string[]} filters.categories
 * @param {number} [filters.minPrice]
 * @param {number} [filters.maxPrice]
 * @param {number} [filters.minRating]
 * @param {string} [filters.sort]
 * @param {string} [filters.search]
 * @param {number} filters.page
 * @param {number} filters.pageSize
 */
function fetchProducts(filters) {
  const params = new URLSearchParams();
  if (filters.categories?.length) params.set('category', filters.categories.join(','));
  if (filters.minPrice !== undefined && filters.minPrice !== null) params.set('minPrice', filters.minPrice);
  if (filters.maxPrice !== undefined && filters.maxPrice !== null) params.set('maxPrice', filters.maxPrice);
  if (filters.minRating) params.set('minRating', filters.minRating);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.search) params.set('search', filters.search);
  params.set('page', filters.page || 1);
  params.set('pageSize', filters.pageSize || 12);

  return request(`/api/products?${params.toString()}`);
}

function fetchMeta() {
  return request('/api/products/meta');
}

export { fetchProducts, fetchMeta, ApiError };
