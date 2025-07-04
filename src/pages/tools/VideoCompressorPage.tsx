import React from 'react';
import VideoToolLayout from '../../components/shared/VideoToolLayout';
import VideoCompressor from '../../components/video-compressor/VideoCompressor';
import { Helmet } from 'react-helmet';
import { useAnalytics } from '../../hooks/useAnalytics';

const VideoCompressorPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  return (
    <>
      <Helmet>
        <title>Video Compressor - Compress Videos Online | ToolsJockey</title>
        <meta name="description" content="Compress videos without uploading them. Free online video compressor with privacy-first approach - all processing happens in your browser." />
      </Helmet>
      
      <VideoToolLayout
        title="Video Compressor"
        description="Compress videos to reduce file size while maintaining quality - all processing happens in your browser for maximum privacy."
        toolPath="video-compressor"
      >
        <VideoCompressor />
      </VideoToolLayout>
    </>
  );
};

export default VideoCompressorPage; 