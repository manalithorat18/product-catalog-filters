import { useEffect, useState } from 'react';
import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import FilterDrawer from './components/FilterDrawer';
import ActiveFilterChips from './components/ActiveFilterChips';
import Toolbar from './components/Toolbar';
import ProductCard from './components/ProductCard';
import Pagination from './components/Pagination';
import { GridSkeleton, EmptyState, ErrorState } from './components/StateViews';
import { useCatalogFilters } from './hooks/useCatalogFilters';
import { useProducts } from './hooks/useProducts';
import { fetchMeta } from './api/products';

const ALL_CATEGORIES = [
  'Audio',
  'Wearables',
  'Laptops',
  'Cameras',
  'Gaming',
  'Home',
  'Phones',
  'Accessories',
];

export default function App() {
  const {
    filters,
    activeFilterCount,
    toggleCategory,
    setPriceRange,
    setMinRating,
    setSort,
    setSearch,
    setPage,
    resetAll,
  } = useCatalogFilters();

  const { result, status, error, isLoading } = useProducts(filters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [priceBounds, setPriceBounds] = useState(null);
  const [categories, setCategories] = useState(ALL_CATEGORIES);

  useEffect(() => {
    fetchMeta()
      .then((meta) => {
        setPriceBounds(meta.priceBounds);
        if (meta.categories?.length) setCategories(meta.categories.map((c) => c.category));
      })
      .catch(() => {
        /* Non-critical: filter panel still works with the fallback category list above. */
      });
  }, []);

  // Close the mobile drawer automatically once the viewport grows past `lg`.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => e.matches && setDrawerOpen(false);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const filterPanelProps = {
    categories,
    categoryFacets: result.facets?.categories ?? [],
    selectedCategories: filters.categories,
    onToggleCategory: toggleCategory,
    priceBounds,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    onSetPriceRange: setPriceRange,
    minRating: filters.minRating,
    onSetMinRating: setMinRating,
    activeFilterCount,
    onResetAll: resetAll,
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-2xl border border-line bg-surface p-4 shadow-panel">
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>

          <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <FilterPanel {...filterPanelProps} />
          </FilterDrawer>

          <div className="flex flex-col gap-5 min-w-0">
            <Toolbar
              total={result.pagination?.total ?? 0}
              isLoading={isLoading}
              sort={filters.sort}
              onSetSort={setSort}
              search={filters.search}
              onSetSearch={setSearch}
              onOpenDrawer={() => setDrawerOpen(true)}
              activeFilterCount={activeFilterCount}
            />

            <ActiveFilterChips
              categories={filters.categories}
              onRemoveCategory={toggleCategory}
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
              onClearPrice={() => setPriceRange(null, null)}
              minRating={filters.minRating}
              onClearRating={() => setMinRating(0)}
              search={filters.search}
              onClearSearch={() => setSearch('')}
            />

            {status === 'error' && (
              <ErrorState message={error?.message} onRetry={() => setPage(filters.page)} />
            )}

            {status !== 'error' && isLoading && <GridSkeleton count={filters.pageSize} />}

            {status === 'success' && result.data.length === 0 && <EmptyState onResetAll={resetAll} />}

            {status === 'success' && result.data.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {result.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination
                  page={result.pagination.page}
                  totalPages={result.pagination.totalPages}
                  hasPrevPage={result.pagination.hasPrevPage}
                  hasNextPage={result.pagination.hasNextPage}
                  onSetPage={setPage}
                />
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-line/70 py-6 text-center font-mono text-[11px] text-ash">
        Signalis · demo catalog · data is mocked for this exercise
      </footer>
    </div>
  );
}
