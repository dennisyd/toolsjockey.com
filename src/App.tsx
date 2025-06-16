import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import UnitConverterPage from './pages/tools/UnitConverterPage';
import CurrencyConverterPage from './pages/tools/CurrencyConverterPage';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import TutorialsIndex from './pages/TutorialsIndex';
import TutorialPage from './pages/TutorialPage';
import About from './pages/About';
import Contact from './pages/Contact';
import ExcelToFormatsConverterPage from './pages/tools/ExcelToFormatsConverterPage';
import VideoConverterPage from './pages/tools/VideoConverterPage';
import VideoClipperPage from './pages/tools/VideoClipperPage';
import VideoCompressorPage from './pages/tools/VideoCompressorPage';
import VideoToGifPage from './pages/tools/VideoToGifPage';
import FrameExtractorPage from './pages/tools/FrameExtractorPage';
import AudioExtractorPage from './pages/tools/AudioExtractorPage';
import VideoMergerPage from './pages/tools/VideoMergerPage';

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
const BatchPDFFormFillerPage = lazy(() => import('./pages/tools/BatchPDFFormFillerPage'));
const PDFSuiteDashboard = lazy(() => import('./pages/pdf-tools/index'));
const MergePDFPage = lazy(() => import('./pages/pdf-tools/MergePDFPage'));
const SplitPDFPage = lazy(() => import('./pages/pdf-tools/SplitPDFPage'));
const ReorderPDFPage = lazy(() => import('./pages/pdf-tools/ReorderPDFPage'));
const RotatePDFPage = lazy(() => import('./pages/pdf-tools/RotatePDFPage'));
const WatermarkPDFPage = lazy(() => import('./pages/pdf-tools/WatermarkPDFPage'));
const PDFToImagesPage = lazy(() => import('./pages/pdf-tools/PDFToImagesPage'));
const ImagesToPDFPage = lazy(() => import('./pages/pdf-tools/ImagesToPDFPage'));
const ExtractTextPage = lazy(() => import('./pages/pdf-tools/ExtractTextPage'));
const PDFToWordPage = lazy(() => import('./pages/pdf-tools/PDFToWordPage'));
const DeletePagesPage = lazy(() => import('./pages/pdf-tools/DeletePagesPage'));
const EditMetadataPage = lazy(() => import('./pages/pdf-tools/EditMetadataPage'));
const TextFromImagePage = lazy(() => import('./pages/tools/TextFromImagePage'));
const HashGeneratorPage = lazy(() => import('./pages/tools/HashGeneratorPage'));
const CSSMinifierPage = lazy(() => import('./pages/tools/CSSMinifierPage'));
const Base64EncoderPage = lazy(() => import('./pages/tools/Base64EncoderPage'));
const PasswordGeneratorPage = lazy(() => import('./pages/tools/PasswordGeneratorPage'));
const TextCaseConverterPage = lazy(() => import('./pages/tools/TextCaseConverterPage'));
const TextDiffViewerPage = lazy(() => import('./pages/tools/TextDiffViewerPage'));
const ColumnFilterToolPage = lazy(() => import('./pages/tools/ColumnFilterToolPage'));
const DuplicateRemoverToolPage = lazy(() => import('./pages/tools/DuplicateRemoverToolPage'));
const MarkdownTableGeneratorPage = lazy(() => import('./pages/tools/MarkdownTableGeneratorPage'));
const RegexTesterPage = lazy(() => import('./pages/tools/RegexTesterPage'));
const ColorPickerTool = lazy(() => import('./tools/colorDesign/ColorPickerTool'));
const ContrastChecker = lazy(() => import('./tools/colorDesign/ContrastChecker'));
const GradientGenerator = lazy(() => import('./tools/colorDesign/GradientGenerator'));
const ColorFormatConverter = lazy(() => import('./tools/colorDesign/ColorFormatConverter'));
const FAQ = lazy(() => import('./pages/FAQ'));
// Blog pages
const Blog = lazy(() => import('./pages/Blog'));
const BlogArticle = lazy(() => import('./pages/BlogArticle'));
const MailMergeToolPage = lazy(() => import('./pages/tools/MailMergeToolPage'));
const PDFRedactionToolPage = lazy(() => import('./pages/tools/PDFRedactionToolPage'));

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
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:id" element={<BlogArticle />} />
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
            <Route path="tools/batch-pdf-form-filler" element={<BatchPDFFormFillerPage />} />
            <Route path="tools/text-from-image" element={<TextFromImagePage />} />
            <Route path="tools/unit-converter" element={<UnitConverterPage />} />
            <Route path="tools/currency-converter" element={<CurrencyConverterPage />} />
            <Route path="tools/hash-generator" element={<HashGeneratorPage />} />
            <Route path="tools/css-minifier" element={<CSSMinifierPage />} />
            <Route path="tools/base64-encoder" element={<Base64EncoderPage />} />
            <Route path="tools/password-generator" element={<PasswordGeneratorPage />} />
            <Route path="tools/text-case-converter" element={<TextCaseConverterPage />} />
            <Route path="tools/text-diff" element={<TextDiffViewerPage />} />
            <Route path="tools/column-filter" element={<ColumnFilterToolPage />} />
            <Route path="tools/remove-duplicates" element={<DuplicateRemoverToolPage />} />
            <Route path="tools/markdown-table-generator" element={<MarkdownTableGeneratorPage />} />
            <Route path="tools/regex-tester" element={<RegexTesterPage />} />
            <Route path="tools/color-picker" element={<ColorPickerTool />} />
            <Route path="tools/contrast-checker" element={<ContrastChecker />} />
            <Route path="tools/gradient-generator" element={<GradientGenerator />} />
            <Route path="tools/color-format-converter" element={<ColorFormatConverter />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="tutorials" element={<TutorialsIndex />} />
            <Route path="tutorials/:id" element={<TutorialPage />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="tools/mail-merge-tool" element={<MailMergeToolPage />} />
            <Route path="tools/pdf-redaction-tool" element={<PDFRedactionToolPage />} />
            <Route path="tools/excel-to-formats" element={<ExcelToFormatsConverterPage />} />
            <Route path="tools/video-converter" element={<VideoConverterPage />} />
            <Route path="tools/video-clipper" element={<VideoClipperPage />} />
            <Route path="tools/video-compressor" element={<VideoCompressorPage />} />
            <Route path="tools/video-to-gif" element={<VideoToGifPage />} />
            <Route path="tools/frame-extractor" element={<FrameExtractorPage />} />
            <Route path="tools/video-merger" element={<VideoMergerPage />} />
            <Route path="tools/audio-extractor" element={<AudioExtractorPage />} />
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
          </Route>
          <Route path="/tools" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
