import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const ImageSharpenerPage = lazy(() => import('./pages/tools/ImageSharpenerPage'));
const QRCodeGeneratorPage = lazy(() => import('./pages/tools/QRCodeGeneratorPage'));
const ImageCompressorPage = lazy(() => import('./pages/tools/ImageCompressorPage'));
const ColorPaletteGeneratorPage = lazy(() => import('./pages/tools/ColorPaletteGeneratorPage'));
const PDFUtilitiesPage = lazy(() => import('./pages/tools/PDFUtilitiesPage'));
const ExcelMergerSplitterPage = lazy(() => import('./pages/tools/ExcelMergerSplitterPage'));
const WordToMarkdownPage = lazy(() => import('./pages/tools/WordToMarkdownPage'));
const CSVToJSONPage = lazy(() => import('./pages/tools/CSVToJSONPage'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="tools/image-sharpener" element={<ImageSharpenerPage />} />
            <Route path="tools/qr-code-generator" element={<QRCodeGeneratorPage />} />
            <Route path="tools/image-compressor" element={<ImageCompressorPage />} />
            <Route path="tools/color-palette-generator" element={<ColorPaletteGeneratorPage />} />
            <Route path="tools/pdf-utilities" element={<PDFUtilitiesPage />} />
            <Route path="tools/excel-merger-splitter" element={<ExcelMergerSplitterPage />} />
            <Route path="tools/word-to-markdown" element={<WordToMarkdownPage />} />
            <Route path="tools/csv-to-json" element={<CSVToJSONPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
