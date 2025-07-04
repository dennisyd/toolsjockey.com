import React from 'react';
import VideoToolLayout from '../../components/shared/VideoToolLayout';
import FrameExtractor from '../../components/frame-extractor/FrameExtractor';
import { Helmet } from 'react-helmet';
import { useAnalytics } from '../../hooks/useAnalytics';

const FrameExtractorPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  return (
    <>
      <Helmet>
        <title>Frame Extractor - Extract Images from Videos | ToolsJockey</title>
        <meta name="description" content="Extract frames from videos without uploading them. Free online frame extractor with privacy-first approach - all processing happens in your browser." />
      </Helmet>
      
      <VideoToolLayout
        title="Frame Extractor"
        description="Extract still frames from videos at specific timestamps - all processing happens in your browser for maximum privacy."
        toolPath="frame-extractor"
      >
        <FrameExtractor />
      </VideoToolLayout>
    </>
  );
};

export default FrameExtractorPage; 