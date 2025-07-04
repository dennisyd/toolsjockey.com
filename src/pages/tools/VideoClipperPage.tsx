import React from 'react';
import VideoToolLayout from '../../components/shared/VideoToolLayout';
import VideoClipper from '../../components/video-clipper/VideoClipper';
import { Helmet } from 'react-helmet';
import { useAnalytics } from '../../hooks/useAnalytics';

const VideoClipperPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  return (
    <>
      <Helmet>
        <title>Video Clipper - Trim Videos Online | ToolsJockey</title>
        <meta name="description" content="Trim and clip videos without uploading them. Free online video clipper with privacy-first approach - all processing happens in your browser." />
      </Helmet>
      
      <VideoToolLayout
        title="Video Clipper"
        description="Trim and cut video segments with frame-accurate precision - all processing happens in your browser for maximum privacy."
        toolPath="video-clipper"
      >
        <VideoClipper />
      </VideoToolLayout>
    </>
  );
};

export default VideoClipperPage; 