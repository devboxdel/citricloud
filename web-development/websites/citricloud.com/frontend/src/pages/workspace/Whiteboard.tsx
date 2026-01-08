import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit3, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import BrandLogo from '../../components/BrandLogo';
import { workspaceAPI } from '../../lib/workspaceApi';

type Point = { x: number; y: number };
type Line = { points: Point[] };

export default function WhiteboardApp() {
  const navigate = useNavigate();
  const [lines, setLines] = useState<Line[]>([]);
  const [drawing, setDrawing] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [storeItemId, setStoreItemId] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Track dark mode
  useEffect(() => {
    const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Load lines from backend
  useEffect(() => {
    workspaceAPI.getItems('whiteboard', 'lines').then(res => {
      const items = res.data || [];
      if (items.length > 0) {
        const item = items[0];
        setStoreItemId(item.id);
        const data = item.data || {};
        if (Array.isArray(data.lines)) setLines(data.lines);
      }
    }).catch(() => {});
  }, []);

  // Save lines to backend
  useEffect(() => {
    const payload = { lines };
    if (storeItemId) {
      workspaceAPI.updateItem(storeItemId, payload).catch(() => {});
    } else if (lines.length > 0) {
      workspaceAPI.createOrUpdateItem({ app_name: 'whiteboard', item_key: 'lines', data: payload })
        .then(res => setStoreItemId(res.data.id))
        .catch(() => {});
    }
  }, [lines, storeItemId]);

  const getRelativePoint = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.MouseEvent) => {
    setDrawing(true);
    const pt = getRelativePoint(e);
    setLines(prev => [...prev, { points: [pt] }]);
  };
  const handlePointerMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const pt = getRelativePoint(e);
    setLines(prev => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      const updated = { ...last, points: [...last.points, pt] };
      return [...prev.slice(0, -1), updated];
    });
  };
  const handlePointerUp = () => {
    setDrawing(false);
  };
  const clearBoard = () => setLines([]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Header Bar */}
      <div className="bg-rose-500 text-white px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="flex items-center gap-2">
            <img src={isDarkMode ? "/darkmode-cc-logo.svg" : "/lightmode-cc-logo.svg"} alt="CITRICLOUD" className="h-12 w-auto" />
            <span className="text-white font-semibold text-sm">Whiteboard</span>
          </div>
          <div className="hidden lg:flex items-center text-sm text-white/90 px-3 py-1 bg-white/10 rounded">
            <FiEdit3 className="w-4 h-4 mr-1.5" />
            <span>{lines.length} strokes</span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={clearBoard} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-white/10 rounded transition-colors" title="Clear board">
            <FiTrash2 className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Clear</span>
          </button>
          <div className="hidden sm:block">
          </div>
          <button 
            onClick={() => navigate('/workspace')}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-white/10 rounded transition-colors"
            title="Go back to Workspace"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-5xl">
          <div className="flex flex-col items-center gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">Draw with your mouse or touch</div>
            <svg
              ref={svgRef}
              width={700}
              height={400}
              className="rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-crosshair touch-none shadow-sm"
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
            >
              {lines.map((line, i) => (
                <polyline
                  key={i}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={line.points.map(pt => `${pt.x},${pt.y}`).join(' ')}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
