import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useResourcify } from '../context/ResourcifyContext';
import { AdminSection, PageRoute } from '../types/resourcify';

const RESIDENT_NAV_ITEMS: { label: string; route: PageRoute }[] = [
  { label: 'Dashboard', route: 'dashboard' },
  { label: 'Book pickup', route: 'book_pickup' },
  { label: 'Rewards shop', route: 'rewards' },
];

const ADMIN_NAV_ITEMS: { label: string; section: AdminSection }[] = [
  { label: 'Verification queue', section: 'queue' },
  { label: 'Residents', section: 'residents' },
  { label: 'Redemptions', section: 'redemptions' },
];

export function Navbar() {
  const {
    currentPage,
    adminSection,
    setAdminSection,
    navigate,
    currentUser,
    logout,
  } = useResourcify();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const handleResidentNav = (route: PageRoute) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  const handleAdminNav = (section: AdminSection) => {
    setAdminSection(section);
    navigate('admin');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FFFFFF] border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Minimalist wordmark */}
        <button
          type="button"
          onClick={() => {
            if (!currentUser) {
              handleResidentNav('index');
            } else if (isAdmin) {
              handleAdminNav('queue');
            } else {
              handleResidentNav('dashboard');
            }
          }}
          className="font-editorial text-[22px] font-semibold tracking-tight text-[#212121] whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] rounded-md px-1 -ml-1 cursor-pointer"
        >
          Resourcify
        </button>

        {currentUser ? (
          <>
            {/* Zone 2: Horizontal navigation links */}
            <nav
              aria-label="Primary"
              className="hidden md:flex items-center gap-8 h-full"
            >
              {isAdmin
                ? ADMIN_NAV_ITEMS.map((item) => {
                    const isActive =
                      currentPage === 'admin' && adminSection === item.section;
                    return (
                      <button
                        key={item.section}
                        type="button"
                        onClick={() => handleAdminNav(item.section)}
                        className={`relative h-full inline-flex items-center text-[14px] font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] ${
                          isActive
                            ? 'text-[#2E7D32] font-semibold'
                            : 'text-[#616161] hover:text-[#212121]'
                        }`}
                      >
                        {item.label}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2E7D32]"
                          />
                        )}
                      </button>
                    );
                  })
                : RESIDENT_NAV_ITEMS.map((item) => {
                    const isActive = currentPage === item.route;
                    return (
                      <button
                        key={item.route}
                        type="button"
                        onClick={() => handleResidentNav(item.route)}
                        className={`relative h-full inline-flex items-center text-[14px] font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] ${
                          isActive
                            ? 'text-[#2E7D32] font-semibold'
                            : 'text-[#616161] hover:text-[#212121]'
                        }`}
                      >
                        {item.label}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2E7D32]"
                          />
                        )}
                      </button>
                    );
                  })}
            </nav>

            {/* Zone 3: Log out action */}
            <div className="hidden md:flex items-center shrink-0">
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 text-[13px] font-medium text-[#616161] hover:text-[#212121] border border-[#E5E7EB] hover:border-[#D1D5DB] rounded-lg bg-[#FFFFFF] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32]"
              >
                Log out
              </button>
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2.5 text-[#212121] hover:bg-[#F8F9FA] rounded-lg transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </>
        ) : (
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => handleResidentNav(currentPage === 'auth' ? 'index' : 'auth')}
              className="px-4 py-2 text-[13px] font-medium text-[#212121] hover:text-[#2E7D32] border border-[#E5E7EB] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32]"
            >
              {currentPage === 'auth' ? 'Log in' : 'Sign Up'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {currentUser && mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFFFF] border-t border-[#E5E7EB] px-4 py-3 space-y-1">
          {isAdmin
            ? ADMIN_NAV_ITEMS.map((item) => {
                const isActive =
                  currentPage === 'admin' && adminSection === item.section;
                return (
                  <button
                    key={item.section}
                    type="button"
                    onClick={() => handleAdminNav(item.section)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#E8F5E9] text-[#2E7D32] font-semibold'
                        : 'text-[#616161] hover:bg-[#F8F9FA] hover:text-[#212121]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })
            : RESIDENT_NAV_ITEMS.map((item) => {
                const isActive = currentPage === item.route;
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => handleResidentNav(item.route)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#E8F5E9] text-[#2E7D32] font-semibold'
                        : 'text-[#616161] hover:bg-[#F8F9FA] hover:text-[#212121]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
          <div className="pt-2 mt-2 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-[14px] font-medium text-[#616161] hover:bg-[#F8F9FA] hover:text-[#212121] cursor-pointer"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
