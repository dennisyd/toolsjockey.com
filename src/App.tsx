import React, { lazy, Suspense, useEffect } from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
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
import PresentationToolsPage from './pages/presentation-tools/index';
import PrivacyToolsPage from './pages/privacy-tools/index';
import PDFToolsPage from './pages/pdf-tools/index';
import MediaToolsPage from './pages/media-tools/index';
import ImageToolsPage from './pages/image-tools/index';
import DeveloperToolsPage from './pages/developer-tools/index';
import ColorDesignToolsPage from './pages/color-design-tools/index';
import DocumentToolsPage from './pages/document-tools/index';

// Only keep tool pages that are actually routed
const WordToMarkdownPage = lazy(() => import('./pages/tools/WordToMarkdownPage'));
const MailMergeToolPage = lazy(() => import('./pages/tools/MailMergeToolPage'));

function App() {
  useEffect(() => {
    const preloadFFmpeg = async () => {
      try {
        const ffmpeg = getFFmpeg();
        if (!ffmpeg.isLoaded()) {
          // Removed all console.* debugging statements
        } else {
          // Removed all console.* debugging statements
        }
      } catch (error) {
        // Removed all console.* debugging statements
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
            <Route path="presentation-tools" element={<PresentationToolsPage />} />
            <Route path="calculation-tools" element={<CalculationToolsPage />} />
            <Route path="archive-tools" element={<ArchiveToolsPage />} />
            <Route path="privacy-tools" element={<PrivacyToolsPage />} />
            <Route path="pdf-tools" element={<PDFToolsPage />} />
            <Route path="media-tools" element={<MediaToolsPage />} />
            <Route path="image-tools" element={<ImageToolsPage />} />
            <Route path="developer-tools" element={<DeveloperToolsPage />} />
            <Route path="color-design-tools" element={<ColorDesignToolsPage />} />
            <Route path="document-tools" element={<DocumentToolsPage />} />
            <Route path="word-docs" element={<DocumentToolsPage />} />
            <Route path="word-tools" element={<DocumentToolsPage />} />

            {/* Main layout for most pages */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:id" element={<BlogArticle />} />
              <Route path="tools/word-to-markdown" element={<WordToMarkdownPage />} />
              <Route path="tools/mail-merge-tool" element={<MailMergeToolPage />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="tutorials" element={<TutorialsIndex />} />
              <Route path="tutorials/:id" element={<TutorialPage />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
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

// Loading fallback and AnalyticsWrapper definitions remain unchanged
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mb-4"></div>
    <p className="text-gray-600">Loading resources...</p>
  </div>
);

const AnalyticsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAnalytics();
  return <>{children}</>;
};

export default App;
