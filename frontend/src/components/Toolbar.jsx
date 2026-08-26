import { SORT_OPTIONS } from '../hooks/useCatalogFilters';

export default function Toolbar({ total, isLoading, sort, onSetSort, search, onSetSearch, onOpenDrawer, activeFilterCount }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenDrawer}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface2 px-3.5 py-2 font-mono text-xs uppercase tracking-wide text-bone lg:hidden"
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-signal px-1 text-[10px] font-semibold text-ink">
              {activeFilterCount}
            </span>
          )}
        </button>
        <p className="font-mono text-xs text-ash">
          {isLoading ? 'Scanning catalog…' : (
            <>
              <span className="text-bone">{total.toLocaleString()}</span> results
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:w-56">
          <input
            type="search"
            value={search}
            onChange={(e) => onSetSearch(e.target.value)}
            placeholder="Search name or brand…"
            className="w-full rounded-full border border-line bg-surface2 px-3.5 py-2 text-sm text-bone placeholder:text-ash outline-none focus:border-signal"
          />
        </div>
        <label className="sr-only" htmlFor="sort-select">
          Sort products
        </label>
        <select
          id="sort-select"
          value={sort}
          onChange={(e) => onSetSort(e.target.value)}
          className="rounded-full border border-line bg-surface2 px-3.5 py-2 font-mono text-xs uppercase tracking-wide text-bone outline-none focus:border-signal"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
