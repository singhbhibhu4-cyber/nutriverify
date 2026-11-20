import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  FlaskConical,
  LogOut,
  Package,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from './ProductVisual';

export type AccountTab = 'orders' | 'verifications' | 'profile' | 'ambassador';

interface AccountModalProps {
  open: boolean;
  initialTab: AccountTab;
  onClose: () => void;
  onInspectBatch: (batchCode: string) => void;
}

export function AccountModal({
  open,
  initialTab,
  onClose,
  onInspectBatch,
}: AccountModalProps) {
  const {
    user,
    signingIn,
    signInWithGoogle,
    signOutUser,
    profile,
    updateProfile,
    orders,
    ordersLoading,
    cancelOrder,
    verifications,
    verificationsLoading,
    deleteBatchVerification,
    ambassadorApp,
    submitAmbassadorApplication,
  } = useAuth();

  const [tab, setTab] = useState<AccountTab>(initialTab);
  const [copiedCode, setCopiedCode] = useState(false);

  // Profile form state
  const [displayName, setDisplayName] = useState('');
  const [campusName, setCampusName] = useState('');
  const [hostelOrAddress, setHostelOrAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Ambassador form state
  const [ambName, setAmbName] = useState('');
  const [ambCampus, setAmbCampus] = useState('DBS Global University, Dehradun');
  const [ambGym, setAmbGym] = useState('');
  const [ambInsta, setAmbInsta] = useState('');
  const [ambWorkouts, setAmbWorkouts] = useState(5);
  const [ambSubmitting, setAmbSubmitting] = useState(false);
  const [ambSavedMsg, setAmbSavedMsg] = useState<string | null>(null);

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, open]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setCampusName(profile.campusName || '');
      setHostelOrAddress(profile.hostelOrAddress || '');
      setPhone(profile.phone || '');
      setAmbName((prev) => prev || profile.displayName || '');
      setAmbCampus((prev) => prev || profile.campusName || 'DBS Global University, Dehradun');
    }
  }, [profile]);

  useEffect(() => {
    if (ambassadorApp) {
      setAmbName(ambassadorApp.fullName);
      setAmbCampus(ambassadorApp.campusName);
      setAmbGym(ambassadorApp.gymName);
      setAmbInsta(ambassadorApp.instagramHandle);
      setAmbWorkouts(ambassadorApp.weeklyWorkouts);
    }
  }, [ambassadorApp]);

  if (!open) return null;

  const handleCopyReferral = () => {
    if (!profile?.referralCode) return;
    navigator.clipboard?.writeText(profile.referralCode).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSavedMsg(null);
    try {
      await updateProfile({ displayName, campusName, hostelOrAddress, phone });
      setProfileSavedMsg('Campus delivery profile updated.');
    } catch {
      setProfileSavedMsg('Unable to update profile right now.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAmbassadorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAmbSubmitting(true);
    setAmbSavedMsg(null);
    try {
      await submitAmbassadorApplication({
        fullName: ambName,
        campusName: ambCampus,
        gymName: ambGym,
        instagramHandle: ambInsta,
        weeklyWorkouts: ambWorkouts,
      });
      setAmbSavedMsg('Campus Fitness Ambassador application saved.');
    } catch {
      setAmbSavedMsg('Could not submit application. Please check all required fields.');
    } finally {
      setAmbSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="NutriVerify Account Hub"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-xl border border-[#E5E7E3] overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-[#E5E7E3] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {user?.photoURL && !avatarFailed ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Google user avatar'}
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
                className="w-9 h-9 rounded-full object-cover border border-[#E5E7E3] shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#F2F3F0] border border-[#E5E7E3] flex items-center justify-center text-sm font-semibold text-[#111312] shrink-0">
                {(user?.displayName || user?.email || 'N')[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-display text-base font-semibold text-[#111312] truncate">
                {user ? user.displayName || 'Student Athlete' : 'Sign in to NutriVerify'}
              </h2>
              <p className="text-xs text-[#575C58] truncate">
                {user ? user.email : 'Google Sign-In unlocks order tracking, saved NABL scans & student referrals'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user && (
              <button
                type="button"
                onClick={async () => {
                  await signOutUser();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7E3] text-xs font-medium text-[#575C58] hover:text-[#111312] hover:bg-[#F2F3F0] transition-colors whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close account modal"
              className="w-9 h-9 rounded-lg border border-[#E5E7E3] flex items-center justify-center text-[#111312] hover:bg-[#F2F3F0] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!user ? (
          <div className="p-8 sm:p-10 text-center space-y-5">
            <div className="w-12 h-12 rounded-xl bg-[#0F5E43]/[0.08] text-[#0F5E43] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="font-display text-2xl font-semibold text-[#111312]">
                Continue with Google
              </h3>
              <p className="text-sm text-[#575C58] leading-relaxed">
                Track your verified supplement orders, keep a permanent log of NABL batch scans, save your Dehradun hostel address, and claim your campus referral code.
              </p>
            </div>
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={signingIn}
              className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-lg bg-[#111312] text-white text-sm font-medium hover:bg-[#262B28] transition-colors disabled:opacity-60"
            >
              <GoogleIcon className="w-4 h-4" />
              {signingIn ? 'Opening Google Sign-In...' : 'Sign in with Google'}
            </button>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="px-6 pt-3 border-b border-[#E5E7E3] flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
                { id: 'verifications', label: `Lab Scans (${verifications.length})`, icon: FlaskConical },
                { id: 'profile', label: 'Campus & Referral', icon: UserIcon },
                { id: 'ambassador', label: 'Ambassador Pilot', icon: Users },
              ].map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id as AccountTab)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'border-[#0F5E43] text-[#111312]'
                        : 'border-transparent text-[#575C58] hover:text-[#111312]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1">
              {tab === 'orders' && (
                <div className="space-y-4">
                  {ordersLoading ? (
                    <p className="text-sm text-[#575C58] py-8 text-center">Loading your orders...</p>
                  ) : orders.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                      <p className="text-sm font-medium text-[#111312]">No verified orders yet</p>
                      <p className="text-xs text-[#575C58]">
                        Orders placed from the catalog appear here with their linked NABL batch certificates.
                      </p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-xl border border-[#E5E7E3] bg-[#FAFAF9] space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-mono font-semibold text-[#111312] tabular-nums">
                              {order.orderNumber}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={`font-medium capitalize ${
                                order.status === 'cancelled'
                                  ? 'text-[#B42318]'
                                  : 'text-[#0F5E43]'
                              }`}
                            >
                              {order.status}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#575C58]">
                              {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'UPI on Delivery'}
                            </span>
                          </div>
                          <span className="font-mono text-sm font-semibold text-[#111312] tabular-nums">
                            ₹{order.totalInr.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <p className="text-sm text-[#111312]">{order.itemsSummary}</p>
                        <p className="text-xs text-[#575C58]">
                          Drop: {order.campusHostel}, {order.city} — {order.pincode}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5E7E3]">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-[#575C58]">Batch QR:</span>
                            {order.batchCodes.map((code) => (
                              <button
                                key={code}
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onInspectBatch(code);
                                }}
                                className="font-mono text-[#0F5E43] hover:underline"
                              >
                                {code}
                              </button>
                            ))}
                          </div>

                          {order.status === 'confirmed' && (
                            <button
                              type="button"
                              disabled={cancellingId === order.id}
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-xs font-medium text-[#B42318] hover:underline whitespace-nowrap disabled:opacity-50"
                            >
                              {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'verifications' && (
                <div className="space-y-3">
                  {verificationsLoading ? (
                    <p className="text-sm text-[#575C58] py-8 text-center">Loading saved lab checks...</p>
                  ) : verifications.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                      <p className="text-sm font-medium text-[#111312]">No saved batch checks yet</p>
                      <p className="text-xs text-[#575C58]">
                        Verify any tub batch code in the Batch Lab Verifier and save it to keep an audit trail.
                      </p>
                    </div>
                  ) : (
                    verifications.map((ver) => (
                      <div
                        key={ver.id}
                        className="p-4 rounded-xl border border-[#E5E7E3] bg-[#FAFAF9] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-mono font-semibold text-[#111312]">
                              {ver.batchCode}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={`font-medium ${
                                ver.verdict === 'verified' ? 'text-[#0F5E43]' : 'text-[#B42318]'
                              }`}
                            >
                              {ver.verdict === 'verified' ? 'NABL Verified' : 'Unrecognized Code'}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-[#111312] mt-0.5 truncate">
                            {ver.brand} — {ver.productName}
                          </div>
                          <div className="text-xs text-[#575C58] mt-0.5 font-mono tabular-nums">
                            {ver.labName} · {ver.nablCertId}
                            {ver.testedProteinG > 0 && ` · Tested ${ver.testedProteinG}g`}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onInspectBatch(ver.batchCode);
                            }}
                            className="text-xs font-medium text-[#0F5E43] hover:underline whitespace-nowrap"
                          >
                            Inspect
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBatchVerification(ver.id)}
                            aria-label={`Delete saved check ${ver.batchCode}`}
                            className="p-1.5 text-[#575C58] hover:text-[#B42318]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'profile' && (
                <div className="space-y-6">
                  {/* Personal Referral Card */}
                  <div className="p-5 rounded-xl bg-[#FAFAF9] border border-[#E5E7E3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-[#575C58]">Your Peer Referral Code</div>
                      <div className="font-mono text-xl font-semibold text-[#111312] mt-0.5">
                        {profile?.referralCode || 'Generating...'}
                      </div>
                      <p className="text-xs text-[#575C58] mt-1">
                        Share in hostel WhatsApp groups — friends get ₹100 off their first verified tub.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyReferral}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#111312] bg-white text-xs font-medium text-[#111312] hover:bg-[#F2F3F0] transition-colors whitespace-nowrap shrink-0"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-[#0F5E43]" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode ? 'Copied' : 'Copy Code'}
                    </button>
                  </div>

                  {/* Delivery Profile Form */}
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#111312] mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#D4D8D2] text-sm focus:border-[#0F5E43]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#111312] mb-1">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          maxLength={20}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#D4D8D2] text-sm font-mono focus:border-[#0F5E43]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#111312] mb-1">
                        University / Gym Hub
                      </label>
                      <input
                        type="text"
                        maxLength={120}
                        value={campusName}
                        onChange={(e) => setCampusName(e.target.value)}
                        placeholder="DBS Global University, Dehradun"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#D4D8D2] text-sm focus:border-[#0F5E43]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#111312] mb-1">
                        Default Hostel / PG Drop Address
                      </label>
                      <input
                        type="text"
                        maxLength={240}
                        value={hostelOrAddress}
                        onChange={(e) => setHostelOrAddress(e.target.value)}
                        placeholder="Hostel Block & Room No., Dehradun"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#D4D8D2] text-sm focus:border-[#0F5E43]"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-5 py-2.5 rounded-lg bg-[#111312] text-white text-sm font-medium hover:bg-[#262B28] transition-colors disabled:opacity-60 whitespace-nowrap"
                      >
                        {savingProfile ? 'Saving...' : 'Save Profile'}
                      </button>
                      {profileSavedMsg && (
                        <span className="text-xs font-medium text-[#0F5E43]">{profileSavedMsg}</span>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {tab === 'ambassador' && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-semibold text-[#111312]">
                      Dehradun Campus Fitness Ambassador Pilot
                    </h3>
                    <p className="text-xs text-[#575C58] leading-relaxed">
                      Help eliminate counterfeit supplements at your university gym. Ambassadors host live QR batch demos and earn direct monthly credit on referred student orders.
                    </p>
                  </div>

                  {ambassadorApp && (
                    <div className="p-3.5 rounded-lg bg-[#0F5E43]/[0.06] border border-[#0F5E43]/20 text-xs text-[#0F5E43] font-medium">
                      Application Status: {ambassadorApp.status.toUpperCase()} — You can update your campus or gym details below while in review.
                    </div>
                  )}

                  <form onSubmit={handleAmbassadorSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#111312] mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          value={ambName}
                          onChange={(e) => setAmbName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#D4D8D2] text-sm focus:border-[#0F5E43]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#111312] mb-1">
                          University / College Campus
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={120}
                          value={ambCampus}
                          onChange={(e) => setAmbCampus(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#D4D8D2] text-sm focus:border-[#0F5E43]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#111312] mb-1">
                          Primary Gym / Fitness Center
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={120}
                          value={ambGym}
                          onChange={(e) => setAmbGym(e.target.value)}
                          placeholder="e.g. Campus Iron Gym, Dehradun"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#D4D8D2] text-sm focus:border-[#0F5E43]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#111312] mb-1">
                          Instagram / Community Handle (Optional)
                        </label>
                        <input
                          type="text"
                          maxLength={60}
                          value={ambInsta}
                          onChange={(e) => setAmbInsta(e.target.value)}
                          placeholder="@yourhandle"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#D4D8D2] text-sm focus:border-[#0F5E43]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#111312] mb-1">
                        Weekly Training Sessions: <span className="font-mono">{ambWorkouts} days</span>
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={7}
                        value={ambWorkouts}
                        onChange={(e) => setAmbWorkouts(Number(e.target.value))}
                        className="w-full max-w-xs accent-[#0F5E43]"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="submit"
                        disabled={ambSubmitting}
                        className="px-5 py-2.5 rounded-lg bg-[#0F5E43] text-white text-sm font-medium hover:bg-[#0B4A34] transition-colors disabled:opacity-60 whitespace-nowrap"
                      >
                        {ambSubmitting
                          ? 'Submitting...'
                          : ambassadorApp
                          ? 'Update Application'
                          : 'Apply for Pilot'}
                      </button>
                      {ambSavedMsg && (
                        <span className="text-xs font-medium text-[#0F5E43]">{ambSavedMsg}</span>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
