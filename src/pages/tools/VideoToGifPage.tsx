import React from 'react';
import VideoToolLayout from '../../components/shared/VideoToolLayout';
import VideoToGif from '../../components/video-to-gif/VideoToGif';
import { Helmet } from 'react-helmet';

const VideoToGifPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Video to GIF Converter - Create GIFs from Videos | ToolsJockey</title>
        <meta name="description" content="Convert videos to GIFs without uploading them. Free online video to GIF converter with privacy-first approach - all processing happens in your browser." />
      </Helmet>
      
      <VideoToolLayout
        title="Video to GIF"
        description="Convert videos to animated GIFs with custom settings - all processing happens in your browser for maximum privacy."
        toolPath="video-to-gif"
      >
        <VideoToGif />
      </VideoToolLayout>
    </>
  );
};

export default VideoToGifPage; 