import React from 'react';
import VideoToolLayout from '../../components/shared/VideoToolLayout';
import AudioExtractor from '../../components/audio-extractor/AudioExtractor';
import { Helmet } from 'react-helmet';

const AudioExtractorPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Audio Extractor - Extract Audio from Videos | ToolsJockey</title>
        <meta name="description" content="Extract audio tracks from videos without uploading them. Free online audio extractor with privacy-first approach - all processing happens in your browser." />
      </Helmet>
      
      <VideoToolLayout
        title="Audio Extractor"
        description="Extract audio tracks from any video in multiple formats - all processing happens in your browser for maximum privacy."
        toolPath="audio-extractor"
        toolName="Audio Extractor"
      >
        <AudioExtractor />
      </VideoToolLayout>
    </>
  );
};

export default AudioExtractorPage; 