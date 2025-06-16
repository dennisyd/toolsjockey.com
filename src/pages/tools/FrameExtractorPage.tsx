import React from 'react';
import VideoToolLayout from '../../components/shared/VideoToolLayout';
import FrameExtractor from '../../components/frame-extractor/FrameExtractor';
import { Helmet } from 'react-helmet';

const FrameExtractorPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Frame Extractor - Extract Images from Videos | ToolsJockey</title>
        <meta name="description" content="Extract frames and screenshots from videos without uploading them. Free online frame extractor with privacy-first approach - all processing happens in your browser." />
      </Helmet>
      
      <VideoToolLayout
        title="Frame Extractor"
        description="Extract frames and screenshots from any video - all processing happens in your browser for maximum privacy."
        toolPath="frame-extractor"
        toolName="Frame Extractor"
      >
        <FrameExtractor />
      </VideoToolLayout>
    </>
  );
};

export default FrameExtractorPage; 