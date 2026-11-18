import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { StatusBadge } from '../components/StatusBadge';
import { useResourcify } from '../context/ResourcifyContext';
import { REWARD_IMAGE_PRESETS } from '../data/seedData';
import {
  PickupRecord,
  PickupStatus,
  RewardProduct,
  UserRole,
} from '../types/resourcify';

type QueueFilter = 'All' | PickupStatus;

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return (
    d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) +
    ' · ' +
    d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  );
}

function getRoleBadgeStyle(role: UserRole): string {
  if (role === 'resident') {
    return 'bg-[#4CAF50]/12 text-[#2E7D32] border-[#4CAF50]/25';
  }
  if (role === 'collector') {
    return 'bg-[#F1F3F5] text-[#4B5563] border-[#D1D5DB]';
  }
  return 'bg-[#212121] text-[#FFFFFF] border-[#212121]';
}

interface RewardDraft {
  name: string;
  partner: string;
  category: RewardProduct['category'];
  ecocoin_cost: string;
  unit_label: string;
  stock: string;
  image_url: string;
  description: string;
}

const EMPTY_REWARD_DRAFT: RewardDraft = {
  name: '',
  partner: '',
  category: 'Produce',
  ecocoin_cost: '150',
  unit_label: '1 bundle',
  stock: '20',
  image_url: REWARD_IMAGE_PRESETS[0].url,
  description: '',
};

export function AdminDashboardPage() {
  const {
    currentUser,
    adminSection,
    allPickups,
    allUsers,
    allRedemptions,
    rewards,
    approvePickup,
    rejectPickup,
    markRedemptionFulfilled,
    addRewardItem,
    updateRewardItem,
    deleteRewardItem,
    updateUserRole,
  } = useResourcify();

  const [queueFilter, setQueueFilter] = useState<QueueFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [weightOverrides, setWeightOverrides] = useState<Record<string, string>>({});
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [previewPickup, setPreviewPickup] = useState<PickupRecord | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Reward CRUD Modal State
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [rewardDraft, setRewardDraft] = useState<RewardDraft>(EMPTY_REWARD_DRAFT);
  const [rewardFormError, setRewardFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u]));

  const totalPlatformWasteKg = allPickups
    .filter((p) => p.status === 'Approved')
    .reduce((sum, p) => sum + p.weight_kg, 0);

  const activeUsersCount = allUsers.filter(
    (u) => u.role === 'resident' || u.role === 'collector'
  ).length;

  const totalEcoCoinsRedeemed = allRedemptions.reduce(
    (sum, r) => sum + r.ecocoins_spent,
    0
  );
  const totalActiveRewardsStock = rewards.reduce((sum, r) => sum + r.stock, 0);

  const filteredPickups = allPickups.filter((pickup) => {
    const matchesStatus =
      queueFilter === 'All' ? true : pickup.status === queueFilter;
    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;
    const resident = userMap[pickup.resident_id];
    const q = searchQuery.trim().toLowerCase();
    return (
      pickup.waste_summary.toLowerCase().includes(q) ||
      pickup.address.toLowerCase().includes(q) ||
      (resident?.full_name.toLowerCase().includes(q) ?? false) ||
      (resident?.email.toLowerCase().includes(q) ?? false)
    );
  });

  const openAddRewardModal = () => {
    setEditingRewardId(null);
    setRewardDraft(EMPTY_REWARD_DRAFT);
    setRewardFormError(null);
    setRewardModalOpen(true);
  };

  const openEditRewardModal = (item: RewardProduct) => {
    setEditingRewardId(item.id);
    setRewardDraft({
      name: item.name,
      partner: item.partner,
      category: item.category,
      ecocoin_cost: String(item.ecocoin_cost),
      unit_label: item.unit_label,
      stock: String(item.stock),
      image_url: item.image_url,
      description: item.description,
    });
    setRewardFormError(null);
    setRewardModalOpen(true);
  };

  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    setRewardFormError(null);

    const parsedCost = Number.parseInt(rewardDraft.ecocoin_cost, 10);
    const parsedStock = Number.parseInt(rewardDraft.stock, 10);

    if (!rewardDraft.name.trim() || !rewardDraft.partner.trim()) {
      setRewardFormError('Item name and partner grocer are required.');
      return;
    }
    if (!Number.isFinite(parsedCost) || parsedCost <= 0) {
      setRewardFormError('EcoCoin price must be greater than 0.');
      return;
    }
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      setRewardFormError('Available stock cannot be negative.');
      return;
    }

    const payload = {
      name: rewardDraft.name.trim(),
      partner: rewardDraft.partner.trim(),
      category: rewardDraft.category,
      ecocoin_cost: parsedCost,
      unit_label: rewardDraft.unit_label.trim() || '1 unit',
      stock: parsedStock,
      image_url: rewardDraft.image_url,
      description:
        rewardDraft.description.trim() ||
        'Sustainably sourced neighborhood grocery reward.',
    };

    if (editingRewardId) {
      updateRewardItem(editingRewardId, payload);
      setFeedbackMessage(`Updated "${payload.name}" in the Rewards Catalog.`);
    } else {
      addRewardItem(payload);
      setFeedbackMessage(`Added "${payload.name}" to the Rewards Catalog.`);
    }
    setRewardModalOpen(false);
  };

  const handleDeleteReward = (item: RewardProduct) => {
    deleteRewardItem(item.id);
    setConfirmDeleteId(null);
    setFeedbackMessage(`Removed "${item.name}" from the Rewards Catalog.`);
  };

  const handleApprove = (pickup: PickupRecord) => {
    const rawWeight = weightOverrides[pickup.id] ?? String(pickup.weight_kg);
    const parsedWeight = Number.parseFloat(rawWeight);
    const finalWeight =
      Number.isFinite(parsedWeight) && parsedWeight > 0
        ? parsedWeight
        : pickup.weight_kg;
    const coins = Math.round(finalWeight * 10);
    const residentName = userMap[pickup.resident_id]?.full_name ?? 'Resident';
    approvePickup(pickup.id, finalWeight, noteInputs[pickup.id]);
    setFeedbackMessage(
      `Approved ${finalWeight.toFixed(1)} kg for ${residentName} (+${coins} EcoCoins credited).`
    );
  };

  const handleReject = (pickup: PickupRecord) => {
    const residentName = userMap[pickup.resident_id]?.full_name ?? 'Resident';
    const reason =
      noteInputs[pickup.id]?.trim() ||
      'Sorted items did not meet cleanliness or separation standards.';
    rejectPickup(pickup.id, reason);
    setFeedbackMessage(`Marked pickup from ${residentName} as Rejected.`);
  };

  const handleFulfillVoucher = (redemptionId: string, code: string) => {
    markRedemptionFulfilled(redemptionId);
    setFeedbackMessage(`Voucher ${code} marked as Redeemed.`);
  };

  const showCatalog = adminSection === 'overview' || adminSection === 'catalog';
  const showOperations = adminSection === 'overview' || adminSection === 'operations';

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] px-4 sm:px-8 py-8 sm:py-10">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {feedbackMessage && (
          <div
            role="status"
            className="flex items-center justify-between gap-4 bg-[#E8F5E9] border border-[#4CAF50]/30 text-[#2E7D32] px-5 py-3.5 rounded-[12px]"
          >
            <div className="flex items-center gap-2.5 text-[14px] font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{feedbackMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              aria-label="Dismiss notification"
              className="p-1 text-[#2E7D32] hover:bg-[#2E7D32]/10 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <h1 className="font-editorial text-[30px] sm:text-[36px] leading-[1.15] font-semibold text-[#212121] tracking-tight">
              Admin Control Center
            </h1>
            <p className="text-[15px] text-[#616161] mt-2">
              Manage platform rewards inventory, user roles, and recycling operations
            </p>
          </div>

          <button
            type="button"
            onClick={openAddRewardModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] font-semibold text-[#FFFFFF] bg-[#2E7D32] hover:bg-[#256628] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2E7D32]"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Reward Item
          </button>
        </div>

        {/* 3-Column Summary Metrics Row */}
        <section
          aria-label="Platform overview metrics"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Metric 1: Total Platform Waste Recycled (kg) */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-6 sm:p-8 flex flex-col justify-between min-h-[168px]">
            <div>
              <p className="text-[14px] font-medium text-[#616161]">
                Total Platform Waste Recycled
              </p>
              <p className="mt-3 text-[38px] leading-none font-bold text-[#212121] tracking-tight tabular-nums">
                {Number(totalPlatformWasteKg.toFixed(1))} kg
              </p>
            </div>
            <p className="mt-5 pt-4 border-t border-[#F1F3F5] text-[13px] text-[#616161] tabular-nums">
              {allPickups.filter((p) => p.status === 'Pending').length} pickups awaiting weight verification
            </p>
          </div>

          {/* Metric 2: Total Active Users (Residents & Collectors) */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-6 sm:p-8 flex flex-col justify-between min-h-[168px]">
            <div>
              <p className="text-[14px] font-medium text-[#616161]">
                Total Active Users
              </p>
              <p className="mt-3 text-[38px] leading-none font-bold text-[#212121] tracking-tight tabular-nums">
                {activeUsersCount}
              </p>
            </div>
            <p className="mt-5 pt-4 border-t border-[#F1F3F5] text-[13px] text-[#616161] tabular-nums">
              {allUsers.filter((u) => u.role === 'resident').length} Residents ·{' '}
              {allUsers.filter((u) => u.role === 'collector').length} Collectors
            </p>
          </div>

          {/* Metric 3: Total EcoCoins Redeemed / Active Rewards Stock */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-6 sm:p-8 flex flex-col justify-between min-h-[168px]">
            <div>
              <p className="text-[14px] font-medium text-[#616161]">
                EcoCoins Redeemed & Stock
              </p>
              <div className="mt-3 flex items-baseline gap-2.5">
                <span className="text-[38px] leading-none font-bold text-[#212121] tracking-tight tabular-nums">
                  {totalEcoCoinsRedeemed}
                </span>
                <span className="text-[15px] font-medium text-[#616161]">
                  EcoCoins redeemed
                </span>
              </div>
            </div>
            <p className="mt-5 pt-4 border-t border-[#F1F3F5] text-[13px] text-[#616161] tabular-nums">
              <span className="font-semibold text-[#212121]">
                {totalActiveRewardsStock}
              </span>{' '}
              units across {rewards.length} active catalog items
            </p>
          </div>
        </section>

        {/* Section 1: Rewards Shop Inventory Management (Reward_Item) */}
        {showCatalog && (
          <section
            aria-labelledby="rewards-catalog-heading"
            className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] overflow-hidden"
          >
            <div className="px-6 sm:px-8 py-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2
                  id="rewards-catalog-heading"
                  className="text-[18px] font-semibold text-[#212121] tracking-tight"
                >
                  Rewards Catalog
                </h2>
                <p className="text-[13px] text-[#616161] mt-0.5">
                  Manage local grocery bundles, EcoCoin pricing, and available stock levels
                </p>
              </div>
              <span className="text-[13px] text-[#616161] tabular-nums">
                {rewards.length} {rewards.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {rewards.length === 0 ? (
              <div className="px-8 py-12 text-center">
                <p className="text-[15px] font-medium text-[#212121]">
                  No reward items in catalog
                </p>
                <p className="text-[13px] text-[#616161] mt-1">
                  Add a grocery or home refill reward to make it available in the resident shop.
                </p>
                <button
                  type="button"
                  onClick={openAddRewardModal}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-[#FFFFFF] bg-[#2E7D32] hover:bg-[#256628] rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Add Reward Item
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-[#E5E7EB]">
                {rewards.map((item) => (
                  <li
                    key={item.id}
                    className="px-6 sm:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-[#F8F9FA]/60 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                      <ResilientImage
                        src={item.image_url}
                        alt={item.name}
                        fallbackLabel={item.name}
                        className="w-16 h-16 rounded-[8px] object-cover shrink-0 border border-[#E5E7EB]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[15px] font-semibold text-[#212121]">
                            {item.name}
                          </h3>
                          <span className="text-[12px] text-[#616161]">
                            · {item.partner} · {item.category}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#616161] mt-1 line-clamp-2 max-w-2xl">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 sm:gap-6 shrink-0">
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#4CAF50]/12 text-[#2E7D32] border border-[#4CAF50]/25 tabular-nums whitespace-nowrap">
                          {item.ecocoin_cost} EcoCoins
                        </span>
                        <span className="text-[13px] font-medium text-[#212121] tabular-nums whitespace-nowrap">
                          {item.stock} in stock
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteReward(item)}
                              className="px-3 py-1.5 text-[12px] font-semibold text-[#FFFFFF] bg-[#D32F2F] hover:bg-[#B71C1C] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                            >
                              Confirm Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1.5 text-[12px] font-medium text-[#616161] hover:text-[#212121] border border-[#E5E7EB] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditRewardModal(item)}
                              className="px-3.5 py-1.5 text-[13px] font-medium text-[#212121] bg-[#FFFFFF] hover:bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(item.id)}
                              aria-label={`Delete ${item.name}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-[#D32F2F] hover:bg-[#D32F2F]/8 border border-[#D32F2F]/25 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Section 2: User Role & Operations Oversight (User / Pickup_Request) */}
        {showOperations && (
          <div className="space-y-8">
            {/* User Role Management */}
            <section
              aria-labelledby="user-roles-heading"
              className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] overflow-hidden"
            >
              <div className="px-6 sm:px-8 py-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2
                    id="user-roles-heading"
                    className="text-[18px] font-semibold text-[#212121] tracking-tight"
                  >
                    User Roles & Balances
                  </h2>
                  <p className="text-[13px] text-[#616161] mt-0.5">
                    Assign Resident, Collector, or Admin roles and monitor household EcoCoin balances
                  </p>
                </div>
                <span className="text-[13px] text-[#616161] tabular-nums">
                  {allUsers.length} accounts
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[12px] font-medium text-[#616161] bg-[#F8F9FA]">
                      <th className="py-3 px-6 sm:px-8">User Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-6 sm:px-8 text-right">EcoCoin Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] text-[14px]">
                    {allUsers.map((user) => {
                      const isSelfAdmin = user.id === currentUser.id;
                      const roleLabel =
                        user.role.charAt(0).toUpperCase() + user.role.slice(1);
                      return (
                        <tr key={user.id} className="hover:bg-[#F8F9FA]/60">
                          <td className="py-4 px-6 sm:px-8">
                            <p className="font-semibold text-[#212121]">
                              {user.full_name}
                            </p>
                            <p className="text-[12px] text-[#616161] mt-0.5">
                              {user.address.split('\n')[0]}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-[13px] text-[#616161]">
                            {user.email}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium border whitespace-nowrap ${getRoleBadgeStyle(
                                  user.role
                                )}`}
                              >
                                {roleLabel}
                              </span>
                              <select
                                aria-label={`Change role for ${user.full_name}`}
                                disabled={isSelfAdmin}
                                value={user.role}
                                onChange={(e) => {
                                  const nextRole = e.target.value as UserRole;
                                  updateUserRole(user.id, nextRole);
                                  setFeedbackMessage(
                                    `Updated ${user.full_name}'s role to ${
                                      nextRole.charAt(0).toUpperCase() +
                                      nextRole.slice(1)
                                    }.`
                                  );
                                }}
                                className="px-2.5 py-1 text-[12px] text-[#212121] bg-[#FFFFFF] border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2E7D32] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <option value="resident">Resident</option>
                                <option value="collector">Collector</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                          </td>
                          <td className="py-4 px-6 sm:px-8 text-right font-semibold text-[#212121] tabular-nums whitespace-nowrap">
                            {user.ecocoin_balance} EcoCoins
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Pickup_Request Verification Oversight */}
            <section
              aria-labelledby="pickup-oversight-heading"
              className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] overflow-hidden"
            >
              <div className="px-6 sm:px-8 py-6 border-b border-[#E5E7EB] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2
                    id="pickup-oversight-heading"
                    className="text-[18px] font-semibold text-[#212121] tracking-tight"
                  >
                    Pickup Requests & Verification
                  </h2>
                  <p className="text-[13px] text-[#616161] mt-0.5">
                    Review sorted waste submissions, verify collection weights, and credit EcoCoins
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="relative">
                    <Search
                      className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search resident or material..."
                      aria-label="Search pickup submissions"
                      className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-[13px] text-[#212121] bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32] focus:bg-[#FFFFFF]"
                    />
                  </div>

                  <div
                    role="tablist"
                    aria-label="Filter pickup requests by status"
                    className="inline-flex items-center gap-1 p-1 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg self-start sm:self-auto"
                  >
                    {(['All', 'Pending', 'Approved', 'Rejected'] as QueueFilter[]).map(
                      (statusOpt) => {
                        const active = queueFilter === statusOpt;
                        return (
                          <button
                            key={statusOpt}
                            role="tab"
                            aria-selected={active}
                            type="button"
                            onClick={() => setQueueFilter(statusOpt)}
                            className={`px-2.5 py-1 text-[12px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                              active
                                ? 'bg-[#FFFFFF] text-[#212121] border border-[#E5E7EB]'
                                : 'text-[#616161] hover:text-[#212121] border border-transparent'
                            }`}
                          >
                            {statusOpt}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              {filteredPickups.length === 0 ? (
                <div className="px-8 py-12 text-center">
                  <p className="text-[15px] font-medium text-[#212121]">
                    No pickups match this filter
                  </p>
                  <p className="text-[13px] text-[#616161] mt-1">
                    Try clearing the search query or switching status tabs.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[#E5E7EB]">
                  {filteredPickups.map((pickup) => {
                    const resident = userMap[pickup.resident_id];
                    const weightValue =
                      weightOverrides[pickup.id] ?? String(pickup.weight_kg);
                    const numericWeight = Number.parseFloat(weightValue);
                    const previewCoins =
                      Number.isFinite(numericWeight) && numericWeight > 0
                        ? Math.round(numericWeight * 10)
                        : 0;

                    return (
                      <li key={pickup.id} className="px-6 sm:px-8 py-5">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                          <div className="flex items-start gap-4 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => setPreviewPickup(pickup)}
                              className="shrink-0 rounded-[8px] overflow-hidden border border-[#E5E7EB] hover:opacity-90 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32]"
                              aria-label={`Inspect sorted waste photo from ${
                                resident?.full_name ?? 'Resident'
                              }`}
                            >
                              <ResilientImage
                                src={pickup.photo_url}
                                alt={pickup.waste_summary}
                                fallbackLabel="Waste"
                                className="w-16 h-16 object-cover"
                              />
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="text-[15px] font-semibold text-[#212121]">
                                  {resident?.full_name ?? 'Resident Household'}
                                </span>
                                <StatusBadge status={pickup.status as PickupStatus} />
                              </div>

                              <p className="text-[14px] text-[#212121] mt-1">
                                {pickup.waste_summary}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[#616161] tabular-nums">
                                <span>{formatDateTime(pickup.pickup_date)}</span>
                                <span aria-hidden="true">·</span>
                                <span>{pickup.weight_kg} kg</span>
                                <span aria-hidden="true">·</span>
                                <span className="truncate max-w-md">
                                  {pickup.address.replace(/\n/g, ', ')}
                                </span>
                              </div>

                              {pickup.reviewer_note && pickup.status !== 'Pending' && (
                                <p className="mt-2 text-[12px] text-[#616161] bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3 py-1.5 inline-block">
                                  Note: {pickup.reviewer_note}
                                </p>
                              )}
                            </div>
                          </div>

                          {pickup.status === 'Pending' ? (
                            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-end gap-3 shrink-0 lg:w-[430px]">
                              <div className="flex-1 grid grid-cols-2 gap-2.5">
                                <div>
                                  <label
                                    htmlFor={`weight-${pickup.id}`}
                                    className="block text-[11px] font-medium text-[#616161] mb-1"
                                  >
                                    Verified kg (+{previewCoins} coins)
                                  </label>
                                  <input
                                    id={`weight-${pickup.id}`}
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={weightValue}
                                    onChange={(e) =>
                                      setWeightOverrides((prev) => ({
                                        ...prev,
                                        [pickup.id]: e.target.value,
                                      }))
                                    }
                                    className="w-full px-2.5 py-1.5 text-[13px] text-[#212121] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg tabular-nums focus:outline-none focus:border-[#2E7D32]"
                                  />
                                </div>

                                <div>
                                  <label
                                    htmlFor={`note-${pickup.id}`}
                                    className="block text-[11px] font-medium text-[#616161] mb-1"
                                  >
                                    Reviewer note
                                  </label>
                                  <input
                                    id={`note-${pickup.id}`}
                                    type="text"
                                    value={noteInputs[pickup.id] ?? ''}
                                    onChange={(e) =>
                                      setNoteInputs((prev) => ({
                                        ...prev,
                                        [pickup.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Optional note"
                                    className="w-full px-2.5 py-1.5 text-[13px] text-[#212121] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32]"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleApprove(pickup)}
                                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-[#FFFFFF] bg-[#2E7D32] hover:bg-[#256628] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(pickup)}
                                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#D32F2F] bg-[#FFFFFF] hover:bg-[#D32F2F]/8 border border-[#D32F2F]/25 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-left lg:text-right shrink-0">
                              <p
                                className={`text-[15px] font-semibold tabular-nums whitespace-nowrap ${
                                  pickup.status === 'Approved'
                                    ? 'text-[#2E7D32]'
                                    : 'text-[#616161]'
                                }`}
                              >
                                +{pickup.ecocoins_awarded} EcoCoins
                              </p>
                              <p className="text-[12px] text-[#616161] mt-0.5 tabular-nums whitespace-nowrap">
                                {pickup.weight_kg} kg recorded
                              </p>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Partner Voucher Redemptions */}
            <section
              aria-labelledby="partner-redemptions-heading"
              className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] overflow-hidden"
            >
              <div className="px-6 sm:px-8 py-6 border-b border-[#E5E7EB]">
                <h2
                  id="partner-redemptions-heading"
                  className="text-[18px] font-semibold text-[#212121] tracking-tight"
                >
                  Recent Grocer Vouchers
                </h2>
                <p className="text-[13px] text-[#616161] mt-0.5">
                  Confirm pickup vouchers once residents collect rewards at partner grocers
                </p>
              </div>

              {allRedemptions.length === 0 ? (
                <div className="px-8 py-12 text-center text-[14px] text-[#616161]">
                  No reward vouchers have been redeemed yet.
                </div>
              ) : (
                <ul className="divide-y divide-[#E5E7EB]">
                  {allRedemptions.map((item) => {
                    const resident = userMap[item.resident_id];
                    return (
                      <li
                        key={item.id}
                        className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[15px] font-semibold text-[#212121]">
                              {item.reward_name}
                            </span>
                            <span className="font-mono text-[12px] font-medium px-2 py-0.5 rounded bg-[#F8F9FA] border border-[#E5E7EB] text-[#212121] tabular-nums">
                              {item.voucher_code}
                            </span>
                          </div>
                          <p className="text-[13px] text-[#616161] mt-1">
                            {resident?.full_name ?? 'Resident'} · {item.partner_name} ·{' '}
                            <span className="tabular-nums">
                              -{item.ecocoins_spent} EcoCoins
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`text-[13px] font-medium whitespace-nowrap ${
                              item.status === 'Ready for pickup'
                                ? 'text-[#D97706]'
                                : 'text-[#2E7D32]'
                            }`}
                          >
                            {item.status}
                          </span>
                          {item.status === 'Ready for pickup' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleFulfillVoucher(item.id, item.voucher_code)
                              }
                              className="px-3.5 py-1.5 text-[13px] font-semibold text-[#FFFFFF] bg-[#2E7D32] hover:bg-[#256628] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                            >
                              Mark Redeemed
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Add / Edit Reward Item Modal */}
      {rewardModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reward-modal-title"
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          onClick={() => setRewardModalOpen(false)}
        >
          <div
            className="w-full max-w-[540px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between gap-4">
              <h3
                id="reward-modal-title"
                className="text-[17px] font-semibold text-[#212121]"
              >
                {editingRewardId ? 'Edit Reward Item' : 'Add Reward Item'}
              </h3>
              <button
                type="button"
                onClick={() => setRewardModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 text-[#616161] hover:text-[#212121] hover:bg-[#F8F9FA] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveReward}
              className="p-6 space-y-4 overflow-y-auto"
              noValidate
            >
              {rewardFormError && (
                <div
                  role="alert"
                  className="px-4 py-2.5 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#D32F2F] text-[13px] font-medium"
                >
                  {rewardFormError}
                </div>
              )}

              <div>
                <label
                  htmlFor="reward-name"
                  className="block text-[13px] font-medium text-[#212121] mb-1.5"
                >
                  Item Name
                </label>
                <input
                  id="reward-name"
                  type="text"
                  value={rewardDraft.name}
                  onChange={(e) =>
                    setRewardDraft((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Seasonal Organic Produce Crate"
                  className="w-full px-3.5 py-2 text-[14px] text-[#212121] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2E7D32]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="reward-partner"
                    className="block text-[13px] font-medium text-[#212121] mb-1.5"
                  >
                    Partner Grocer
                  </label>
                  <input
                    id="reward-partner"
                    type="text"
                    value={rewardDraft.partner}
                    onChange={(e) =>
                      setRewardDraft((prev) => ({ ...prev, partner: e.target.value }))
                    }
                    placeholder="Greenleaf Local Market"
                    className="w-full px-3.5 py-2 text-[14px] text-[#212121] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reward-category"
                    className="block text-[13px] font-medium text-[#212121] mb-1.5"
                  >
                    Category
                  </label>
                  <select
                    id="reward-category"
                    value={rewardDraft.category}
                    onChange={(e) =>
                      setRewardDraft((prev) => ({
                        ...prev,
                        category: e.target.value as RewardProduct['category'],
                      }))
                    }
                    className="w-full px-3.5 py-2 text-[14px] text-[#212121] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2E7D32]"
                  >
                    <option value="Produce">Produce</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Home Refills">Home Refills</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="reward-cost"
                    className="block text-[13px] font-medium text-[#212121] mb-1.5"
                  >
                    EcoCoin Price
                  </label>
                  <input
                    id="reward-cost"
                    type="number"
                    min="1"
                    value={rewardDraft.ecocoin_cost}
                    onChange={(e) =>
                      setRewardDraft((prev) => ({
                        ...prev,
                        ecocoin_cost: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2 text-[14px] text-[#212121] border border-[#E5E7EB] rounded-lg tabular-nums focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reward-stock"
                    className="block text-[13px] font-medium text-[#212121] mb-1.5"
                  >
                    Available Stock
                  </label>
                  <input
                    id="reward-stock"
                    type="number"
                    min="0"
                    value={rewardDraft.stock}
                    onChange={(e) =>
                      setRewardDraft((prev) => ({
                        ...prev,
                        stock: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2 text-[14px] text-[#212121] border border-[#E5E7EB] rounded-lg tabular-nums focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reward-unit"
                    className="block text-[13px] font-medium text-[#212121] mb-1.5"
                  >
                    Unit Label
                  </label>
                  <input
                    id="reward-unit"
                    type="text"
                    value={rewardDraft.unit_label}
                    onChange={(e) =>
                      setRewardDraft((prev) => ({
                        ...prev,
                        unit_label: e.target.value,
                      }))
                    }
                    placeholder="4.5 kg harvest box"
                    className="w-full px-3.5 py-2 text-[14px] text-[#212121] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>
              </div>

              <div>
                <span className="block text-[13px] font-medium text-[#212121] mb-1.5">
                  Product Photo
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {REWARD_IMAGE_PRESETS.map((preset) => {
                    const selected = rewardDraft.image_url === preset.url;
                    return (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() =>
                          setRewardDraft((prev) => ({ ...prev, image_url: preset.url }))
                        }
                        className={`p-1.5 rounded-lg border text-left transition-colors cursor-pointer ${
                          selected
                            ? 'border-[#2E7D32] bg-[#E8F5E9]/40'
                            : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
                        }`}
                      >
                        <ResilientImage
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-16 rounded object-cover"
                        />
                        <span className="block text-[11px] font-medium text-[#212121] mt-1 truncate">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="reward-description"
                  className="block text-[13px] font-medium text-[#212121] mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="reward-description"
                  rows={3}
                  value={rewardDraft.description}
                  onChange={(e) =>
                    setRewardDraft((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the contents and partner sourcing..."
                  className="w-full px-3.5 py-2 text-[14px] text-[#212121] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2E7D32] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRewardModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium text-[#212121] border border-[#E5E7EB] hover:bg-[#F8F9FA] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-[13px] font-semibold text-[#FFFFFF] bg-[#2E7D32] hover:bg-[#256628] rounded-lg transition-colors cursor-pointer"
                >
                  {editingRewardId ? 'Save Changes' : 'Add Reward Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Inspection Modal */}
      {previewPickup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-photo-modal-title"
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          onClick={() => setPreviewPickup(null)}
        >
          <div
            className="w-full max-w-[520px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between gap-4">
              <h3
                id="admin-photo-modal-title"
                className="text-[16px] font-semibold text-[#212121]"
              >
                Sorted waste photo proof
              </h3>
              <button
                type="button"
                onClick={() => setPreviewPickup(null)}
                aria-label="Close photo preview"
                className="p-1.5 text-[#616161] hover:text-[#212121] hover:bg-[#F8F9FA] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <ResilientImage
                src={previewPickup.photo_url}
                alt={previewPickup.waste_summary}
                fallbackLabel="Sorted waste photo"
                className="w-full max-h-[380px] rounded-[12px] object-cover border border-[#E5E7EB]"
              />
              <div>
                <p className="text-[14px] font-semibold text-[#212121]">
                  {userMap[previewPickup.resident_id]?.full_name ?? 'Resident'}
                </p>
                <p className="text-[13px] text-[#616161] mt-0.5">
                  {previewPickup.waste_summary} · Estimated {previewPickup.weight_kg} kg
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
