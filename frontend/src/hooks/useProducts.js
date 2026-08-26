import { useEffect, useRef, useState } from 'react';
import { fetchProducts, ApiError } from '../api/products';

const EMPTY_RESULT = {
  data: [],
  pagination: { page: 1, pageSize: 12, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false },
  facets: { categories: [] },
};

/**
 * Fetches the product page for the given filters. Cancels the previous
 * in-flight request when filters change quickly (e.g. dragging a price
 * slider) so a slow older response can never clobber a newer one.
 */
export function useProducts(filters) {
  const [state, setState] = useState({ status: 'loading', result: EMPTY_RESULT, error: null });
  const requestId = useRef(0);
  const categoriesKey = JSON.stringify(filters.categories);

  useEffect(() => {
    const thisRequestId = ++requestId.current;

    // Deferred to a microtask so the "start loading" state update never
    // fires synchronously inside the effect body (avoids the extra
    // cascading render React's effect-timing rules warn about), while
    // still kicking off well before the network response could return.
    Promise.resolve().then(() => {
      if (requestId.current !== thisRequestId) return;
      setState((prev) => ({ ...prev, status: 'loading', error: null }));
    });

    fetchProducts(filters)
      .then((data) => {
        if (requestId.current !== thisRequestId) return; // stale response, ignore
        setState({ status: 'success', result: data, error: null });
      })
      .catch((err) => {
        if (requestId.current !== thisRequestId) return;
        setState({
          status: 'error',
          result: EMPTY_RESULT,
          error:
            err instanceof ApiError
              ? err
              : new ApiError('Something unexpected happened while loading products.', { status: 500 }),
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    categoriesKey,
    filters.minPrice,
    filters.maxPrice,
    filters.minRating,
    filters.sort,
    filters.search,
    filters.page,
    filters.pageSize,
  ]);

  return { result: state.result, status: state.status, error: state.error, isLoading: state.status === 'loading' };
}
