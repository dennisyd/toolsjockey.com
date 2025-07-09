import React, { useState } from 'react';

const SilentAudioGeneratorPage: React.FC = () => {
  const [duration, setDuration] = useState<number>(5);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const handleGenerate = () => {
    if (duration <= 0 || duration > 600) {
      setError('Duration must be between 1 and 600 seconds.');
      return;
    }
    setError(null);
    setProgress(0);
    setOutputUrl(null);
    // TODO: Generate silent audio using Web Audio API
    // Simulate progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setOutputUrl('#'); // Placeholder
      }
    }, 150);
  };

  return (
    <div className="container-app mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Silent Audio Generator</h1>
      <div className="mb-4 flex gap-4 items-center">
        <label className="block text-sm font-medium">Duration (seconds):
          <input type="number" value={duration} min={1} max={600} onChange={e => setDuration(Number(e.target.value))} className="ml-2 p-1 border rounded w-24" />
        </label>
        <button onClick={handleGenerate} className="btn btn-accent">Generate</button>
      </div>
      {progress > 0 && progress < 100 && (
        <div className="mb-4"><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-accent h-2 rounded-full" style={{ width: `${progress}%` }}></div></div><div className="text-xs mt-1">Generating... {progress}%</div></div>
      )}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {outputUrl && <a href={outputUrl} download="silent.mp3" className="btn btn-accent">Download Silent Audio</a>}
    </div>
  );
};

export default SilentAudioGeneratorPage; 