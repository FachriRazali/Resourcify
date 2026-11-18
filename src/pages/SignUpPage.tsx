import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useResourcify } from '../context/ResourcifyContext';

export function SignUpPage() {
  const { signup, navigate } = useResourcify();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = signup({
      email,
      password,
      full_name: fullName,
      phone,
      address,
    });
    if (!res.ok && res.error) {
      setError(res.error);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-[500px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-8 sm:p-10">
        <div className="mb-8">
          <p className="text-[13px] font-medium text-[#2E7D32] mb-2">
            Resident Registration
          </p>
          <h1 className="font-editorial text-[30px] leading-[1.2] font-semibold text-[#212121] tracking-tight">
            Create your resident account
          </h1>
          <p className="text-[15px] text-[#616161] mt-2 leading-relaxed">
            Register your household pickup address to start earning 10 EcoCoins per kilogram of verified sorted waste.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div
              role="alert"
              className="px-4 py-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] text-[13px] font-medium"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="signup-fullname"
                className="block text-[13px] font-medium text-[#212121] mb-1.5"
              >
                Full Name
              </label>
              <input
                id="signup-fullname"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Clara Vance"
                className="w-full px-3.5 py-2.5 text-[15px] text-[#212121] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/15 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="signup-phone"
                className="block text-[13px] font-medium text-[#212121] mb-1.5"
              >
                Phone
              </label>
              <input
                id="signup-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (415) 555-0192"
                className="w-full px-3.5 py-2.5 text-[15px] text-[#212121] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/15 transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-email"
              className="block text-[13px] font-medium text-[#212121] mb-1.5"
            >
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 text-[15px] text-[#212121] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/15 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="block text-[13px] font-medium text-[#212121] mb-1.5"
            >
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full px-3.5 py-2.5 text-[15px] text-[#212121] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/15 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="signup-address"
              className="block text-[13px] font-medium text-[#212121] mb-1.5"
            >
              Address
            </label>
            <textarea
              id="signup-address"
              rows={3}
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address, apartment/unit, city, and postal code"
              className="w-full px-3.5 py-2.5 text-[15px] text-[#212121] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/15 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 text-[15px] font-semibold text-[#FFFFFF] bg-[#2E7D32] hover:bg-[#256628] rounded-lg transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2E7D32]"
          >
            Create Resident Account
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E5E7EB] flex items-center justify-between gap-4">
          <span className="text-[14px] text-[#616161]">
            Already registered?
          </span>
          <button
            type="button"
            onClick={() => navigate('index')}
            className="text-[14px] font-semibold text-[#2E7D32] hover:text-[#256628] hover:underline underline-offset-4 transition-colors whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] rounded px-1"
          >
            Log in
          </button>
        </div>
      </div>
    </main>
  );
}
