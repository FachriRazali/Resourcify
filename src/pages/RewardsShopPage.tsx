import { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { useResourcify } from '../context/ResourcifyContext';
import { RedemptionRecord, RewardProduct } from '../types/resourcify';

type CategoryFilter = 'All' | RewardProduct['category'];

export function RewardsShopPage() {
  const { currentUser, rewards, redeemReward, navigate } = useResourcify();
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [lastRedemption, setLastRedemption] = useState<RedemptionRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) return null;

  const filteredRewards =
    category === 'All'
      ? rewards
      : rewards.filter((item) => item.category === category);

  const handleRedeem = (product: RewardProduct) => {
    setError(null);
    const result = redeemReward(product);
    if (!result.ok) {
      setError(result.error ?? 'Unable to redeem this reward.');
      return;
    }
    if (result.redemption) {
      setLastRedemption(result.redemption);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] px-4 sm:px-8 py-8 sm:py-10">
      <div className="max-w-[1200px] mx-auto space-y-8">
        <div>
          <button
            type="button"
            onClick={() => navigate('dashboard')}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#616161] hover:text-[#212121] mb-4 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] rounded px-1 -ml-1"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-editorial text-[30px] sm:text-[36px] leading-[1.15] font-semibold text-[#212121] tracking-tight">
                Rewards Shop
              </h1>
              <p className="text-[15px] text-[#616161] mt-2 max-w-2xl">
                Redeem EcoCoins earned from household recycling for seasonal organic produce, bulk pantry staples, and refillable home essentials.
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] px-5 py-3.5 shrink-0">
              <p className="text-[12px] font-medium text-[#616161]">
                Available Balance
              </p>
              <p className="text-[22px] font-bold text-[#2E7D32] tabular-nums mt-0.5">
                {currentUser.ecocoin_balance} EcoCoins
              </p>
            </div>
          </div>
        </div>

        {/* Redemption confirmation or error */}
        {lastRedemption && (
          <div
            role="status"
            className="bg-[#E8F5E9] border border-[#4CAF50]/35 rounded-[12px] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
              <div className="text-[14px] text-[#212121]">
                <span className="font-semibold">{lastRedemption.reward_name}</span>{' '}
                redeemed at {lastRedemption.partner_name}. Show voucher{' '}
                <span className="font-mono font-semibold text-[#2E7D32]">
                  {lastRedemption.voucher_code}
                </span>{' '}
                at checkout.
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('dashboard')}
              className="text-[13px] font-semibold text-[#2E7D32] hover:underline whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-center"
            >
              View in Dashboard
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] rounded-[12px] px-5 py-3.5 text-[14px] font-medium"
          >
            {error}
          </div>
        )}

        {/* Category Filter Bar */}
        <div
          role="tablist"
          aria-label="Filter rewards by category"
          className="inline-flex flex-wrap items-center gap-1.5 p-1 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg"
        >
          {(['All', 'Produce', 'Pantry', 'Home Refills'] as CategoryFilter[]).map(
            (cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#2E7D32] text-[#FFFFFF]'
                      : 'text-[#616161] hover:text-[#212121]'
                  }`}
                >
                  {cat}
                </button>
              );
            }
          )}
        </div>

        {/* 3-Column Product Grid */}
        <section
          aria-label="Neighborhood grocery rewards"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {filteredRewards.map((product) => {
            const canAfford = currentUser.ecocoin_balance >= product.ecocoin_cost;
            const deficit = product.ecocoin_cost - currentUser.ecocoin_balance;

            return (
              <article
                key={product.id}
                className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div className="aspect-[4/3] w-full bg-[#F1F3F5] overflow-hidden border-b border-[#E5E7EB]">
                  <ResilientImage
                    src={product.image_url}
                    alt={product.name}
                    fallbackLabel={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                  <div>
                    <div className="flex items-center gap-2 text-[12px] text-[#616161]">
                      <span>{product.partner}</span>
                      <span aria-hidden="true">·</span>
                      <span>{product.unit_label}</span>
                    </div>

                    <h2 className="text-[18px] font-semibold text-[#212121] mt-1.5 leading-snug">
                      {product.name}
                    </h2>

                    <p className="text-[14px] text-[#616161] mt-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#F1F3F5] space-y-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[13px] text-[#616161]">Reward cost</span>
                      <span className="text-[18px] font-bold text-[#212121] tabular-nums">
                        {product.ecocoin_cost} EcoCoins
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleRedeem(product)}
                      className={`w-full py-2.5 px-4 text-[14px] font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap ${
                        canAfford
                          ? 'bg-[#2E7D32] hover:bg-[#256628] text-[#FFFFFF] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2E7D32]'
                          : 'bg-[#F1F3F5] text-[#616161] border border-[#E5E7EB] cursor-not-allowed'
                      }`}
                    >
                      {canAfford
                        ? 'Redeem reward'
                        : `Need ${deficit} more EcoCoins`}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
