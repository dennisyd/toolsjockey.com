import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import DonationBanner from './DonationBanner';
import TickerTape from '../TickerTape';

const pdfToolPaths = [
  '/merge-pdf',
  '/split-pdf',
  '/reorder-pdf',
  '/rotate-pdf',
  '/watermark-pdf',
  '/pdf-to-images',
  '/images-to-pdf',
  '/extract-text',
  '/pdf-to-word',
  '/delete-pages',
  '/edit-metadata'
];

const Layout = () => {
  const location = useLocation();
  // Show CTA only on tool pages and individual PDF tool pages
  const showDonationBanner =
    location.pathname.startsWith('/tools') ||
    location.pathname.startsWith('/pdf-tools') ||
    pdfToolPaths.some(path => location.pathname.startsWith(path));

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