export default function Header() {
  return (
    <header className="border-b border-line/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-end justify-center gap-[3px] rounded-lg bg-surface2 pb-1.5">
            <span className="h-2 w-1 rounded-sm bg-signal" />
            <span className="h-3.5 w-1 rounded-sm bg-signal" />
            <span className="h-1.5 w-1 rounded-sm bg-wave" />
          </span>
          <div className="leading-none">
            <p className="font-display text-base font-bold tracking-tight text-bone">Signalis</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">Catalog terminal</p>
          </div>
        </div>
        <p className="hidden font-mono text-[11px] text-ash sm:block">
          Faceted search · live filters · zero page reloads
        </p>
      </div>
    </header>
  );
}
