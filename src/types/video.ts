export type OutputFormat = 'mp4' | 'webm' | 'avi' | 'mov' | 'mkv';

export type VideoCodec = 'libx264' | 'libx265' | 'libvpx-vp9' | 'libaom-av1';
export type AudioCodec = 'aac' | 'mp3' | 'opus' | 'vorbis';
export type CompressionLevel = 'low' | 'medium' | 'high' | 'custom';

export interface VideoMetadata {
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  codec?: string;
  bitrate?: number;
  framerate?: number;
  fileSize?: number;
}

export interface VideoFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  metadata?: VideoMetadata;
  thumbnail?: string;
  url: string; // Blob URL for preview
}

export interface ConversionOptions {
  outputFormat: OutputFormat;
  quality: string;
  resolution?: string;
  bitrate?: string;
  framerate?: string;
  videoCodec?: string;
  audioCodec?: string;
  audioChannels?: string;
  audioSampleRate?: string;
  compressionLevel?: string;
  // Optional advanced options
  trimStart?: string;
  trimEnd?: string;
  maintainAspectRatio?: boolean;
  includeAudio?: boolean;
}

export interface ConvertedFile {
  id: string;
  originalId: string;
  name: string;
  size: number;
  url: string; // Blob URL for download
  format: string;
  metadata?: VideoMetadata;
}

export interface FFmpegProgress {
  ratio: number; // Progress from 0 to 1
  time: number; // Processed time in seconds
  eta: number | null; // Estimated time remaining in seconds
}

export interface VideoConverterHookReturn {
  isConverting: boolean;
  conversionProgress: number; // 0 to 100
  currentTask: string;
  estimatedTimeRemaining: number | null;
  convertedFiles: ConvertedFile[];
  convert: (files: VideoFile[], options: ConversionOptions) => Promise<void>;
  abort: () => void;
}

export interface FFmpegHookReturn {
  isFFmpegLoaded: boolean;
  isFFmpegLoading: boolean;
  ffmpegLoadingProgress: number; // 0 to 100
  ffmpegLoadingError: string | null;
  loadFFmpeg: () => Promise<void>;
}

export interface FileHandlerOptions {
  setVideoFiles: React.Dispatch<React.SetStateAction<VideoFile[]>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface FileHandlerHookReturn {
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileDrop: (acceptedFiles: File[]) => void;
  validateFile: (file: File) => boolean;
  removeFile: (id: string) => void;
}

export interface VideoFormatInfo {
  extension: string;
  name: string;
  mimeType: string;
  videoCodecs: VideoCodec[];
  audioCodecs: AudioCodec[];
  description: string;
}

export const VIDEO_FORMATS: Record<OutputFormat, VideoFormatInfo> = {
  mp4: {
    extension: 'mp4',
    name: 'MP4',
    mimeType: 'video/mp4',
    videoCodecs: ['libx264', 'libx265'],
    audioCodecs: ['aac', 'mp3'],
    description: 'High compatibility, good compression'
  },
  webm: {
    extension: 'webm',
    name: 'WebM',
    mimeType: 'video/webm',
    videoCodecs: ['libvpx-vp9', 'libaom-av1'],
    audioCodecs: ['opus', 'vorbis'],
    description: 'Open format, excellent for web'
  },
  avi: {
    extension: 'avi',
    name: 'AVI',
    mimeType: 'video/x-msvideo',
    videoCodecs: ['libx264'],
    audioCodecs: ['mp3', 'aac'],
    description: 'Wide compatibility with older software'
  },
  mov: {
    extension: 'mov',
    name: 'QuickTime',
    mimeType: 'video/quicktime',
    videoCodecs: ['libx264'],
    audioCodecs: ['aac'],
    description: 'Popular on Apple devices'
  },
  mkv: {
    extension: 'mkv',
    name: 'Matroska',
    mimeType: 'video/x-matroska',
    videoCodecs: ['libx264', 'libx265', 'libvpx-vp9'],
    audioCodecs: ['aac', 'opus', 'vorbis'],
    description: 'Container format supporting many codecs'
  }
};

export const QUALITY_PRESETS = {
  low: {
    resolution: '854x480',
    bitrate: '500k',
    framerate: '24',
  },
  medium: {
    resolution: '1280x720',
    bitrate: '1000k',
    framerate: '30',
  },
  high: {
    resolution: '1920x1080',
    bitrate: '2000k',
    framerate: '30',
  }
}; 