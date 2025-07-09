import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import { useAnalytics } from './hooks/useAnalytics';

// Optional: if you want to keep your existing loading spinner
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mb-4"></div>
    <p className="text-gray-600">Loading resources...</p>
  </div>
);

// Analytics wrapper (used in your original file)
const AnalyticsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAnalytics();
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AnalyticsWrapper>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
            </Route>
          </Routes>
        </Suspense>
      </AnalyticsWrapper>
    </BrowserRouter>
  );
}

export default App;
