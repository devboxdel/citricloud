import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSquare, FiCircle, FiType, FiArrowLeft } from 'react-icons/fi';
import BrandLogo from '../../components/BrandLogo';
import { workspaceAPI } from '../../lib/workspaceApi';

type ShapeType = 'rect' | 'ellipse' | 'text';
type Shape = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  w?: number;
  h?: number;
  text?: string;
};

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const SHAPE_SIZE = 80;

export default function VisioApp() {
  const navigate = useNavigate();
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [adding, setAdding] = useState<ShapeType | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [storeItemId, setStoreItemId] = useState<number | null>(null);

  // Load shapes from backend
  useEffect(() => {
    workspaceAPI.getItems('visio', 'shapes').then(res => {
      const items = res.data || [];
      if (items.length > 0) {
        const item = items[0];
        setStoreItemId(item.id);
        const data = item.data || {};
        if (Array.isArray(data.shapes)) setShapes(data.shapes);
      }
    }).catch(() => {});
  }, []);

  // Save shapes to backend
  useEffect(() => {
    const payload = { shapes };
    if (storeItemId) {
      workspaceAPI.updateItem(storeItemId, payload).catch(() => {});
    } else if (shapes.length > 0) {
      workspaceAPI.createOrUpdateItem({ app_name: 'visio', item_key: 'shapes', data: payload })
        .then(res => setStoreItemId(res.data.id))
        .catch(() => {});
    }
  }, [shapes, storeItemId]);

  const handleAddShape = (type: ShapeType) => {
    setAdding(type);
  };

  const handleSvgClick = (e: React.MouseEvent) => {
    if (!adding) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (adding === 'rect' || adding === 'ellipse') {
      setShapes(prev => [...prev, { id: uuid(), type: adding, x, y, w: SHAPE_SIZE, h: SHAPE_SIZE }]);
    } else if (adding === 'text') {
      const text = prompt('Enter text:') || '';
      if (text) setShapes(prev => [...prev, { id: uuid(), type: 'text', x, y, text }]);
    }
    setAdding(null);
  };

  const handleShapePointerDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const shape = shapes.find(s => s.id === id);
    if (!shape) return;
    setDragOffset({ x: e.clientX - rect.left - shape.x, y: e.clientY - rect.top - shape.y });
  };

  const handleSvgPointerMove = (e: React.MouseEvent) => {
    if (!selectedId || !dragOffset) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    setShapes(prev => prev.map(s => s.id === selectedId ? { ...s, x, y } : s));
  };

  const handleSvgPointerUp = () => {
    setSelectedId(null);
    setDragOffset(null);
  };

  const deleteShape = (id: string) => {
    setShapes(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Header Bar */}
      <div className="bg-violet-500 text-white px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="flex items-center gap-2">
            <BrandLogo size="small" showTagline={true} variant="light" />
            <span className="text-white font-semibold text-sm">Visio</span>
          </div>
          <div className="hidden lg:flex items-center text-sm text-white/90 px-3 py-1 bg-white/10 rounded">
            <FiSquare className="w-4 h-4 mr-1.5" />
            <span>{shapes.length} shapes</span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex gap-1">
            <button onClick={() => handleAddShape('rect')} className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 hover:bg-white/10 rounded transition-colors ${adding === 'rect' ? 'bg-white/20' : ''}`} title="Add Rectangle">
              <FiSquare className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Rect</span>
            </button>
            <button onClick={() => handleAddShape('ellipse')} className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 hover:bg-white/10 rounded transition-colors ${adding === 'ellipse' ? 'bg-white/20' : ''}`} title="Add Ellipse">
              <FiCircle className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Circle</span>
            </button>
            <button onClick={() => handleAddShape('text')} className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 hover:bg-white/10 rounded transition-colors ${adding === 'text' ? 'bg-white/20' : ''}`} title="Add Text">
              <FiType className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Text</span>
            </button>
          </div>
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
            <div className="text-sm text-gray-600 dark:text-gray-400">{adding ? `Click on canvas to place ${adding}` : 'Select a shape above, then click to place'}</div>
            <svg
              ref={svgRef}
              width={700}
              height={400}
              className="rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 touch-none shadow-sm"
              style={{ cursor: adding ? 'crosshair' : 'default' }}
              onClick={handleSvgClick}
              onMouseMove={handleSvgPointerMove}
              onMouseUp={handleSvgPointerUp}
              onMouseLeave={handleSvgPointerUp}
            >
              {shapes.map(shape => (
                shape.type === 'rect' ? (
                  <g key={shape.id}>
                    <rect
                      x={shape.x}
                      y={shape.y}
                      width={shape.w}
                      height={shape.h}
                      fill="#93c5fd"
                      stroke="#2563eb"
                      strokeWidth={selectedId === shape.id ? 4 : 2}
                      onMouseDown={e => handleShapePointerDown(e, shape.id)}
                      style={{ cursor: 'move' }}
                    />
                    <text
                      x={shape.x + (shape.w || SHAPE_SIZE) / 2}
                      y={shape.y + (shape.h || SHAPE_SIZE) / 2}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fill="#fff"
                      fontSize={18}
                      pointerEvents="none"
                    >
                      Rectangle
                    </text>
                    <g>
                      <rect x={shape.x + (shape.w || SHAPE_SIZE) - 18} y={shape.y - 10} width={18} height={18} rx={4} fill="#fff" stroke="#7c3aed" strokeWidth={1} onClick={() => deleteShape(shape.id)} style={{ cursor: 'pointer' }} />
                      <text x={shape.x + (shape.w || SHAPE_SIZE) - 9} y={shape.y + 3} textAnchor="middle" alignmentBaseline="middle" fontSize={14} fill="#7c3aed" style={{ pointerEvents: 'none' }}>×</text>
                    </g>
                  </g>
                ) : shape.type === 'ellipse' ? (
                  <g key={shape.id}>
                    <ellipse
                      cx={shape.x + (shape.w || SHAPE_SIZE) / 2}
                      cy={shape.y + (shape.h || SHAPE_SIZE) / 2}
                      rx={(shape.w || SHAPE_SIZE) / 2}
                      ry={(shape.h || SHAPE_SIZE) / 2}
                      fill="#bfdbfe"
                      stroke="#2563eb"
                      strokeWidth={selectedId === shape.id ? 4 : 2}
                      onMouseDown={e => handleShapePointerDown(e, shape.id)}
                      style={{ cursor: 'move' }}
                    />
                    <text
                      x={shape.x + (shape.w || SHAPE_SIZE) / 2}
                      y={shape.y + (shape.h || SHAPE_SIZE) / 2}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fill="#fff"
                      fontSize={18}
                      pointerEvents="none"
                    >
                      Ellipse
                    </text>
                    <g>
                      <rect x={shape.x + (shape.w || SHAPE_SIZE) - 18} y={shape.y - 10} width={18} height={18} rx={4} fill="#fff" stroke="#7c3aed" strokeWidth={1} onClick={() => deleteShape(shape.id)} style={{ cursor: 'pointer' }} />
                      <text x={shape.x + (shape.w || SHAPE_SIZE) - 9} y={shape.y + 3} textAnchor="middle" alignmentBaseline="middle" fontSize={14} fill="#7c3aed" style={{ pointerEvents: 'none' }}>×</text>
                    </g>
                  </g>
                ) : (
                  <g key={shape.id}>
                    <text
                      x={shape.x}
                      y={shape.y}
                      fill="#7c3aed"
                      fontSize={22}
                      fontWeight={selectedId === shape.id ? 700 : 500}
                      onMouseDown={e => handleShapePointerDown(e, shape.id)}
                      style={{ cursor: 'move', userSelect: 'none' }}
                    >
                      {shape.text}
                    </text>
                    <g>
                      <rect x={shape.x + 8} y={shape.y - 22} width={18} height={18} rx={4} fill="#fff" stroke="#7c3aed" strokeWidth={1} onClick={() => deleteShape(shape.id)} style={{ cursor: 'pointer' }} />
                      <text x={shape.x + 17} y={shape.y - 9} textAnchor="middle" alignmentBaseline="middle" fontSize={14} fill="#7c3aed" style={{ pointerEvents: 'none' }}>×</text>
                    </g>
                  </g>
                )
              ))}
            </svg>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Drag shapes to move. Click × to delete.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
