import React from 'react';
import VideoToolLayout from '../../components/shared/VideoToolLayout';
import AudioExtractor from '../../components/audio-extractor/AudioExtractor';
import { Helmet } from 'react-helmet';
import { useAnalytics } from '../../hooks/useAnalytics';

const AudioExtractorPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  return (
    <>
      <Helmet>
        <title>Audio Extractor - Extract Audio from Videos | ToolsJockey</title>
        <meta name="description" content="Extract audio from videos without uploading them. Free online audio extractor with privacy-first approach - all processing happens in your browser." />
      </Helmet>
      
      <VideoToolLayout
        title="Audio Extractor"
        description="Extract audio tracks from videos in multiple formats - all processing happens in your browser for maximum privacy."
        toolPath="audio-extractor"
      >
        <AudioExtractor />
      </VideoToolLayout>
    </>
  );
};

export default AudioExtractorPage; 