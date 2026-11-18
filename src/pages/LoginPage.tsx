import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useResourcify } from '../context/ResourcifyContext';
import { ADMIN_CREDENTIALS, RESIDENT_DEMO_CREDENTIALS } from '../data/seedData';

export function LoginPage() {
  const { login, navigate } = useResourcify();
  const [email, setEmail] = useState(RESIDENT_DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(RESIDENT_DEMO_CREDENTIALS.password);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = login(email, password);
    if (!res.ok && res.error) {
      setError(res.error);
    }
  };

  const fillDemoAccount = (type: 'resident' | 'admin') => {
    setError(null);
    if (type === 'admin') {
      setEmail(ADMIN_CREDENTIALS.email);
      setPassword(ADMIN_CREDENTIALS.password);
    } else {
      setEmail(RESIDENT_DEMO_CREDENTIALS.email);
      setPassword(RESIDENT_DEMO_CREDENTIALS.password);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-[460px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-8 sm:p-10">
        <div className="mb-7">
          <p className="text-[13px] font-medium text-[#2E7D32] mb-2">
            Resourcify Account Access
          </p>
          <h1 className="font-editorial text-[30px] leading-[1.2] font-semibold text-[#212121] tracking-tight">
            Sign in to your account
          </h1>
          <p className="text-[15px] text-[#616161] mt-2 leading-relaxed">
            Access your resident EcoCoin wallet or sign in as an operations admin to verify waste pickups.
          </p>
        </div>

        {/* Role Quick-Fill Switcher */}
        <div className="mb-6 grid grid-cols-2 gap-2 p-1 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg">
          <button
            type="button"
            onClick={() => fillDemoAccount('resident')}
            className={`py-2 px-3 text-[13px] font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              email.trim().toLowerCase() !== ADMIN_CREDENTIALS.email
                ? 'bg-[#FFFFFF] text-[#212121] border border-[#E5E7EB]'
                : 'text-[#616161] hover:text-[#212121]'
            }`}
          >
            Resident account
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('admin')}
            className={`py-2 px-3 text-[13px] font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              email.trim().toLowerCase() === ADMIN_CREDENTIALS.email
                ? 'bg-[#FFFFFF] text-[#2E7D32] font-semibold border border-[#E5E7EB]'
                : 'text-[#616161] hover:text-[#212121]'
            }`}
          >
            Admin account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && (
            <div
              role="alert"
              className="px-4 py-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] text-[13px] font-medium"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="login-email"
              className="block text-[13px] font-medium text-[#212121] mb-1.5"
            >
              Email
            </label>
            <input
              id="login-email"
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
              htmlFor="login-password"
              className="block text-[13px] font-medium text-[#212121] mb-1.5"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 text-[15px] text-[#212121] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/15 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 text-[15px] font-semibold text-[#FFFFFF] bg-[#2E7D32] hover:bg-[#256628] rounded-lg transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2E7D32]"
          >
            Log in
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>

        <div className="mt-7 pt-6 border-t border-[#E5E7EB] flex items-center justify-between gap-4">
          <span className="text-[14px] text-[#616161]">
            New resident?
          </span>
          <button
            type="button"
            onClick={() => navigate('auth')}
            className="text-[14px] font-semibold text-[#2E7D32] hover:text-[#256628] hover:underline underline-offset-4 transition-colors whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] rounded px-1"
          >
            Sign Up
          </button>
        </div>
      </div>
    </main>
  );
}
