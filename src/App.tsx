import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ComponentType } from 'react';
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
import NotFound from './pages/NotFound';
import { getFFmpeg } from './hooks/useFFmpeg';

// Lazy load pages with retry mechanism
const retryLazy = <T extends ComponentType<any>>(componentImport: () => Promise<{ default: T }>) => {
  return new Promise<{ default: T }>((resolve, reject) => {
    // Try to load the component with retries
    const load = (retryCount = 0) => {
      componentImport()
        .then(resolve)
        .catch((error: Error) => {
          if (retryCount < 3) {
            console.log(`Retrying import (${retryCount + 1}/3)...`);
            setTimeout(() => load(retryCount + 1), 300);
          } else {
            console.error('Failed to load component after retries:', error);
            reject(error);
          }
        });
    };
    load();
  });
};

// Lazy load pages with retry mechanism
const Home = lazy(() => retryLazy(() => import('./pages/Home')));
const ImageSharpenerPage = lazy(() => retryLazy(() => import('./pages/tools/ImageSharpenerPage')));
const QRCodeGeneratorPage = lazy(() => retryLazy(() => import('./pages/tools/QRCodeGeneratorPage')));
const ImageCompressorPage = lazy(() => retryLazy(() => import('./pages/tools/ImageCompressorPage')));
const ColorPaletteGeneratorPage = lazy(() => retryLazy(() => import('./pages/tools/ColorPaletteGeneratorPage')));
const ExcelMergerSplitterPage = lazy(() => retryLazy(() => import('./pages/tools/ExcelMergerSplitterPage')));
const WordToMarkdownPage = lazy(() => retryLazy(() => import('./pages/tools/WordToMarkdownPage')));
const CSVToJSONPage = lazy(() => retryLazy(() => import('./pages/tools/CSVToJSONPage')));
const WordCounterPage = lazy(() => retryLazy(() => import('./pages/tools/WordCounterPage')));
const WatermarkAdderPage = lazy(() => retryLazy(() => import('./pages/tools/WatermarkAdderPage')));
const EXIFRemoverPage = lazy(() => retryLazy(() => import('./pages/tools/EXIFRemoverPage')));
const ImageFormatConverterPage = lazy(() => retryLazy(() => import('./pages/tools/ImageFormatConverterPage')));
const CSVToolMergerPage = lazy(() => retryLazy(() => import('./pages/tools/CSVToolMergerPage')));
const JSONFormatterPage = lazy(() => retryLazy(() => import('./pages/tools/JSONFormatterPage')));
const BatchPDFFormFillerPage = lazy(() => retryLazy(() => import('./pages/tools/BatchPDFFormFillerPage')));
const PDFSuiteDashboard = lazy(() => retryLazy(() => import('./pages/pdf-tools/index')));
const VideoToolsPage = lazy(() => retryLazy(() => import('./pages/video-tools/index')));
const ImageToolsPage = lazy(() => retryLazy(() => import('./pages/image-tools/index')));
const ExcelCsvToolsPage = lazy(() => retryLazy(() => import('./pages/excel-csv-tools/index')));
const DocumentToolsPage = lazy(() => retryLazy(() => import('./pages/document-tools/index')));
const DeveloperToolsPage = lazy(() => retryLazy(() => import('./pages/developer-tools/index')));
const ColorDesignToolsPage = lazy(() => retryLazy(() => import('./pages/color-design-tools/index')));
const UtilityToolsPage = lazy(() => retryLazy(() => import('./pages/utility-tools/index')));
const MergePDFPage = lazy(() => retryLazy(() => import('./pages/pdf-tools/MergePDFPage')));
const SplitPDFPage = lazy(() => retryLazy(() => import('./pages/pdf-tools/SplitPDFPage')));
const ReorderPDFPage = lazy(() => retryLazy(() => import('./pages/pdf-tools/ReorderPDFPage')));
const RotatePDFPage = lazy(() => retryLazy(() => import('./pages/pdf-tools/RotatePDFPage')));
const WatermarkPDFPage = lazy(() => retryLazy(() => import('./pages/pdf-tools/WatermarkPDFPage')));
const PDFToImagesPage = lazy(() => retryLazy(() => import('./pages/pdf-tools/PDFToImagesPage')));
const ImagesToPDFPage = lazy(() => retryLazy(() => import('./pages/pdf-tools/ImagesToPDFPage')));
const ExtractTextPage = lazy(() => retryLazy(() => import('./pages/pdf-tools/ExtractTextPage')));
const PDFToWordPage = lazy(() => retryLazy(() => import('./pages/pdf-tools/PDFToWordPage')));
const DeletePagesPage = lazy(() => retryLazy(() => import('./pages/pdf-tools/DeletePagesPage')));
const EditMetadataPage = lazy(() => retryLazy(() => import('./pages/pdf-tools/EditMetadataPage')));
const TextFromImagePage = lazy(() => retryLazy(() => import('./pages/tools/TextFromImagePage')));
const HashGeneratorPage = lazy(() => retryLazy(() => import('./pages/tools/HashGeneratorPage')));
const CSSMinifierPage = lazy(() => retryLazy(() => import('./pages/tools/CSSMinifierPage')));
const Base64EncoderPage = lazy(() => retryLazy(() => import('./pages/tools/Base64EncoderPage')));
const PasswordGeneratorPage = lazy(() => retryLazy(() => import('./pages/tools/PasswordGeneratorPage')));
const TextCaseConverterPage = lazy(() => retryLazy(() => import('./pages/tools/TextCaseConverterPage')));
const TextDiffViewerPage = lazy(() => retryLazy(() => import('./pages/tools/TextDiffViewerPage')));
const ColumnFilterToolPage = lazy(() => retryLazy(() => import('./pages/tools/ColumnFilterToolPage')));
const DuplicateRemoverToolPage = lazy(() => retryLazy(() => import('./pages/tools/DuplicateRemoverToolPage')));
const MarkdownTableGeneratorPage = lazy(() => retryLazy(() => import('./pages/tools/MarkdownTableGeneratorPage')));
const RegexTesterPage = lazy(() => retryLazy(() => import('./pages/tools/RegexTesterPage')));
const ColorPickerTool = lazy(() => retryLazy(() => import('./tools/colorDesign/ColorPickerTool')));
const ContrastChecker = lazy(() => retryLazy(() => import('./tools/colorDesign/ContrastChecker')));
const GradientGenerator = lazy(() => retryLazy(() => import('./tools/colorDesign/GradientGenerator')));
const ColorFormatConverter = lazy(() => retryLazy(() => import('./tools/colorDesign/ColorFormatConverter')));
const FAQ = lazy(() => retryLazy(() => import('./pages/FAQ')));
// Blog pages
const Blog = lazy(() => retryLazy(() => import('./pages/Blog')));
const BlogArticle = lazy(() => retryLazy(() => import('./pages/BlogArticle')));
const MailMergeToolPage = lazy(() => retryLazy(() => import('./pages/tools/MailMergeToolPage')));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mb-4"></div>
    <p className="text-gray-600">Loading resources...</p>
  </div>
);

function App() {
  useEffect(() => {
    // Pre-load FFmpeg when the app starts
    const preloadFFmpeg = async () => {
      try {
        const ffmpeg = getFFmpeg();
        if (!ffmpeg.isLoaded()) {
          console.log('Preloading FFmpeg at app level...');
          await ffmpeg.load();
          console.log('FFmpeg preloaded successfully');
        }
      } catch (error) {
        console.error('Error preloading FFmpeg:', error);
        // Individual components will handle FFmpeg loading if needed
      }
    };

    preloadFFmpeg();
  }, []);

  return (
    <BrowserRouter>
      <meta
        httpEquiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
      />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="pdf-tools" element={<PDFSuiteDashboard />} />
          <Route path="video-tools" element={<VideoToolsPage />} />
          <Route path="image-tools" element={<ImageToolsPage />} />
          <Route path="excel-csv-tools" element={<ExcelCsvToolsPage />} />
          <Route path="document-tools" element={<DocumentToolsPage />} />
          <Route path="developer-tools" element={<DeveloperToolsPage />} />
          <Route path="color-design-tools" element={<ColorDesignToolsPage />} />
          <Route path="utility-tools" element={<UtilityToolsPage />} />
          
          {/* Video tool routes - these have their own layout with header/footer */}
          <Route path="tools/video-converter" element={<VideoConverterPage />} />
          <Route path="tools/video-clipper" element={<VideoClipperPage />} />
          <Route path="tools/video-compressor" element={<VideoCompressorPage />} />
          <Route path="tools/video-to-gif" element={<VideoToGifPage />} />
          <Route path="tools/frame-extractor" element={<FrameExtractorPage />} />
          <Route path="tools/video-merger" element={<VideoMergerPage />} />
          <Route path="tools/audio-extractor" element={<AudioExtractorPage />} />
          
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
            <Route path="tools/excel-to-formats" element={<ExcelToFormatsConverterPage />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
