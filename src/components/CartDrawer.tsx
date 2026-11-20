import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { PROMO_CODES, Product } from '../data/catalog';
import { SupplementOrder, useAuth } from '../context/AuthContext';
import { GoogleIcon } from './ProductVisual';

export interface CartItem {
  key: string;
  product: Product;
  flavor: string;
  quantity: number;
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onClearCart: () => void;
  onOpenOrders: () => void;
  onInspectBatch: (batchCode: string) => void;
}

export function CartDrawer({
  open,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenOrders,
  onInspectBatch,
}: CartDrawerProps) {
  const { user, profile, signInWithGoogle, signingIn, placeOrder } = useAuth();

  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [promoInput, setPromoInput] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [campusHostel, setCampusHostel] = useState('');
  const [city, setCity] = useState('Dehradun');
  const [pincode, setPincode] = useState('248001');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI_ON_DELIVERY'>('UPI_ON_DELIVERY');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<SupplementOrder | null>(null);

  useEffect(() => {
    if (profile) {
      setCustomerName((prev) => prev || profile.displayName || '');
      setPhone((prev) => prev || profile.phone || '');
      setCampusHostel((prev) => prev || profile.hostelOrAddress || profile.campusName || '');
    } else if (user) {
      setCustomerName((prev) => prev || user.displayName || '');
    }
  }, [profile, user]);

  useEffect(() => {
    if (!open && step === 'confirmed') {
      setStep('bag');
      setConfirmedOrder(null);
    }
  }, [open, step]);

  if (!open) return null;

  const subtotalInr = items.reduce((sum, item) => sum + item.product.priceInr * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const computeDiscount = (code: string): number => {
    const clean = code.trim().toUpperCase();
    if (!clean) return 0;
    const official = PROMO_CODES[clean];
    if (official && subtotalInr >= official.minOrderInr) {
      return official.flatDiscountInr;
    }
    if (clean.startsWith('NV-') && clean.length >= 6 && subtotalInr >= 1200) {
      return 100;
    }
    return 0;
  };

  const discountInr = computeDiscount(appliedCode);
  const totalInr = Math.max(0, subtotalInr - discountInr);
  const freeDeliveryUnlocked = subtotalInr >= 999;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (!clean) {
      setAppliedCode('');
      setPromoFeedback(null);
      return;
    }
    const official = PROMO_CODES[clean];
    if (official) {
      if (subtotalInr < official.minOrderInr) {
        setPromoFeedback(
          `Add ₹${(official.minOrderInr - subtotalInr).toLocaleString('en-IN')} more to unlock ${clean}.`
        );
        return;
      }
      setAppliedCode(clean);
      setPromoFeedback(`${official.label} applied (₹${official.flatDiscountInr} off).`);
      return;
    }
    if (clean.startsWith('NV-') && clean.length >= 6) {
      if (subtotalInr < 1200) {
        setPromoFeedback('Minimum order ₹1,200 required for peer referral discount.');
        return;
      }
      setAppliedCode(clean);
      setPromoFeedback('Campus peer referral code applied (₹100 off).');
      return;
    }
    setPromoFeedback('Try DEHRADUN10 (₹150 off) or BATCH01 (₹200 off).');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      await signInWithGoogle();
      return;
    }

    if (customerName.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (phone.replace(/[^0-9+]/g, '').length < 7) {
      setErrorMsg('Please enter a valid mobile number for campus delivery updates.');
      return;
    }
    if (campusHostel.trim().length < 3) {
      setErrorMsg('Please enter your hostel, PG, or local Dehradun address.');
      return;
    }
    if (!/^[0-9]{4,12}$/.test(pincode.trim())) {
      setErrorMsg('Please enter a valid numeric PIN code (e.g., 248001).');
      return;
    }

    setSubmitting(true);
    try {
      const itemsSummary = items
        .map((i) => `${i.product.brand} ${i.product.name} (${i.flavor}) ×${i.quantity}`)
        .join('; ');
      const batchCodes = Array.from(new Set(items.map((i) => i.product.batchCode)));

      const created = await placeOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        campusHostel: campusHostel.trim(),
        city: city.trim() || 'Dehradun',
        pincode: pincode.trim(),
        paymentMethod,
        referralCodeUsed: appliedCode,
        subtotalInr,
        discountInr,
        totalInr,
        itemCount,
        itemsSummary,
        batchCodes,
      });
      setConfirmedOrder(created);
      onClearCart();
      setAppliedCode('');
      setPromoInput('');
      setStep('confirmed');
    } catch {
      setErrorMsg('Could not complete your order right now. Please verify your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag and checkout"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full flex flex-col border-l border-[#E5E7E3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7E3] flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#111312]">
              {step === 'bag'
                ? `Your Bag (${itemCount})`
                : step === 'checkout'
                ? 'Campus Delivery Checkout'
                : 'Order Confirmed'}
            </h2>
            <p className="text-xs text-[#575C58]">
              {step === 'confirmed'
                ? 'Sealed NABL-tested dispatch scheduled'
                : 'Free same-day campus drop in Dehradun on orders ₹999+'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="w-9 h-9 rounded-lg border border-[#E5E7E3] flex items-center justify-center text-[#111312] hover:bg-[#F2F3F0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'confirmed' && confirmedOrder ? (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-[#0F5E43]/[0.06] border border-[#0F5E43]/20 space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-medium text-[#0F5E43]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Order {confirmedOrder.orderNumber} Confirmed — Preparing Shipment</span>
                </div>
                <p className="text-sm text-[#111312] leading-relaxed">
                  Every tub in your order ships with a tamper-proof NABL QR code seal. Pay via{' '}
                  {confirmedOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : 'UPI on Delivery'}{' '}
                  at your hostel or campus drop point.
                </p>
              </div>

              <div className="space-y-3 text-sm border border-[#E5E7E3] rounded-xl p-4 bg-[#FAFAF9]">
                <div className="flex justify-between">
                  <span className="text-[#575C58]">Recipient</span>
                  <span className="font-medium text-[#111312]">{confirmedOrder.customerName}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#575C58] shrink-0">Campus Drop</span>
                  <span className="font-medium text-[#111312] text-right">
                    {confirmedOrder.campusHostel}, {confirmedOrder.city} — {confirmedOrder.pincode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#575C58]">Payable Total</span>
                  <span className="font-mono font-semibold text-[#111312] tabular-nums">
                    ₹{confirmedOrder.totalInr.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E5E7E3]">
                  <div className="text-xs text-[#575C58] mb-2">Included Batch Certificates</div>
                  <div className="flex flex-wrap gap-2">
                    {confirmedOrder.batchCodes.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          onClose();
                          onInspectBatch(code);
                        }}
                        className="font-mono text-xs text-[#0F5E43] underline underline-offset-4 hover:text-[#0B4A34]"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOrders();
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-[#111312] text-white text-sm font-medium hover:bg-[#262B28] transition-colors"
              >
                View in My Orders
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 rounded-xl bg-[#F2F3F0] flex items-center justify-center text-[#575C58] mb-4">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[#111312]">
                Your bag is empty
              </h3>
              <p className="text-sm text-[#575C58] mt-1 max-w-xs">
                Browse our NABL-tested whey proteins, creatine, and student stacks with open batch certificates.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 px-5 py-2.5 rounded-lg bg-[#111312] text-white text-sm font-medium hover:bg-[#262B28] transition-colors"
              >
                Explore Verified Catalog
              </button>
            </div>
          ) : step === 'bag' ? (
            <div className="space-y-5">
              <div className="divide-y divide-[#EAECE8]">
                {items.map((item) => (
                  <div key={item.key} className="py-4 first:pt-0 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs text-[#575C58]">
                        {item.product.brand} · {item.product.weight}
                      </div>
                      <div className="text-sm font-semibold text-[#111312] mt-0.5">
                        {item.product.name}
                      </div>
                      <div className="text-xs text-[#575C58] mt-0.5">
                        {item.flavor} · Batch{' '}
                        <span className="font-mono text-[#0F5E43]">{item.product.batchCode}</span>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <div className="inline-flex items-center border border-[#D4D8D2] rounded-md">
                          <button
                            type="button"
                            aria-label="Decrease item quantity"
                            onClick={() => onUpdateQty(item.key, -1)}
                            className="w-7 h-7 flex items-center justify-center text-[#111312] hover:bg-[#F2F3F0]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-mono text-xs tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase item quantity"
                            onClick={() => onUpdateQty(item.key, 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#111312] hover:bg-[#F2F3F0]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.key)}
                          className="inline-flex items-center gap-1 text-xs text-[#575C58] hover:text-[#B42318]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="font-mono text-sm font-semibold text-[#111312] shrink-0 tabular-nums">
                      ₹{(item.product.priceInr * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Student Starter Promo / Referral Input */}
              <form onSubmit={handleApplyPromo} className="pt-4 border-t border-[#E5E7E3] space-y-2">
                <label htmlFor="promo-code" className="block text-xs font-medium text-[#111312]">
                  Student Starter or Campus Referral Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="promo-code"
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="DEHRADUN10 or BATCH01"
                    maxLength={24}
                    className="flex-1 px-3 py-2 rounded-lg border border-[#D4D8D2] bg-[#FAFAF9] text-xs font-mono uppercase focus:bg-white focus:border-[#0F5E43]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg border border-[#111312] text-xs font-medium text-[#111312] hover:bg-[#F2F3F0] transition-colors whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
                {promoFeedback && (
                  <p className="text-xs text-[#0F5E43] font-medium">{promoFeedback}</p>
                )}
              </form>
            </div>
          ) : (
            /* Step 2: Campus Delivery Checkout Form */
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              {!user && (
                <div className="p-4 rounded-xl bg-[#FAFAF9] border border-[#E5E7E3] space-y-3">
                  <p className="text-xs text-[#474C48] leading-relaxed">
                    Sign in with Google so your order receipt, NABL batch certificates, and student referral credits are securely linked to your account.
                  </p>
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    disabled={signingIn}
                    className="w-full inline-flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-[#D4D8D2] bg-white text-sm font-medium text-[#111312] hover:bg-[#F2F3F0] transition-colors"
                  >
                    <GoogleIcon className="w-4 h-4" />
                    {signingIn ? 'Opening Google Sign-In...' : 'Sign in with Google'}
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#111312] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D4D8D2] text-sm focus:border-[#0F5E43]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111312] mb-1">
                  Mobile Number (WhatsApp delivery updates)
                </label>
                <input
                  type="tel"
                  required
                  maxLength={20}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D4D8D2] text-sm font-mono focus:border-[#0F5E43]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111312] mb-1">
                  Campus Hostel / PG / Local Address
                </label>
                <input
                  type="text"
                  required
                  maxLength={240}
                  value={campusHostel}
                  onChange={(e) => setCampusHostel(e.target.value)}
                  placeholder="e.g. Hostel Block B, DBS Global University"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D4D8D2] text-sm focus:border-[#0F5E43]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111312] mb-1">City</label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D4D8D2] text-sm focus:border-[#0F5E43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111312] mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D4D8D2] text-sm font-mono focus:border-[#0F5E43]"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <span className="block text-xs font-medium text-[#111312]">
                  Pay on Campus Delivery (Inspect QR Seal First)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI_ON_DELIVERY')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      paymentMethod === 'UPI_ON_DELIVERY'
                        ? 'border-[#0F5E43] bg-[#0F5E43]/[0.06] text-[#0F5E43]'
                        : 'border-[#D4D8D2] text-[#111312]'
                    }`}
                  >
                    UPI on Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      paymentMethod === 'COD'
                        ? 'border-[#0F5E43] bg-[#0F5E43]/[0.06] text-[#0F5E43]'
                        : 'border-[#D4D8D2] text-[#111312]'
                    }`}
                  >
                    Cash on Delivery
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs font-medium text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA] rounded-lg px-3 py-2">
                  {errorMsg}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Footer Totals & CTA */}
        {items.length > 0 && step !== 'confirmed' && (
          <div className="px-6 py-5 border-t border-[#E5E7E3] bg-[#FAFAF9] space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#575C58]">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">₹{subtotalInr.toLocaleString('en-IN')}</span>
              </div>
              {discountInr > 0 && (
                <div className="flex justify-between text-[#0F5E43]">
                  <span>Discount ({appliedCode})</span>
                  <span className="font-mono tabular-nums">-₹{discountInr.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-[#575C58]">
                <span>Campus Delivery</span>
                <span className="font-mono text-xs text-[#0F5E43]">
                  {freeDeliveryUnlocked ? 'FREE' : '₹49 (Free ₹999+)'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5E7E3] font-semibold text-[#111312]">
                <span>Total Payable</span>
                <span className="font-mono text-base tabular-nums">
                  ₹{totalInr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-[#0F5E43] text-white text-sm font-medium hover:bg-[#0B4A34] transition-colors"
              >
                Proceed to Campus Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('bag')}
                  className="px-4 py-3 rounded-lg border border-[#D4D8D2] bg-white text-sm font-medium text-[#111312] hover:bg-[#F2F3F0] transition-colors whitespace-nowrap"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-[#0F5E43] text-white text-sm font-medium hover:bg-[#0B4A34] transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {submitting
                    ? 'Confirming Order...'
                    : user
                    ? `Place Order · ₹${totalInr.toLocaleString('en-IN')}`
                    : 'Sign in with Google & Place Order'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
