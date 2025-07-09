import React, { useRef, useState } from 'react';

type ImgObj = {
  id: number;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isDragging: boolean;
};

const ImageCollageMaker: React.FC = () => {
  const [images, setImages] = useState<ImgObj[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizingId, setResizingId] = useState<number | null>(null);
  const [resizeStart, setResizeStart] = useState<{ mouseX: number; mouseY: number; width: number; height: number; aspect: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle file upload
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          // Use original image size, or scale down proportionally if too large
          let width = img.width;
          let height = img.height;
          const maxDim = 800; // Optional: set a max dimension for very large images
          if (width > maxDim || height > maxDim) {
            const scale = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          setImages((prev) => [
            ...prev,
            {
              id: Date.now() + idx,
              src: reader.result as string,
              x: 20 + prev.length * 30,
              y: 20 + prev.length * 30,
              width,
              height,
              isDragging: false,
            },
          ]);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Draw all images on canvas
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    images.forEach((img) => {
      const image = new window.Image();
      image.src = img.src;
      ctx.drawImage(image, img.x, img.y, img.width, img.height);
      // Draw border if selected
      if (img.id === selectedId) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(img.x, img.y, img.width, img.height);
      }
    });
  };

  // Redraw on images or selection change
  React.useEffect(() => {
    drawCanvas();
    // eslint-disable-next-line
  }, [images, selectedId]);

  // Mouse events for drag
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    // Find topmost image under cursor
    for (let i = images.length - 1; i >= 0; i--) {
      const img = images[i];
      if (
        mouseX >= img.x &&
        mouseX <= img.x + img.width &&
        mouseY >= img.y &&
        mouseY <= img.y + img.height
      ) {
        setSelectedId(img.id);
        setDragOffset({ x: mouseX - img.x, y: mouseY - img.y });
        setImages((prev) =>
          prev.map((im) =>
            im.id === img.id ? { ...im, isDragging: true } : { ...im, isDragging: false }
          )
        );
        return;
      }
    }
    setSelectedId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const draggingImg = images.find((img) => img.isDragging);
    if (!draggingImg) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setImages((prev) =>
      prev.map((img) =>
        img.id === draggingImg.id
          ? {
              ...img,
              x: mouseX - dragOffset.x,
              y: mouseY - dragOffset.y,
            }
          : img
      )
    );
  };

  const handleMouseUp = () => {
    setImages((prev) => prev.map((img) => ({ ...img, isDragging: false })));
  };

  // Bring selected image to front
  const bringToFront = () => {
    if (selectedId == null) return;
    setImages((prev) => {
      const idx = prev.findIndex((img) => img.id === selectedId);
      if (idx === -1) return prev;
      const img = prev[idx];
      const newArr = prev.slice();
      newArr.splice(idx, 1);
      newArr.push(img);
      return newArr;
    });
  };

  // Download merged image
  const handleDownload = () => {
    const url = canvasRef.current?.toDataURL('image/png');
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged-image.png';
      a.click();
    }
  };

  // Remove selected image
  const removeSelected = () => {
    if (selectedId == null) return;
    setImages((prev) => prev.filter((img) => img.id !== selectedId));
    setSelectedId(null);
  };

  // Auto-size canvas to fit all images
  const autoSizeCanvas = () => {
    if (images.length === 0) return;
    // Find bounding box
    const minX = Math.min(...images.map(img => img.x));
    const minY = Math.min(...images.map(img => img.y));
    const maxX = Math.max(...images.map(img => img.x + img.width));
    const maxY = Math.max(...images.map(img => img.y + img.height));
    const newWidth = maxX - minX;
    const newHeight = maxY - minY;

    // Move images so top-left is (0,0)
    setImages(prev =>
      prev.map(img => ({
        ...img,
        x: img.x - minX,
        y: img.y - minY,
      }))
    );

    // Resize canvas and redraw after state update
    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.width = newWidth;
        canvasRef.current.height = newHeight;
        drawCanvas();
      }
    }, 0);
  };

  // Mouse events for resize
  const handleResizeMouseDown = (e: React.MouseEvent, imgId: number) => {
    e.stopPropagation();
    const img = images.find(i => i.id === imgId);
    if (!img) return;
    setResizingId(imgId);
    setResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: img.width,
      height: img.height,
      aspect: img.width / img.height,
    });
  };

  const handleResizeMouseMove = (e: React.MouseEvent) => {
    if (resizingId == null || !resizeStart) return;
    const dx = e.clientX - resizeStart.mouseX;
    const dy = e.clientY - resizeStart.mouseY;
    // Use the larger of dx or dy to scale proportionally
    let delta = Math.max(dx, dy);
    let newWidth = Math.max(10, resizeStart.width + delta);
    let newHeight = Math.max(10, newWidth / resizeStart.aspect);
    setImages(prev => prev.map(img =>
      img.id === resizingId ? { ...img, width: newWidth, height: newHeight } : img
    ));
  };

  const handleResizeMouseUp = () => {
    setResizingId(null);
    setResizeStart(null);
  };

  // Attach mousemove/mouseup listeners for resizing
  React.useEffect(() => {
    if (resizingId != null) {
      const move = (e: MouseEvent) => handleResizeMouseMove(e as any);
      const up = () => handleResizeMouseUp();
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      return () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
    }
  }, [resizingId, resizeStart]);

  return (
    <div className="space-y-4" style={{ position: 'relative' }}>
      <h2 className="text-xl font-bold">Image Collage Maker</h2>
      <input type="file" multiple accept="image/*" onChange={handleFiles} />
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          width={canvasRef.current ? canvasRef.current.width : 800}
          height={canvasRef.current ? canvasRef.current.height : 600}
          style={{ border: '1px solid #888', background: '#fff', cursor: resizingId ? 'nwse-resize' : 'move' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        {/* Resize handle overlay for selected image */}
        {(() => {
          const img = images.find(i => i.id === selectedId);
          if (!img) return null;
          const left = img.x + img.width - 8;
          const top = img.y + img.height - 8;
          return (
            <div
              style={{
                position: 'absolute',
                left,
                top,
                width: 16,
                height: 16,
                cursor: 'nwse-resize',
                zIndex: 10,
                background: '#fff',
                border: '2px solid #7c3aed',
                borderRadius: 4,
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                display: resizingId === img.id ? 'block' : 'block',
              }}
              onMouseDown={e => handleResizeMouseDown(e, img.id)}
              title="Resize image"
            >
              <svg width="12" height="12" style={{ display: 'block', margin: 2 }}><polyline points="0,12 12,0" stroke="#7c3aed" strokeWidth="2" fill="none" /></svg>
            </div>
          );
        })()}
      </div>
      <div className="flex gap-2">
        <button
          onClick={bringToFront}
          disabled={selectedId == null}
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Bring to Front
        </button>
        <button
          onClick={removeSelected}
          disabled={selectedId == null}
          className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
        >
          Remove Selected
        </button>
        <button
          onClick={handleDownload}
          disabled={images.length === 0}
          className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
        >
          Download Merged Image
        </button>
        <button
          onClick={autoSizeCanvas}
          disabled={images.length === 0}
          className="px-3 py-1 bg-purple-600 text-white rounded disabled:opacity-50"
        >
          Auto-size Canvas
        </button>
      </div>
      <div>
        <p>
          <b>Instructions:</b> Upload images, drag them on the canvas, select and bring to front or remove, then download your merged image.
        </p>
      </div>
    </div>
  );
};

export default ImageCollageMaker; 