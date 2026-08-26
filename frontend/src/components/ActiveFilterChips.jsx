function Chip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface2 py-1 pl-3 pr-1.5 font-mono text-[11px] text-bone/90">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove filter"
        className="flex h-4 w-4 items-center justify-center rounded-full text-ash transition-colors hover:bg-alert/20 hover:text-alert"
      >
        ×
      </button>
    </span>
  );
}

export default function ActiveFilterChips({
  categories,
  onRemoveCategory,
  minPrice,
  maxPrice,
  onClearPrice,
  minRating,
  onClearRating,
  search,
  onClearSearch,
}) {
  const hasAny = categories.length > 0 || minPrice !== null || maxPrice !== null || minRating > 0 || !!search;
  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line/70 pb-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">Active</span>
      {categories.map((c) => (
        <Chip key={c} onRemove={() => onRemoveCategory(c)}>
          {c}
        </Chip>
      ))}
      {(minPrice !== null || maxPrice !== null) && (
        <Chip onRemove={onClearPrice}>
          ${minPrice ?? 0} – ${maxPrice ?? '∞'}
        </Chip>
      )}
      {minRating > 0 && <Chip onRemove={onClearRating}>{minRating}+ rating</Chip>}
      {search && <Chip onRemove={onClearSearch}>&ldquo;{search}&rdquo;</Chip>}
    </div>
  );
}
