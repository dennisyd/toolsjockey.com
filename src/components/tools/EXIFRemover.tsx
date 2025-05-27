import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

const SUPPORTED_TYPES = ['jpg', 'jpeg', 'png'];

const EXIFRemover = () => {
  // State
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [cleanedUrls, setCleanedUrls] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // File upload logic (batch)
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: true,
    onDrop: (acceptedFiles) => {
      setError(null);
      setFiles(acceptedFiles);
      setPreviews(acceptedFiles.map(f => URL.createObjectURL(f)));
      setCleanedUrls([]);
    }
  });

  // Remove metadata from a single image
  const stripMetadata = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !SUPPORTED_TYPES.includes(ext)) {
        reject('Unsupported file type.');
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = canvasRef.current!;
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          // Re-encode as JPG or PNG (strips metadata)
          const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
          const url = canvas.toDataURL(mime, 0.95);
          resolve(url);
        };
        img.onerror = () => reject('Failed to load image.');
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject('Failed to read file.');
      reader.readAsDataURL(file);
    });
  };

  // Batch process all files
  const handleRemoveMetadata = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const results: string[] = [];
      for (const file of files) {
        // eslint-disable-next-line no-await-in-loop
        const url = await stripMetadata(file);
        results.push(url);
      }
      setCleanedUrls(results);
    } catch (e: any) {
      setError(e.message || 'Failed to process images.');
    }
    setIsProcessing(false);
  };

  // Download single cleaned image
  const handleDownload = (url: string, originalName: string) => {
    const ext = originalName.split('.').pop()?.toLowerCase();
    const name = originalName.replace(/\.[^.]+$/, '') + '-cleaned.' + ext;
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all as ZIP (optional, not implemented here for brevity)
  // You can add JSZip for batch download if desired.

  return (
    <div className="flex flex-col gap-6">
      {/* File upload */}
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors">
        <input {...getInputProps()} />
        {files.length === 0 ? (
          <div>
            <p className="font-semibold">Drag & drop JPG or PNG images here, or click to select (batch supported)</p>
            <p className="text-sm text-gray-500 mt-1">Supported: JPG, PNG</p>
          </div>
        ) : (
          <div>
            <p className="mb-2">Selected: <b>{files.map(f => f.name).join(', ')}</b></p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previews.map((url, i) => (
                <div key={url} className="flex flex-col items-center">
                  <span className="text-xs mb-1">Original</span>
                  <img src={url} alt={`Original ${i}`} className="max-h-40 rounded shadow" />
                  <span className="text-xs text-gray-500">{files[i].name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Remove metadata button */}
      {files.length > 0 && (
        <button className="btn btn-primary w-full" onClick={handleRemoveMetadata} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Remove EXIF/Metadata'}
        </button>
      )}
      {/* Error */}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {/* Before/After comparison */}
      {cleanedUrls.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Before & After Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cleanedUrls.map((url, i) => (
              <div key={url} className="flex flex-col items-center gap-2">
                <span className="text-xs mb-1">Cleaned</span>
                <img src={url} alt={`Cleaned ${i}`} className="max-h-40 rounded shadow border-2 border-green-400" />
                <button className="btn btn-secondary w-full" onClick={() => handleDownload(url, files[i].name)}>
                  Download Cleaned
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default EXIFRemover; 