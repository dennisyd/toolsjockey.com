import React from 'react';
import VideoToolLayout from '../../components/shared/VideoToolLayout';
import VideoToGif from '../../components/video-to-gif/VideoToGif';
import { Helmet } from 'react-helmet';

const VideoToGifPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Video to GIF Converter - Create GIFs Online | ToolsJockey</title>
        <meta name="description" content="Convert videos to GIFs without uploading them. Free online video to GIF converter with privacy-first approach - all processing happens in your browser." />
      </Helmet>
      
      <VideoToolLayout
        title="Video to GIF Converter"
        description="Convert your videos to animated GIFs with customizable settings - all processing happens in your browser for maximum privacy."
        toolPath="video-to-gif"
        toolName="Video to GIF"
      >
        <VideoToGif />
      </VideoToolLayout>
    </>
  );
};

export default VideoToGifPage; 