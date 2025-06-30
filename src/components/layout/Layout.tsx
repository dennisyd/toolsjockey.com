import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import DonationBanner from './DonationBanner';
import TickerTape from '../TickerTape';

// PDF tool paths are now handled outside of the Layout component
// so we don't need to check for them here anymore
const Layout = () => {
  const location = useLocation();
  // Show CTA only on tool pages (not on PDF tool pages since they're outside the Layout)
  const showDonationBanner =
    location.pathname.startsWith('/tools') ||
    location.pathname.startsWith('/pdf-tools');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <TickerTape />
      <main className="flex-grow">
        <Outlet />
      </main>
      {showDonationBanner && <DonationBanner />}
      <Footer />
    </div>
  );
};

export default Layout; 