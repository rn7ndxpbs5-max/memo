import React, { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, PenTool, Eraser, Download } from 'lucide-react';

interface ScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const ScratchpadModal: React.FC<ScratchpadModalProps> = ({
  isOpen,
  onClose,
  title = 'مسودة الحسابات والحلول السريعة لدكتورة منة (EST Scratchpad) 🩺🌸',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#E91E63'); // rose default
  const [lineWidth, setLineWidth] = useState(3);
  const [mode, setMode] = useState<'pen' | 'eraser'>('pen');

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Background grid
      drawGrid(ctx, rect.width, rect.height);
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#FEE6ED';
    ctx.lineWidth = 1;

    const step = 28;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth;

    if (mode === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = lineWidth * 4;
    } else {
      ctx.strokeStyle = color;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    drawGrid(ctx, rect.width, rect.height);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `menna-dr-memo-scratchpad-${Date.now()}.png`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-pink-950/30 backdrop-blur-xs">
      <div className="white-card border border-pink-200 rounded-3xl w-full max-w-4xl h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-3 border-b border-pink-100 flex items-center justify-between bg-pink-50/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
            <h3 className="font-bold text-pink-800 text-sm sm:text-base">{title}</h3>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="p-1.5 text-pink-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors text-xs flex items-center gap-1 cursor-pointer border border-pink-200/60"
              title="مسح اللوحة"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">مسح الكل</span>
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 text-pink-600 hover:text-pink-800 hover:bg-pink-100 rounded-xl transition-colors text-xs flex items-center gap-1 cursor-pointer border border-pink-200/60"
              title="تنزيل المسودة كصورة"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">حفظ</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-pink-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-2.5 bg-white border-b border-pink-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('pen')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                mode === 'pen'
                  ? 'bg-[var(--primary-rose)] text-white shadow-xs'
                  : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>قلم</span>
            </button>
            <button
              onClick={() => setMode('eraser')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                mode === 'eraser'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>ممحاة</span>
            </button>
          </div>

          {/* Color palette */}
          <div className="flex items-center gap-1.5">
            {['#E91E63', '#C2185B', '#9C27B0', '#2563EB', '#059669', '#D97706', '#1E293B'].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setMode('pen');
                }}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer border border-pink-200 ${
                  color === c && mode === 'pen' ? 'scale-125 ring-2 ring-[var(--primary-rose)] ring-offset-2 ring-offset-white' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Thickness */}
          <div className="flex items-center gap-2 text-pink-700 font-bold">
            <span>السمك:</span>
            {[2, 4, 7].map((w) => (
              <button
                key={w}
                onClick={() => setLineWidth(w)}
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold cursor-pointer transition-colors ${
                  lineWidth === w
                    ? 'bg-[var(--primary-rose)] text-white shadow-xs'
                    : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                }`}
              >
                {w === 2 ? 'رقيق' : w === 4 ? 'وسط' : 'عريض'}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative cursor-crosshair overflow-hidden touch-none bg-white">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full block"
          />
        </div>
      </div>
    </div>
  );
};
