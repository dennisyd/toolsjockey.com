import React from 'react';
import VideoToolLayout from '../../components/shared/VideoToolLayout';
import VideoMerger from '../../components/video-merger/VideoMerger';
import { Helmet } from 'react-helmet';

const VideoMergerPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Video Merger - Combine Videos Online | ToolsJockey</title>
        <meta name="description" content="Merge multiple video files into one without uploading them. Free online video merger tool with privacy-first approach - all processing happens in your browser." />
      </Helmet>
      
      <VideoToolLayout
        title="Video Merger"
        description="Combine multiple videos into a single file - all processing happens in your browser for maximum privacy."
        toolPath="video-merger"
        toolName="Video Merger"
      >
        <VideoMerger />
      </VideoToolLayout>
    </>
  );
};

export default VideoMergerPage; 