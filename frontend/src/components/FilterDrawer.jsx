import { useEffect } from 'react';

export default function FilterDrawer({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className={`absolute left-0 top-0 h-full w-[85vw] max-w-xs overflow-y-auto scrollbar-thin border-r border-line bg-ink p-5 shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="font-display text-sm font-semibold text-bone">Filters</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-full border border-line p-1.5 text-ash hover:text-bone"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
