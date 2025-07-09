import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import { useAnalytics } from './hooks/useAnalytics';

// PDF tool imports
import PDFToolsPage from './pages/pdf-tools';
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

// Media tool imports
import MediaToolsPage from './pages/media-tools';
import AudioConverterPage from './pages/tools/AudioConverterPage';
import AudioCompressorPage from './pages/tools/AudioCompressorPage';
import AudioMergerPage from './pages/tools/AudioMergerPage';
import AudioClipperPage from './pages/tools/AudioClipperPage';
import VolumeNormalizerPage from './pages/tools/VolumeNormalizerPage';
import AudioMetadataEditorPage from './pages/tools/AudioMetadataEditorPage';
import AudioSpeedChangerPage from './pages/tools/AudioSpeedChangerPage';
import SilentAudioGeneratorPage from './pages/tools/SilentAudioGeneratorPage';
import VideoConverterPage from './pages/tools/VideoConverterPage';
import VideoClipperPage from './pages/tools/VideoClipperPage';
import VideoCompressorPage from './pages/tools/VideoCompressorPage';
import FrameExtractorPage from './pages/tools/FrameExtractorPage';
import VideoMergerPage from './pages/tools/VideoMergerPage';

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
            {/* Standalone pages with custom header */}
            <Route path="pdf-tools" element={<PDFToolsPage />} />
            <Route path="media-tools" element={<MediaToolsPage />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              
              {/* PDF tool routes - most use direct paths, BatchPDFFormFiller uses /tools/ prefix */}
              <Route path="tools/batch-pdf-form-filler" element={<BatchPDFFormFillerPage />} />
              
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
