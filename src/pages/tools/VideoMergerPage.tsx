import React from 'react';
import VideoToolLayout from '../../components/shared/VideoToolLayout';
import VideoMerger from '../../components/video-merger/VideoMerger';
import { Helmet } from 'react-helmet';
import { useAnalytics } from '../../hooks/useAnalytics';

const VideoMergerPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  return (
    <>
      <Helmet>
        <title>Video Merger - Combine Videos Online | ToolsJockey</title>
        <meta name="description" content="Merge multiple videos without uploading them. Free online video merger with privacy-first approach - all processing happens in your browser." />
      </Helmet>
      
      <VideoToolLayout
        title="Video Merger"
        description="Combine multiple video files into a single video - all processing happens in your browser for maximum privacy."
        toolPath="video-merger"
      >
        <VideoMerger />
      </VideoToolLayout>
    </>
  );
};

export default VideoMergerPage; 