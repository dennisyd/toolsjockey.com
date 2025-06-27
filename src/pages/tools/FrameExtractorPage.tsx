import React from 'react';
import VideoToolLayout from '../../components/shared/VideoToolLayout';
import FrameExtractor from '../../components/frame-extractor/FrameExtractor';
import { Helmet } from 'react-helmet';

const FrameExtractorPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Frame Extractor - Extract Frames from Videos | ToolsJockey</title>
        <meta name="description" content="Extract frames from videos without uploading your files. This free online frame extractor processes videos locally in your browser for maximum privacy." />
      </Helmet>
      
      <VideoToolLayout
        title="Frame Extractor"
        description="Extract frames from videos at specific timestamps or intervals - all processing happens locally for maximum privacy."
        toolPath="frame-extractor"
      >
        <FrameExtractor />
      </VideoToolLayout>
    </>
  );
};

export default FrameExtractorPage; 