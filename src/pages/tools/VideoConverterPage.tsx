import React from 'react';
import VideoToolLayout from '../../components/shared/VideoToolLayout';
import VideoConverter from '../../components/tools/VideoConverter';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Helmet } from 'react-helmet';

const VideoConverterPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  return (
    <>
      <Helmet>
        <title>Video Converter - Convert Videos Between Formats | ToolsJockey</title>
        <meta name="description" content="Convert videos between formats without uploading them. Free online video converter with privacy-first approach - all processing happens in your browser." />
      </Helmet>
      
      <VideoToolLayout
        title="Video Converter"
        description="Convert videos between multiple formats (MP4, WebM, AVI, etc.) - all processing happens in your browser for maximum privacy."
        toolPath="video-converter"
      >
        <VideoConverter />
      </VideoToolLayout>
    </>
  );
};

export default VideoConverterPage; 