import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const ImageSharpenerPage = lazy(() => import('./pages/tools/ImageSharpenerPage'));
const QRCodeGeneratorPage = lazy(() => import('./pages/tools/QRCodeGeneratorPage'));
const ImageCompressorPage = lazy(() => import('./pages/tools/ImageCompressorPage'));
const ColorPaletteGeneratorPage = lazy(() => import('./pages/tools/ColorPaletteGeneratorPage'));
const ExcelMergerSplitterPage = lazy(() => import('./pages/tools/ExcelMergerSplitterPage'));
const WordToMarkdownPage = lazy(() => import('./pages/tools/WordToMarkdownPage'));
const CSVToJSONPage = lazy(() => import('./pages/tools/CSVToJSONPage'));
const WordCounterPage = lazy(() => import('./pages/tools/WordCounterPage'));
const WatermarkAdderPage = lazy(() => import('./pages/tools/WatermarkAdderPage'));
const EXIFRemoverPage = lazy(() => import('./pages/tools/EXIFRemoverPage'));
const ImageFormatConverterPage = lazy(() => import('./pages/tools/ImageFormatConverterPage'));
const CSVToolMergerPage = lazy(() => import('./pages/tools/CSVToolMergerPage'));
const JSONFormatterPage = lazy(() => import('./pages/tools/JSONFormatterPage'));
const BatchPDFFormFiller = lazy(() => import('./components/tools/BatchPDFFormFiller'));
const PDFSuiteDashboard = lazy(() => import('./pages/pdf-tools/index'));
const MergePDFPage = lazy(() => import('./pages/pdf-tools/MergePDFPage'));
const SplitPDFPage = lazy(() => import('./pages/pdf-tools/SplitPDFPage'));
const CompressPDFPage = lazy(() => import('./pages/pdf-tools/CompressPDFPage'));
const ReorderPDFPage = lazy(() => import('./pages/pdf-tools/ReorderPDFPage'));
const RotatePDFPage = lazy(() => import('./pages/pdf-tools/RotatePDFPage'));
const WatermarkPDFPage = lazy(() => import('./pages/pdf-tools/WatermarkPDFPage'));
const PDFToImagesPage = lazy(() => import('./pages/pdf-tools/PDFToImagesPage'));
const ImagesToPDFPage = lazy(() => import('./pages/pdf-tools/ImagesToPDFPage'));
const ExtractTextPage = lazy(() => import('./pages/pdf-tools/ExtractTextPage'));
const PDFToWordPage = lazy(() => import('./pages/pdf-tools/PDFToWordPage'));
const DeletePagesPage = lazy(() => import('./pages/pdf-tools/DeletePagesPage'));
const UnlockPDFPage = lazy(() => import('./pages/pdf-tools/UnlockPDFPage'));
const EditMetadataPage = lazy(() => import('./pages/pdf-tools/EditMetadataPage'));

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
          <Route path="pdf-tools" element={<PDFSuiteDashboard />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="tools/image-sharpener" element={<ImageSharpenerPage />} />
            <Route path="tools/qr-code-generator" element={<QRCodeGeneratorPage />} />
            <Route path="tools/image-compressor" element={<ImageCompressorPage />} />
            <Route path="tools/color-palette-generator" element={<ColorPaletteGeneratorPage />} />
            <Route path="tools/excel-merger-splitter" element={<ExcelMergerSplitterPage />} />
            <Route path="tools/word-to-markdown" element={<WordToMarkdownPage />} />
            <Route path="tools/csv-to-json" element={<CSVToJSONPage />} />
            <Route path="tools/word-counter" element={<WordCounterPage />} />
            <Route path="tools/watermark-adder" element={<WatermarkAdderPage />} />
            <Route path="tools/exif-remover" element={<EXIFRemoverPage />} />
            <Route path="tools/image-format-converter" element={<ImageFormatConverterPage />} />
            <Route path="tools/csv-merger" element={<CSVToolMergerPage />} />
            <Route path="tools/json-formatter" element={<JSONFormatterPage />} />
            <Route path="tools/batch-pdf-form-filler" element={<BatchPDFFormFiller />} />
          </Route>
          <Route path="merge-pdf" element={<MergePDFPage />} />
          <Route path="split-pdf" element={<SplitPDFPage />} />
          <Route path="compress-pdf" element={<CompressPDFPage />} />
          <Route path="reorder-pdf" element={<ReorderPDFPage />} />
          <Route path="rotate-pdf" element={<RotatePDFPage />} />
          <Route path="watermark-pdf" element={<WatermarkPDFPage />} />
          <Route path="pdf-to-images" element={<PDFToImagesPage />} />
          <Route path="images-to-pdf" element={<ImagesToPDFPage />} />
          <Route path="extract-text" element={<ExtractTextPage />} />
          <Route path="pdf-to-word" element={<PDFToWordPage />} />
          <Route path="delete-pages" element={<DeletePagesPage />} />
          <Route path="unlock-pdf" element={<UnlockPDFPage />} />
          <Route path="edit-metadata" element={<EditMetadataPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
