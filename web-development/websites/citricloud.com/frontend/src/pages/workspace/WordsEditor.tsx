import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiGrid, FiSave, FiShare2, FiSettings, FiMessageSquare, FiUser, FiChevronDown, FiRotateCcw, FiRotateCw, FiCopy, FiScissors, FiClipboard, FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify, FiList, FiMoreHorizontal, FiBold, FiItalic, FiUnderline, FiArrowLeft } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

export default function WordsEditor() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [docName, setDocName] = useState('Unnamed001');
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
  };

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        localStorage.setItem(`doc_${docName}`, JSON.stringify({
          name: docName,
          content,
          lastModified: new Date().toISOString(),
          owner: user?.email?.split('@')[0] || 'User'
        }));
        setLastSaved(new Date());
      }
    }, 3000); // Auto-save every 3 seconds

    return () => clearInterval(autoSave);
  }, [docName, user]);

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAppMenu(!showAppMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <FiGrid className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Word</span>
            </div>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="text-sm bg-transparent border-none focus:outline-none text-gray-900 dark:text-white w-32"
            />
            <FiSave className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Saved {lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for tools, Help and more (Alt+Q)"
                className="w-96 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border-none rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <FiSettings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">{user?.email?.split('@')[0] || 'User'}</span>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <FiUser className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button 
              onClick={() => navigate('/workspace/words')}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Go back to Workspace"
            >
              <FiArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Workspace</span>
            </button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="flex items-center gap-1 px-4 pb-1 text-sm">
          <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300">File</button>
          <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">Home</button>
          <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300">Insert</button>
          <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300">Layout</button>
          <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300">References</button>
          <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300">Review</button>
          <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300">View</button>
          <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300">Help</button>
          <div className="flex-1"></div>
          <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <FiMessageSquare className="w-4 h-4" /> Comments
          </button>
          <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <FiShare2 className="w-4 h-4" /> Get Link
          </button>
          <button className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1">
            <FiShare2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Ribbon Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center gap-1">
          {/* Clipboard Group */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
            <button onClick={() => document.execCommand('undo')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Undo">
              <FiRotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button onClick={() => document.execCommand('redo')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Redo">
              <FiRotateCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Copy">
              <FiCopy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Cut">
              <FiScissors className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Paste">
              <FiClipboard className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Font Group */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-300 dark:border-gray-600">
            <select className="px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300">
              <option>Aptos (Body)</option>
              <option>Arial</option>
              <option>Times New Roman</option>
            </select>
            <select className="px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 w-16">
              <option>12</option>
              <option>10</option>
              <option>14</option>
              <option>16</option>
            </select>
            <button onClick={() => exec('bold')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Bold">
              <FiBold className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button onClick={() => exec('italic')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Italic">
              <FiItalic className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button onClick={() => exec('underline')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Underline">
              <FiUnderline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Paragraph Group */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-300 dark:border-gray-600">
            <button onClick={() => exec('insertUnorderedList')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Bullets">
              <FiList className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button onClick={() => exec('insertOrderedList')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Numbering">
              <FiList className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button onClick={() => exec('justifyLeft')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Align Left">
              <FiAlignLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button onClick={() => exec('justifyCenter')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Center">
              <FiAlignCenter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button onClick={() => exec('justifyRight')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Align Right">
              <FiAlignRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button onClick={() => exec('justifyFull')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Justify">
              <FiAlignJustify className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Style Group */}
          <div className="flex items-center gap-1 px-2">
            <select 
              onChange={(e) => exec('formatBlock', e.target.value)} 
              className="px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300"
            >
              <option value="p">Normal</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">No Spacing</span>
            <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
              Heading 1 <FiChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1"></div>

          {/* Right side actions */}
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <FiMoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-[816px] mx-auto bg-white dark:bg-gray-800 shadow-lg min-h-[1056px]">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="px-24 py-20 text-gray-900 dark:text-white focus:outline-none"
            style={{ 
              lineHeight: '1.5',
              fontSize: '12pt',
              fontFamily: 'Aptos, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            <p><br /></p>
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>Page 1 of 1</span>
            <span>0 words</span>
            <span>English (United States)</span>
            <span>Text predictions: On</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <span>📄</span>
            </button>
            <input type="range" min="50" max="200" defaultValue="100" className="w-32" />
            <span>60%</span>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">➕</button>
            <span>📌 Customize</span>
            <span>Give feedback to CITRICLOUD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
