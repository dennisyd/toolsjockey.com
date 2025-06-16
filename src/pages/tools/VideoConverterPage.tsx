import { useEffect } from 'react';
import VideoConverter from '../../components/tools/VideoConverter';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { FileVideo } from 'lucide-react';

const VideoConverterPage = () => {
  useEffect(() => {
    document.title = 'Video Converter - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="video-converter"
      title="Video Converter"
      icon={FileVideo}
      group="video"
      relatedTools={['image-sharpener', 'image-compressor', 'json-formatter']}
    >
      <VideoConverter />
    </ToolPageLayout>
  );
};

export default VideoConverterPage; 