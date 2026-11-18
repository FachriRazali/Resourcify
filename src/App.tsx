import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ResourcifyProvider, useResourcify } from './context/ResourcifyContext';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { BookPickupPage } from './pages/BookPickupPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RewardsShopPage } from './pages/RewardsShopPage';
import { SignUpPage } from './pages/SignUpPage';

function ResourcifyShell() {
  const { currentPage, currentUser } = useResourcify();
  const [dashboardBanner, setDashboardBanner] = useState<string | null>(null);

  const renderPage = () => {
    if (!currentUser) {
      if (currentPage === 'auth') {
        return <SignUpPage />;
      }
      return <LoginPage />;
    }

    if (currentUser.role === 'admin') {
      if (currentPage === 'index') return <LoginPage />;
      if (currentPage === 'auth') return <SignUpPage />;
      return <AdminDashboardPage />;
    }

    switch (currentPage) {
      case 'index':
        return <LoginPage />;
      case 'auth':
        return <SignUpPage />;
      case 'book_pickup':
        return (
          <BookPickupPage
            onPickupCreated={(summary) => setDashboardBanner(summary)}
          />
        );
      case 'rewards':
        return <RewardsShopPage />;
      case 'admin':
      case 'dashboard':
      default:
        return (
          <DashboardPage
            bannerMessage={dashboardBanner}
            onDismissBanner={() => setDashboardBanner(null)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212121] flex flex-col">
      <Navbar />
      <div className="flex-1">{renderPage()}</div>
    </div>
  );
}

export default function App() {
  return (
    <ResourcifyProvider>
      <ResourcifyShell />
    </ResourcifyProvider>
  );
}
