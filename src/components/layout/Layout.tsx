import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';
import DonationBanner from './DonationBanner';

const Layout = () => {
  const location = useLocation();
  // Show CTA on all tool pages and category pages
  const showDonationBanner =
    location.pathname.startsWith('/tools') ||
    location.pathname.includes('-tools') ||
    location.pathname.includes('/merge-pdf') ||
    location.pathname.includes('/split-pdf') ||
    location.pathname.includes('/reorder-pdf') ||
    location.pathname.includes('/rotate-pdf') ||
    location.pathname.includes('/watermark-pdf') ||
    location.pathname.includes('/pdf-to-images') ||
    location.pathname.includes('/images-to-pdf') ||
    location.pathname.includes('/extract-text') ||
    location.pathname.includes('/pdf-to-word') ||
    location.pathname.includes('/delete-pages') ||
    location.pathname.includes('/edit-metadata') ||
    location.pathname.includes('/compress-pdf') ||
    location.pathname.includes('/unlock-pdf');

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Outlet />
      </main>
      {showDonationBanner && <DonationBanner />}
      <Footer />
    </div>
  );
};

export default Layout; 