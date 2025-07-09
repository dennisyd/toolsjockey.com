import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import { useAnalytics } from './hooks/useAnalytics';

// PDF tool imports
import MergePDFPage from './pages/pdf-tools/MergePDFPage';
import SplitPDFPage from './pages/pdf-tools/SplitPDFPage';
import ReorderPDFPage from './pages/pdf-tools/ReorderPDFPage';
import RotatePDFPage from './pages/pdf-tools/RotatePDFPage';
import WatermarkPDFPage from './pages/pdf-tools/WatermarkPDFPage';
import PDFToImagesPage from './pages/pdf-tools/PDFToImagesPage';
import ImagesToPDFPage from './pages/pdf-tools/ImagesToPDFPage';
import ExtractTextPage from './pages/pdf-tools/ExtractTextPage';
import PDFToWordPage from './pages/pdf-tools/PDFToWordPage';
import DeletePagesPage from './pages/pdf-tools/DeletePagesPage';
import EditMetadataPage from './pages/pdf-tools/EditMetadataPage';
import CompressPDFPage from './pages/pdf-tools/CompressPDFPage';
import UnlockPDFPage from './pages/pdf-tools/UnlockPDFPage';
import BatchPDFFormFillerPage from './pages/tools/BatchPDFFormFillerPage';

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
              
              {/* PDF tool routes - most use direct paths, BatchPDFFormFiller uses /tools/ prefix */}
              <Route path="tools/batch-pdf-form-filler" element={<BatchPDFFormFillerPage />} />
            </Route>
            
            {/* PDF tool routes - direct paths (outside Layout) */}
            <Route path="merge-pdf" element={<MergePDFPage />} />
            <Route path="split-pdf" element={<SplitPDFPage />} />
            <Route path="reorder-pdf" element={<ReorderPDFPage />} />
            <Route path="rotate-pdf" element={<RotatePDFPage />} />
            <Route path="watermark-pdf" element={<WatermarkPDFPage />} />
            <Route path="pdf-to-images" element={<PDFToImagesPage />} />
            <Route path="images-to-pdf" element={<ImagesToPDFPage />} />
            <Route path="extract-text" element={<ExtractTextPage />} />
            <Route path="pdf-to-word" element={<PDFToWordPage />} />
            <Route path="delete-pages" element={<DeletePagesPage />} />
            <Route path="edit-metadata" element={<EditMetadataPage />} />
            <Route path="compress-pdf" element={<CompressPDFPage />} />
            <Route path="unlock-pdf" element={<UnlockPDFPage />} />
          </Routes>
        </Suspense>
      </AnalyticsWrapper>
    </BrowserRouter>
  );
}

export default App;
