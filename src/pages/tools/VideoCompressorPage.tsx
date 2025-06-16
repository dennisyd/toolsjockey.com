import React from 'react';
import VideoToolLayout from '../../components/shared/VideoToolLayout';
import VideoCompressor from '../../components/video-compressor/VideoCompressor';
import { Helmet } from 'react-helmet';

const VideoCompressorPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Video Compressor - Reduce Video Size Online | ToolsJockey</title>
        <meta name="description" content="Compress videos without uploading them. Free online video compressor tool with privacy-first approach - all processing happens in your browser." />
      </Helmet>
      
      <VideoToolLayout
        title="Video Compressor"
        description="Reduce video file size while maintaining quality - all processing happens in your browser for maximum privacy."
        toolPath="video-compressor"
        toolName="Video Compressor"
      >
        <VideoCompressor />
      </VideoToolLayout>
    </>
  );
};

export default VideoCompressorPage; 