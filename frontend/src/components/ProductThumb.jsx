// No external images in a mocked catalog — instead we render a small
// deterministic "waveform" tile per product, seeded from its id, so every
// card still feels distinct without pulling in placeholder image services.
function seededHue(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 360;
}

export default function ProductThumb({ seed, category, inStock }) {
  const hue = seededHue(seed);
  const bars = Array.from({ length: 12 }, (_, i) => {
    const n = (hue + i * 37) % 100;
    return 20 + (n % 60);
  });

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 45% 14%), hsl(${(hue + 40) % 360} 40% 10%))`,
      }}
    >
      <div className="absolute inset-0 flex items-end justify-center gap-[3px] px-4 pb-4 opacity-80">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-full rounded-t-sm"
            style={{
              height: `${h}%`,
              background: `hsl(${(hue + i * 6) % 360} 70% ${i % 2 === 0 ? 62 : 50}%)`,
              opacity: 0.55,
            }}
          />
        ))}
      </div>
      <span className="absolute left-2 top-2 rounded-full bg-ink/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-bone/80 backdrop-blur">
        {category}
      </span>
      {!inStock && (
        <span className="absolute right-2 top-2 rounded-full bg-alert/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink">
          Out of stock
        </span>
      )}
    </div>
  );
}
