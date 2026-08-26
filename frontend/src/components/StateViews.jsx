export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-line bg-surface p-3">
          <div className="aspect-[4/3] w-full rounded-xl bg-surface2" />
          <div className="mt-3 h-3 w-3/4 rounded bg-surface2" />
          <div className="mt-2 h-2.5 w-1/3 rounded bg-surface2" />
          <div className="mt-4 h-3.5 w-1/2 rounded bg-surface2" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ onResetAll }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-20 text-center">
      <SignalGlyph />
      <p className="font-display text-base font-semibold text-bone">No matches on this frequency</p>
      <p className="max-w-xs text-sm text-ash">
        Nothing fits the current combination of filters. Try widening the price range or clearing a filter.
      </p>
      <button
        type="button"
        onClick={onResetAll}
        className="mt-2 rounded-full border border-signal/60 px-4 py-1.5 font-mono text-xs uppercase tracking-wide text-signal hover:bg-signal/10"
      >
        Reset all filters
      </button>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-alert/30 bg-alert/5 py-20 text-center">
      <SignalGlyph danger />
      <p className="font-display text-base font-semibold text-bone">Signal lost</p>
      <p className="max-w-sm text-sm text-ash">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded-full border border-alert/60 px-4 py-1.5 font-mono text-xs uppercase tracking-wide text-alert hover:bg-alert/10"
      >
        Try again
      </button>
    </div>
  );
}

function SignalGlyph({ danger = false }) {
  const heights = [10, 16, 22, 16, 10];
  return (
    <span className="inline-flex items-end gap-1">
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-sm ${danger ? 'bg-alert/70' : 'bg-line'}`}
          style={{ height: h }}
        />
      ))}
    </span>
  );
}
