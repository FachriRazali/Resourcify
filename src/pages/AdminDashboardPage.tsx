import { useState } from 'react';
import { Check, CheckCircle2, Search, X, XCircle } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { StatusBadge } from '../components/StatusBadge';
import { useResourcify } from '../context/ResourcifyContext';
import { PickupRecord, PickupStatus } from '../types/resourcify';

type QueueFilter = 'Pending' | 'All' | 'Approved' | 'Rejected';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) +
    ' · ' +
    d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
}

export function AdminDashboardPage() {
  const {
    currentUser,
    adminSection,
    setAdminSection,
    allPickups,
    allResidents,
    allRedemptions,
    approvePickup,
    rejectPickup,
    markRedemptionFulfilled,
  } = useResourcify();

  const [queueFilter, setQueueFilter] = useState<QueueFilter>('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [weightOverrides, setWeightOverrides] = useState<Record<string, string>>({});
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [previewPickup, setPreviewPickup] = useState<PickupRecord | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const residentMap = Object.fromEntries(allResidents.map((r) => [r.id, r]));

  const pendingPickups = allPickups.filter((p) => p.status === 'Pending');
  const totalApprovedWeight = allPickups
    .filter((p) => p.status === 'Approved')
    .reduce((sum, p) => sum + p.weight_kg, 0);
  const totalIssuedCoins = allPickups.reduce(
    (sum, p) => sum + p.ecocoins_awarded,
    0
  );

  const filteredPickups = allPickups.filter((pickup) => {
    const matchesStatus =
      queueFilter === 'All' ? true : pickup.status === queueFilter;
    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;
    const resident = residentMap[pickup.resident_id];
    const q = searchQuery.trim().toLowerCase();
    return (
      pickup.waste_summary.toLowerCase().includes(q) ||
      pickup.address.toLowerCase().includes(q) ||
      (resident?.full_name.toLowerCase().includes(q) ?? false) ||
      (resident?.email.toLowerCase().includes(q) ?? false)
    );
  });

  const handleApprove = (pickup: PickupRecord) => {
    const rawWeight = weightOverrides[pickup.id] ?? String(pickup.weight_kg);
    const parsedWeight = Number.parseFloat(rawWeight);
    const finalWeight =
      Number.isFinite(parsedWeight) && parsedWeight > 0
        ? parsedWeight
        : pickup.weight_kg;
    const coins = Math.round(finalWeight * 10);
    const residentName =
      residentMap[pickup.resident_id]?.full_name ?? 'Resident';
    approvePickup(pickup.id, finalWeight, noteInputs[pickup.id]);
    setFeedbackMessage(
      `Approved ${finalWeight.toFixed(1)} kg for ${residentName} (+${coins} EcoCoins credited).`
    );
  };

  const handleReject = (pickup: PickupRecord) => {
    const residentName =
      residentMap[pickup.resident_id]?.full_name ?? 'Resident';
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <p className="text-[13px] font-medium text-[#2E7D32] mb-1.5">
              Operations Admin · {currentUser.full_name}
            </p>
            <h1 className="font-editorial text-[30px] sm:text-[36px] leading-[1.15] font-semibold text-[#212121] tracking-tight">
              Collector Verification Console
            </h1>
            <p className="text-[15px] text-[#616161] mt-2">
              Verify household waste submissions, record scale weights, credit EcoCoins, and fulfill grocer vouchers.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Admin sections"
            className="inline-flex items-center gap-1 p-1 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg self-start md:self-auto"
          >
            {(
              [
                { id: 'queue', label: 'Verification queue' },
                { id: 'residents', label: 'Residents' },
                { id: 'redemptions', label: 'Redemptions' },
              ] as const
            ).map((tab) => {
              const active = adminSection === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setAdminSection(tab.id)}
                  className={`px-3.5 py-2 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#2E7D32] text-[#FFFFFF]'
                      : 'text-[#616161] hover:text-[#212121]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Column Metrics Grid */}
        <section
          aria-label="Operations summary metrics"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Hero Metric Card */}
          <div className="bg-[#2E7D32] text-[#FFFFFF] rounded-[16px] p-6 sm:p-7 flex flex-col justify-between min-h-[184px]">
            <div>
              <p className="text-[13px] font-medium text-white/85">
                Pending verifications
              </p>
              <div className="mt-2 flex items-baseline gap-2.5">
                <span className="text-[40px] leading-none font-bold tracking-tight tabular-nums">
                  {pendingPickups.length}
                </span>
                <span className="text-[16px] font-medium text-white/90">
                  {pendingPickups.length === 1 ? 'pickup awaiting review' : 'pickups awaiting review'}
                </span>
              </div>
              <p className="text-[13px] text-white/80 mt-2.5">
                1 kg verified = 10 EcoCoins credited
              </p>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => {
                  setAdminSection('queue');
                  setQueueFilter('Pending');
                }}
                className="w-full py-2.5 px-4 text-[14px] font-semibold text-[#2E7D32] bg-[#FFFFFF] hover:bg-[#F8F9FA] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Review Pending Queue
              </button>
            </div>
          </div>

          {/* Stat Card 1 */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-6 sm:p-7 flex flex-col justify-between min-h-[184px]">
            <div>
              <p className="text-[14px] font-medium text-[#616161]">
                Total waste verified
              </p>
              <p className="mt-3 text-[40px] leading-none font-bold text-[#212121] tracking-tight tabular-nums">
                {Number(totalApprovedWeight.toFixed(1))} kg
              </p>
            </div>
            <div className="pt-4 border-t border-[#F1F3F5] text-[13px] text-[#616161]">
              Across{' '}
              <span className="font-semibold text-[#212121] tabular-nums">
                {allResidents.length}
              </span>{' '}
              active households
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-6 sm:p-7 flex flex-col justify-between min-h-[184px]">
            <div>
              <p className="text-[14px] font-medium text-[#616161]">
                Total EcoCoins issued
              </p>
              <p className="mt-3 text-[40px] leading-none font-bold text-[#212121] tracking-tight tabular-nums">
                {totalIssuedCoins}
              </p>
            </div>
            <div className="pt-4 border-t border-[#F1F3F5] text-[13px] text-[#616161]">
              <span className="font-semibold text-[#212121] tabular-nums">
                {allRedemptions.filter((r) => r.status === 'Ready for pickup').length}
              </span>{' '}
              grocer vouchers ready for pickup
            </div>
          </div>
        </section>

        {/* Section 1: Verification Queue */}
        {adminSection === 'queue' && (
          <section
            aria-labelledby="admin-queue-heading"
            className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-[#E5E7EB] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2
                  id="admin-queue-heading"
                  className="text-[18px] font-semibold text-[#212121] tracking-tight"
                >
                  Pickup verification queue
                </h2>
                <p className="text-[13px] text-[#616161] mt-0.5">
                  Adjust verified weight if needed and approve to credit EcoCoins directly to the resident wallet
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
                  aria-label="Filter queue by status"
                  className="inline-flex items-center gap-1 p-1 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg self-start sm:self-auto"
                >
                  {(['Pending', 'All', 'Approved', 'Rejected'] as QueueFilter[]).map(
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
              <div className="px-6 py-14 text-center">
                <p className="text-[15px] font-medium text-[#212121]">
                  No pickups match this filter
                </p>
                <p className="text-[13px] text-[#616161] mt-1">
                  {queueFilter === 'Pending'
                    ? 'All pending household pickups have been verified.'
                    : 'Try clearing the search query or switching status tabs.'}
                </p>
                {queueFilter !== 'All' && (
                  <button
                    type="button"
                    onClick={() => {
                      setQueueFilter('All');
                      setSearchQuery('');
                    }}
                    className="mt-4 px-4 py-2 text-[13px] font-medium text-[#2E7D32] border border-[#2E7D32]/30 hover:bg-[#E8F5E9]/40 rounded-lg transition-colors cursor-pointer"
                  >
                    View all pickups
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-[#E5E7EB]">
                {filteredPickups.map((pickup) => {
                  const resident = residentMap[pickup.resident_id];
                  const weightValue =
                    weightOverrides[pickup.id] ?? String(pickup.weight_kg);
                  const numericWeight = Number.parseFloat(weightValue);
                  const previewCoins =
                    Number.isFinite(numericWeight) && numericWeight > 0
                      ? Math.round(numericWeight * 10)
                      : 0;

                  return (
                    <li key={pickup.id} className="px-6 py-5">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                        {/* Left: Photo + Resident + Details */}
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
                              <span>Est. {pickup.weight_kg} kg</span>
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

                        {/* Right: Actions or Final Credit Summary */}
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
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#B91C1C] bg-[#FFFFFF] hover:bg-[#FEE2E2]/50 border border-[#FECACA] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
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
        )}

        {/* Section 2: Residents Directory */}
        {adminSection === 'residents' && (
          <section
            aria-labelledby="admin-residents-heading"
            className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-[#E5E7EB]">
              <h2
                id="admin-residents-heading"
                className="text-[18px] font-semibold text-[#212121] tracking-tight"
              >
                Registered households
              </h2>
              <p className="text-[13px] text-[#616161] mt-0.5">
                Live EcoCoin wallet balances and verified recycling totals per resident
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[12px] font-medium text-[#616161] bg-[#F8F9FA]">
                    <th className="py-3 px-6">Resident</th>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4 text-right">Verified kg</th>
                    <th className="py-3 px-4 text-right">Earned all time</th>
                    <th className="py-3 px-6 text-right">Wallet balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-[14px]">
                  {allResidents.map((resident) => (
                    <tr key={resident.id} className="hover:bg-[#F8F9FA]/60">
                      <td className="py-4 px-6">
                        <p className="font-semibold text-[#212121]">
                          {resident.full_name}
                        </p>
                        <p className="text-[12px] text-[#616161] mt-0.5">
                          {resident.email} · {resident.phone}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-[13px] text-[#616161] max-w-xs">
                        {resident.address.replace(/\n/g, ', ')}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-[#212121] tabular-nums whitespace-nowrap">
                        {resident.total_waste_kg} kg
                      </td>
                      <td className="py-4 px-4 text-right text-[#616161] tabular-nums whitespace-nowrap">
                        {resident.ecocoins_earned_all_time} EcoCoins
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-[#2E7D32] tabular-nums whitespace-nowrap">
                        {resident.ecocoin_balance} EcoCoins
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section 3: Grocer Redemptions */}
        {adminSection === 'redemptions' && (
          <section
            aria-labelledby="admin-redemptions-heading"
            className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-[#E5E7EB]">
              <h2
                id="admin-redemptions-heading"
                className="text-[18px] font-semibold text-[#212121] tracking-tight"
              >
                Partner grocer redemptions
              </h2>
              <p className="text-[13px] text-[#616161] mt-0.5">
                Confirm pickup vouchers once residents collect their rewards at partner locations
              </p>
            </div>

            {allRedemptions.length === 0 ? (
              <div className="px-6 py-12 text-center text-[14px] text-[#616161]">
                No reward vouchers have been redeemed yet.
              </div>
            ) : (
              <ul className="divide-y divide-[#E5E7EB]">
                {allRedemptions.map((item) => {
                  const resident = residentMap[item.resident_id];
                  return (
                    <li
                      key={item.id}
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
        )}
      </div>

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
                  {residentMap[previewPickup.resident_id]?.full_name ?? 'Resident'}
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
