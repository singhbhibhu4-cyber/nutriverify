import React, { useState } from 'react';
import { CheckCircle2, FlaskConical, Minus, Plus, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import { Product } from '../data/catalog';
import { BatchQrSvg, ProductTubArtwork } from './ProductVisual';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, flavor: string, quantity: number) => void;
  onInspectBatch: (batchCode: string) => void;
}

export function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onInspectBatch,
}: ProductDetailModalProps) {
  const [selectedFlavor, setSelectedFlavor] = useState(product?.flavors[0] ?? '');
  const [quantity, setQuantity] = useState(1);

  React.useEffect(() => {
    if (product) {
      setSelectedFlavor(product.flavors[0]);
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const savingsInr = product.mrpInr - product.priceInr;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-xl border border-[#E5E7E3] overflow-hidden my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-lg bg-white/90 border border-[#E5E7E3] flex items-center justify-center text-[#111312] hover:bg-[#F2F3F0] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Column: Packaging Artwork + Batch QR Proof */}
          <div className="lg:col-span-5 bg-[#F2F3F0] p-6 flex flex-col justify-between gap-6 border-b lg:border-b-0 lg:border-r border-[#E5E7E3]">
            <ProductTubArtwork product={product} compact />

            <div className="bg-white border border-[#E5E7E3] rounded-lg p-4 flex items-center gap-4">
              <BatchQrSvg code={product.batchCode} size={64} className="shrink-0" />
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F5E43]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>NABL Lab Verified</span>
                </div>
                <div className="font-mono text-xs font-semibold text-[#111312] mt-1 tabular-nums">
                  {product.batchCode}
                </div>
                <div className="text-xs text-[#575C58] truncate">{product.labName}</div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onInspectBatch(product.batchCode);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#0F5E43] hover:underline mt-1.5 whitespace-nowrap"
                >
                  <FlaskConical className="w-3 h-3" />
                  Open Full Lab Certificate
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#575C58] mb-1.5">
                  <span className="font-medium text-[#111312]">{product.brand}</span>
                  <span aria-hidden="true">·</span>
                  <span>{product.categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{product.weight}</span>
                  <span aria-hidden="true">·</span>
                  <span>{product.servings} servings</span>
                </div>
                <h2 id="pdp-title" className="font-display text-2xl font-semibold text-[#111312]">
                  {product.name}
                </h2>
              </div>

              {/* Price Baseline */}
              <div className="flex items-baseline gap-3 pb-5 border-b border-[#EAECE8]">
                <span className="font-mono text-3xl font-semibold text-[#111312] tabular-nums">
                  ₹{product.priceInr.toLocaleString('en-IN')}
                </span>
                <span className="font-mono text-sm text-[#8A908C] line-through tabular-nums">
                  ₹{product.mrpInr.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-medium text-[#0F5E43]">
                  Direct savings ₹{savingsInr.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Verified Lab Numbers */}
              <div className="grid grid-cols-3 gap-4 py-3 px-4 rounded-lg bg-[#FAFAF9] border border-[#EAECE8] text-xs">
                <div>
                  <div className="text-[#575C58]">Label Claim</div>
                  <div className="font-mono font-semibold text-[#111312] mt-0.5 tabular-nums">
                    {product.claimedProteinG}g
                  </div>
                </div>
                <div>
                  <div className="text-[#575C58]">NABL Tested</div>
                  <div className="font-mono font-semibold text-[#0F5E43] mt-0.5 tabular-nums">
                    {product.testedProteinG}g ({product.accuracyPercent}%)
                  </div>
                </div>
                <div>
                  <div className="text-[#575C58]">Heavy Metals</div>
                  <div className="inline-flex items-center gap-1 font-medium text-[#0F5E43] mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All Clear
                  </div>
                </div>
              </div>

              <p className="text-sm text-[#474C48] leading-relaxed">{product.description}</p>

              {/* Flavor Selector */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-[#111312]">
                  Flavour / Variant: <span className="text-[#575C58]">{selectedFlavor}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.flavors.map((flavor) => (
                    <button
                      key={flavor}
                      type="button"
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                        selectedFlavor === flavor
                          ? 'border-[#111312] bg-[#111312] text-white'
                          : 'border-[#D4D8D2] bg-white text-[#111312] hover:border-[#8A908C]'
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div className="text-xs text-[#575C58] leading-relaxed">
                <span className="font-medium text-[#111312]">Ingredients: </span>
                {product.ingredients}
              </div>
            </div>

            {/* Purchase Action Row */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#EAECE8]">
              <div className="inline-flex items-center border border-[#D4D8D2] rounded-lg bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#111312] hover:bg-[#F2F3F0] rounded-l-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-mono text-sm font-medium tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#111312] hover:bg-[#F2F3F0] rounded-r-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, selectedFlavor, quantity);
                  onClose();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 h-10 rounded-lg bg-[#0F5E43] text-white text-sm font-medium hover:bg-[#0B4A34] transition-colors whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Bag · ₹{(product.priceInr * quantity).toLocaleString('en-IN')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
