import React, { useState } from 'react';
import { useFFmpegTest } from '../hooks/useFFmpeg-test';
import { fetchFile } from '@ffmpeg/ffmpeg';

const FFmpegTest: React.FC = () => {
  const { isFFmpegLoaded, isFFmpegLoading, error, getFFmpeg } = useFFmpegTest();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const runTest = async () => {
    if (!isFFmpegLoaded) {
      setTestResult('FFmpeg not loaded');
      return;
    }

    setProcessing(true);
    setTestResult('Running test...');

    try {
      const ffmpeg = getFFmpeg();
      
      // Create a simple test video file (black screen 1 second)
      setTestResult('Creating test video...');
      await ffmpeg.run(
        '-f', 'lavfi',
        '-i', 'color=black:size=640x480:duration=1',
        '-c:v', 'libx264',
        '-t', '1',
        'test_video.mp4'
      );

      // Extract audio (should create empty audio)
      setTestResult('Extracting audio...');
      await ffmpeg.run(
        '-i', 'test_video.mp4',
        '-vn',
        '-acodec', 'libmp3lame',
        '-ab', '128k',
        '-f', 'mp3',
        'test_audio.mp3'
      );

      // Check if file was created
      const audioData = ffmpeg.FS('readFile', 'test_audio.mp3');
      
      // Clean up
      ffmpeg.FS('unlink', 'test_video.mp4');
      ffmpeg.FS('unlink', 'test_audio.mp3');

      setTestResult(`✅ Test passed! Audio file created with ${audioData.length} bytes`);
    } catch (err) {
      console.error('Test failed:', err);
      setTestResult(`❌ Test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const testFileUpload = async (file: File) => {
    if (!isFFmpegLoaded) {
      setTestResult('FFmpeg not loaded');
      return;
    }

    setProcessing(true);
    setTestResult('Processing uploaded file...');

    try {
      const ffmpeg = getFFmpeg();
      
      // Write uploaded file
      const inputName = 'input' + (file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '.mp4');
      ffmpeg.FS('writeFile', inputName, await fetchFile(file));
      
      // Extract audio
      await ffmpeg.run(
        '-i', inputName,
        '-vn',
        '-acodec', 'libmp3lame',
        '-ab', '128k',
        '-f', 'mp3',
        'output.mp3'
      );

      // Read result
      const audioData = ffmpeg.FS('readFile', 'output.mp3');
      const blob = new Blob([audioData.buffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      // Clean up
      ffmpeg.FS('unlink', inputName);
      ffmpeg.FS('unlink', 'output.mp3');

      setTestResult(`✅ Real file test passed! Audio extracted: ${audioData.length} bytes`);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted_audio.mp3';
      a.click();
    } catch (err) {
      console.error('File test failed:', err);
      setTestResult(`❌ File test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">FFmpeg Test Page</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">FFmpeg Status</h2>
          
          {isFFmpegLoading && (
            <div className="text-blue-600 dark:text-blue-400">
              ⏳ Loading FFmpeg...
            </div>
          )}
          
          {isFFmpegLoaded && (
            <div className="text-green-600 dark:text-green-400">
              ✅ FFmpeg loaded successfully!
            </div>
          )}
          
          {error && (
            <div className="text-red-600 dark:text-red-400">
              ❌ Error: {error}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            <button
              onClick={runTest}
              disabled={!isFFmpegLoaded || processing}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {processing ? 'Running Test...' : 'Run Basic Test'}
            </button>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Test with your video file:
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) testFileUpload(file);
                }}
                disabled={!isFFmpegLoaded || processing}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        </div>

        {testResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <div className="whitespace-pre-wrap font-mono text-sm">
              {testResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FFmpegTest; 