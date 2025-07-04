import React from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import VideoConverter from '../../components/tools/VideoConverter';
import { useAnalytics } from '../../hooks/useAnalytics';
import { FilmIcon } from '@heroicons/react/24/outline';

const VideoConverterPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  return (
    <ToolPageLayout
      toolId="video-converter"
      title="Video Converter - Convert Videos Between Any Format"
      icon={FilmIcon}
      group="video"
    >
      <VideoConverter />
    </ToolPageLayout>
  );
};

export default VideoConverterPage; 