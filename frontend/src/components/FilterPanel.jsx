import SignalBars from './SignalBars';

const PRICE_PRESETS = [
  { label: 'Any price', min: null, max: null },
  { label: 'Under $50', min: null, max: 50 },
  { label: '$50 – $200', min: 50, max: 200 },
  { label: '$200 – $600', min: 200, max: 600 },
  { label: '$600+', min: 600, max: null },
];

const RATING_STEPS = [4.5, 4, 3.5, 3];

function SectionHeading({ children, eyebrow }) {
  return (
    <div className="mb-3">
      {eyebrow && <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">{eyebrow}</p>}
      <h3 className="font-display text-sm font-semibold text-bone">{children}</h3>
    </div>
  );
}

export default function FilterPanel({
  categories,
  categoryFacets,
  selectedCategories,
  onToggleCategory,
  priceBounds,
  minPrice,
  maxPrice,
  onSetPriceRange,
  minRating,
  onSetMinRating,
  activeFilterCount,
  onResetAll,
}) {
  const facetMap = new Map(categoryFacets.map((f) => [f.category, f.count]));

  const isPresetActive = (preset) => (preset.min ?? null) === minPrice && (preset.max ?? null) === maxPrice;

  return (
    <div className="flex h-full flex-col gap-6 font-body">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}</p>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetAll}
            className="font-mono text-[11px] uppercase tracking-wide text-signal hover:text-signal-soft"
          >
            Reset all
          </button>
        )}
      </div>

      <section>
        <SectionHeading eyebrow="Browse by">Category</SectionHeading>
        <ul className="flex flex-col gap-1.5">
          {categories.map((cat) => {
            const count = facetMap.get(cat) ?? 0;
            const checked = selectedCategories.includes(cat);
            const disabled = count === 0 && !checked;
            return (
              <li key={cat}>
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors ${
                    checked ? 'bg-signal-dim text-signal-soft' : 'text-bone/90 hover:bg-surface2'
                  } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => onToggleCategory(cat)}
                      className="h-3.5 w-3.5 rounded-sm border-line bg-surface2 text-signal accent-signal"
                    />
                    {cat}
                  </span>
                  <span className="font-mono text-[11px] text-ash">{count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <SectionHeading eyebrow={priceBounds ? `Range $${priceBounds.min} – $${priceBounds.max}` : undefined}>
          Price
        </SectionHeading>
        <div className="flex flex-col gap-1.5">
          {PRICE_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.label}
              onClick={() => onSetPriceRange(preset.min, preset.max)}
              className={`rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                isPresetActive(preset) ? 'bg-signal-dim text-signal-soft' : 'text-bone/90 hover:bg-surface2'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label className="flex-1">
            <span className="mb-1 block font-mono text-[10px] uppercase text-ash">Min</span>
            <input
              type="number"
              min={0}
              value={minPrice ?? ''}
              placeholder={String(priceBounds?.min ?? 0)}
              onChange={(e) => onSetPriceRange(e.target.value === '' ? null : Number(e.target.value), maxPrice)}
              className="w-full rounded-lg border border-line bg-surface2 px-2 py-1.5 font-mono text-sm text-bone outline-none focus:border-signal"
            />
          </label>
          <span className="mt-4 text-ash">–</span>
          <label className="flex-1">
            <span className="mb-1 block font-mono text-[10px] uppercase text-ash">Max</span>
            <input
              type="number"
              min={0}
              value={maxPrice ?? ''}
              placeholder={String(priceBounds?.max ?? 0)}
              onChange={(e) => onSetPriceRange(minPrice, e.target.value === '' ? null : Number(e.target.value))}
              className="w-full rounded-lg border border-line bg-surface2 px-2 py-1.5 font-mono text-sm text-bone outline-none focus:border-signal"
            />
          </label>
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Minimum">Rating</SectionHeading>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => onSetMinRating(0)}
            className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors ${
              minRating === 0 ? 'bg-signal-dim text-signal-soft' : 'text-bone/90 hover:bg-surface2'
            }`}
          >
            Any rating
          </button>
          {RATING_STEPS.map((step) => (
            <button
              type="button"
              key={step}
              onClick={() => onSetMinRating(step)}
              className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors ${
                minRating === step ? 'bg-signal-dim text-signal-soft' : 'text-bone/90 hover:bg-surface2'
              }`}
            >
              <SignalBars rating={step} size="sm" />
              <span className="font-mono text-xs">{step}+ </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
