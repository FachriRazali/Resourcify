import { useState } from 'react';
import { ArrowRight, Check, Copy, ShoppingBag } from 'lucide-react';
import { useResourcify } from '../context/ResourcifyContext';

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function RecentRedemptionsElement() {
  const { redemptions, navigate } = useResourcify();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 1800);
  };

  return (
    <section
      aria-labelledby="recent-redemptions-heading"
      className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between gap-4">
        <div>
          <h2
            id="recent-redemptions-heading"
            className="text-[18px] font-semibold text-[#212121] tracking-tight"
          >
            Recent redemptions
          </h2>
          <p className="text-[13px] text-[#616161] mt-0.5">
            Local grocer vouchers and pantry refills
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('rewards')}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#2E7D32] hover:text-[#256628] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] rounded px-1.5 py-1"
        >
          Shop all
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {redemptions.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="w-10 h-10 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-3 text-[#616161]">
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
          </div>
          <p className="text-[15px] font-medium text-[#212121]">No redemptions yet</p>
          <p className="text-[13px] text-[#616161] mt-1 max-w-xs mx-auto">
            Exchange your EcoCoins for organic produce crates and home refills at participating grocers.
          </p>
          <button
            type="button"
            onClick={() => navigate('rewards')}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 text-[13px] font-medium text-white bg-[#2E7D32] hover:bg-[#256628] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Browse Rewards Shop
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-[#E5E7EB]">
          {redemptions.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <li
                key={item.id}
                className="px-6 py-4 hover:bg-[#F8F9FA]/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-[#212121] truncate">
                      {item.reward_name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-[#616161]">
                      <span>{item.partner_name}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{formatShortDate(item.redeemed_at)}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[14px] font-semibold text-[#212121] tabular-nums whitespace-nowrap">
                      -{item.ecocoins_spent} EcoCoins
                    </p>
                    <p
                      className={`text-[12px] font-medium mt-0.5 whitespace-nowrap ${
                        item.status === 'Ready for pickup' ? 'text-[#2E7D32]' : 'text-[#616161]'
                      }`}
                    >
                      {item.status}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 pt-2.5 border-t border-[#F1F3F5]">
                  <span className="text-[12px] text-[#616161]">
                    Voucher code:{' '}
                    <span className="font-mono font-medium text-[#212121] tabular-nums">
                      {item.voucher_code}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(item.id, item.voucher_code)}
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-[#616161] hover:text-[#212121] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] rounded px-1.5 py-0.5"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#2E7D32]" aria-hidden="true" />
                        <span className="text-[#2E7D32]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Copy code</span>
                      </>
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
