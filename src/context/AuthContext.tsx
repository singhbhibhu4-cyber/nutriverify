import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  BLUEPRINT_LIMITS,
  OperationType,
  auth,
  buildReferralCode,
  db,
  googleProvider,
  handleFirestoreError,
  sanitizeString,
} from '../lib/firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  campusName: string;
  hostelOrAddress: string;
  phone: string;
  referralCode: string;
  referralCount: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SupplementOrder {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  phone: string;
  campusHostel: string;
  city: string;
  pincode: string;
  paymentMethod: 'COD' | 'UPI_ON_DELIVERY';
  referralCodeUsed: string;
  subtotalInr: number;
  discountInr: number;
  totalInr: number;
  itemCount: number;
  itemsSummary: string;
  batchCodes: string[];
  status: 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface BatchVerificationRecord {
  id: string;
  userId: string;
  batchCode: string;
  productName: string;
  brand: string;
  labName: string;
  nablCertId: string;
  claimedProteinG: number;
  testedProteinG: number;
  verdict: 'verified' | 'unrecognized';
  verifiedAt?: Timestamp;
}

export interface AmbassadorApplication {
  userId: string;
  fullName: string;
  campusName: string;
  gymName: string;
  instagramHandle: string;
  weeklyWorkouts: number;
  status: 'submitted' | 'approved' | 'rejected';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface PlaceOrderInput {
  customerName: string;
  phone: string;
  campusHostel: string;
  city: string;
  pincode: string;
  paymentMethod: 'COD' | 'UPI_ON_DELIVERY';
  referralCodeUsed: string;
  subtotalInr: number;
  discountInr: number;
  totalInr: number;
  itemCount: number;
  itemsSummary: string;
  batchCodes: string[];
}

interface SaveVerificationInput {
  batchCode: string;
  productName: string;
  brand: string;
  labName: string;
  nablCertId: string;
  claimedProteinG: number;
  testedProteinG: number;
  verdict: 'verified' | 'unrecognized';
}

interface AmbassadorInput {
  fullName: string;
  campusName: string;
  gymName: string;
  instagramHandle: string;
  weeklyWorkouts: number;
}

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  signingIn: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  profile: UserProfile | null;
  profileLoading: boolean;
  updateProfile: (fields: {
    displayName: string;
    campusName: string;
    hostelOrAddress: string;
    phone: string;
  }) => Promise<void>;
  orders: SupplementOrder[];
  ordersLoading: boolean;
  placeOrder: (input: PlaceOrderInput) => Promise<SupplementOrder>;
  cancelOrder: (orderId: string) => Promise<void>;
  verifications: BatchVerificationRecord[];
  verificationsLoading: boolean;
  saveBatchVerification: (input: SaveVerificationInput) => Promise<void>;
  deleteBatchVerification: (verificationId: string) => Promise<void>;
  ambassadorApp: AmbassadorApplication | null;
  submitAmbassadorApplication: (input: AmbassadorInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function makeClientSafeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [orders, setOrders] = useState<SupplementOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [verifications, setVerifications] = useState<BatchVerificationRecord[]>([]);
  const [verificationsLoading, setVerificationsLoading] = useState(false);

  const [ambassadorApp, setAmbassadorApp] = useState<AmbassadorApplication | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // Ensure user profile exists and subscribe to private user collections once authenticated
  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setProfile(null);
      setOrders([]);
      setVerifications([]);
      setAmbassadorApp(null);
      setProfileLoading(false);
      setOrdersLoading(false);
      setVerificationsLoading(false);
      return;
    }

    let cancelled = false;
    const userDocPath = `users/${user.uid}`;
    const userRef = doc(db, 'users', user.uid);

    const ensureProfile = async () => {
      setProfileLoading(true);
      try {
        const snap = await getDoc(userRef);
        if (!snap.exists() && !cancelled) {
          const initialProfile = {
            uid: user.uid,
            displayName: sanitizeString(
              user.displayName || user.email?.split('@')[0] || 'Student Athlete',
              BLUEPRINT_LIMITS.displayNameMax
            ),
            email: sanitizeString(user.email || '', BLUEPRINT_LIMITS.emailMax),
            campusName: 'DBS Global University, Dehradun',
            hostelOrAddress: '',
            phone: '',
            referralCode: buildReferralCode(user.uid),
            referralCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, initialProfile);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error initializing user profile:', err);
        }
      }
    };

    void ensureProfile();

    const unsubProfile = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        }
        setProfileLoading(false);
      },
      (err) => {
        setProfileLoading(false);
        handleFirestoreError(err, OperationType.GET, userDocPath);
      }
    );

    setOrdersLoading(true);
    const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubOrders = onSnapshot(
      ordersQuery,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<SupplementOrder, 'id'>) }))
          .sort((a, b) => {
            const aMs = a.createdAt?.toMillis?.() ?? 0;
            const bMs = b.createdAt?.toMillis?.() ?? 0;
            return bMs - aMs;
          });
        setOrders(list);
        setOrdersLoading(false);
      },
      (err) => {
        setOrdersLoading(false);
        handleFirestoreError(err, OperationType.LIST, 'orders');
      }
    );

    setVerificationsLoading(true);
    const verificationsQuery = query(
      collection(db, 'batchVerifications'),
      where('userId', '==', user.uid)
    );
    const unsubVerifications = onSnapshot(
      verificationsQuery,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<BatchVerificationRecord, 'id'>) }))
          .sort((a, b) => {
            const aMs = a.verifiedAt?.toMillis?.() ?? 0;
            const bMs = b.verifiedAt?.toMillis?.() ?? 0;
            return bMs - aMs;
          });
        setVerifications(list);
        setVerificationsLoading(false);
      },
      (err) => {
        setVerificationsLoading(false);
        handleFirestoreError(err, OperationType.LIST, 'batchVerifications');
      }
    );

    const ambRef = doc(db, 'ambassadorApplications', user.uid);
    const unsubAmbassador = onSnapshot(
      ambRef,
      (snap) => {
        if (snap.exists()) {
          setAmbassadorApp(snap.data() as AmbassadorApplication);
        } else {
          setAmbassadorApp(null);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `ambassadorApplications/${user.uid}`);
      }
    );

    return () => {
      cancelled = true;
      unsubProfile();
      unsubOrders();
      unsubVerifications();
      unsubAmbassador();
    };
  }, [authReady, user]);

  const signInWithGoogle = async (): Promise<User | null> => {
    setSigningIn(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setAuthError('Sign-in window was closed before completing Google authentication.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('Your browser blocked the Google Sign-In popup. Please allow popups for this site and try again.');
      } else {
        setAuthError('Unable to complete Google Sign-In right now. Please try again.');
      }
      return null;
    } finally {
      setSigningIn(false);
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const updateProfile = async (fields: {
    displayName: string;
    campusName: string;
    hostelOrAddress: string;
    phone: string;
  }) => {
    if (!user) throw new Error('Please sign in with Google first.');
    const path = `users/${user.uid}`;
    const userRef = doc(db, 'users', user.uid);
    const safeName = sanitizeString(fields.displayName, BLUEPRINT_LIMITS.displayNameMax) || 'Student Athlete';
    try {
      await updateDoc(userRef, {
        displayName: safeName,
        campusName: sanitizeString(fields.campusName, BLUEPRINT_LIMITS.campusNameMax),
        hostelOrAddress: sanitizeString(fields.hostelOrAddress, BLUEPRINT_LIMITS.hostelOrAddressMax),
        phone: sanitizeString(fields.phone, BLUEPRINT_LIMITS.phoneMax),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const placeOrder = async (input: PlaceOrderInput): Promise<SupplementOrder> => {
    if (!user) throw new Error('Please sign in with Google to place your verified order.');
    const orderId = makeClientSafeId('ord');
    const orderNumber = `NV-${Math.floor(100000 + Math.random() * 899999)}`;
    const subtotalInr = Math.max(1, Math.round(input.subtotalInr));
    const discountInr = Math.max(0, Math.min(subtotalInr - 1, Math.round(input.discountInr)));
    const totalInr = subtotalInr - discountInr;

    const cleanBatchCodes = input.batchCodes
      .map((code) => code.trim().toUpperCase().slice(0, 40))
      .filter((code) => code.length >= 3)
      .slice(0, BLUEPRINT_LIMITS.batchCodesMax);

    const payload = {
      orderNumber,
      userId: user.uid,
      customerName: sanitizeString(input.customerName, BLUEPRINT_LIMITS.displayNameMax),
      phone: sanitizeString(input.phone, BLUEPRINT_LIMITS.phoneMax),
      campusHostel: sanitizeString(input.campusHostel, BLUEPRINT_LIMITS.hostelOrAddressMax),
      city: sanitizeString(input.city, BLUEPRINT_LIMITS.cityMax),
      pincode: input.pincode.replace(/[^0-9]/g, '').slice(0, 12),
      paymentMethod: input.paymentMethod,
      referralCodeUsed: sanitizeString(input.referralCodeUsed.toUpperCase(), BLUEPRINT_LIMITS.referralCodeMax),
      subtotalInr,
      discountInr,
      totalInr,
      itemCount: Math.max(1, Math.min(20, Math.round(input.itemCount))),
      itemsSummary: sanitizeString(input.itemsSummary, BLUEPRINT_LIMITS.itemsSummaryMax),
      batchCodes: cleanBatchCodes.length > 0 ? cleanBatchCodes : ['NV-AVV-2611-04'],
      status: 'confirmed' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const path = `orders/${orderId}`;
    try {
      await setDoc(doc(db, 'orders', orderId), payload);
      return {
        id: orderId,
        ...payload,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!user) throw new Error('Please sign in with Google first.');
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const saveBatchVerification = async (input: SaveVerificationInput) => {
    if (!user) throw new Error('Please sign in with Google to save batch verifications.');
    const verId = makeClientSafeId('ver');
    const cleanBatch = input.batchCode
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '')
      .slice(0, 40);

    const payload = {
      userId: user.uid,
      batchCode: cleanBatch.length >= 3 ? cleanBatch : 'UNKNOWN',
      productName: sanitizeString(input.productName, BLUEPRINT_LIMITS.productNameMax) || 'Unrecognized Product',
      brand: sanitizeString(input.brand, BLUEPRINT_LIMITS.brandMax) || 'Unverified Source',
      labName: sanitizeString(input.labName, BLUEPRINT_LIMITS.labNameMax) || 'No NABL Record Found',
      nablCertId: sanitizeString(input.nablCertId, BLUEPRINT_LIMITS.nablCertIdMax) || 'NONE',
      claimedProteinG: Math.max(0, Math.min(100, Number(input.claimedProteinG) || 0)),
      testedProteinG: Math.max(0, Math.min(100, Number(input.testedProteinG) || 0)),
      verdict: input.verdict,
      verifiedAt: serverTimestamp(),
    };

    const path = `batchVerifications/${verId}`;
    try {
      await setDoc(doc(db, 'batchVerifications', verId), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const deleteBatchVerification = async (verificationId: string) => {
    if (!user) throw new Error('Please sign in with Google first.');
    const path = `batchVerifications/${verificationId}`;
    try {
      await deleteDoc(doc(db, 'batchVerifications', verificationId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const submitAmbassadorApplication = async (input: AmbassadorInput) => {
    if (!user) throw new Error('Please sign in with Google to apply.');
    const path = `ambassadorApplications/${user.uid}`;
    const appRef = doc(db, 'ambassadorApplications', user.uid);
    const weeklyWorkouts = Math.max(1, Math.min(14, Math.round(input.weeklyWorkouts)));

    try {
      const existingSnap = await getDoc(appRef);
      if (existingSnap.exists()) {
        await updateDoc(appRef, {
          fullName: sanitizeString(input.fullName, BLUEPRINT_LIMITS.displayNameMax),
          campusName: sanitizeString(input.campusName, BLUEPRINT_LIMITS.campusNameMax),
          gymName: sanitizeString(input.gymName, BLUEPRINT_LIMITS.campusNameMax),
          instagramHandle: sanitizeString(input.instagramHandle, BLUEPRINT_LIMITS.instagramHandleMax),
          weeklyWorkouts,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(appRef, {
          userId: user.uid,
          fullName: sanitizeString(input.fullName, BLUEPRINT_LIMITS.displayNameMax),
          campusName: sanitizeString(input.campusName, BLUEPRINT_LIMITS.campusNameMax),
          gymName: sanitizeString(input.gymName, BLUEPRINT_LIMITS.campusNameMax),
          instagramHandle: sanitizeString(input.instagramHandle, BLUEPRINT_LIMITS.instagramHandleMax),
          weeklyWorkouts,
          status: 'submitted',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        signingIn,
        authError,
        clearAuthError: () => setAuthError(null),
        signInWithGoogle,
        signOutUser,
        profile,
        profileLoading,
        updateProfile,
        orders,
        ordersLoading,
        placeOrder,
        cancelOrder,
        verifications,
        verificationsLoading,
        saveBatchVerification,
        deleteBatchVerification,
        ambassadorApp,
        submitAmbassadorApplication,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
