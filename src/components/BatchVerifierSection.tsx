import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookmarkCheck,
  CheckCircle2,
  FlaskConical,
  Search,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { BATCH_REGISTRY, PRODUCTS, Product } from '../data/catalog';
import { useAuth } from '../context/AuthContext';
import { BatchQrSvg, GoogleIcon } from './ProductVisual';

interface BatchVerifierSectionProps {
  activeTab: 'verify' | 'stack';
  onTabChange: (tab: 'verify' | 'stack') => void;
  selectedBatchCode: string;
  onSelectBatchCode: (code: string) => void;
  onAddToCart: (product: Product, flavor?: string) => void;
}

export function BatchVerifierSection({
  activeTab,
  onTabChange,
  selectedBatchCode,
  onSelectBatchCode,
  onAddToCart,
}: BatchVerifierSectionProps) {
  const { user, signInWithGoogle, saveBatchVerification, verifications } = useAuth();
  const [inputCode, setInputCode] = useState(selectedBatchCode);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Sync external batch selection (e.g. clicking "Inspect Batch" on a product or order)
  React.useEffect(() => {
    setInputCode(selectedBatchCode);
    setSaveMessage(null);
  }, [selectedBatchCode]);

  const normalizedCode = selectedBatchCode.trim().toUpperCase();
  const verifiedProduct = BATCH_REGISTRY[normalizedCode] ?? null;

  const alreadySaved = useMemo(
    () => verifications.some((v) => v.batchCode === normalizedCode),
    [verifications, normalizedCode]
  );

  // Macro & Student Budget Calculator state
  const [weightKg, setWeightKg] = useState(68);
  const [trainingDays, setTrainingDays] = useState(5);
  const [goal, setGoal] = useState<'gain' | 'cut' | 'maintain'>('gain');
  const [monthlyBudget, setMonthlyBudget] = useState(2600);

  const macroPlan = useMemo(() => {
    const multiplier = goal === 'cut' ? 2.0 : goal === 'gain' ? 1.8 : 1.5;
    const activityBump = trainingDays >= 5 ? 0.1 : 0;
    const dailyProteinG = Math.round(weightKg * (multiplier + activityBump));
    const dietProteinG = Math.round(dailyProteinG * 0.65);
    const supplementGapG = Math.max(24, dailyProteinG - dietProteinG);
    const recommendedScoops = supplementGapG > 40 ? 1.5 : 1;

    const wheyPick =
      monthlyBudget < 2300
        ? PRODUCTS.find((p) => p.id === 'nakpro-gold-whey-1kg')!
        : monthlyBudget >= 2850
        ? PRODUCTS.find((p) => p.id === 'student-batch-1-stack')!
        : PRODUCTS.find((p) => p.id === 'avvatar-whey-1kg')!;

    const creatinePick = PRODUCTS.find((p) => p.id === 'nutriverify-creatine-250g')!;
    const includeSeparateCreatine =
      wheyPick.id !== 'student-batch-1-stack' && wheyPick.priceInr + creatinePick.priceInr <= monthlyBudget;

    const stackProducts = includeSeparateCreatine ? [wheyPick, creatinePick] : [wheyPick];
    const totalCostInr = stackProducts.reduce((sum, item) => sum + item.priceInr, 0);

    return {
      dailyProteinG,
      dietProteinG,
      supplementGapG,
      recommendedScoops,
      stackProducts,
      totalCostInr,
      wheyPick,
    };
  }, [weightKg, trainingDays, goal, monthlyBudget]);

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = inputCode.trim().toUpperCase();
    if (!cleaned) return;
    onSelectBatchCode(cleaned);
    setSaveMessage(null);
  };

  const handleSaveVerification = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    try {
      await saveBatchVerification({
        batchCode: normalizedCode,
        productName: verifiedProduct?.name ?? 'Unrecognized / Unlisted Supplement',
        brand: verifiedProduct?.brand ?? 'Unknown Seller',
        labName: verifiedProduct?.labName ?? 'No NABL Certificate on File',
        nablCertId: verifiedProduct?.nablCertId ?? 'UNVERIFIED',
        claimedProteinG: verifiedProduct?.claimedProteinG ?? 0,
        testedProteinG: verifiedProduct?.testedProteinG ?? 0,
        verdict: verifiedProduct ? 'verified' : 'unrecognized',
      });
      setSaveMessage('Saved to your Google account verification log.');
    } catch {
      setSaveMessage('Could not save verification right now. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="verify" className="border-t border-[#E5E7E3] bg-white py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-[#0F5E43] tracking-wide mb-2">
              Independent NABL Batch Proof & Macro Planner
            </p>
            <h2
              className="font-display text-3xl lg:text-4xl font-semibold text-[#111312] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Verify every tub before you break the seal
            </h2>
          </div>

          {/* Interactive Segmented Control */}
          <div
            className="inline-flex items-center p-1 bg-[#F2F3F0] rounded-lg border border-[#E5E7E3] self-start md:self-auto"
            role="tablist"
            aria-label="Verification and Stack tools"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'verify'}
              onClick={() => onTabChange('verify')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'verify'
                  ? 'bg-white text-[#111312] shadow-xs'
                  : 'text-[#575C58] hover:text-[#111312]'
              }`}
            >
              Batch Lab Verifier
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'stack'}
              onClick={() => onTabChange('stack')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'stack'
                  ? 'bg-white text-[#111312] shadow-xs'
                  : 'text-[#575C58] hover:text-[#111312]'
              }`}
            >
              Macro & Budget Finder
            </button>
          </div>
        </div>

        {activeTab === 'verify' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Batch Input + Quick Test Batches */}
            <div className="lg:col-span-5 space-y-6">
              <form onSubmit={handleLookupSubmit} className="space-y-3">
                <label
                  htmlFor="batch-code-input"
                  className="block text-sm font-medium text-[#111312]"
                >
                  Enter tub batch code or scan QR identifier
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#6A706C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="batch-code-input"
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder="e.g. NV-AVV-2611-04"
                      maxLength={40}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#D4D8D2] bg-[#FAFAF9] text-sm font-mono uppercase text-[#111312] placeholder:text-[#8A908C] focus:border-[#0F5E43] focus:bg-white transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#111312] text-white text-sm font-medium hover:bg-[#262B28] transition-colors whitespace-nowrap shrink-0"
                  >
                    Verify Batch
                  </button>
                </div>
              </form>

              <div className="pt-2 border-t border-[#EAECE8]">
                <p className="text-xs font-medium text-[#575C58] mb-3">
                  Active Dehradun Stock Lots (click to inspect certificate)
                </p>
                <div className="space-y-2">
                  {PRODUCTS.map((item) => {
                    const isSelected = normalizedCode === item.batchCode;
                    return (
                      <button
                        key={item.batchCode}
                        type="button"
                        onClick={() => {
                          onSelectBatchCode(item.batchCode);
                          setInputCode(item.batchCode);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'border-[#0F5E43] bg-[#0F5E43]/[0.04]'
                            : 'border-[#E5E7E3] bg-[#FAFAF9] hover:border-[#C7CCC5]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-mono text-xs font-semibold text-[#111312] tabular-nums">
                            {item.batchCode}
                          </div>
                          <div className="text-xs text-[#575C58] truncate mt-0.5">
                            {item.brand} · {item.name}
                          </div>
                        </div>
                        <span className="font-mono text-xs font-medium text-[#0F5E43] whitespace-nowrap shrink-0 tabular-nums">
                          {item.accuracyPercent}% Match
                        </span>
                      </button>
                    );
                  })}

                  {/* Counterfeit simulation button */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectBatchCode('FAKE-MKT-9910');
                      setInputCode('FAKE-MKT-9910');
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center justify-between gap-4 ${
                      normalizedCode === 'FAKE-MKT-9910'
                        ? 'border-[#B42318] bg-[#FEF3F2]'
                        : 'border-[#E5E7E3] bg-white hover:border-[#D9A7A3]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-semibold text-[#912018]">
                        FAKE-MKT-9910
                      </div>
                      <div className="text-xs text-[#575C58] truncate mt-0.5">
                        Test an unverified marketplace code
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#B42318] whitespace-nowrap shrink-0">
                      Test Alert
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live NABL Lab Certificate Output */}
            <div className="lg:col-span-7">
              {verifiedProduct ? (
                <div className="bg-[#FAFAF9] border border-[#E5E7E3] rounded-xl p-6 lg:p-8 space-y-7">
                  {/* Certificate Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-6 border-b border-[#E5E7E3]">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 text-xs font-medium text-[#0F5E43]">
                        <ShieldCheck className="w-4 h-4" />
                        <span>NABL Third-Party Certificate Verified</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{verifiedProduct.nablCertId}</span>
                      </div>
                      <h3 className="font-display text-2xl font-semibold text-[#111312]">
                        {verifiedProduct.brand} {verifiedProduct.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#575C58]">
                        <span>Batch {verifiedProduct.batchCode}</span>
                        <span aria-hidden="true">·</span>
                        <span>Tested {verifiedProduct.testedDate}</span>
                        <span aria-hidden="true">·</span>
                        <span>Exp. {verifiedProduct.expiryDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start shrink-0">
                      <div className="p-2 bg-white border border-[#E5E7E3] rounded-lg">
                        <BatchQrSvg code={verifiedProduct.batchCode} size={74} />
                      </div>
                    </div>
                  </div>

                  {/* Protein / Active Accuracy Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-[#E5E7E3]">
                    <div>
                      <div className="text-xs text-[#575C58] mb-1">Label Claim</div>
                      <div className="font-mono text-2xl font-semibold text-[#111312] tabular-nums">
                        {verifiedProduct.claimedProteinG}
                        <span className="text-sm font-normal text-[#575C58] ml-1">
                          {verifiedProduct.category === 'essentials' ? 'nutrients' : 'g / scoop'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#575C58] mb-1">Lab Tested Result</div>
                      <div className="font-mono text-2xl font-semibold text-[#0F5E43] tabular-nums">
                        {verifiedProduct.testedProteinG}
                        <span className="text-sm font-normal text-[#575C58] ml-1">
                          {verifiedProduct.category === 'essentials' ? 'nutrients' : 'g / scoop'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#575C58] mb-1">Amino Spiking & Melamine</div>
                      <div className="inline-flex items-center gap-1.5 font-medium text-sm text-[#0F5E43] mt-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Passed (Not Detected)</span>
                      </div>
                    </div>
                  </div>

                  {/* Heavy Metals Table */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-[#111312]">
                        Heavy Metals & Contaminant Panel ({verifiedProduct.labName})
                      </h4>
                      <span className="text-xs text-[#575C58] font-mono">ICP-MS Method</span>
                    </div>
                    <div className="overflow-x-auto border border-[#E5E7E3] rounded-lg bg-white">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#E5E7E3] text-xs text-[#575C58] bg-[#FAFAF9]">
                            <th className="py-2.5 px-4 font-medium">Analyte</th>
                            <th className="py-2.5 px-4 font-medium">Tested Value (ppm)</th>
                            <th className="py-2.5 px-4 font-medium">FSSAI Safe Limit</th>
                            <th className="py-2.5 px-4 font-medium text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAECE8] text-sm">
                          {verifiedProduct.heavyMetals.map((hm) => (
                            <tr key={hm.element}>
                              <td className="py-2.5 px-4 font-medium text-[#111312]">{hm.element}</td>
                              <td className="py-2.5 px-4 font-mono text-xs text-[#111312] tabular-nums">
                                {hm.testedPpm}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-xs text-[#575C58] tabular-nums">
                                {hm.fssaiLimitPpm}
                              </td>
                              <td className="py-2.5 px-4 text-right text-xs font-medium text-[#0F5E43]">
                                Pass
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Direct Chain of Custody */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
                    <div>
                      <div className="text-[#575C58] mb-1">01. Direct Source</div>
                      <div className="font-medium text-[#111312] leading-relaxed">
                        {verifiedProduct.dispatchChain.manufacturer}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#575C58] mb-1">02. Independent Lab</div>
                      <div className="font-medium text-[#111312] leading-relaxed">
                        {verifiedProduct.dispatchChain.labFacility}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#575C58] mb-1">03. Sealed Dispatch</div>
                      <div className="font-medium text-[#111312] leading-relaxed">
                        {verifiedProduct.dispatchChain.fulfillmentHub}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[#E5E7E3]">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleSaveVerification}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#111312] bg-white text-[#111312] text-sm font-medium hover:bg-[#F2F3F0] transition-colors whitespace-nowrap disabled:opacity-60"
                      >
                        {user ? (
                          <BookmarkCheck className="w-4 h-4 text-[#0F5E43]" />
                        ) : (
                          <GoogleIcon className="w-4 h-4" />
                        )}
                        {saving
                          ? 'Saving...'
                          : alreadySaved
                          ? 'Save Again to Account'
                          : user
                          ? 'Save Verification to Account'
                          : 'Sign in with Google to Save'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onAddToCart(verifiedProduct)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F5E43] text-white text-sm font-medium hover:bg-[#0B4A34] transition-colors whitespace-nowrap"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add Verified Tub · ₹{verifiedProduct.priceInr.toLocaleString('en-IN')}
                      </button>
                    </div>

                    {saveMessage && (
                      <p className="text-xs font-medium text-[#0F5E43]">{saveMessage}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#FEF3F2] border border-[#FECDCA] rounded-xl p-6 lg:p-8 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#FECDCA] text-[#B42318] flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#B42318] mb-1">
                        Counterfeit & Unverified Supply Warning
                      </p>
                      <h3 className="font-display text-2xl font-semibold text-[#111312]">
                        Batch code “{normalizedCode}” not found in NABL registry
                      </h3>
                      <p className="text-sm text-[#474C48] mt-2 leading-relaxed max-w-xl">
                        This batch identifier does not match any NutriVerify direct-from-manufacturer lot or independent NABL Certificate of Analysis. Over 30% of supplements from open marketplaces or grey-market desks are adulterated or carry duplicated scratch codes.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSaveVerification}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#111312] text-white text-sm font-medium hover:bg-[#262B28] transition-colors whitespace-nowrap"
                    >
                      {!user && <GoogleIcon className="w-4 h-4" />}
                      {user ? 'Log Unverified Check to Account' : 'Sign in with Google to Log Check'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectBatchCode(PRODUCTS[0].batchCode);
                        setInputCode(PRODUCTS[0].batchCode);
                      }}
                      className="px-4 py-2.5 rounded-lg border border-[#D4D8D2] bg-white text-sm font-medium text-[#111312] hover:bg-[#FAFAF9] transition-colors whitespace-nowrap"
                    >
                      Inspect Valid Sample Batch
                    </button>
                    {saveMessage && (
                      <p className="text-xs font-medium text-[#0F5E43]">{saveMessage}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Macro & Student Budget Stack Finder */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 bg-[#FAFAF9] border border-[#E5E7E3] rounded-xl p-6 space-y-6">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#111312]">
                  Your Training & Monthly Budget
                </h3>
                <p className="text-xs text-[#575C58] mt-1">
                  Built for college athletes and hostel/PG lifters tracking protein without overspending.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label htmlFor="body-weight" className="font-medium text-[#111312]">
                    Body Weight
                  </label>
                  <span className="font-mono font-semibold text-[#111312] tabular-nums">
                    {weightKg} kg
                  </span>
                </div>
                <input
                  id="body-weight"
                  type="range"
                  min={45}
                  max={110}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full accent-[#0F5E43]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label htmlFor="monthly-budget" className="font-medium text-[#111312]">
                    Monthly Supplement Budget
                  </label>
                  <span className="font-mono font-semibold text-[#0F5E43] tabular-nums">
                    ₹{monthlyBudget.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  id="monthly-budget"
                  type="range"
                  min={1800}
                  max={3800}
                  step={100}
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="w-full accent-[#0F5E43]"
                />
              </div>

              <div className="space-y-2">
                <span className="block text-sm font-medium text-[#111312]">Training Frequency</span>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 6].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setTrainingDays(days)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                        trainingDays === days
                          ? 'border-[#0F5E43] bg-[#0F5E43] text-white'
                          : 'border-[#D4D8D2] bg-white text-[#111312] hover:bg-[#F2F3F0]'
                      }`}
                    >
                      {days} days / wk
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-sm font-medium text-[#111312]">Primary Goal</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'gain', label: 'Muscle Gain' },
                    { id: 'cut', label: 'Lean Cut' },
                    { id: 'maintain', label: 'Recomp' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id as 'gain' | 'cut' | 'maintain')}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                        goal === item.id
                          ? 'border-[#111312] bg-[#111312] text-white'
                          : 'border-[#D4D8D2] bg-white text-[#111312] hover:bg-[#F2F3F0]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#FAFAF9] border border-[#E5E7E3] rounded-xl p-6 lg:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-[#E5E7E3]">
                <div>
                  <div className="text-xs text-[#575C58] mb-1">Daily Protein Target</div>
                  <div className="font-mono text-2xl font-semibold text-[#111312] tabular-nums">
                    {macroPlan.dailyProteinG}g
                    <span className="text-xs font-normal text-[#575C58] ml-1">/ day</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#575C58] mb-1">Hostel / Home Food Est.</div>
                  <div className="font-mono text-2xl font-semibold text-[#575C58] tabular-nums">
                    ~{macroPlan.dietProteinG}g
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#575C58] mb-1">Verified Scoop Gap</div>
                  <div className="font-mono text-2xl font-semibold text-[#0F5E43] tabular-nums">
                    {macroPlan.recommendedScoops} scoop{macroPlan.recommendedScoops > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-lg font-semibold text-[#111312]">
                    Recommended Verified Monthly Stack
                  </h4>
                  <span className="font-mono text-xs text-[#0F5E43] font-medium tabular-nums">
                    ₹{macroPlan.wheyPick.costPerGramProteinInr?.toFixed(2)} / g tested protein
                  </span>
                </div>

                <div className="divide-y divide-[#E5E7E3] border border-[#E5E7E3] rounded-lg bg-white">
                  {macroPlan.stackProducts.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-xs text-[#575C58]">
                          {item.brand} · {item.weight} · Batch {item.batchCode}
                        </div>
                        <div className="text-sm font-semibold text-[#111312] mt-0.5">
                          {item.name}
                        </div>
                        <div className="text-xs text-[#0F5E43] mt-1 font-mono tabular-nums">
                          Lab tested: {item.claimedActiveLabel}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="font-mono text-base font-semibold text-[#111312] tabular-nums">
                          ₹{item.priceInr.toLocaleString('en-IN')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectBatchCode(item.batchCode);
                            onTabChange('verify');
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#575C58] hover:text-[#111312] underline underline-offset-4 whitespace-nowrap"
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          Lab Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div>
                  <div className="text-xs text-[#575C58]">Stack Total (Direct Manufacturer Price)</div>
                  <div className="font-mono text-2xl font-semibold text-[#111312] tabular-nums">
                    ₹{macroPlan.totalCostInr.toLocaleString('en-IN')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    macroPlan.stackProducts.forEach((p) => onAddToCart(p));
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#0F5E43] text-white text-sm font-medium hover:bg-[#0B4A34] transition-colors whitespace-nowrap"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add Recommended Stack to Bag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
