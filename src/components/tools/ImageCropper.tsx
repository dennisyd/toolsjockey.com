import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
// Remove this line:
// import Slider from '@mui/material/Slider';

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject();
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      canvas.toBlob(blob => {
        if (!blob) return reject();
        resolve(URL.createObjectURL(blob));
      }, 'image/png');
    };
    image.onerror = reject;
  });
}

const ImageCropper: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [aspect, setAspect] = useState<number | null>(null);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result as string));
      reader.readAsDataURL(file);
      setCroppedImage(null); // Reset preview on new image
    }
  };

  // Automatically update cropped image preview when crop, zoom, aspect, or image changes
  useEffect(() => {
    const updateCroppedImage = async () => {
      if (!imageSrc || !croppedAreaPixels) {
        setCroppedImage(null);
        return;
      }
      try {
        const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels);
        setCroppedImage(croppedImg);
      } catch {
        setCroppedImage(null);
      }
    };
    updateCroppedImage();
  }, [imageSrc, croppedAreaPixels, aspect, zoom, crop]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">Image Cropper</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
      {imageSrc && (
        <div style={{ position: 'relative', width: '100%', height: 400, background: '#333' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect || undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      )}
      {imageSrc && (
        <div className="my-4">
          <label className="mr-2">Zoom:</label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-48"
          />
          <span className="ml-2">{zoom.toFixed(2)}x</span>
        </div>
      )}
      {imageSrc && (
        <div className="my-4">
          <label className="mr-2">Aspect Ratio:</label>
          <select
            value={aspect === null ? 'free' : aspect}
            onChange={e => {
              const val = e.target.value;
              setAspect(val === 'free' ? null : Number(val));
            }}
          >
            <option value="free">Free</option>
            <option value={1}>1:1</option>
            <option value={16 / 9}>16:9</option>
            <option value={4 / 3}>4:3</option>
          </select>
        </div>
      )}
      {croppedImage && (
        <div className="my-4">
          <h2 className="text-lg font-semibold mb-2">Cropped Preview</h2>
          <img src={croppedImage} alt="Cropped" className="max-w-full border rounded" />
          <a
            href={croppedImage}
            download="cropped-image.png"
            className="block mt-2 bg-green-600 text-white px-4 py-2 rounded-md text-center hover:bg-green-700"
          >
            Download Cropped Image
          </a>
        </div>
      )}
    </div>
  );
};

export default ImageCropper; 