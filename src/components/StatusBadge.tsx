import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { PickupStatus } from '../types/resourcify';

interface StatusBadgeProps {
  status: PickupStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'Approved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#4CAF50]/12 text-[#2E7D32] border border-[#4CAF50]/25 whitespace-nowrap shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50] shrink-0" aria-hidden="true" />
        Approved
      </span>
    );
  }

  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#F59E0B]/12 text-[#92400E] border border-[#F59E0B]/25 whitespace-nowrap shrink-0">
        <Clock className="w-3.5 h-3.5 text-[#D97706] shrink-0" aria-hidden="true" />
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#EF4444]/10 text-[#B91C1C] border border-[#EF4444]/25 whitespace-nowrap shrink-0">
      <XCircle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" aria-hidden="true" />
      Rejected
    </span>
  );
}
