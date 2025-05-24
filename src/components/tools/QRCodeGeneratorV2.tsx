import React from 'react';
import { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { useDropzone } from 'react-dropzone';
import AdSlot from '../ads/AdSlot';

const QR_TYPES = [
  { value: 'text', label: 'Text/URL' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'vcard', label: 'Contact Card (vCard)' },
];

const ERROR_LEVELS = [
  { value: 'L', label: 'Low (7%)' },
  { value: 'M', label: 'Medium (15%)' },
  { value: 'Q', label: 'Quartile (25%)' },
  { value: 'H', label: 'High (30%)' },
];

const DEFAULT_SIZE = 256;

function getWiFiString(ssid: string, password: string, encryption: string) {
  return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
}

function getVCardString(name: string, phone: string, email: string) {
  return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
}

const QRCodeGeneratorV2 = () => {
  const [qrType, setQrType] = useState('text');
  const [text, setText] = useState('');
  const [wifi, setWifi] = useState({ ssid: '', password: '', encryption: 'WPA' });
  const [vcard, setVcard] = useState({ name: '', phone: '', email: '' });
  const [fgColor, setFgColor] = useState('#222');
  const [bgColor, setBgColor] = useState('#fff');
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [errorLevel, setErrorLevel] = useState('M');
  const [logo, setLogo] = useState<string | null>(null);
  const [qrPng, setQrPng] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Logo upload
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'] },
    maxFiles: 1,
    onDrop: (files) => {
      const file = files[0];
      setLogo(URL.createObjectURL(file));
    },
  });

  // Compose QR data
  let qrData = '';
  if (qrType === 'text') qrData = text;
  if (qrType === 'wifi') qrData = getWiFiString(wifi.ssid, wifi.password, wifi.encryption);
  if (qrType === 'vcard') qrData = getVCardString(vcard.name, vcard.phone, vcard.email);

  // Generate QR code
  const generateQR = async () => {
    setIsGenerating(true);
    try {
      // PNG
      const png = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: errorLevel,
        color: { dark: fgColor, light: bgColor },
        width: size,
        margin: 2,
      });
      setQrPng(png);
      // SVG
      const svg = await QRCode.toString(qrData, {
        errorCorrectionLevel: errorLevel,
        color: { dark: fgColor, light: bgColor },
        type: 'svg',
        width: size,
        margin: 2,
      });
      setQrSvg(svg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Overlay logo on PNG
  const getLogoPreview = () => {
    if (!qrPng || !logo) return qrPng;
    const canvas = canvasRef.current;
    if (!canvas) return qrPng;
    const ctx = canvas.getContext('2d');
    if (!ctx) return qrPng;
    const img = new window.Image();
    img.src = qrPng;
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const logoImg = new window.Image();
      logoImg.src = logo;
      logoImg.onload = () => {
        const logoSize = size * 0.22;
        ctx.drawImage(logoImg, (size - logoSize) / 2, (size - logoSize) / 2, logoSize, logoSize);
      };
    };
    return canvas.toDataURL();
  };

  // Download handlers
  const handleDownload = (type: 'png' | 'svg') => {
    if (type === 'png' && qrPng) {
      const link = document.createElement('a');
      link.href = logo ? getLogoPreview() : qrPng;
      link.download = 'qrcode.png';
      link.click();
    } else if (type === 'svg' && qrSvg) {
      const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qrcode.svg';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  // Auto-generate on input change
  React.useEffect(() => {
    if (qrData) generateQR();
    // eslint-disable-next-line
  }, [qrData, fgColor, bgColor, size, errorLevel]);

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
          <h1 className="text-2xl font-bold mb-4">QR Code Generator</h1>
          <div className="mb-4 flex gap-2">
            {QR_TYPES.map(t => (
              <button key={t.value} className={`btn ${qrType === t.value ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setQrType(t.value)}>{t.label}</button>
            ))}
          </div>
          {/* Inputs by type */}
          {qrType === 'text' && (
            <textarea className="w-full p-2 border rounded mb-4" rows={3} placeholder="Enter text or URL" value={text} onChange={e => setText(e.target.value)} />
          )}
          {qrType === 'wifi' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              <input className="p-2 border rounded" placeholder="SSID" value={wifi.ssid} onChange={e => setWifi({ ...wifi, ssid: e.target.value })} />
              <input className="p-2 border rounded" placeholder="Password" value={wifi.password} onChange={e => setWifi({ ...wifi, password: e.target.value })} />
              <select className="p-2 border rounded" value={wifi.encryption} onChange={e => setWifi({ ...wifi, encryption: e.target.value })}>
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None</option>
              </select>
            </div>
          )}
          {qrType === 'vcard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              <input className="p-2 border rounded" placeholder="Name" value={vcard.name} onChange={e => setVcard({ ...vcard, name: e.target.value })} />
              <input className="p-2 border rounded" placeholder="Phone" value={vcard.phone} onChange={e => setVcard({ ...vcard, phone: e.target.value })} />
              <input className="p-2 border rounded" placeholder="Email" value={vcard.email} onChange={e => setVcard({ ...vcard, email: e.target.value })} />
            </div>
          )}
          {/* Customization */}
          <div className="flex gap-4 mb-4">
            <div>
              <label className="block text-xs mb-1">Foreground</label>
              <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs mb-1">Background</label>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs mb-1">Size</label>
              <input type="number" min={128} max={1024} step={32} value={size} onChange={e => setSize(Number(e.target.value))} className="w-20 p-1 border rounded" />
            </div>
            <div>
              <label className="block text-xs mb-1">Error Correction</label>
              <select value={errorLevel} onChange={e => setErrorLevel(e.target.value)} className="p-1 border rounded">
                {ERROR_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>
          {/* Logo upload */}
          <div className="mb-4">
            <label className="block text-xs mb-1">Logo (optional)</label>
            <div {...getRootProps()} className="border-dashed border-2 border-gray-300 rounded p-2 text-center cursor-pointer hover:border-accent">
              <input {...getInputProps()} />
              {logo ? <img src={logo} alt="Logo" className="h-12 mx-auto" /> : <span className="text-xs text-gray-500">Drag & drop or click to upload</span>}
            </div>
          </div>
          {/* Generate/Preview */}
          <div className="flex flex-col items-center gap-2">
            {isGenerating ? <span>Generating...</span> : (
              <>
                {qrPng && (
                  <>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <img src={logo ? getLogoPreview() : qrPng} alt="QR Preview" className="mx-auto rounded border" style={{ width: size, height: size }} />
                  </>
                )}
                <div className="flex gap-2 mt-2">
                  <button className="btn btn-primary" onClick={() => handleDownload('png')} disabled={!qrPng}>Download PNG</button>
                  <button className="btn btn-secondary" onClick={() => handleDownload('svg')} disabled={!qrSvg}>Download SVG</button>
                </div>
              </>
            )}
          </div>
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

export default QRCodeGeneratorV2; 