import React from 'react';
import Header from '../../components/layout/Header';
import DonationBanner from '../../components/layout/DonationBanner';
import { Helmet } from 'react-helmet';
import { useAnalytics } from '../../hooks/useAnalytics';
import ToolCard from '../../components/shared/ToolCard';
import { 
  FilmIcon, 
  ArchiveBoxIcon, 
  ArrowsUpDownIcon, 
  ScissorsIcon,
  SpeakerWaveIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

const VIDEO_TOOLS = [
  { title: 'Video Converter', path: '/tools/video-converter', desc: 'Convert videos between formats (MP4, WebM, AVI, etc.).', icon: FilmIcon },
  { title: 'Video Compressor', path: '/tools/video-compressor', desc: 'Reduce video file size while maintaining quality.', icon: ArchiveBoxIcon },
  { title: 'Video Merger', path: '/tools/video-merger', desc: 'Combine multiple videos into a single file.', icon: ArrowsUpDownIcon },
  { title: 'Video Clipper', path: '/tools/video-clipper', desc: 'Trim and cut videos with frame-accurate precision.', icon: ScissorsIcon },
  { title: 'Video to GIF', path: '/tools/video-to-gif', desc: 'Convert video clips to animated GIFs.', icon: FilmIcon },
];

const AUDIO_TOOLS = [
  { title: 'Audio Extractor', path: '/tools/audio-extractor', desc: 'Extract audio tracks from video files.', icon: SpeakerWaveIcon },
  { title: 'Frame Extractor', path: '/tools/frame-extractor', desc: 'Extract individual frames from videos as images.', icon: CameraIcon },
];

const VideoToolsPage: React.FC = () => {
  useAnalytics();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Helmet>
        <title>Video Tools - Free Online Video Editor & Converter | ToolsJockey</title>
        <meta name="description" content="Free online video tools to convert, compress, merge, clip, and extract audio from videos. No installation or signup required - all processing happens in your browser." />
      </Helmet>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Video Tools – Convert, Compress & Edit Videos Online</h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Video Processing Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {VIDEO_TOOLS.map((tool) => (
                <ToolCard
                  key={tool.path}
                  title={tool.title}
                  description={tool.desc}
                  path={tool.path}
                  icon={tool.icon}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Audio & Frame Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AUDIO_TOOLS.map((tool) => (
                <ToolCard
                  key={tool.path}
                  title={tool.title}
                  description={tool.desc}
                  path={tool.path}
                  icon={tool.icon}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Why Use Our Video Tools?</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><span className="font-medium">100% Private:</span> All processing happens in your browser. Your videos never leave your device.</li>
              <li><span className="font-medium">No Installation:</span> No need to download or install any video editing software.</li>
              <li><span className="font-medium">Free to Use:</span> All video tools are completely free.</li>
              <li><span className="font-medium">Fast Processing:</span> Get results quickly without waiting for uploads/downloads.</li>
              <li><span className="font-medium">Works Everywhere:</span> Compatible with Windows, Mac, Linux, iOS, and Android.</li>
            </ul>
          </div>
        </div>
      </main>
      <DonationBanner />
    </div>
  );
};

export default VideoToolsPage;
