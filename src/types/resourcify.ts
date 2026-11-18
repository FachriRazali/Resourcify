export type PageRoute =
  | 'index'
  | 'auth'
  | 'dashboard'
  | 'book_pickup'
  | 'rewards'
  | 'admin';

export type AdminSection = 'overview' | 'catalog' | 'operations';

export type UserRole = 'resident' | 'collector' | 'admin';

export type PickupStatus = 'Approved' | 'Pending' | 'Rejected';

export type RedemptionStatus = 'Ready for pickup' | 'Redeemed';

export interface ResidentUser {
  id: string;
  role: UserRole;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  ecocoin_balance: number;
  total_waste_kg: number;
  ecocoins_earned_all_time: number;
}

export interface PickupRecord {
  id: string;
  resident_id: string;
  pickup_date: string;
  address: string;
  weight_kg: number;
  photo_url: string;
  waste_summary: string;
  status: PickupStatus;
  ecocoins_awarded: number;
  reviewer_note?: string;
}

export interface RewardProduct {
  id: string;
  name: string;
  partner: string;
  category: 'Produce' | 'Pantry' | 'Home Refills';
  ecocoin_cost: number;
  unit_label: string;
  stock: number;
  image_url: string;
  description: string;
  in_stock: boolean;
}

export interface RedemptionRecord {
  id: string;
  resident_id: string;
  reward_name: string;
  partner_name: string;
  ecocoins_spent: number;
  redeemed_at: string;
  voucher_code: string;
  status: RedemptionStatus;
}
