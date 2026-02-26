import { useEffect, useRef, useState, useCallback } from 'react';
import { Undo, Redo, Save, Pencil, Paintbrush, Eraser } from 'lucide-react';

interface PixelArtEditorProps {
  imageData: Uint8Array;
  onSave: (data: Uint8Array) => void;
  fileName: string;
}

type Tool = 'pencil' | 'brush' | 'eraser';

export default function PixelArtEditor({ imageData, onSave, fileName }: PixelArtEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [tool, setTool] = useState<Tool>('pencil');
  const [brushSize, setBrushSize] = useState(1);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [resolution, setResolution] = useState(16);
  const [zoom, setZoom] = useState(16);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    setCtx(context);

    const img = new Image();
    const blob = new Blob([imageData], { type: 'image/png' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      setResolution(img.width);
      context.imageSmoothingEnabled = false;
      context.drawImage(img, 0, 0);

      const initialState = context.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialState]);
      setHistoryIndex(0);

      URL.revokeObjectURL(url);
    };

    img.src = url;
  }, [imageData, fileName]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  const saveToHistory = useCallback(() => {
    if (!ctx || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);

    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }

    setHistory(newHistory);
    setHasChanges(true);
  }, [ctx, history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (!ctx || !canvasRef.current || historyIndex <= 0) return;

    const canvas = canvasRef.current;
    const prevIndex = historyIndex - 1;
    ctx.putImageData(history[prevIndex], 0, 0);
    setHistoryIndex(prevIndex);
    setHasChanges(true);
  }, [ctx, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (!ctx || !canvasRef.current || historyIndex >= history.length - 1) return;

    const canvas = canvasRef.current;
    const nextIndex = historyIndex + 1;
    ctx.putImageData(history[nextIndex], 0, 0);
    setHistoryIndex(nextIndex);
    setHasChanges(true);
  }, [ctx, history, historyIndex]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    return { x, y };
  };

  const drawPixel = (x: number, y: number) => {
    if (!ctx || !canvasRef.current) return;

    const canvas = canvasRef.current;

    if (tool === 'eraser') {
      ctx.clearRect(x - Math.floor(brushSize / 2), y - Math.floor(brushSize / 2), brushSize, brushSize);
    } else {
      ctx.fillStyle = currentColor;
      if (tool === 'pencil') {
        ctx.fillRect(x, y, 1, 1);
      } else if (tool === 'brush') {
        ctx.fillRect(x - Math.floor(brushSize / 2), y - Math.floor(brushSize / 2), brushSize, brushSize);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    setIsDrawing(true);
    drawPixel(coords.x, coords.y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const coords = getCanvasCoords(e);
    if (!coords) return;

    drawPixel(coords.x, coords.y);
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const handleResolutionChange = (newResolution: number) => {
    if (!ctx || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.putImageData(currentImageData, 0, 0);

    canvas.width = newResolution;
    canvas.height = newResolution;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, newResolution, newResolution);

    setResolution(newResolution);
    saveToHistory();
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      if (!blob) return;

      blob.arrayBuffer().then((buffer) => {
        onSave(new Uint8Array(buffer));
        setHasChanges(false);
      });
    }, 'image/png');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{fileName}</span>
          {hasChanges && <span className="text-xs text-yellow-500">Unsaved changes</span>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo size={18} />
          </button>

          <div className="w-px h-6 bg-gray-600 mx-2" />

          <button
            onClick={() => setTool('pencil')}
            className={`p-2 rounded ${tool === 'pencil' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            title="Pencil"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => setTool('brush')}
            className={`p-2 rounded ${tool === 'brush' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            title="Brush"
          >
            <Paintbrush size={18} />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded ${tool === 'eraser' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            title="Eraser"
          >
            <Eraser size={18} />
          </button>

          {tool !== 'pencil' && (
            <>
              <span className="text-sm text-gray-400">Size:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm">{brushSize}</span>
            </>
          )}

          <div className="w-px h-6 bg-gray-600 mx-2" />

          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
            title="Color Picker"
          />

          <div className="w-px h-6 bg-gray-600 mx-2" />

          <select
            value={resolution}
            onChange={(e) => handleResolutionChange(Number(e.target.value))}
            className="bg-gray-700 rounded px-2 py-1 text-sm"
            title="Canvas Resolution"
          >
            <option value={16}>16x16</option>
            <option value={32}>32x32</option>
            <option value={64}>64x64</option>
            <option value={128}>128x128</option>
          </select>

          <select
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="bg-gray-700 rounded px-2 py-1 text-sm"
            title="Zoom"
          >
            <option value={8}>800%</option>
            <option value={16}>1600%</option>
            <option value={24}>2400%</option>
            <option value={32}>3200%</option>
          </select>

          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-900 p-8 flex items-center justify-center">
        <div className="relative" style={{
          backgroundImage: 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px',
        }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-crosshair border-2 border-gray-700"
            style={{
              width: `${resolution * zoom}px`,
              height: `${resolution * zoom}px`,
              imageRendering: 'pixelated',
            }}
          />
        </div>
      </div>
    </div>
  );
}
