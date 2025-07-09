import React, { useRef, useState } from 'react';

const aspectRatios = [
  { label: 'Freeform', value: null },
  { label: '1:1 (Square)', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
];

const ImageCropper: React.FC = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [resizing, setResizing] = useState<boolean>(false);
  const [resizeCorner, setResizeCorner] = useState<string | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [aspect, setAspect] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  // Handle image upload
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setImage(img);
      // Default crop: center square or full image
      const minDim = Math.min(img.width, img.height);
      setCrop({
        x: Math.round((img.width - minDim) / 2),
        y: Math.round((img.height - minDim) / 2),
        w: minDim,
        h: minDim,
      });
    };
    img.src = url;
  };

  // Draw image and crop rectangle
  React.useEffect(() => {
    if (!image || !crop || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    canvasRef.current.width = image.width;
    canvasRef.current.height = image.height;
    ctx.clearRect(0, 0, image.width, image.height);
    ctx.drawImage(image, 0, 0);
    // Draw crop rectangle
    ctx.save();
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);
    ctx.setLineDash([]);
    ctx.restore();
    // Draw resize handles
    const handleSize = 10;
    const corners = [
      [crop.x, crop.y],
      [crop.x + crop.w, crop.y],
      [crop.x, crop.y + crop.h],
      [crop.x + crop.w, crop.y + crop.h],
    ];
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#7c3aed';
    corners.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, handleSize / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });
  }, [image, crop]);

  // Draw preview
  React.useEffect(() => {
    if (!image || !crop || !previewRef.current) return;
    const ctx = previewRef.current.getContext('2d')!;
    previewRef.current.width = crop.w;
    previewRef.current.height = crop.h;
    ctx.clearRect(0, 0, crop.w, crop.h);
    ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
  }, [image, crop]);

  // Mouse events for crop area
  const getCorner = (mx: number, my: number) => {
    if (!crop) return null;
    const corners = [
      { name: 'nw', x: crop.x, y: crop.y },
      { name: 'ne', x: crop.x + crop.w, y: crop.y },
      { name: 'sw', x: crop.x, y: crop.y + crop.h },
      { name: 'se', x: crop.x + crop.w, y: crop.y + crop.h },
    ];
    for (const corner of corners) {
      if (Math.abs(mx - corner.x) < 10 && Math.abs(my - corner.y) < 10) return corner.name;
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!crop || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const corner = getCorner(mx, my);
    if (corner) {
      setResizing(true);
      setResizeCorner(corner);
      setStartPos({ x: mx, y: my });
      return;
    }
    // Inside crop area?
    if (
      mx >= crop.x &&
      mx <= crop.x + crop.w &&
      my >= crop.y &&
      my <= crop.y + crop.h
    ) {
      setDragging(true);
      setStartPos({ x: mx, y: my });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!crop || !canvasRef.current || (!dragging && !resizing)) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (dragging && startPos) {
      // Move crop
      const dx = mx - startPos.x;
      const dy = my - startPos.y;
      let newX = crop.x + dx;
      let newY = crop.y + dy;
      // Clamp
      newX = Math.max(0, Math.min(newX, image!.width - crop.w));
      newY = Math.max(0, Math.min(newY, image!.height - crop.h));
      setCrop({ ...crop, x: newX, y: newY });
      setStartPos({ x: mx, y: my });
    } else if (resizing && startPos && resizeCorner) {
      // Resize crop
      let { x, y, w, h } = crop;
      let dx = mx - startPos.x;
      let dy = my - startPos.y;
      if (resizeCorner === 'nw') {
        x += dx;
        y += dy;
        w -= dx;
        h -= dy;
      } else if (resizeCorner === 'ne') {
        y += dy;
        w += dx;
        h -= dy;
      } else if (resizeCorner === 'sw') {
        x += dx;
        w -= dx;
        h += dy;
      } else if (resizeCorner === 'se') {
        w += dx;
        h += dy;
      }
      // Aspect ratio lock
      if (aspect) {
        if (w / h > aspect) {
          w = Math.round(h * aspect);
        } else {
          h = Math.round(w / aspect);
        }
      }
      // Clamp
      if (w < 10) w = 10;
      if (h < 10) h = 10;
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x + w > image!.width) w = image!.width - x;
      if (y + h > image!.height) h = image!.height - y;
      setCrop({ x, y, w, h });
      setStartPos({ x: mx, y: my });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
    setResizeCorner(null);
    setStartPos(null);
  };

  // Download cropped image
  const handleDownload = () => {
    if (!previewRef.current) return;
    const url = previewRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cropped.png';
    a.click();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Image Cropper</h2>
      <input type="file" accept="image/*" onChange={handleFile} />
      <div className="flex flex-col md:flex-row gap-8">
        <div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Aspect Ratio</label>
            <select
              className="px-2 py-1 border rounded"
              value={aspect ?? ''}
              onChange={e => setAspect(e.target.value ? Number(e.target.value) : null)}
            >
              {aspectRatios.map(opt => (
                <option key={opt.label} value={opt.value ?? ''}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div
            style={{ position: 'relative', border: '1px solid #888', display: 'inline-block', background: '#fff' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas ref={canvasRef} style={{ maxWidth: 400, maxHeight: 400, cursor: dragging ? 'move' : resizing ? 'nwse-resize' : 'crosshair' }} />
          </div>
        </div>
        <div>
          <div className="mb-2 font-medium">Cropped Preview</div>
          <canvas ref={previewRef} style={{ maxWidth: 300, maxHeight: 300, border: '1px solid #ccc', background: '#fff' }} />
          <div className="mt-2">
            <button onClick={handleDownload} className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-dark">Download Cropped Image</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper; 