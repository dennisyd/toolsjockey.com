export interface VideoFormat {
  extension: string;
  mimeType: string;
  name: string;
  description: string;
  videoCodecs: string[];
  audioCodecs: string[];
}

export const videoFormats: Record<string, VideoFormat> = {
  mp4: {
    extension: 'mp4',
    mimeType: 'video/mp4',
    name: 'MP4',
    description: 'Most compatible format for web and devices',
    videoCodecs: ['libx264', 'libx265'],
    audioCodecs: ['aac', 'mp3'],
  },
  webm: {
    extension: 'webm',
    mimeType: 'video/webm',
    name: 'WebM',
    description: 'Open format with good compression, ideal for web',
    videoCodecs: ['libvpx-vp9', 'libvpx'],
    audioCodecs: ['opus', 'vorbis'],
  },
  avi: {
    extension: 'avi',
    mimeType: 'video/x-msvideo',
    name: 'AVI',
    description: 'Older format with wide compatibility',
    videoCodecs: ['libx264'],
    audioCodecs: ['mp3', 'pcm_s16le'],
  },
  mov: {
    extension: 'mov',
    mimeType: 'video/quicktime',
    name: 'QuickTime (MOV)',
    description: 'Apple QuickTime format, good for Mac/iOS',
    videoCodecs: ['libx264'],
    audioCodecs: ['aac'],
  },
  mkv: {
    extension: 'mkv',
    mimeType: 'video/x-matroska',
    name: 'Matroska (MKV)',
    description: 'Container format supporting many codecs',
    videoCodecs: ['libx264', 'libx265'],
    audioCodecs: ['aac', 'opus', 'flac'],
  },
};

export const imageFormats = {
  png: {
    extension: 'png',
    mimeType: 'image/png',
    name: 'PNG',
    description: 'Lossless format with transparency',
  },
  jpg: {
    extension: 'jpg',
    mimeType: 'image/jpeg',
    name: 'JPEG',
    description: 'Compressed format, good for photos',
  },
  webp: {
    extension: 'webp',
    mimeType: 'image/webp',
    name: 'WebP',
    description: 'Modern format with good compression',
  },
  bmp: {
    extension: 'bmp',
    mimeType: 'image/bmp',
    name: 'BMP',
    description: 'Uncompressed bitmap format',
  },
};

export const audioFormats = {
  mp3: {
    extension: 'mp3',
    mimeType: 'audio/mpeg',
    name: 'MP3',
    description: 'Most common audio format',
    command: ['-vn', '-acodec', 'mp3', '-ab', '192k'],
  },
  wav: {
    extension: 'wav',
    mimeType: 'audio/wav',
    name: 'WAV',
    description: 'Uncompressed audio, high quality',
    command: ['-vn', '-acodec', 'pcm_s16le'],
  },
  aac: {
    extension: 'aac',
    mimeType: 'audio/aac',
    name: 'AAC',
    description: 'High quality, used in MP4 videos',
    command: ['-vn', '-acodec', 'aac', '-ab', '128k'],
  },
  ogg: {
    extension: 'ogg',
    mimeType: 'audio/ogg',
    name: 'OGG Vorbis',
    description: 'Open format with good compression',
    command: ['-vn', '-acodec', 'libvorbis', '-ab', '128k'],
  },
};

export const qualityPresets = {
  low: {
    label: 'Low (480p)',
    resolution: '854x480',
    videoBitrate: '800k',
    audioBitrate: '96k',
    crf: 28,
    preset: 'fast',
  },
  medium: {
    label: 'Medium (720p)',
    resolution: '1280x720',
    videoBitrate: '1500k',
    audioBitrate: '128k',
    crf: 23,
    preset: 'medium',
  },
  high: {
    label: 'High (1080p)',
    resolution: '1920x1080',
    videoBitrate: '3000k',
    audioBitrate: '192k',
    crf: 18,
    preset: 'slow',
  },
};

export const resolutions = [
  { label: '240p', value: '426x240' },
  { label: '360p', value: '640x360' },
  { label: '480p', value: '854x480' },
  { label: '720p', value: '1280x720' },
  { label: '1080p', value: '1920x1080' },
  { label: '1440p', value: '2560x1440' },
  { label: '4K', value: '3840x2160' },
];

export const frameRates = [
  { label: '24 fps (Film)', value: '24' },
  { label: '25 fps (PAL)', value: '25' },
  { label: '30 fps (Standard)', value: '30' },
  { label: '50 fps (PAL HD)', value: '50' },
  { label: '60 fps (Smooth)', value: '60' },
];

// GIF settings
export const gifSettings = {
  frameRates: [10, 15, 20, 25, 30],
  defaultFrameRate: 15,
  qualityOptions: [
    { name: 'Low', value: 5, description: 'Smaller file size, lower quality' },
    { name: 'Medium', value: 10, description: 'Balanced quality and file size' },
    { name: 'High', value: 15, description: 'Higher quality, larger file size' },
  ],
};

// Compression presets
export const compressionPresets = {
  high: {
    name: 'High Quality',
    crf: 18,
    preset: 'slow',
    description: 'Best quality, larger file size',
  },
  medium: {
    name: 'Balanced',
    crf: 23,
    preset: 'medium',
    description: 'Good balance of quality and file size',
  },
  low: {
    name: 'Low Quality',
    crf: 28,
    preset: 'fast',
    description: 'Smaller file size, reduced quality',
  },
};

// Common resolutions
export const commonResolutions = [
  { name: 'Original', width: null, height: null },
  { name: '4K (2160p)', width: 3840, height: 2160 },
  { name: '1440p', width: 2560, height: 1440 },
  { name: '1080p', width: 1920, height: 1080 },
  { name: '720p', width: 1280, height: 720 },
  { name: '480p', width: 854, height: 480 },
  { name: '360p', width: 640, height: 360 },
]; 