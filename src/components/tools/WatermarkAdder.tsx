import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

// Supported image types
const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'webp'];

const WatermarkAdder = () => {
  // State
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState('Sample Watermark');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkImageUrl, setWatermarkImageUrl] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.5);
  const [position, setPosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // File upload logic
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': IMAGE_TYPES.map(ext => `.${ext}`),
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const f = acceptedFiles[0];
      setFile(f);
      setResultUrl(null);
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (IMAGE_TYPES.includes(ext!)) {
        setFileType('image');
        setPreview(URL.createObjectURL(f));
      } else if (ext === 'pdf') {
        setFileType('pdf');
        setPreview(null);
      } else {
        setFileType(null);
        setPreview(null);
      }
    }
  });

  // Watermark image upload
  const { getRootProps: getWatermarkRootProps, getInputProps: getWatermarkInputProps } = useDropzone({
    accept: { 'image/*': IMAGE_TYPES.map(ext => `.${ext}`) },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const f = acceptedFiles[0];
      setWatermarkImage(f);
      setWatermarkImageUrl(URL.createObjectURL(f));
    }
  });

  // Helper: Draw watermark on canvas for images
  const drawWatermarkOnCanvas = async (imgUrl: string) => {
    return new Promise<string>(async (resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        const canvas = canvasRef.current!;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        ctx.globalAlpha = opacity;
        // Watermark
        if (watermarkType === 'text') {
          ctx.font = `${Math.floor(canvas.width / 15)}px sans-serif`;
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          let x = canvas.width / 2, y = canvas.height / 2;
          if (position === 'top-left') { x = 60; y = 40; }
          if (position === 'top-right') { x = canvas.width - 60; y = 40; }
          if (position === 'bottom-left') { x = 60; y = canvas.height - 40; }
          if (position === 'bottom-right') { x = canvas.width - 60; y = canvas.height - 40; }
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.lineWidth = 4;
          ctx.strokeText(watermarkText, x, y);
          ctx.fillText(watermarkText, x, y);
        } else if (watermarkType === 'image' && watermarkImageUrl) {
          const wmImg = new window.Image();
          wmImg.onload = () => {
            let wmW = canvas.width / 4, wmH = (wmImg.height / wmImg.width) * wmW;
            let x = (canvas.width - wmW) / 2, y = (canvas.height - wmH) / 2;
            if (position === 'top-left') { x = 20; y = 20; }
            if (position === 'top-right') { x = canvas.width - wmW - 20; y = 20; }
            if (position === 'bottom-left') { x = 20; y = canvas.height - wmH - 20; }
            if (position === 'bottom-right') { x = canvas.width - wmW - 20; y = canvas.height - wmH - 20; }
            ctx.drawImage(wmImg, x, y, wmW, wmH);
            resolve(canvas.toDataURL('image/png'));
          };
          wmImg.src = watermarkImageUrl;
          return;
        }
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = imgUrl;
    });
  };

  // Helper: Add watermark to PDF using pdf-lib
  const addWatermarkToPDF = async (file: File) => {
    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      if (watermarkType === 'text') {
        page.drawText(watermarkText, {
          x: position.includes('left') ? 40 : position.includes('right') ? width - 200 : width / 2 - 100,
          y: position.includes('top') ? height - 60 : position.includes('bottom') ? 40 : height / 2,
          size: 48,
          color: rgb(1, 1, 1),
          opacity,
          rotate: degrees(0),
        });
      } else if (watermarkType === 'image' && watermarkImage) {
        const imgBytes = await watermarkImage.arrayBuffer();
        let embed, dims;
        if (watermarkImage.type.includes('png')) {
          embed = await pdfDoc.embedPng(imgBytes);
        } else {
          embed = await pdfDoc.embedJpg(imgBytes);
        }
        dims = embed.scale(0.25);
        let x = (width - dims.width) / 2, y = (height - dims.height) / 2;
        if (position === 'top-left') { x = 40; y = height - dims.height - 40; }
        if (position === 'top-right') { x = width - dims.width - 40; y = height - dims.height - 40; }
        if (position === 'bottom-left') { x = 40; y = 40; }
        if (position === 'bottom-right') { x = width - dims.width - 40; y = 40; }
        page.drawImage(embed, {
          x, y, width: dims.width, height: dims.height, opacity
        });
      }
    }
    const pdfBytes = await pdfDoc.save();
    return URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
  };

  // Main watermark handler
  const handleAddWatermark = async () => {
    if (!file || !fileType) return;
    setIsProcessing(true);
    if (fileType === 'image' && preview) {
      const url = await drawWatermarkOnCanvas(preview);
      setResultUrl(url);
    } else if (fileType === 'pdf') {
      const url = await addWatermarkToPDF(file);
      setResultUrl(url);
    }
    setIsProcessing(false);
  };

  // Download handler
  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = fileType === 'pdf' ? 'watermarked.pdf' : 'watermarked.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* File upload */}
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors">
        <input {...getInputProps()} />
        {!file ? (
          <div>
            <p className="font-semibold">Drag & drop an image or PDF here, or click to select</p>
            <p className="text-sm text-gray-500 mt-1">Supported: JPG, PNG, WEBP, PDF</p>
          </div>
        ) : (
          <div>
            <p className="mb-2">Selected: <b>{file.name}</b></p>
            {fileType === 'image' && preview && (
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded shadow" />
            )}
            {fileType === 'pdf' && (
              <p className="text-sm text-gray-500">PDF file ready for watermarking</p>
            )}
          </div>
        )}
      </div>
      {/* Watermark options */}
      {file && fileType && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <label className="font-semibold">Watermark type:</label>
            <select value={watermarkType} onChange={e => setWatermarkType(e.target.value as any)} className="p-2 border rounded">
              <option value="text">Text</option>
              <option value="image">Image</option>
            </select>
          </div>
          {watermarkType === 'text' ? (
            <input
              type="text"
              value={watermarkText}
              onChange={e => setWatermarkText(e.target.value)}
              className="p-2 border rounded w-full"
              placeholder="Enter watermark text"
            />
          ) : (
            <div {...getWatermarkRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-accent transition-colors">
              <input {...getWatermarkInputProps()} />
              {!watermarkImageUrl ? (
                <span className="text-gray-500">Drag & drop watermark image, or click to select</span>
              ) : (
                <img src={watermarkImageUrl} alt="Watermark preview" className="max-h-24 mx-auto" />
              )}
            </div>
          )}
          <div className="flex gap-4 items-center">
            <label className="font-semibold">Opacity:</label>
            <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={e => setOpacity(Number(e.target.value))} />
            <span>{Math.round(opacity * 100)}%</span>
          </div>
          <div className="flex gap-4 items-center">
            <label className="font-semibold">Position:</label>
            <select value={position} onChange={e => setPosition(e.target.value as any)} className="p-2 border rounded">
              <option value="center">Center</option>
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>
          <button className="btn btn-primary w-full" onClick={handleAddWatermark} disabled={isProcessing || (watermarkType === 'image' && !watermarkImage && !watermarkImageUrl)}>
            {isProcessing ? 'Processing...' : 'Add Watermark'}
          </button>
        </div>
      )}
      {/* Result preview and download */}
      {resultUrl && (
        <div className="flex flex-col gap-2 items-center mt-4">
          {fileType === 'image' ? (
            <img src={resultUrl} alt="Watermarked result" className="max-h-64 rounded shadow" />
          ) : (
            <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline">Preview PDF</a>
          )}
          <button className="btn btn-primary mt-2" onClick={handleDownload}>Download</button>
        </div>
      )}
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default WatermarkAdder; 