import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  FileText,
  FlaskConical,
  Search,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { PRODUCTS, Product, ProductCategory } from './data/catalog';
import { useAuth } from './context/AuthContext';
import { BatchQrSvg, GoogleIcon, ProductTubArtwork } from './components/ProductVisual';
import { BatchVerifierSection } from './components/BatchVerifierSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { AccountModal, AccountTab } from './components/AccountModal';

type CategoryFilter = 'all' | ProductCategory;
type SortOption = 'featured' | 'price-asc' | 'accuracy-desc';

export default function App() {
  const {
    user,
    authReady,
    signingIn,
    authError,
    clearAuthError,
    signInWithGoogle,
    profile,
    orders,
  } = useAuth();

  // Catalog filter & search state
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Batch Verifier & Macro Finder state
  const [toolTab, setToolTab] = useState<'verify' | 'stack'>('verify');
  const [selectedBatchCode, setSelectedBatchCode] = useState(PRODUCTS[0].batchCode);

  // Modals & Drawers
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<AccountTab>('orders');
  const [avatarError, setAvatarError] = useState(false);

  // Shopping Bag state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const totalBagCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = PRODUCTS.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.batchCode.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
      );
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.priceInr - b.priceInr);
    }
    if (sortBy === 'accuracy-desc') {
      return [...list].sort((a, b) => b.accuracyPercent - a.accuracyPercent);
    }
    return list;
  }, [category, searchQuery, sortBy]);

  const handleAddToCart = (product: Product, flavor?: string, qty = 1) => {
    const chosenFlavor = flavor || product.flavors[0];
    const key = `${product.id}::${chosenFlavor}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: Math.min(5, i.quantity + qty) } : i
        );
      }
      return [...prev, { key, product, flavor: chosenFlavor, quantity: qty }];
    });
    setAddedToast(`Added ${product.brand} ${product.weight} to bag`);
    window.setTimeout(() => {
      setAddedToast((current) =>
        current === `Added ${product.brand} ${product.weight} to bag` ? null : current
      );
    }, 2400);
  };

  const handleUpdateQty = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: Math.min(5, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const handleInspectBatch = (batchCode: string) => {
    setSelectedBatchCode(batchCode);
    setToolTab('verify');
    const el = document.getElementById('verify');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openAccountAt = (targetTab: AccountTab) => {
    setAccountTab(targetTab);
    setAccountOpen(true);
  };

  const heroSpecimen = PRODUCTS[0];
  const firstName = (user?.displayName || user?.email?.split('@')[0] || 'Account').split(' ')[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#111312]">
      {/* Top Navigation Bar — Strict 3-Zone Contract */}
      <header className="sticky top-0 z-40 bg-[#FAFAF9]/95 backdrop-blur-sm border-b border-[#E5E7E3]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#top"
            className="font-display text-xl font-bold tracking-tight text-[#111312] whitespace-nowrap shrink-0"
          >
            NutriVerify
          </a>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#575C58]"
          >
            <a
              href="#catalog"
              className="hover:text-[#111312] transition-colors whitespace-nowrap shrink-0"
            >
              Catalog
            </a>
            <a
              href="#verify"
              onClick={() => setToolTab('verify')}
              className="hover:text-[#111312] transition-colors whitespace-nowrap shrink-0"
            >
              Verify Batch
            </a>
            <a
              href="#verify"
              onClick={() => setToolTab('stack')}
              className="hover:text-[#111312] transition-colors whitespace-nowrap shrink-0"
            >
              Stack Finder
            </a>
            <button
              type="button"
              onClick={() => openAccountAt('orders')}
              className="hover:text-[#111312] transition-colors whitespace-nowrap shrink-0"
            >
              Orders{user && orders.length > 0 ? ` (${orders.length})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="hover:text-[#111312] transition-colors whitespace-nowrap shrink-0 font-mono text-[13px] tabular-nums"
            >
              Bag ({totalBagCount})
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action (Google Sign-In / Authenticated Account) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="md:hidden text-xs font-mono font-medium text-[#111312] whitespace-nowrap shrink-0 tabular-nums"
            >
              Bag ({totalBagCount})
            </button>

            {user ? (
              <button
                type="button"
                onClick={() => openAccountAt('orders')}
                className="inline-flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-lg border border-[#D4D8D2] bg-white hover:bg-[#F2F3F0] transition-colors whitespace-nowrap shrink-0"
              >
                {user.photoURL && !avatarError ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google profile'}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-[#0F5E43] text-white text-xs font-semibold flex items-center justify-center">
                    {firstName[0]?.toUpperCase()}
                  </span>
                )}
                <span className="text-xs font-medium text-[#111312] max-w-[110px] truncate">
                  {firstName}
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!authReady || signingIn}
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111312] text-white text-xs font-medium hover:bg-[#262B28] transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                <GoogleIcon className="w-3.5 h-3.5" />
                {signingIn ? 'Signing in...' : 'Sign in with Google'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Non-blocking Auth Error Notice */}
      {authError && (
        <div className="bg-[#FEF3F2] border-b border-[#FECDCA]">
          <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4 text-xs text-[#912018]">
            <span>{authError}</span>
            <button
              type="button"
              onClick={clearAuthError}
              className="font-medium underline whitespace-nowrap"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Subtle Added-to-Bag Feedback Toast */}
      {addedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-[#111312] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-xs font-medium"
        >
          <Check className="w-4 h-4 text-[#4ADE80]" />
          <span>{addedToast}</span>
          <button
            type="button"
            onClick={() => {
              setAddedToast(null);
              setCartOpen(true);
            }}
            className="text-[#A7F3D0] underline underline-offset-4 ml-1 whitespace-nowrap"
          >
            View Bag
          </button>
        </div>
      )}

      <main id="top" className="flex-1">
        {/* SECTION 1: Storefront Hero (2-Column Split + Full-Width Proof Strip) */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Hero Left Copy */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-8">
              <div className="space-y-5">
                <p className="text-xs font-medium text-[#0F5E43] tracking-wide">
                  Dehradun Campus Pilot · Independent NABL Third-Party Batch Testing
                </p>
                <h1
                  className="font-display font-semibold tracking-tight text-[#111312] leading-[1.08]"
                  style={{
                    fontSize: 'clamp(2.25rem, 4.2vw, 3.65rem)',
                    textWrap: 'balance',
                  }}
                >
                  Lab-tested protein. Direct from source.
                </h1>
                <p className="text-base text-[#474C48] leading-relaxed max-w-xl">
                  Over 30% of sports supplements sold across Indian marketplaces and local gym desks are mislabeled or counterfeit. NutriVerify sources directly from verified manufacturers and attaches a scannable NABL lab certificate to every single tub—at honest student pricing.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="#catalog"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0F5E43] text-white text-sm font-medium hover:bg-[#0B4A34] transition-colors whitespace-nowrap"
                  >
                    Browse Verified Catalog
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleInspectBatch(heroSpecimen.batchCode)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-[#D4D8D2] bg-white text-[#111312] text-sm font-medium hover:bg-[#F2F3F0] transition-colors whitespace-nowrap"
                  >
                    <FlaskConical className="w-4 h-4 text-[#0F5E43]" />
                    Verify a Batch QR
                  </button>
                </div>

                {/* Contextual Google Sign-In Status Strip */}
                {user ? (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#575C58]">
                    <span className="text-[#0F5E43] font-medium">
                      Signed in as {user.email}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Referral code:{' '}
                      <strong className="font-mono text-[#111312]">
                        {profile?.referralCode || '...'}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={() => openAccountAt('profile')}
                      className="text-[#111312] underline underline-offset-4 hover:text-[#0F5E43]"
                    >
                      Manage Account
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#575C58]">
                    <span>Use code</span>
                    <span className="font-mono font-semibold text-[#111312]">DEHRADUN10</span>
                    <span>for ₹150 off your first tub, or</span>
                    <button
                      type="button"
                      onClick={signInWithGoogle}
                      className="font-medium text-[#0F5E43] underline underline-offset-4 hover:text-[#0B4A34]"
                    >
                      sign in with Google
                    </button>
                    <span>to save lab scans and track campus drop orders.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hero Right: Live NABL Batch Specimen Card */}
            <div className="lg:col-span-5">
              <div className="h-full bg-white border border-[#E5E7E3] rounded-xl p-6 flex flex-col justify-between gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium text-[#0F5E43] inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Live Lot Certificate
                    </div>
                    <h2 className="font-display text-xl font-semibold text-[#111312] mt-1">
                      {heroSpecimen.brand} {heroSpecimen.weight}
                    </h2>
                    <p className="text-xs text-[#575C58] mt-0.5">
                      Batch {heroSpecimen.batchCode} · {heroSpecimen.labName}
                    </p>
                  </div>
                  <div className="p-1.5 rounded-lg border border-[#E5E7E3] bg-[#FAFAF9] shrink-0">
                    <BatchQrSvg code={heroSpecimen.batchCode} size={64} />
                  </div>
                </div>

                {/* Tested vs Claimed Visual Comparison */}
                <div className="space-y-4 py-4 border-y border-[#EAECE8]">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#575C58]">Label Claim (35g scoop)</span>
                      <span className="font-mono font-medium text-[#111312] tabular-nums">
                        {heroSpecimen.claimedProteinG.toFixed(1)} g protein
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#EAECE8] overflow-hidden">
                      <div className="h-full bg-[#9AA09B] rounded-full w-[90%]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#0F5E43]">NABL Kjeldahl Tested</span>
                      <span className="font-mono font-semibold text-[#0F5E43] tabular-nums">
                        {heroSpecimen.testedProteinG.toFixed(1)} g ({heroSpecimen.accuracyPercent}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#EAECE8] overflow-hidden">
                      <div className="h-full bg-[#0F5E43] rounded-full w-[94%]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                    <div>
                      <span className="text-[#575C58] block">Heavy Metals (Pb, As, Hg, Cd)</span>
                      <span className="font-medium text-[#111312]">Pass · Below FSSAI limits</span>
                    </div>
                    <div>
                      <span className="text-[#575C58] block">Amino Spiking Screen</span>
                      <span className="font-medium text-[#111312]">Clear · No added glycine</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-[#575C58]">Direct Student Price</div>
                    <div className="font-mono text-xl font-semibold text-[#111312] tabular-nums">
                      ₹{heroSpecimen.priceInr.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-[#8A908C] line-through ml-2">
                        ₹{heroSpecimen.mrpInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInspectBatch(heroSpecimen.batchCode)}
                    className="px-4 py-2 rounded-lg border border-[#111312] text-xs font-medium text-[#111312] hover:bg-[#F2F3F0] transition-colors whitespace-nowrap"
                  >
                    Inspect Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column Proof Strip */}
          <div className="mt-12 pt-8 border-t border-[#E5E7E3] grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div>
              <div className="font-mono text-2xl font-semibold text-[#111312] tabular-nums">100%</div>
              <div className="text-xs text-[#575C58] mt-1">
                Every lot tested at NABL-accredited labs (Eurofins, TUV SUD, SGS)
              </div>
            </div>
            <div>
              <div className="font-mono text-2xl font-semibold text-[#111312] tabular-nums">₹2,400</div>
              <div className="text-xs text-[#575C58] mt-1">
                Benchmark 1 kg whey direct price — eliminating retail middlemen
              </div>
            </div>
            <div>
              <div className="font-mono text-2xl font-semibold text-[#111312] tabular-nums">0%</div>
              <div className="text-xs text-[#575C58] mt-1">
                Third-party marketplace sellers or commingled warehouse stock
              </div>
            </div>
            <div>
              <div className="font-mono text-2xl font-semibold text-[#111312] tabular-nums">Same-Day</div>
              <div className="text-xs text-[#575C58] mt-1">
                Campus hostel & PG drop delivery across Dehradun hubs
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Featured Verified Catalog */}
        <section id="catalog" className="border-t border-[#E5E7E3] py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div>
                <p className="text-xs font-medium text-[#0F5E43] tracking-wide mb-2">
                  Curated Direct-from-Manufacturer Stock
                </p>
                <h2 className="font-display text-3xl lg:text-4xl font-semibold text-[#111312] tracking-tight">
                  Verified Supplements Catalog
                </h2>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#6A706C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search brand, whey, or batch..."
                    aria-label="Search supplements"
                    className="w-full sm:w-64 pl-9 pr-3.5 py-2 rounded-lg border border-[#D4D8D2] bg-white text-sm text-[#111312] placeholder:text-[#8A908C] focus:border-[#0F5E43]"
                  />
                </div>
                <select
                  aria-label="Sort catalog"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3.5 py-2 rounded-lg border border-[#D4D8D2] bg-white text-sm text-[#111312] focus:border-[#0F5E43]"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="accuracy-desc">Highest Lab Accuracy</option>
                </select>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-8">
              {[
                { id: 'all', label: 'All Products' },
                { id: 'whey', label: 'Whey Protein' },
                { id: 'creatine', label: 'Creatine' },
                { id: 'essentials', label: 'Daily Essentials' },
                { id: 'stacks', label: 'Student Stacks' },
              ].map((tabItem) => (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => setCategory(tabItem.id as CategoryFilter)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    category === tabItem.id
                      ? 'bg-[#111312] text-white'
                      : 'bg-[#F2F3F0] text-[#474C48] hover:text-[#111312] hover:bg-[#E8EAE6]'
                  }`}
                >
                  {tabItem.label}
                </button>
              ))}
            </div>

            {/* 3-Column Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-white border border-[#E5E7E3] rounded-xl">
                <p className="text-sm font-medium text-[#111312]">
                  No verified supplements match “{searchQuery}”.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCategory('all');
                  }}
                  className="mt-3 text-xs font-medium text-[#0F5E43] underline underline-offset-4"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group bg-white border border-[#E5E7E3] rounded-xl overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveProduct(product)}
                      className="block w-full text-left focus:outline-none"
                    >
                      <ProductTubArtwork product={product} />
                    </button>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                      <div className="space-y-2">
                        {/* Unboxed clean metadata */}
                        <div className="flex items-center justify-between gap-2 text-xs text-[#575C58]">
                          <span className="truncate">
                            {product.brand} · {product.weight}
                          </span>
                          {product.tag && (
                            <span className="text-[#0F5E43] font-medium whitespace-nowrap shrink-0">
                              {product.tag}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveProduct(product)}
                          className="text-left block"
                        >
                          <h3 className="font-display text-base font-semibold text-[#111312] group-hover:text-[#0F5E43] transition-colors">
                            {product.name}
                          </h3>
                        </button>

                        <div className="text-xs text-[#474C48] font-mono tabular-nums">
                          {product.category === 'essentials'
                            ? '24/24 micronutrients · 100% ICMR RDA'
                            : product.category === 'creatine'
                            ? `${product.testedProteinG}g tested / ${product.claimedProteinG}g scoop (99.7%)`
                            : `${product.testedProteinG}g tested / ${product.claimedProteinG}g scoop · ${product.accuracyPercent}%`}
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#EAECE8]">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-lg font-semibold text-[#111312] tabular-nums">
                              ₹{product.priceInr.toLocaleString('en-IN')}
                            </span>
                            <span className="font-mono text-xs text-[#8A908C] line-through tabular-nums">
                              ₹{product.mrpInr.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleInspectBatch(product.batchCode)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#0F5E43] hover:underline whitespace-nowrap"
                          >
                            <FlaskConical className="w-3.5 h-3.5" />
                            Lab Report
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveProduct(product)}
                            className="px-3.5 py-2 rounded-lg border border-[#D4D8D2] text-xs font-medium text-[#111312] hover:bg-[#F2F3F0] transition-colors whitespace-nowrap"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#111312] text-white text-xs font-medium hover:bg-[#0F5E43] transition-colors whitespace-nowrap"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Add to Bag
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: Interactive Batch Lab-Test Verifier & Macro Stack Finder */}
        <BatchVerifierSection
          activeTab={toolTab}
          onTabChange={setToolTab}
          selectedBatchCode={selectedBatchCode}
          onSelectBatchCode={setSelectedBatchCode}
          onAddToCart={(product, flavor) => handleAddToCart(product, flavor, 1)}
        />

        {/* SECTION 4: Our Direct Verification Standard & Dehradun Campus Pilot */}
        <section className="border-t border-[#E5E7E3] py-16 lg:py-20 bg-[#FAFAF9]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              <div className="lg:col-span-5 space-y-4">
                <p className="text-xs font-medium text-[#0F5E43] tracking-wide">
                  Zero-Risk Nutrition Procurement
                </p>
                <h2
                  className="font-display text-3xl font-semibold text-[#111312] tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Why students switch from open marketplaces to NutriVerify
                </h2>
                <p className="text-sm text-[#474C48] leading-relaxed">
                  Scratch-and-verify holograms are routinely cloned by counterfeit syndicates, while local gym desks often push high-commission stock without lab proof. Every NutriVerify container is batch-tested independently before reaching Dehradun hostels.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => openAccountAt('ambassador')}
                    className="px-5 py-2.5 rounded-lg bg-[#111312] text-white text-xs font-medium hover:bg-[#262B28] transition-colors whitespace-nowrap"
                  >
                    Join Dehradun Ambassador Pilot
                  </button>
                  <a
                    href="/assets/aistudio/shashwat.0251mba712dgu_ac_in_18ba915c.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#D4D8D2] bg-white text-xs font-medium text-[#111312] hover:bg-[#F2F3F0] transition-colors whitespace-nowrap"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#0F5E43]" />
                    Read Venture Plan PDF
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E5E7E3] rounded-xl p-5 space-y-2.5">
                  <div className="font-mono text-xs font-semibold text-[#0F5E43]">01</div>
                  <h3 className="font-display text-base font-semibold text-[#111312]">
                    Direct B2B Sourcing
                  </h3>
                  <p className="text-xs text-[#575C58] leading-relaxed">
                    Procured directly from brand plants and authorized primary distributors—cutting out untracked third-party marketplace sellers and retail markups.
                  </p>
                </div>

                <div className="bg-white border border-[#E5E7E3] rounded-xl p-5 space-y-2.5">
                  <div className="font-mono text-xs font-semibold text-[#0F5E43]">02</div>
                  <h3 className="font-display text-base font-semibold text-[#111312]">
                    Independent NABL Testing
                  </h3>
                  <p className="text-xs text-[#575C58] leading-relaxed">
                    Blind-sampled lots undergo Kjeldahl/HPLC protein assay, amino-spiking checks, and ICP-MS heavy-metal screening at accredited labs.
                  </p>
                </div>

                <div className="bg-white border border-[#E5E7E3] rounded-xl p-5 space-y-2.5">
                  <div className="font-mono text-xs font-semibold text-[#0F5E43]">03</div>
                  <h3 className="font-display text-base font-semibold text-[#111312]">
                    Scannable QR & Campus Drop
                  </h3>
                  <p className="text-xs text-[#575C58] leading-relaxed">
                    Scan the tamper-proof QR seal before paying via UPI or Cash on Delivery at your Dehradun campus hostel or partner gym desk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#E5E7E3] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#575C58]">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-display font-semibold text-[#111312]">NutriVerify</span>
            <span aria-hidden="true">·</span>
            <span>Verified Sports Nutrition · Dehradun, Uttarakhand</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a href="#catalog" className="hover:text-[#111312] transition-colors">
              Catalog
            </a>
            <a href="#verify" className="hover:text-[#111312] transition-colors">
              Batch Verifier
            </a>
            <button
              type="button"
              onClick={() => openAccountAt('orders')}
              className="hover:text-[#111312] transition-colors"
            >
              My Account
            </button>
            <a
              href="/assets/aistudio/shashwat.0251mba712dgu_ac_in_18ba915c.pdf"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#111312] transition-colors"
            >
              Venture Plan
            </a>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
        onAddToCart={handleAddToCart}
        onInspectBatch={handleInspectBatch}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCart([])}
        onOpenOrders={() => openAccountAt('orders')}
        onInspectBatch={handleInspectBatch}
      />

      <AccountModal
        open={accountOpen}
        initialTab={accountTab}
        onClose={() => setAccountOpen(false)}
        onInspectBatch={handleInspectBatch}
      />
    </div>
  );
}
