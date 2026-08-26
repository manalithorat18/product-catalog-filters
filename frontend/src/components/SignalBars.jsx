const BAR_HEIGHTS = [7, 11, 15, 19, 23];

/**
 * The catalog's signature rating visual: five ascending signal bars
 * (borrowed from an audio level meter) instead of stars, filled up to the
 * rounded rating. Used both as a read-only badge on cards and, reused with
 * a `filled` count, as the interactive rating filter control.
 */
export default function SignalBars({ rating, size = 'md', filledOverride, className = '' }) {
  const filled = filledOverride ?? Math.round(rating);
  const gap = size === 'sm' ? 'gap-[2px]' : 'gap-[3px]';
  const widthClass = size === 'sm' ? 'w-[3px]' : 'w-[4px]';

  return (
    <span className={`inline-flex items-end ${gap} ${className}`} aria-hidden="true">
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={h}
          className={`${widthClass} rounded-[1px] transition-colors ${
            i < filled ? 'bg-signal' : 'bg-line'
          }`}
          style={{ height: size === 'sm' ? h * 0.75 : h }}
        />
      ))}
    </span>
  );
}
