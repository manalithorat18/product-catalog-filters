import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'rating_desc', label: 'Rating: high to low' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest arrivals' },
  { value: 'name_asc', label: 'Name: A to Z' },
];

const DEFAULT_PAGE_SIZE = 12;

/**
 * Keeps every filter, the sort key, and the current page inside the URL
 * query string. This is what makes pagination "preserve query state" and
 * lets a filtered view be copy-pasted, refreshed, or bookmarked intact.
 */
export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categories = useMemo(() => {
    const raw = searchParams.get('category');
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const minPrice = searchParams.has('minPrice') ? Number(searchParams.get('minPrice')) : null;
  const maxPrice = searchParams.has('maxPrice') ? Number(searchParams.get('maxPrice')) : null;
  const minRating = searchParams.has('minRating') ? Number(searchParams.get('minRating')) : 0;
  const sort = searchParams.get('sort') || 'relevance';
  const search = searchParams.get('search') || '';
  const page = searchParams.has('page') ? Math.max(1, parseInt(searchParams.get('page'), 10) || 1) : 1;
  const pageSize = searchParams.has('pageSize') ? Number(searchParams.get('pageSize')) : DEFAULT_PAGE_SIZE;

  /** Merge a partial patch into the URL. Any filter change resets page to 1. */
  const patch = useCallback(
    (updates, { resetPage = true } = {}) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
          next.delete(key);
        } else if (Array.isArray(value)) {
          next.set(key, value.join(','));
        } else {
          next.set(key, String(value));
        }
      });
      if (resetPage) next.delete('page');
      setSearchParams(next, { replace: false });
    },
    [searchParams, setSearchParams],
  );

  const toggleCategory = useCallback(
    (category) => {
      const set = new Set(categories);
      if (set.has(category)) set.delete(category);
      else set.add(category);
      patch({ category: [...set] });
    },
    [categories, patch],
  );

  const setPriceRange = useCallback((min, max) => patch({ minPrice: min, maxPrice: max }), [patch]);
  const setMinRating = useCallback((value) => patch({ minRating: value || null }), [patch]);
  const setSort = useCallback((value) => patch({ sort: value === 'relevance' ? null : value }, { resetPage: false }), [patch]);
  const setSearch = useCallback((value) => patch({ search: value || null }), [patch]);
  const setPage = useCallback(
    (nextPage) => patch({ page: nextPage === 1 ? null : nextPage }, { resetPage: false }),
    [patch],
  );

  const resetAll = useCallback(() => setSearchParams(new URLSearchParams(), { replace: false }), [setSearchParams]);

  const activeFilterCount =
    categories.length +
    (minPrice !== null ? 1 : 0) +
    (maxPrice !== null ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (search ? 1 : 0);

  return {
    filters: { categories, minPrice, maxPrice, minRating, sort, search, page, pageSize },
    activeFilterCount,
    toggleCategory,
    setPriceRange,
    setMinRating,
    setSort,
    setSearch,
    setPage,
    resetAll,
  };
}
