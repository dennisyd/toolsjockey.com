import React from 'react';
import VideoToolLayout from '../../components/shared/VideoToolLayout';
import VideoClipper from '../../components/video-clipper/VideoClipper';
import { Helmet } from 'react-helmet';

const VideoClipperPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Video Clipper - Trim Videos Online | ToolsJockey</title>
        <meta name="description" content="Trim and cut videos without uploading them. Free online video clipper tool with privacy-first approach - all processing happens in your browser." />
      </Helmet>
      
      <VideoToolLayout
        title="Video Clipper"
        description="Trim and cut videos to the exact length you need - all processing happens in your browser for maximum privacy."
        toolPath="video-clipper"
        toolName="Video Clipper"
      >
        <VideoClipper />
      </VideoToolLayout>
    </>
  );
};

export default VideoClipperPage; 