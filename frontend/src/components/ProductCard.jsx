import SignalBars from './SignalBars';
import ProductThumb from './ProductThumb';

const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function ProductCard({ product }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-line bg-surface p-3 shadow-panel transition-transform hover:-translate-y-0.5 hover:border-signal/40">
      <ProductThumb seed={product.imageSeed} category={product.category} inStock={product.inStock} />

      <div className="mt-3 flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-sm font-semibold leading-snug text-bone">{product.name}</h3>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-wide text-ash">{product.brand}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-mono text-base font-semibold text-bone">
            {priceFormatter.format(product.price)}
          </span>
          <div className="flex items-center gap-1.5">
            <SignalBars rating={product.rating} size="sm" />
            <span className="font-mono text-[11px] text-ash">{product.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="font-mono text-[10px] text-ash/80">{product.reviewCount.toLocaleString()} reviews</p>
      </div>
    </article>
  );
}
