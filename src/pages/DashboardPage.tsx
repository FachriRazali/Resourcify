import { useState } from 'react';
import { ArrowRight, CheckCircle2, Plus, X } from 'lucide-react';
import { RecentRedemptionsElement } from '../components/RecentRedemptionsElement';
import { ResilientImage } from '../components/ResilientImage';
import { StatusBadge } from '../components/StatusBadge';
import { useResourcify } from '../context/ResourcifyContext';
import { PickupRecord, PickupStatus } from '../types/resourcify';

type FilterOption = 'All' | PickupStatus;

function formatPickupDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatPickupTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function DashboardPage({
  bannerMessage,
  onDismissBanner,
}: {
  bannerMessage: string | null;
  onDismissBanner: () => void;
}) {
  const { currentUser, pickups, navigate } = useResourcify();
  const [statusFilter, setStatusFilter] = useState<FilterOption>('All');
  const [selectedPickup, setSelectedPickup] = useState<PickupRecord | null>(null);

  if (!currentUser) {
    return null;
  }

  const approvedCount = pickups.filter((p) => p.status === 'Approved').length;
  const filteredPickups =
    statusFilter === 'All'
      ? pickups
      : pickups.filter((p) => p.status === statusFilter);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] px-4 sm:px-8 py-8 sm:py-10">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Optional post-action confirmation banner */}
        {bannerMessage && (
          <div
            role="status"
            className="flex items-center justify-between gap-4 bg-[#E8F5E9] border border-[#4CAF50]/30 text-[#2E7D32] px-5 py-3.5 rounded-[12px]"
          >
            <div className="flex items-center gap-2.5 text-[14px] font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" aria-hidden="true" />
              <span>{bannerMessage}</span>
            </div>
            <button
              type="button"
              onClick={onDismissBanner}
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
              Welcome back, {currentUser.full_name}
            </h1>
            <p className="text-[15px] text-[#616161] mt-2">
              Track your sorted waste pickups, verified weights, and EcoCoin grocery rewards.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('book_pickup')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] font-semibold text-[#FFFFFF] bg-[#2E7D32] hover:bg-[#256628] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2E7D32]"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Book a pickup
          </button>
        </div>

        {/* Top Metrics Grid (3-Column Layout, 16px radius cards) */}
        <section
          aria-label="Resident EcoCoin wallet and recycling summary"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* 1. Hero Wallet Card */}
          <div className="bg-[#2E7D32] text-[#FFFFFF] rounded-[16px] p-6 sm:p-7 flex flex-col justify-between min-h-[196px]">
            <div>
              <p className="text-[13px] font-medium text-white/85">
                Available wallet balance
              </p>
              <div className="mt-2 flex items-baseline gap-2.5">
                <span className="text-[40px] leading-none font-bold tracking-tight tabular-nums">
                  {currentUser.ecocoin_balance}
                </span>
                <span className="text-[18px] font-medium text-white/90">
                  EcoCoins
                </span>
              </div>
              <p className="text-[13px] text-white/80 mt-2.5">
                1 kg = 10 EcoCoins
              </p>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('rewards')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-[#2E7D32] bg-[#FFFFFF] hover:bg-[#F8F9FA] rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Spend in Rewards Shop
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* 2. Stat Card 1: Total waste recycled */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-6 sm:p-7 flex flex-col justify-between min-h-[196px]">
            <div>
              <p className="text-[14px] font-medium text-[#616161]">
                Total waste recycled
              </p>
              <p className="mt-3 text-[40px] leading-none font-bold text-[#212121] tracking-tight tabular-nums">
                {currentUser.total_waste_kg} kg
              </p>
            </div>
            <div className="pt-4 border-t border-[#F1F3F5] text-[13px] text-[#616161]">
              Across{' '}
              <span className="font-semibold text-[#212121] tabular-nums">
                {approvedCount}
              </span>{' '}
              verified household {approvedCount === 1 ? 'pickup' : 'pickups'}
            </div>
          </div>

          {/* 3. Stat Card 2: EcoCoins earned all time */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-6 sm:p-7 flex flex-col justify-between min-h-[196px]">
            <div>
              <p className="text-[14px] font-medium text-[#616161]">
                EcoCoins earned all time
              </p>
              <p className="mt-3 text-[40px] leading-none font-bold text-[#212121] tracking-tight tabular-nums">
                {currentUser.ecocoins_earned_all_time}
              </p>
            </div>
            <div className="pt-4 border-t border-[#F1F3F5] text-[13px] text-[#616161]">
              Lifetime rewards credited to your household
            </div>
          </div>
        </section>

        {/* Bottom Split Grid (2-Column Asymmetric Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: My pickups Repeating Group */}
          <section
            aria-labelledby="my-pickups-heading"
            className="lg:col-span-7 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2
                  id="my-pickups-heading"
                  className="text-[18px] font-semibold text-[#212121] tracking-tight"
                >
                  My pickups
                </h2>
                <p className="text-[13px] text-[#616161] mt-0.5">
                  Sorted household collection history and verified EcoCoin credits
                </p>
              </div>

              {/* Filter Tabs */}
              <div
                role="tablist"
                aria-label="Filter pickups by status"
                className="inline-flex items-center gap-1 p-1 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg self-start sm:self-auto"
              >
                {(['All', 'Approved', 'Pending', 'Rejected'] as FilterOption[]).map(
                  (option) => {
                    const active = statusFilter === option;
                    return (
                      <button
                        key={option}
                        role="tab"
                        aria-selected={active}
                        type="button"
                        onClick={() => setStatusFilter(option)}
                        className={`px-2.5 py-1 text-[12px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                          active
                            ? 'bg-[#FFFFFF] text-[#212121] border border-[#E5E7EB]'
                            : 'text-[#616161] hover:text-[#212121] border border-transparent'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {filteredPickups.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-[15px] font-medium text-[#212121]">
                  {statusFilter === 'All'
                    ? 'No pickups scheduled yet'
                    : `No ${statusFilter.toLowerCase()} pickups`}
                </p>
                <p className="text-[13px] text-[#616161] mt-1 max-w-sm mx-auto">
                  {statusFilter === 'All'
                    ? 'Schedule your first sorted household waste collection to earn EcoCoins.'
                    : 'Switch filters or book a new pickup to see activity here.'}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    statusFilter === 'All'
                      ? navigate('book_pickup')
                      : setStatusFilter('All')
                  }
                  className="mt-4 inline-flex items-center justify-center px-4 py-2 text-[13px] font-semibold text-[#FFFFFF] bg-[#2E7D32] hover:bg-[#256628] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  {statusFilter === 'All' ? '+ Book a pickup' : 'Show all pickups'}
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-[#E5E7EB]">
                {filteredPickups.map((pickup) => (
                  <li key={pickup.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedPickup(pickup)}
                      className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#F8F9FA]/80 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2E7D32]"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <ResilientImage
                          src={pickup.photo_url}
                          alt={`Sorted waste photo from ${formatPickupDate(
                            pickup.pickup_date
                          )}`}
                          fallbackLabel="Waste"
                          className="w-14 h-14 rounded-[8px] object-cover shrink-0 border border-[#E5E7EB]"
                        />

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                            <span className="text-[14px] font-semibold text-[#212121] tabular-nums">
                              {formatPickupDate(pickup.pickup_date)}
                            </span>
                            <StatusBadge status={pickup.status} />
                          </div>

                          <p className="text-[13px] text-[#212121] mt-1 truncate">
                            {pickup.waste_summary}
                          </p>

                          <div className="mt-0.5 flex items-center gap-2 text-[12px] text-[#616161] tabular-nums">
                            <span>{pickup.weight_kg} kg</span>
                            {formatPickupTime(pickup.pickup_date) && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{formatPickupTime(pickup.pickup_date)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`text-[14px] font-semibold tabular-nums whitespace-nowrap ${
                            pickup.status === 'Approved'
                              ? 'text-[#2E7D32]'
                              : 'text-[#616161]'
                          }`}
                        >
                          +{pickup.ecocoins_awarded} EcoCoins
                        </p>
                        <p className="text-[12px] text-[#616161] mt-0.5 whitespace-nowrap">
                          {pickup.status === 'Pending'
                            ? 'Awaiting weigh-in'
                            : pickup.status === 'Rejected'
                            ? 'Not credited'
                            : 'Credited'}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Right Column: Recent redemptions (Dev 3 Reusable Element) */}
          <div className="lg:col-span-5">
            <RecentRedemptionsElement />
          </div>
        </div>
      </div>

      {/* Pickup Detail Modal */}
      {selectedPickup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pickup-detail-title"
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelectedPickup(null)}
        >
          <div
            className="w-full max-w-[480px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between gap-4">
              <h3
                id="pickup-detail-title"
                className="text-[17px] font-semibold text-[#212121]"
              >
                Pickup details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPickup(null)}
                aria-label="Close pickup details"
                className="p-1.5 text-[#616161] hover:text-[#212121] hover:bg-[#F8F9FA] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <ResilientImage
                src={selectedPickup.photo_url}
                alt={`Sorted waste proof for ${formatPickupDate(
                  selectedPickup.pickup_date
                )}`}
                fallbackLabel="Sorted waste photo"
                className="w-full h-56 rounded-[12px] object-cover border border-[#E5E7EB]"
              />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] text-[#616161]">
                    {formatPickupDate(selectedPickup.pickup_date)} ·{' '}
                    {formatPickupTime(selectedPickup.pickup_date)}
                  </p>
                  <p className="text-[16px] font-semibold text-[#212121] mt-0.5">
                    {selectedPickup.waste_summary}
                  </p>
                </div>
                <StatusBadge status={selectedPickup.status} />
              </div>

              <dl className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5E7EB] text-[13px]">
                <div>
                  <dt className="text-[#616161]">Weight</dt>
                  <dd className="font-semibold text-[#212121] mt-0.5 tabular-nums">
                    {selectedPickup.weight_kg} kg
                  </dd>
                </div>
                <div>
                  <dt className="text-[#616161]">EcoCoins Awarded</dt>
                  <dd className="font-semibold text-[#2E7D32] mt-0.5 tabular-nums">
                    +{selectedPickup.ecocoins_awarded} EcoCoins
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[#616161]">Pickup Address</dt>
                  <dd className="text-[#212121] mt-0.5 whitespace-pre-line">
                    {selectedPickup.address}
                  </dd>
                </div>
                {selectedPickup.reviewer_note && (
                  <div className="col-span-2 bg-[#FEE2E2]/60 border border-[#FECACA] rounded-lg p-3">
                    <dt className="text-[12px] font-semibold text-[#B91C1C]">
                      Collector Note
                    </dt>
                    <dd className="text-[13px] text-[#7F1D1D] mt-0.5">
                      {selectedPickup.reviewer_note}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
