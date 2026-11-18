import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  INITIAL_PICKUPS,
  INITIAL_REDEMPTIONS,
  INITIAL_RESIDENT,
  REWARD_PRODUCTS,
} from '../data/seedData';
import {
  PageRoute,
  PickupRecord,
  RedemptionRecord,
  ResidentUser,
  RewardProduct,
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

interface ResourcifyContextValue {
  currentPage: PageRoute;
  navigate: (page: PageRoute) => void;
  currentUser: ResidentUser | null;
  pickups: PickupRecord[];
  redemptions: RedemptionRecord[];
  rewards: RewardProduct[];
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signup: (payload: SignupPayload) => { ok: boolean; error?: string };
  logout: () => void;
  bookPickup: (payload: BookPickupPayload) => PickupRecord;
  redeemReward: (product: RewardProduct) => { ok: boolean; error?: string; redemption?: RedemptionRecord };
}

const ResourcifyContext = createContext<ResourcifyContextValue | undefined>(undefined);

const VALID_PAGES: PageRoute[] = ['index', 'auth', 'dashboard', 'book_pickup', 'rewards'];

function getInitialRoute(): PageRoute {
  const hash = window.location.hash.replace('#', '') as PageRoute;
  if (VALID_PAGES.includes(hash)) {
    return hash;
  }
  return 'dashboard';
}

export function ResourcifyProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<ResidentUser | null>(INITIAL_RESIDENT);
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, ResidentUser>>({
    [INITIAL_RESIDENT.email.toLowerCase()]: INITIAL_RESIDENT,
  });
  const [currentPage, setCurrentPage] = useState<PageRoute>(getInitialRoute);
  const [pickups, setPickups] = useState<PickupRecord[]>(INITIAL_PICKUPS);
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>(INITIAL_REDEMPTIONS);

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
      const existing = registeredUsers[trimmedEmail];
      if (existing) {
        setCurrentUser(existing);
      } else {
        const displayName = trimmedEmail
          .split('@')[0]
          .split(/[._-]/)
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
        const guestResident: ResidentUser = {
          ...INITIAL_RESIDENT,
          email: email.trim(),
          full_name: displayName || 'Resident Member',
        };
        setRegisteredUsers((prev) => ({ ...prev, [trimmedEmail]: guestResident }));
        setCurrentUser(guestResident);
      }
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
      const newResident: ResidentUser = {
        id: `res_${Date.now()}`,
        email: payload.email.trim(),
        full_name: payload.full_name.trim(),
        phone: payload.phone.trim() || '+1 (415) 555-0148',
        address: payload.address.trim(),
        ecocoin_balance: 50, // Welcome bonus for joining
        total_waste_kg: 0,
        ecocoins_earned_all_time: 50,
      };
      setRegisteredUsers((prev) => ({ ...prev, [trimmedEmail]: newResident }));
      setCurrentUser(newResident);
      navigate('dashboard');
      return { ok: true };
    },
    [navigate]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
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
      const updatedUser: ResidentUser = {
        ...currentUser,
        ecocoin_balance: currentUser.ecocoin_balance - product.ecocoin_cost,
      };
      setCurrentUser(updatedUser);
      setRegisteredUsers((prev) => ({
        ...prev,
        [updatedUser.email.toLowerCase()]: updatedUser,
      }));
      const codeNum = Math.floor(1000 + Math.random() * 9000);
      const newRedemption: RedemptionRecord = {
        id: `red_${Date.now()}`,
        resident_id: updatedUser.id,
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

  const userPickups = currentUser
    ? pickups.filter((p) => p.resident_id === currentUser.id)
    : [];

  const userRedemptions = currentUser
    ? redemptions.filter((r) => r.resident_id === currentUser.id)
    : [];

  return (
    <ResourcifyContext.Provider
      value={{
        currentPage,
        navigate,
        currentUser,
        pickups: userPickups,
        redemptions: userRedemptions,
        rewards: REWARD_PRODUCTS,
        login,
        signup,
        logout,
        bookPickup,
        redeemReward,
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
