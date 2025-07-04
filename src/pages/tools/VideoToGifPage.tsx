import React from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import VideoToGif from '../../components/video-to-gif/VideoToGif';
import { FilmIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Helmet } from 'react-helmet';

const VideoToGifPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  return (
    <>
      <Helmet>
        <title>Video to GIF Converter - Create GIFs from Videos | ToolsJockey</title>
        <meta name="description" content="Convert videos to GIFs without uploading them. Free online video to GIF converter with privacy-first approach - all processing happens in your browser." />
      </Helmet>
      
      <ToolPageLayout
        toolId="video-to-gif"
        title="Video to GIF"
        icon={FilmIcon}
        group="video"
      >
        <VideoToGif />
      </ToolPageLayout>
    </>
  );
};

export default VideoToGifPage; 