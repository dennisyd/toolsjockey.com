import { useEffect } from 'react';
import VideoConverter from '../../components/tools/VideoConverter';
import VideoToolLayout from '../../components/shared/VideoToolLayout';

const VideoConverterPage = () => {
  useEffect(() => {
    document.title = 'Video Converter - ToolsJockey.com';
  }, []);

  return (
    <VideoToolLayout
      title="Video Converter"
      description="Convert videos between different formats without uploading to servers."
      toolPath="video-converter"
    >
      <VideoConverter />
    </VideoToolLayout>
  );
};

export default VideoConverterPage; 