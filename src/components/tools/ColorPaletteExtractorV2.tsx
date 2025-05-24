import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import AdSlot from '../ads/AdSlot';

function rgbToHex(r: number, g: number, b: number) {
  return (
    '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  );
}

function getComplementary(hex: string) {
  // Simple complementary: invert RGB
  const r = 255 - parseInt(hex.slice(1, 3), 16);
  const g = 255 - parseInt(hex.slice(3, 5), 16);
  const b = 255 - parseInt(hex.slice(5, 7), 16);
  return rgbToHex(r, g, b);
}

function exportCSS(palette: string[]) {
  return palette.map((c, i) => `--color${i + 1}: ${c};`).join('\n');
}

function exportJSON(palette: string[]) {
  return JSON.stringify(palette, null, 2);
}

function exportASE(palette: string[]) {
  // Minimal ASE (Adobe Swatch Exchange) format for palette
  // This is a binary format, so here we just export as .txt for demo
  return palette.join('\n');
}

const ColorPaletteExtractorV2 = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [palettes, setPalettes] = useState<string[][]>([]);
  const [complementaries, setComplementaries] = useState<string[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: true,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      setPreviews(acceptedFiles.map(f => URL.createObjectURL(f)));
      setPalettes([]);
      setComplementaries([]);
    },
  });

  const extractColors = async () => {
    setIsProcessing(true);
    const allPalettes: string[][] = [];
    const allComplements: string[][] = [];
    for (const file of files) {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      await new Promise(res => (img.onload = res));
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const data = ctx.getImageData(0, 0, img.width, img.height).data;
      // Simple color quantization: group by rounding
      const colorMap: Record<string, number> = {};
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        const r = Math.round(data[i] / 16) * 16;
        const g = Math.round(data[i + 1] / 16) * 16;
        const b = Math.round(data[i + 2] / 16) * 16;
        const hex = rgbToHex(r, g, b);
        colorMap[hex] = (colorMap[hex] || 0) + 1;
      }
      const sorted = Object.entries(colorMap).sort((a, b) => b[1] - a[1]);
      const palette = sorted.slice(0, 6).map(([hex]) => hex);
      allPalettes.push(palette);
      allComplements.push(palette.map(getComplementary));
    }
    setPalettes(allPalettes);
    setComplementaries(allComplements);
    setIsProcessing(false);
  };

  const handleExport = (type: 'css' | 'json' | 'ase', palette: string[], name: string) => {
    let content = '';
    let mime = 'text/plain';
    let ext = type;
    if (type === 'css') content = exportCSS(palette);
    if (type === 'json') { content = exportJSON(palette); mime = 'application/json'; }
    if (type === 'ase') content = exportASE(palette);
    const blob = new Blob([content], { type: mime });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${name}-palette.${ext}`;
    link.click();
  };

  return (
    <div className="container-app grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Header Ad */}
      <div className="md:col-span-12">
        <AdSlot slot="header" className="mb-4" />
      </div>
      {/* Sidebar Ad */}
      <div className="hidden md:block md:col-span-3">
        <AdSlot slot="sidebar" className="sticky top-6" />
      </div>
      {/* Main Content */}
      <div className="md:col-span-6">
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 shadow-md mb-6">
          <h1 className="text-2xl font-bold mb-4">Color Palette Extractor</h1>
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors mb-4">
            <input {...getInputProps()} />
            <span className="text-gray-500">Drag & drop images here, or click to select (batch supported)</span>
          </div>
          {files.length > 0 && (
            <>
              <button className="btn btn-primary mb-4" onClick={extractColors} disabled={isProcessing}>
                {isProcessing ? 'Extracting...' : 'Extract Palettes'}
              </button>
              <div className="grid grid-cols-1 gap-6">
                {files.map((file, i) => (
                  <div key={file.name} className="bg-gray-50 dark:bg-primary rounded p-3 shadow">
                    <div className="mb-2 font-medium text-sm">{file.name}</div>
                    <img src={previews[i]} alt="preview" className="max-h-32 rounded mb-2" />
                    {palettes[i] && (
                      <>
                        <div className="mb-1 text-xs text-gray-500">Dominant Palette</div>
                        <div className="flex gap-2 mb-2">
                          {palettes[i].map((hex) => (
                            <button key={hex} className="w-8 h-8 rounded" style={{ background: hex }} title={hex} onClick={() => navigator.clipboard.writeText(hex)} />
                          ))}
                        </div>
                        <div className="mb-1 text-xs text-gray-500">Complementary Palette</div>
                        <div className="flex gap-2 mb-2">
                          {complementaries[i].map((hex) => (
                            <button key={hex} className="w-8 h-8 rounded" style={{ background: hex }} title={hex} onClick={() => navigator.clipboard.writeText(hex)} />
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button className="btn btn-secondary" onClick={() => handleExport('css', palettes[i], file.name)}>Export CSS</button>
                          <button className="btn btn-secondary" onClick={() => handleExport('json', palettes[i], file.name)}>Export JSON</button>
                          <button className="btn btn-secondary" onClick={() => handleExport('ase', palettes[i], file.name)}>Export ASE</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {/* Between tools ad */}
        <AdSlot slot="native" className="my-6" />
      </div>
      {/* Sidebar Ad (mobile) */}
      <div className="md:hidden col-span-12">
        <AdSlot slot="mobile" />
      </div>
      {/* Footer Ad */}
      <div className="md:col-span-12">
        <AdSlot slot="footer" className="mt-4" />
      </div>
    </div>
  );
};

export default ColorPaletteExtractorV2; 