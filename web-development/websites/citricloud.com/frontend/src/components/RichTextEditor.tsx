import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline, List as ListIcon, ListOrdered, Link as LinkIcon, Heading as HeadingIcon, Eraser } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  compact?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Type here...',
  className = '',
  minHeight = '100px',
  compact = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('14');
  const [textColor, setTextColor] = useState('#000000');
  const [showHeadings, setShowHeadings] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [pendingLinkRange, setPendingLinkRange] = useState<Range | null>(null);

  // Track dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Sync text color with theme
  useEffect(() => {
    setTextColor(isDarkMode ? '#ffffff' : '#000000');
  }, [isDarkMode]);

  // Set initial content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const applyFormatting = (tag: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    
    let wrapperTag = '';
    switch (tag) {
      case 'bold': wrapperTag = 'strong'; break;
      case 'italic': wrapperTag = 'em'; break;
      case 'underline': wrapperTag = 'u'; break;
      default: return;
    }
    
    if (selection.isCollapsed) {
      const el = document.createElement(wrapperTag);
      const zwsp = document.createTextNode('\u200B');
      el.appendChild(zwsp);
      range.insertNode(el);
      const newRange = document.createRange();
      newRange.setStart(el.firstChild as Text, 1);
      newRange.setEnd(el.firstChild as Text, 1);
      selection.removeAllRanges();
      selection.addRange(newRange);
      onChange(editor.innerHTML);
      return;
    }
    
    const selectedText = range.toString();
    const el = document.createElement(wrapperTag);
    el.textContent = selectedText;
    range.deleteContents();
    range.insertNode(el);
    range.setStartAfter(el);
    range.setEndAfter(el);
    selection.removeAllRanges();
    selection.addRange(range);
    onChange(editor.innerHTML);
  };

  const applyList = (type: 'ul' | 'ol') => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    
    const listEl = document.createElement(type);
    
    if (selection.isCollapsed) {
      const li = document.createElement('li');
      li.textContent = '\u200B';
      listEl.appendChild(li);
      range.insertNode(listEl);
      const newRange = document.createRange();
      newRange.setStart(li.firstChild as Text, 1);
      newRange.setEnd(li.firstChild as Text, 1);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      const selectedText = range.toString();
      const lines = selectedText.split(/\n+/).map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        const li = document.createElement('li');
        li.textContent = '\u200B';
        listEl.appendChild(li);
      } else {
        lines.forEach(line => {
          const li = document.createElement('li');
          li.textContent = line;
          listEl.appendChild(li);
        });
      }
      range.deleteContents();
      range.insertNode(listEl);
      range.setStartAfter(listEl);
      range.setEndAfter(listEl);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    onChange(editor.innerHTML);
  };

  const applyLink = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0).cloneRange();
    if (!editor.contains(range.commonAncestorContainer)) return;
    
    setPendingLinkRange(range);
    if (!selection.isCollapsed) {
      setLinkText(range.toString());
    }
    setShowLinkDialog(true);
  };

  const insertLink = () => {
    if (!pendingLinkRange || !linkUrl) return;
    const editor = editorRef.current;
    if (!editor) return;
    
    const selection = window.getSelection();
    if (!selection) return;
    
    selection.removeAllRanges();
    selection.addRange(pendingLinkRange);
    
    const a = document.createElement('a');
    a.href = linkUrl;
    a.textContent = linkText || linkUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    
    pendingLinkRange.deleteContents();
    pendingLinkRange.insertNode(a);
    
    const newRange = document.createRange();
    newRange.setStartAfter(a);
    newRange.setEndAfter(a);
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    onChange(editor.innerHTML);
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
    setPendingLinkRange(null);
  };

  const applyHeading = (level: 'h1' | 'h2' | 'h3' | 'p') => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    
    const el = document.createElement(level);
    if (selection.isCollapsed) {
      el.textContent = '\u200B';
      range.insertNode(el);
      const newRange = document.createRange();
      newRange.setStart(el.firstChild as Text, 1);
      newRange.setEnd(el.firstChild as Text, 1);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      el.textContent = range.toString();
      range.deleteContents();
      range.insertNode(el);
      range.setStartAfter(el);
      range.setEndAfter(el);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    onChange(editor.innerHTML);
  };

  const clearFormatting = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    
    if (selection.isCollapsed) return;
    
    const plainText = range.toString();
    range.deleteContents();
    const textNode = document.createTextNode(plainText);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
    onChange(editor.innerHTML);
  };

  const toolbarButtonClass = compact
    ? "p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
    : "p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400";

  const iconSize = compact ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className={`flex items-center gap-1 px-2 ${compact ? 'py-1' : 'py-2'} border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-x-auto`}>
        <button 
          type="button" 
          onMouseDown={(e) => { e.preventDefault(); applyFormatting('bold'); }}
          className={toolbarButtonClass}
          title="Bold"
        >
          <Bold className={iconSize} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => { e.preventDefault(); applyFormatting('italic'); }}
          className={toolbarButtonClass}
          title="Italic"
        >
          <Italic className={iconSize} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => { e.preventDefault(); applyFormatting('underline'); }}
          className={toolbarButtonClass}
          title="Underline"
        >
          <Underline className={iconSize} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); applyList('ul'); }}
          className={toolbarButtonClass}
          title="Bullet list"
        >
          <ListIcon className={iconSize} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); applyList('ol'); }}
          className={toolbarButtonClass}
          title="Numbered list"
        >
          <ListOrdered className={iconSize} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); applyLink(); }}
          className={`${toolbarButtonClass} text-blue-600 dark:text-blue-400`}
          title="Insert link"
        >
          <LinkIcon className={iconSize} />
        </button>
        <div 
          className="relative heading-dropdown"
          onMouseEnter={() => setShowHeadings(true)}
          onMouseLeave={() => setShowHeadings(false)}
        >
          <button
            type="button"
            className={toolbarButtonClass}
            title="Heading"
          >
            <HeadingIcon className={iconSize} />
          </button>
          {showHeadings && (
            <div className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-1 flex flex-col min-w-[90px]">
              {['h1','h2','h3','p'].map(h => (
                <button
                  key={h}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); applyHeading(h as 'h1'|'h2'|'h3'|'p'); }}
                  className="text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                >
                  {h.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); clearFormatting(); }}
          className={`${toolbarButtonClass} text-red-600 dark:text-red-400`}
          title="Clear formatting"
        >
          <Eraser className={iconSize} />
        </button>
        {!compact && (
          <>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <select 
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="px-2 py-1 text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300" 
              title="Font size"
            >
              <option value="12">12</option>
              <option value="14">14</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="20">20</option>
              <option value="24">24</option>
            </select>
            <input 
              type="color" 
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-8 h-6 border border-gray-300 dark:border-gray-600 rounded cursor-pointer" 
              title="Text color" 
            />
          </>
        )}
      </div>

      {/* Editor */}
      <style>{`
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5em 0;
          padding-left: 2em;
        }
        [contenteditable] ul {
          list-style-type: disc;
        }
        [contenteditable] ol {
          list-style-type: decimal;
        }
        [contenteditable] li {
          margin: 0.25em 0;
        }
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] p {
          margin: 0.5em 0;
        }
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        [contenteditable] strong {
          font-weight: bold;
        }
        [contenteditable] em {
          font-style: italic;
        }
        [contenteditable] u {
          text-decoration: underline;
        }
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
      <div
        ref={editorRef}
        contentEditable
        data-placeholder={placeholder}
        className={`w-full p-3 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white`}
        style={{ minHeight, fontSize: `${fontSize}px`, color: textColor }}
        onInput={(e) => onChange((e.currentTarget as HTMLDivElement).innerHTML)}
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowLinkDialog(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link Text (optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Click here"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => { setShowLinkDialog(false); setLinkUrl(''); setLinkText(''); setPendingLinkRange(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                disabled={!linkUrl}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
