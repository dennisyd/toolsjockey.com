import { lazy, Suspense, useEffect } from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ComponentType } from 'react';
import Layout from './components/layout/Layout';
import UnitConverterPage from './pages/tools/UnitConverterPage';
import CurrencyConverterPage from './pages/tools/CurrencyConverterPage';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import About from './pages/About';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import TutorialsIndex from './pages/TutorialsIndex';
import TutorialPage from './pages/TutorialPage';
import { getFFmpeg } from './hooks/useFFmpeg';
import { useAnalytics } from './hooks/useAnalytics';
import CalculationToolsPage from './pages/calculation-tools/index';
import ArchiveToolsPage from './pages/archive-tools/index';
import ExcelCsvToolsPage from './pages/excelcsv-tools/index';
import PresentationToolsPage from './pages/presentation-tools';
import PrivacyToolsPage from './pages/privacy-tools';
import PDFToolsPage from './pages/pdf-tools';
import MediaToolsPage from './pages/media-tools';
import ImageToolsPage from './pages/image-tools';
import DeveloperToolsPage from './pages/developer-tools';
import ColorDesignToolsPage from './pages/color-design-tools';
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

// Lazy load pages with retry mechanism
const retryLazy = <T extends ComponentType<any>>(componentImport: () => Promise<{ default: T }>) => {
  return new Promise<{ default: T }>((resolve, reject) => {
    // Try to load the component with retries
    const load = (retryCount = 0) => {
      componentImport()
        .then(resolve)
        .catch((error: Error) => {
          if (retryCount < 3) {
            setTimeout(() => load(retryCount + 1), 300);
          } else {
            reject(error);
          }
        });
    };
    load();
  });
};

// Lazy load pages with retry mechanism - Grouped by category for better chunking
const AudioConverterPage = lazy(() => retryLazy(() => import('./pages/tools/AudioConverterPage')));
const AudioCompressorPage = lazy(() => retryLazy(() => import('./pages/tools/AudioCompressorPage')));
const AudioMergerPage = lazy(() => retryLazy(() => import('./pages/tools/AudioMergerPage')));
const AudioClipperPage = lazy(() => retryLazy(() => import('./pages/tools/AudioClipperPage')));
const VolumeNormalizerPage = lazy(() => retryLazy(() => import('./pages/tools/VolumeNormalizerPage')));
const AudioMetadataEditorPage = lazy(() => retryLazy(() => import('./pages/tools/AudioMetadataEditorPage')));
const AudioSpeedChangerPage = lazy(() => retryLazy(() => import('./pages/tools/AudioSpeedChangerPage')));
const SilentAudioGeneratorPage = lazy(() => retryLazy(() => import('./pages/tools/SilentAudioGeneratorPage')));

// Image tools - separate chunk
const ImageSharpenerPage = lazy(() => retryLazy(() => import('./pages/tools/ImageSharpenerPage')));
const QRCodeGeneratorPage = lazy(() => retryLazy(() => import('./pages/tools/QRCodeGeneratorPage')));
const ImageCompressorPage = lazy(() => retryLazy(() => import('./pages/tools/ImageCompressorPage')));
const ColorPaletteGeneratorPage = lazy(() => retryLazy(() => import('./pages/tools/ColorPaletteGeneratorPage')));

// Document tools - separate chunk
const ExcelMergerSplitterPage = lazy(() => retryLazy(() => import('./pages/tools/ExcelMergerSplitterPage')));
const WordToMarkdownPage = lazy(() => retryLazy(() => import('./pages/tools/WordToMarkdownPage')));
const CSVToJSONPage = lazy(() => retryLazy(() => import('./pages/tools/CSVToJSONPage')));
const WordCounterPage = lazy(() => retryLazy(() => import('./pages/tools/WordCounterPage')));

// Utility tools - separate chunk
const WatermarkAdderPage = lazy(() => retryLazy(() => import('./pages/tools/WatermarkAdderPage')));
const EXIFRemoverPage = lazy(() => retryLazy(() => import('./pages/tools/EXIFRemoverPage')));
const ImageFormatConverterPage = lazy(() => retryLazy(() => import('./pages/tools/ImageFormatConverterPage')));
const CSVToolMergerPage = lazy(() => retryLazy(() => import('./pages/tools/CSVToolMergerPage')));
const JSONFormatterPage = lazy(() => retryLazy(() => import('./pages/tools/JSONFormatterPage')));
const BatchPDFFormFillerPage = lazy(() => retryLazy(() => import('./pages/tools/BatchPDFFormFillerPage')));
const TextFromImagePage = lazy(() => retryLazy(() => import('./pages/tools/TextFromImagePage')));

// Developer tools - separate chunk
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

// Color design tools - separate chunk
const ColorPickerTool = lazy(() => retryLazy(() => import('./tools/colorDesign/ColorPickerTool')));
const ContrastChecker = lazy(() => retryLazy(() => import('./tools/colorDesign/ContrastChecker')));
const GradientGenerator = lazy(() => retryLazy(() => import('./tools/colorDesign/GradientGenerator')));
const ColorFormatConverter = lazy(() => retryLazy(() => import('./tools/colorDesign/ColorFormatConverter')));

// Archive tools - separate chunk
const MailMergeToolPage = lazy(() => retryLazy(() => import('./pages/tools/MailMergeToolPage')));
const ExcelToFormatsConverterPage = lazy(() => retryLazy(() => import('./pages/tools/ExcelToFormatsConverterPage')));
const ZipCreatorPage = lazy(() => retryLazy(() => import('./pages/tools/ZipCreatorPage')));
const ZipExtractorPage = lazy(() => retryLazy(() => import('./pages/tools/ZipExtractorPage')));
const SevenZipSupportPage = lazy(() => retryLazy(() => import('./pages/tools/SevenZipSupportPage')));
const FileArchiverPage = lazy(() => retryLazy(() => import('./pages/tools/FileArchiverPage')));
const ArchiveInspectorPage = lazy(() => retryLazy(() => import('./pages/tools/ArchiveInspectorPage')));
const BatchCompressorPage = lazy(() => retryLazy(() => import('./pages/tools/BatchCompressorPage')));
const ArchiveConverterPage = lazy(() => retryLazy(() => import('./pages/tools/ArchiveConverterPage')));

// Calculation tools - separate chunk
const ScientificCalculatorPage = lazy(() => retryLazy(() => import('./pages/tools/ScientificCalculatorPage')));
const DateCalculatorPage = lazy(() => retryLazy(() => import('./pages/tools/DateCalculatorPage')));
const LoanCalculatorPage = lazy(() => retryLazy(() => import('./pages/tools/LoanCalculatorPage')));
const TaxCalculatorPage = lazy(() => retryLazy(() => import('./pages/tools/TaxCalculatorPage')));
const PercentageCalculatorPage = lazy(() => retryLazy(() => import('./pages/tools/PercentageCalculatorPage')));
const StatisticsCalculatorPage = lazy(() => retryLazy(() => import('./pages/tools/StatisticsCalculatorPage')));
const InvestmentCalculatorPage = lazy(() => retryLazy(() => import('./pages/tools/InvestmentCalculatorPage')));
const BMICalculatorPage = lazy(() => retryLazy(() => import('./pages/tools/BMICalculatorPage')));

// Presentation tools - separate chunk
const PPTXToPDFPage = lazy(() => retryLazy(() => import('./pages/tools/PPTXToPDFPage')));
const PPTXToImagesPage = lazy(() => retryLazy(() => import('./pages/tools/PPTXToImagesPage')));
const PPTXMergerPage = lazy(() => retryLazy(() => import('./pages/tools/PPTXMergerPage')));
const PPTXSplitterPage = lazy(() => retryLazy(() => import('./pages/tools/PPTXSplitterPage')));
const PPTXExtractTextPage = lazy(() => retryLazy(() => import('./pages/tools/PPTXExtractTextPage')));
const PPTXMetadataEditorPage = lazy(() => retryLazy(() => import('./pages/tools/PPTXMetadataEditorPage')));
const PPTXSlideCounterPage = lazy(() => retryLazy(() => import('./pages/tools/PPTXSlideCounterPage')));

// Video tools - separate chunk
const VideoConverterPage = lazy(() => retryLazy(() => import('./pages/tools/VideoConverterPage')));
const VideoClipperPage = lazy(() => retryLazy(() => import('./pages/tools/VideoClipperPage')));
const VideoCompressorPage = lazy(() => retryLazy(() => import('./pages/tools/VideoCompressorPage')));
const FrameExtractorPage = lazy(() => retryLazy(() => import('./pages/tools/FrameExtractorPage')));
const VideoMergerPage = lazy(() => retryLazy(() => import('./pages/tools/VideoMergerPage')));

// Developer tools - separate chunk
const HTMLMinifierPage = lazy(() => retryLazy(() => import('./pages/tools/HTMLMinifierPage')));
const JSMinifierPage = lazy(() => retryLazy(() => import('./pages/tools/JSMinifierPage')));
const CodeFormatterPage = lazy(() => retryLazy(() => import('./pages/tools/CodeFormatterPage')));
const SyntaxHighlighterPage = lazy(() => retryLazy(() => import('./pages/tools/SyntaxHighlighterPage')));
const CodeDiffViewerPage = lazy(() => retryLazy(() => import('./pages/tools/CodeDiffViewerPage')));
const URLEncoderDecoderPage = lazy(() => retryLazy(() => import('./pages/tools/URLEncoderDecoderPage')));
const HTMLEntityConverterPage = lazy(() => retryLazy(() => import('./pages/tools/HTMLEntityConverterPage')));
const LoremIpsumGeneratorPage = lazy(() => retryLazy(() => import('./pages/tools/LoremIpsumGeneratorPage')));

// Image tools - separate chunk
const ImageCollageMakerPage = lazy(() => retryLazy(() => import('./pages/tools/ImageCollageMakerPage')));
const ImageCropperPage = lazy(() => retryLazy(() => import('./pages/tools/ImageCropperPage')));
const ImageOptimizerPage = lazy(() => retryLazy(() => import('./pages/tools/ImageOptimizerPage')));
const ImageDownscalerPage = lazy(() => retryLazy(() => import('./pages/tools/ImageDownscalerPage')));

// Privacy tools - separate chunk
const FileEncryptorPage = lazy(() => retryLazy(() => import('./pages/tools/FileEncryptorPage')));
const FileDecryptorPage = lazy(() => retryLazy(() => import('./pages/tools/FileDecryptorPage')));
const SecureNotesPage = lazy(() => retryLazy(() => import('./pages/tools/SecureNotesPage')));
const RandomDataGeneratorPage = lazy(() => retryLazy(() => import('./pages/tools/RandomDataGeneratorPage')));
const EXIFDataViewerPage = lazy(() => retryLazy(() => import('./pages/tools/EXIFDataViewerPage')));
const FileHashVerifierPage = lazy(() => retryLazy(() => import('./pages/tools/FileHashVerifierPage')));
const SecureFileShredderPage = lazy(() => retryLazy(() => import('./pages/tools/SecureFileShredderPage')));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mb-4"></div>
    <p className="text-gray-600">Loading resources...</p>
  </div>
);

// Analytics wrapper component
const AnalyticsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAnalytics(); // This will handle route tracking automatically
  return <>{children}</>;
};

function App() {
  useEffect(() => {
    // Pre-load FFmpeg when the app starts - but only in a background way
    // Let individual components handle their own loading properly
    const preloadFFmpeg = async () => {
      try {
        const ffmpeg = getFFmpeg();
        // Only check if it's already loaded, don't force loading here
        // This avoids race conditions with component-level loading
        if (!ffmpeg.isLoaded()) {
          // Removed all console.* debugging statements
        } else {
          // Removed all console.* debugging statements
        }
      } catch (error) {
        // Removed all console.* debugging statements
        // Individual components will handle FFmpeg loading if needed
      }
    };

    preloadFFmpeg();
  }, []);

  return (
    <BrowserRouter>
      <AnalyticsWrapper>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Standalone pages with custom header */}
            <Route path="excelcsv-tools" element={<ExcelCsvToolsPage />} />
            <Route path="presentation-tools" element={<PresentationToolsPage />} />
            <Route path="calculation-tools" element={<CalculationToolsPage />} />
            <Route path="archive-tools" element={<ArchiveToolsPage />} />
            <Route path="privacy-tools" element={<PrivacyToolsPage />} />
            <Route path="pdf-tools" element={<PDFToolsPage />} />
            <Route path="media-tools" element={<MediaToolsPage />} />
            <Route path="image-tools" element={<ImageToolsPage />} />
            <Route path="developer-tools" element={<DeveloperToolsPage />} />
            <Route path="color-design-tools" element={<ColorDesignToolsPage />} />

            {/* Main layout for most pages */}
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
              
              {/* Archive tool routes */}
              <Route path="tools/zip-creator" element={<ZipCreatorPage />} />
              <Route path="tools/zip-extractor" element={<ZipExtractorPage />} />
              <Route path="tools/seven-zip-support" element={<SevenZipSupportPage />} />
              <Route path="tools/file-archiver" element={<FileArchiverPage />} />
              <Route path="tools/archive-inspector" element={<ArchiveInspectorPage />} />
              <Route path="tools/batch-compressor" element={<BatchCompressorPage />} />
              <Route path="tools/archive-converter" element={<ArchiveConverterPage />} />
              
              {/* Calculation tool routes */}
              <Route path="tools/scientific-calculator" element={<ScientificCalculatorPage />} />
              <Route path="tools/date-calculator" element={<DateCalculatorPage />} />
              <Route path="tools/loan-calculator" element={<LoanCalculatorPage />} />
              <Route path="tools/tax-calculator" element={<TaxCalculatorPage />} />
              <Route path="tools/percentage-calculator" element={<PercentageCalculatorPage />} />
              <Route path="tools/statistics-calculator" element={<StatisticsCalculatorPage />} />
              <Route path="tools/investment-calculator" element={<InvestmentCalculatorPage />} />
              <Route path="tools/bmi-calculator" element={<BMICalculatorPage />} />
              
              {/* Presentation tool routes */}
              <Route path="tools/pptx-to-pdf" element={<PPTXToPDFPage />} />
              <Route path="tools/pptx-to-images" element={<PPTXToImagesPage />} />
              <Route path="tools/pptx-merger" element={<PPTXMergerPage />} />
              <Route path="tools/pptx-splitter" element={<PPTXSplitterPage />} />
              <Route path="tools/pptx-extract-text" element={<PPTXExtractTextPage />} />
              <Route path="tools/pptx-metadata-editor" element={<PPTXMetadataEditorPage />} />
              <Route path="tools/pptx-slide-counter" element={<PPTXSlideCounterPage />} />
              
              {/* Audio tool routes */}
              <Route path="tools/audio-converter" element={<AudioConverterPage />} />
              <Route path="tools/audio-compressor" element={<AudioCompressorPage />} />
              <Route path="tools/audio-merger" element={<AudioMergerPage />} />
              <Route path="tools/audio-clipper" element={<AudioClipperPage />} />
              <Route path="tools/volume-normalizer" element={<VolumeNormalizerPage />} />
              <Route path="tools/audio-metadata-editor" element={<AudioMetadataEditorPage />} />
              <Route path="tools/audio-speed-changer" element={<AudioSpeedChangerPage />} />
              <Route path="tools/silent-audio-generator" element={<SilentAudioGeneratorPage />} />
              
              {/* Video tool routes */}
              <Route path="tools/video-converter" element={<VideoConverterPage />} />
              <Route path="tools/video-clipper" element={<VideoClipperPage />} />
              <Route path="tools/video-compressor" element={<VideoCompressorPage />} />
              <Route path="tools/frame-extractor" element={<FrameExtractorPage />} />
              <Route path="tools/video-merger" element={<VideoMergerPage />} />
              
              {/* New code tool routes */}
              <Route path="tools/html-minifier" element={<HTMLMinifierPage />} />
              <Route path="tools/js-minifier" element={<JSMinifierPage />} />
              <Route path="tools/code-formatter" element={<CodeFormatterPage />} />
              <Route path="tools/syntax-highlighter" element={<SyntaxHighlighterPage />} />
              <Route path="tools/code-diff-viewer" element={<CodeDiffViewerPage />} />
              <Route path="tools/url-encoder-decoder" element={<URLEncoderDecoderPage />} />
              <Route path="tools/html-entity-converter" element={<HTMLEntityConverterPage />} />
              <Route path="tools/lorem-ipsum-generator" element={<LoremIpsumGeneratorPage />} />
              
              {/* New image tool routes */}
              <Route path="tools/image-collage-maker" element={<ImageCollageMakerPage />} />
              <Route path="tools/image-cropper" element={<ImageCropperPage />} />
              <Route path="tools/image-optimizer" element={<ImageOptimizerPage />} />
              <Route path="tools/image-downscaler" element={<ImageDownscalerPage />} />
              
              {/* Privacy tool routes */}
              <Route path="tools/file-encryptor" element={<FileEncryptorPage />} />
              <Route path="tools/file-decryptor" element={<FileDecryptorPage />} />
              <Route path="tools/secure-notes" element={<SecureNotesPage />} />
              <Route path="tools/random-data-generator" element={<RandomDataGeneratorPage />} />
              <Route path="tools/exif-data-viewer" element={<EXIFDataViewerPage />} />
              <Route path="tools/file-hash-verifier" element={<FileHashVerifierPage />} />
              <Route path="tools/secure-file-shredder" element={<SecureFileShredderPage />} />
              
              {/* PDF tool routes */}
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
              
              <Route path="*" element={<Navigate to="/not-found" replace />} />
            </Route>
            <Route path="not-found" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </Suspense>
      </AnalyticsWrapper>
    </BrowserRouter>
  );
}

export default App;
