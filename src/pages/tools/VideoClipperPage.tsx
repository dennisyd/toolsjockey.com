import React from 'react';
import VideoToolLayout from '../../components/shared/VideoToolLayout';
import VideoClipper from '../../components/video-clipper/VideoClipper';
import { Helmet } from 'react-helmet';

const VideoClipperPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Video Clipper - Cut and Trim Videos | ToolsJockey</title>
        <meta name="description" content="Cut and trim videos without uploading them. Free online video clipper with privacy-first approach - all processing happens in your browser." />
      </Helmet>
      
      <VideoToolLayout
        title="Video Clipper"
        description="Cut and trim videos to extract the parts you need - all processing happens in your browser for maximum privacy."
        toolPath="video-clipper"
      >
        <VideoClipper />
      </VideoToolLayout>
    </>
  );
};

export default VideoClipperPage; 