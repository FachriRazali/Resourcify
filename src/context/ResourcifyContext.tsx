import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  ADMIN_CREDENTIALS,
  ADMIN_USER,
  COLLECTOR_USER,
  INITIAL_PICKUPS,
  INITIAL_REDEMPTIONS,
  INITIAL_RESIDENT,
  REWARD_PRODUCTS,
  SECOND_RESIDENT,
} from '../data/seedData';
import {
  AdminSection,
  PageRoute,
  PickupRecord,
  RedemptionRecord,
  ResidentUser,
  RewardProduct,
  UserRole,
} from '../types/resourcify';

interface SignupPayload {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  address: string;
}

interface BookPickupPayload {
  pickup_date: string;
  address: string;
  weight_kg: number;
  photo_url: string;
  waste_summary: string;
}

type RewardFormPayload = Omit<RewardProduct, 'id' | 'in_stock'>;

interface ResourcifyContextValue {
  currentPage: PageRoute;
  adminSection: AdminSection;
  setAdminSection: (section: AdminSection) => void;
  navigate: (page: PageRoute) => void;
  currentUser: ResidentUser | null;
  pickups: PickupRecord[];
  redemptions: RedemptionRecord[];
  allPickups: PickupRecord[];
  allRedemptions: RedemptionRecord[];
  allUsers: ResidentUser[];
  allResidents: ResidentUser[];
  rewards: RewardProduct[];
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signup: (payload: SignupPayload) => { ok: boolean; error?: string };
  logout: () => void;
  bookPickup: (payload: BookPickupPayload) => PickupRecord;
  redeemReward: (product: RewardProduct) => { ok: boolean; error?: string; redemption?: RedemptionRecord };
  approvePickup: (pickupId: string, verifiedWeightKg: number, note?: string) => void;
  rejectPickup: (pickupId: string, reason: string) => void;
  markRedemptionFulfilled: (redemptionId: string) => void;
  addRewardItem: (payload: RewardFormPayload) => RewardProduct;
  updateRewardItem: (id: string, payload: RewardFormPayload) => void;
  deleteRewardItem: (id: string) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
}

const ResourcifyContext = createContext<ResourcifyContextValue | undefined>(undefined);

const VALID_PAGES: PageRoute[] = ['index', 'auth', 'dashboard', 'book_pickup', 'rewards', 'admin'];

function getInitialRoute(): PageRoute {
  const hash = window.location.hash.replace('#', '') as PageRoute;
  if (VALID_PAGES.includes(hash)) {
    return hash;
  }
  return 'dashboard';
}

export function ResourcifyProvider({ children }: { children: React.ReactNode }) {
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, ResidentUser>>({
    [INITIAL_RESIDENT.email.toLowerCase()]: INITIAL_RESIDENT,
    [SECOND_RESIDENT.email.toLowerCase()]: SECOND_RESIDENT,
    [COLLECTOR_USER.email.toLowerCase()]: COLLECTOR_USER,
    [ADMIN_USER.email.toLowerCase()]: ADMIN_USER,
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(
    INITIAL_RESIDENT.email.toLowerCase()
  );
  const [currentPage, setCurrentPage] = useState<PageRoute>(getInitialRoute);
  const [adminSection, setAdminSection] = useState<AdminSection>('overview');
  const [pickups, setPickups] = useState<PickupRecord[]>(INITIAL_PICKUPS);
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>(INITIAL_REDEMPTIONS);
  const [rewards, setRewards] = useState<RewardProduct[]>(REWARD_PRODUCTS);

  const currentUser = currentUserEmail ? registeredUsers[currentUserEmail] ?? null : null;

  const navigate = useCallback((page: PageRoute) => {
    setCurrentPage(page);
    if (window.location.hash !== `#${page}`) {
      window.location.hash = page;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageRoute;
      if (VALID_PAGES.includes(hash)) {
        setCurrentPage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const login = useCallback(
    (email: string, password: string) => {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !password.trim()) {
        return { ok: false, error: 'Please enter both your email and password.' };
      }

      if (trimmedEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
        if (password.trim() !== ADMIN_CREDENTIALS.password) {
          return { ok: false, error: 'Invalid admin password. Please try again.' };
        }
        setCurrentUserEmail(trimmedEmail);
        setAdminSection('overview');
        navigate('admin');
        return { ok: true };
      }

      const existing = registeredUsers[trimmedEmail];
      if (existing) {
        setCurrentUserEmail(trimmedEmail);
        if (existing.role === 'admin') {
          setAdminSection('overview');
          navigate('admin');
        } else {
          navigate('dashboard');
        }
        return { ok: true };
      }

      const displayName = trimmedEmail
        .split('@')[0]
        .split(/[._-]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      const guestResident: ResidentUser = {
        ...INITIAL_RESIDENT,
        id: `res_${Date.now()}`,
        role: 'resident',
        email: email.trim(),
        full_name: displayName || 'Resident Member',
      };
      setRegisteredUsers((prev) => ({ ...prev, [trimmedEmail]: guestResident }));
      setCurrentUserEmail(trimmedEmail);
      navigate('dashboard');
      return { ok: true };
    },
    [registeredUsers, navigate]
  );

  const signup = useCallback(
    (payload: SignupPayload) => {
      const trimmedEmail = payload.email.trim().toLowerCase();
      if (!trimmedEmail || !payload.password.trim() || !payload.full_name.trim() || !payload.address.trim()) {
        return { ok: false, error: 'Please complete all required resident details.' };
      }
      if (trimmedEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
        return { ok: false, error: 'This email is reserved for operations administration.' };
      }
      const newResident: ResidentUser = {
        id: `res_${Date.now()}`,
        role: 'resident',
        email: payload.email.trim(),
        full_name: payload.full_name.trim(),
        phone: payload.phone.trim() || '+1 (415) 555-0148',
        address: payload.address.trim(),
        ecocoin_balance: 50,
        total_waste_kg: 0,
        ecocoins_earned_all_time: 50,
      };
      setRegisteredUsers((prev) => ({ ...prev, [trimmedEmail]: newResident }));
      setCurrentUserEmail(trimmedEmail);
      navigate('dashboard');
      return { ok: true };
    },
    [navigate]
  );

  const logout = useCallback(() => {
    setCurrentUserEmail(null);
    navigate('index');
  }, [navigate]);

  const bookPickup = useCallback(
    (payload: BookPickupPayload) => {
      const activeUserId = currentUser?.id ?? INITIAL_RESIDENT.id;
      const newPickup: PickupRecord = {
        id: `pk_${Date.now()}`,
        resident_id: activeUserId,
        pickup_date: payload.pickup_date,
        address: payload.address.trim(),
        weight_kg: Number(payload.weight_kg),
        photo_url: payload.photo_url,
        waste_summary: payload.waste_summary.trim() || 'Sorted household recyclables',
        status: 'Pending',
        ecocoins_awarded: 0,
      };
      setPickups((prev) => [newPickup, ...prev]);
      return newPickup;
    },
    [currentUser]
  );

  const redeemReward = useCallback(
    (product: RewardProduct) => {
      if (!currentUser) {
        return { ok: false, error: 'Please sign in to redeem rewards.' };
      }
      if (currentUser.ecocoin_balance < product.ecocoin_cost) {
        return {
          ok: false,
          error: `You need ${product.ecocoin_cost - currentUser.ecocoin_balance} more EcoCoins for this reward.`,
        };
      }
      const key = currentUser.email.toLowerCase();
      setRegisteredUsers((prev) => {
        const user = prev[key];
        if (!user) return prev;
        return {
          ...prev,
          [key]: {
            ...user,
            ecocoin_balance: user.ecocoin_balance - product.ecocoin_cost,
          },
        };
      });
      setRewards((prev) =>
        prev.map((item) =>
          item.id === product.id && item.stock > 0
            ? {
                ...item,
                stock: item.stock - 1,
                in_stock: item.stock - 1 > 0,
              }
            : item
        )
      );
      const codeNum = Math.floor(1000 + Math.random() * 9000);
      const newRedemption: RedemptionRecord = {
        id: `red_${Date.now()}`,
        resident_id: currentUser.id,
        reward_name: product.name,
        partner_name: product.partner,
        ecocoins_spent: product.ecocoin_cost,
        redeemed_at: new Date().toISOString(),
        voucher_code: `RSC-${codeNum}`,
        status: 'Ready for pickup',
      };
      setRedemptions((prev) => [newRedemption, ...prev]);
      return { ok: true, redemption: newRedemption };
    },
    [currentUser]
  );

  const approvePickup = useCallback(
    (pickupId: string, verifiedWeightKg: number, note?: string) => {
      const target = pickups.find((p) => p.id === pickupId);
      if (!target || target.status !== 'Pending') return;

      const cleanWeight = Math.max(0.5, Number(verifiedWeightKg.toFixed(1)));
      const awardedCoins = Math.round(cleanWeight * 10);

      setPickups((prev) =>
        prev.map((item) =>
          item.id === pickupId
            ? {
                ...item,
                weight_kg: cleanWeight,
                status: 'Approved',
                ecocoins_awarded: awardedCoins,
                reviewer_note: note?.trim() || undefined,
              }
            : item
        )
      );

      setRegisteredUsers((prev) => {
        const next = { ...prev };
        for (const [emailKey, user] of Object.entries(next)) {
          if (user.id === target.resident_id) {
            next[emailKey] = {
              ...user,
              ecocoin_balance: user.ecocoin_balance + awardedCoins,
              total_waste_kg: Number((user.total_waste_kg + cleanWeight).toFixed(1)),
              ecocoins_earned_all_time: user.ecocoins_earned_all_time + awardedCoins,
            };
          }
        }
        return next;
      });
    },
    [pickups]
  );

  const rejectPickup = useCallback((pickupId: string, reason: string) => {
    setPickups((prev) =>
      prev.map((item) =>
        item.id === pickupId && item.status === 'Pending'
          ? {
              ...item,
              status: 'Rejected',
              ecocoins_awarded: 0,
              reviewer_note:
                reason.trim() ||
                'Sorted items did not meet cleanliness or separation standards.',
            }
          : item
      )
    );
  }, []);

  const markRedemptionFulfilled = useCallback((redemptionId: string) => {
    setRedemptions((prev) =>
      prev.map((item) =>
        item.id === redemptionId ? { ...item, status: 'Redeemed' } : item
      )
    );
  }, []);

  const addRewardItem = useCallback((payload: RewardFormPayload) => {
    const created: RewardProduct = {
      ...payload,
      id: `rew_${Date.now()}`,
      in_stock: payload.stock > 0,
    };
    setRewards((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateRewardItem = useCallback((id: string, payload: RewardFormPayload) => {
    setRewards((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...payload,
              in_stock: payload.stock > 0,
            }
          : item
      )
    );
  }, []);

  const deleteRewardItem = useCallback((id: string) => {
    setRewards((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateUserRole = useCallback((userId: string, role: UserRole) => {
    setRegisteredUsers((prev) => {
      const next = { ...prev };
      for (const [emailKey, user] of Object.entries(next)) {
        if (user.id === userId) {
          next[emailKey] = { ...user, role };
        }
      }
      return next;
    });
  }, []);

  const userPickups = currentUser
    ? pickups.filter((p) => p.resident_id === currentUser.id)
    : [];

  const userRedemptions = currentUser
    ? redemptions.filter((r) => r.resident_id === currentUser.id)
    : [];

  const allUsers = Object.values(registeredUsers);
  const allResidents = allUsers.filter((u) => u.role === 'resident');

  return (
    <ResourcifyContext.Provider
      value={{
        currentPage,
        adminSection,
        setAdminSection,
        navigate,
        currentUser,
        pickups: userPickups,
        redemptions: userRedemptions,
        allPickups: pickups,
        allRedemptions: redemptions,
        allUsers,
        allResidents,
        rewards,
        login,
        signup,
        logout,
        bookPickup,
        redeemReward,
        approvePickup,
        rejectPickup,
        markRedemptionFulfilled,
        addRewardItem,
        updateRewardItem,
        deleteRewardItem,
        updateUserRole,
      }}
    >
      {children}
    </ResourcifyContext.Provider>
  );
}

export function useResourcify() {
  const ctx = useContext(ResourcifyContext);
  if (!ctx) {
    throw new Error('useResourcify must be used inside ResourcifyProvider');
  }
  return ctx;
}
