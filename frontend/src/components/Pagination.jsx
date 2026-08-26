function pageWindow(current, total, span = 1) {
  const pages = new Set([1, total, current]);
  for (let i = 1; i <= span; i += 1) {
    pages.add(current - i);
    pages.add(current + i);
  }
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

export default function Pagination({ page, totalPages, hasPrevPage, hasNextPage, onSetPage }) {
  if (totalPages <= 1) return null;
  const pages = pageWindow(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-4" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onSetPage(page - 1)}
        disabled={!hasPrevPage}
        className="rounded-lg border border-line px-3 py-1.5 font-mono text-xs text-bone transition-colors hover:border-signal disabled:cursor-not-allowed disabled:opacity-30"
      >
        Prev
      </button>

      {pages.map((p, idx) => {
        const prev = pages[idx - 1];
        const showGap = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {showGap && <span className="px-1 font-mono text-xs text-ash">…</span>}
            <button
              type="button"
              onClick={() => onSetPage(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`h-8 min-w-8 rounded-lg px-2 font-mono text-xs transition-colors ${
                p === page ? 'bg-signal text-ink' : 'text-bone hover:bg-surface2'
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => onSetPage(page + 1)}
        disabled={!hasNextPage}
        className="rounded-lg border border-line px-3 py-1.5 font-mono text-xs text-bone transition-colors hover:border-signal disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next
      </button>
    </nav>
  );
}
