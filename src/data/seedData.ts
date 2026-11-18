import { PickupRecord, RedemptionRecord, ResidentUser, RewardProduct } from '../types/resourcify';

export const ADMIN_CREDENTIALS = {
  email: 'admin@resourcify.co',
  password: 'admin1234',
};

export const RESIDENT_DEMO_CREDENTIALS = {
  email: 'clara.vance@resourcify.co',
  password: 'resourcify2026',
};

export const ADMIN_USER: ResidentUser = {
  id: 'adm_marcus_01',
  role: 'admin',
  email: 'admin@resourcify.co',
  full_name: 'Marcus Chen',
  phone: '+1 (415) 890-0100',
  address: 'Resourcify Central Sorting Hub\n240 Folsom St, San Francisco, CA 94105',
  ecocoin_balance: 0,
  total_waste_kg: 0,
  ecocoins_earned_all_time: 0,
};

export const SAMPLE_WASTE_PHOTOS = [
  {
    label: 'Sorted glass, cardboard & aluminum',
    url: '/src/assets/images/waste_sorted_crates_1794849178004.jpg',
  },
  {
    label: 'Bundled kraft paper & clear PET',
    url: '/src/assets/images/waste_pet_paper_1794849178495.jpg',
  },
  {
    label: 'Rinsed pantry glass & corrugated boxes',
    url: '/src/assets/images/waste_mixed_glass_1794849178169.jpg',
  },
];

export const INITIAL_RESIDENT: ResidentUser = {
  id: 'res_clara_01',
  role: 'resident',
  email: 'clara.vance@resourcify.co',
  full_name: 'Clara Vance',
  phone: '+1 (415) 890-4312',
  address: '742 Evergreen Terrace, Apt 3B\nSan Francisco, CA 94110',
  ecocoin_balance: 210,
  total_waste_kg: 51,
  ecocoins_earned_all_time: 510,
};

export const SECOND_RESIDENT: ResidentUser = {
  id: 'res_daniel_02',
  role: 'resident',
  email: 'daniel.okafor@resourcify.co',
  full_name: 'Daniel Okafor',
  phone: '+1 (415) 722-9104',
  address: '118 Valencia St, Unit 4A\nSan Francisco, CA 94103',
  ecocoin_balance: 240,
  total_waste_kg: 24,
  ecocoins_earned_all_time: 240,
};

export const INITIAL_PICKUPS: PickupRecord[] = [
  {
    id: 'pk_105',
    resident_id: 'res_clara_01',
    pickup_date: '2026-11-15T09:30:00',
    address: '742 Evergreen Terrace, Apt 3B\nSan Francisco, CA 94110',
    weight_kg: 14.0,
    photo_url: '/src/assets/images/waste_pet_paper_1794849178495.jpg',
    waste_summary: 'Bundled kraft paper & rinsed clear PET bottles',
    status: 'Pending',
    ecocoins_awarded: 0,
  },
  {
    id: 'pk_106',
    resident_id: 'res_daniel_02',
    pickup_date: '2026-11-16T10:15:00',
    address: '118 Valencia St, Unit 4A\nSan Francisco, CA 94103',
    weight_kg: 11.5,
    photo_url: '/src/assets/images/waste_sorted_crates_1794849178004.jpg',
    waste_summary: 'Clear glass bottles, crushed cans & flattened cardboard',
    status: 'Pending',
    ecocoins_awarded: 0,
  },
  {
    id: 'pk_104',
    resident_id: 'res_clara_01',
    pickup_date: '2026-11-11T10:00:00',
    address: '742 Evergreen Terrace, Apt 3B\nSan Francisco, CA 94110',
    weight_kg: 18.5,
    photo_url: '/src/assets/images/waste_sorted_crates_1794849178004.jpg',
    waste_summary: 'Rinsed glass jars, flattened cardboard & crushed aluminum',
    status: 'Approved',
    ecocoins_awarded: 185,
  },
  {
    id: 'pk_103',
    resident_id: 'res_clara_01',
    pickup_date: '2026-10-29T09:00:00',
    address: '742 Evergreen Terrace, Apt 3B\nSan Francisco, CA 94110',
    weight_kg: 19.0,
    photo_url: '/src/assets/images/waste_mixed_glass_1794849178169.jpg',
    waste_summary: 'Amber condiment glass & folded corrugated shipping boxes',
    status: 'Approved',
    ecocoins_awarded: 190,
  },
  {
    id: 'pk_102',
    resident_id: 'res_clara_01',
    pickup_date: '2026-10-14T11:15:00',
    address: '742 Evergreen Terrace, Apt 3B\nSan Francisco, CA 94110',
    weight_kg: 13.5,
    photo_url: '/src/assets/images/waste_sorted_crates_1794849178004.jpg',
    waste_summary: 'Sorted household paperboard & clear beverage bottles',
    status: 'Approved',
    ecocoins_awarded: 135,
  },
  {
    id: 'pk_100',
    resident_id: 'res_daniel_02',
    pickup_date: '2026-11-03T09:00:00',
    address: '118 Valencia St, Unit 4A\nSan Francisco, CA 94103',
    weight_kg: 24.0,
    photo_url: '/src/assets/images/waste_mixed_glass_1794849178169.jpg',
    waste_summary: 'Pantry glass jars & sorted corrugated cardboard',
    status: 'Approved',
    ecocoins_awarded: 240,
  },
  {
    id: 'pk_101',
    resident_id: 'res_clara_01',
    pickup_date: '2026-10-02T08:45:00',
    address: '742 Evergreen Terrace, Apt 3B\nSan Francisco, CA 94110',
    weight_kg: 8.0,
    photo_url: '/src/assets/images/waste_mixed_glass_1794849178169.jpg',
    waste_summary: 'Mixed glass & paperboard containers',
    status: 'Rejected',
    ecocoins_awarded: 0,
    reviewer_note: 'Containers contained residual food oil; please rinse jars before pickup.',
  },
];

export const INITIAL_REDEMPTIONS: RedemptionRecord[] = [
  {
    id: 'red_402',
    resident_id: 'res_clara_01',
    reward_name: 'Seasonal Organic Produce Crate',
    partner_name: 'Greenleaf Local Market',
    ecocoins_spent: 160,
    redeemed_at: '2026-11-12T16:20:00',
    voucher_code: 'RSC-8492',
    status: 'Ready for pickup',
  },
  {
    id: 'red_401',
    resident_id: 'res_clara_01',
    reward_name: 'Botanical Glass Home Refill Set',
    partner_name: 'Grove Pantry Refillery',
    ecocoins_spent: 140,
    redeemed_at: '2026-10-31T14:05:00',
    voucher_code: 'RSC-7104',
    status: 'Redeemed',
  },
];

export const REWARD_PRODUCTS: RewardProduct[] = [
  {
    id: 'rew_produce_crate',
    name: 'Seasonal Organic Produce Crate',
    partner: 'Greenleaf Local Market',
    category: 'Produce',
    ecocoin_cost: 160,
    unit_label: '4.5 kg harvest box',
    image_url: '/src/assets/images/reward_organic_produce_1794849179209.jpg',
    description: 'Heirloom tomatoes, Tuscan kale, Hass avocados, and Meyer lemons sourced from regional organic farms.',
    in_stock: true,
  },
  {
    id: 'rew_pantry_kit',
    name: 'Zero-Waste Pantry Staples Kit',
    partner: 'Hearth & Grain Co-op',
    category: 'Pantry',
    ecocoin_cost: 220,
    unit_label: '4-piece refill set',
    image_url: '/src/assets/images/reward_pantry_staples_1794849179106.jpg',
    description: 'Organic rolled oats in cork-sealed glass, cold-pressed extra virgin olive oil, raw wildflower honey, and country sourdough.',
    in_stock: true,
  },
  {
    id: 'rew_home_refills',
    name: 'Botanical Glass Home Refill Set',
    partner: 'Grove Pantry Refillery',
    category: 'Home Refills',
    ecocoin_cost: 140,
    unit_label: '2 glass bottles + 3 cloths',
    image_url: '/src/assets/images/reward_home_refills_1794849179739.jpg',
    description: 'Refillable amber glass geranium dish soap, frosted lavender hand wash, and three unbleached organic waffle cloths.',
    in_stock: true,
  },
];
