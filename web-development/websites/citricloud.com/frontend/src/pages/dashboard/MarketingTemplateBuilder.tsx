import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { motion } from 'framer-motion';
import {
  FiType,
  FiImage,
  FiLayout,
  FiColumns,
  FiCode,
  FiEye,
  FiSave,
  FiDownload,
  FiTrash2,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
  FiCopy,
  FiMail,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
} from 'react-icons/fi';

interface EmailBlock {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider' | 'columns' | 'spacer';
  content: any;
  styles: {
    padding?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontSize?: string;
    color?: string;
    fontWeight?: string;
  };
}

export default function MarketingTemplateBuilder() {
  const [blocks, setBlocks] = useState<EmailBlock[]>([
    {
      id: '1',
      type: 'text',
      content: 'Welcome to our newsletter!',
      styles: {
        padding: '20px',
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333333',
      },
    },
  ]);
  
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>('1');
  const [previewMode, setPreviewMode] = useState(false);
  const [templateName, setTemplateName] = useState('Untitled Template');

  const addBlock = (type: EmailBlock['type']) => {
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      styles: {
        padding: '15px',
        backgroundColor: '#ffffff',
        textAlign: 'left',
      },
    };
    
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const getDefaultContent = (type: EmailBlock['type']) => {
    switch (type) {
      case 'text':
        return 'Edit this text...';
      case 'image':
        return { src: 'https://via.placeholder.com/600x200', alt: 'Image' };
      case 'button':
        return { text: 'Click here', url: '#' };
      case 'divider':
        return {};
      case 'columns':
        return { columns: 2 };
      case 'spacer':
        return { height: '20px' };
      default:
        return '';
    }
  };

  const updateBlock = (id: string, updates: Partial<EmailBlock>) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(block => block.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const duplicateBlock = (id: string) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      const newBlock = {
        ...block,
        id: Date.now().toString(),
      };
      const index = blocks.findIndex(b => b.id === id);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);
    }
  };

  const renderBlock = (block: EmailBlock) => {
    const commonStyles = {
      padding: block.styles.padding,
      backgroundColor: block.styles.backgroundColor,
      textAlign: block.styles.textAlign,
    };

    switch (block.type) {
      case 'text':
        return (
          <div
            style={{
              ...commonStyles,
              fontSize: block.styles.fontSize,
              color: block.styles.color,
              fontWeight: block.styles.fontWeight,
            }}
          >
            {block.content}
          </div>
        );
      case 'image':
        return (
          <div style={commonStyles}>
            <img
              src={block.content.src}
              alt={block.content.alt}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        );
      case 'button':
        return (
          <div style={{ ...commonStyles }}>
            <a
              href={block.content.url}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '500',
              }}
            >
              {block.content.text}
            </a>
          </div>
        );
      case 'divider':
        return (
          <div style={commonStyles}>
            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />
          </div>
        );
      case 'spacer':
        return (
          <div style={{ height: block.content.height }} />
        );
      default:
        return null;
    }
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  const blockIcons = {
    text: <FiType />,
    image: <FiImage />,
    button: <FiMail />,
    divider: <FiLayout />,
    columns: <FiColumns />,
    spacer: <FiLayout />,
  };

  return (
    <DashboardLayout
      title="Marketing Template Builder"
      breadcrumb={<div className="text-xs text-gray-500">CRM / Marketing / Template Builder</div>}
    >
      <div className="h-[calc(100vh-140px)] flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2 dark:text-white transition-all"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
                previewMode
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/20'
                  : 'bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              <FiEye />
              <span>Preview</span>
            </button>
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium shadow-sm border border-gray-200 dark:border-gray-600">
              <FiSave />
              <span>Save</span>
            </button>
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-lg shadow-blue-500/30">
              <FiDownload />
              <span>Export HTML</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Block Library */}
          {!previewMode && (
            <div className="w-64 bg-white dark:bg-gray-800/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700/50 overflow-y-auto">
              <div className="p-5">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wider">
                  Content Blocks
                </h3>
                <div className="space-y-2">
                  {[
                    { type: 'text', label: 'Text', icon: <FiType /> },
                    { type: 'image', label: 'Image', icon: <FiImage /> },
                    { type: 'button', label: 'Button', icon: <FiMail /> },
                    { type: 'divider', label: 'Divider', icon: <FiLayout /> },
                    { type: 'spacer', label: 'Spacer', icon: <FiLayout /> },
                    { type: 'columns', label: 'Columns', icon: <FiColumns /> },
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => addBlock(item.type as EmailBlock['type'])}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/60 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all text-left border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30 shadow-sm hover:shadow"
                    >
                      <span className="text-gray-600 dark:text-gray-300">{item.icon}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Template Blocks
                  </h3>
                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="p-2 rounded bg-gray-50 dark:bg-gray-700">
                      <p>Drag and drop blocks to build your email template</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Center - Canvas */}
          <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800/95 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/50"
              >
                {/* Email Preview Header */}
                <div className="bg-gray-50 dark:bg-gray-700/60 px-4 py-3 border-b border-gray-200 dark:border-gray-600/50 text-xs font-medium text-gray-600 dark:text-gray-300">
                  Email Preview (600px width)
                </div>

                {/* Email Body */}
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                  {blocks.map((block, index) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative group"
                    >
                      {!previewMode && (
                        <div className="absolute -left-12 top-0 opacity-0 group-hover:opacity-100 transition-all flex flex-col space-y-2">
                          <button
                            onClick={() => moveBlock(block.id, 'up')}
                            disabled={index === 0}
                            className="p-2 bg-white dark:bg-gray-700/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-30 border border-gray-200 dark:border-gray-600 transition-all"
                          >
                            <FiChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                          <button
                            onClick={() => moveBlock(block.id, 'down')}
                            disabled={index === blocks.length - 1}
                            className="p-2 bg-white dark:bg-gray-700/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-30 border border-gray-200 dark:border-gray-600 transition-all"
                          >
                            <FiChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                        </div>
                      )}

                      <div
                        onClick={() => !previewMode && setSelectedBlockId(block.id)}
                        className={`cursor-pointer transition-all rounded-lg ${
                          selectedBlockId === block.id && !previewMode
                            ? 'ring-2 ring-blue-500 ring-inset shadow-lg shadow-blue-500/20'
                            : ''
                        }`}
                      >
                        {renderBlock(block)}
                      </div>

                      {!previewMode && selectedBlockId === block.id && (
                        <div className="absolute -right-12 top-0 flex flex-col space-y-2">
                          <button
                            onClick={() => duplicateBlock(block.id)}
                            className="p-2 bg-white dark:bg-gray-700/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-600 transition-all"
                            title="Duplicate"
                          >
                            <FiCopy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                          <button
                            onClick={() => deleteBlock(block.id)}
                            className="p-2 bg-white dark:bg-gray-700/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-red-50 dark:hover:bg-red-900/30 border border-gray-200 dark:border-gray-600 transition-all"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Add Block Button */}
                  {!previewMode && (
                    <div className="p-6 text-center">
                      <button
                        onClick={() => addBlock('text')}
                        className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-medium"
                      >
                        <FiPlus className="w-5 h-5" />
                        <span>Add Block</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Sidebar - Properties */}
          {!previewMode && selectedBlock && (
            <div className="w-80 bg-white dark:bg-gray-800/95 backdrop-blur-sm border-l border-gray-200 dark:border-gray-700/50 overflow-y-auto">
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                    Block Settings
                  </h3>
                  <span className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/60 px-3 py-1.5 rounded-lg">
                    {blockIcons[selectedBlock.type]}
                    <span className="capitalize">{selectedBlock.type}</span>
                  </span>
                </div>

                {/* Content Settings */}
                <div className="space-y-4">
                  {selectedBlock.type === 'text' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                          Text Content
                        </label>
                        <textarea
                          value={selectedBlock.content}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, { content: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700/60 dark:text-white text-sm transition-all"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                          Font Size
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.styles.fontSize || '16px'}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              styles: { ...selectedBlock.styles, fontSize: e.target.value },
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700/60 dark:text-white text-sm transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                          Text Color
                        </label>
                        <input
                          type="color"
                          value={selectedBlock.styles.color || '#333333'}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              styles: { ...selectedBlock.styles, color: e.target.value },
                            })
                          }
                          className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {selectedBlock.type === 'image' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content.src}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, src: e.target.value },
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700/60 dark:text-white text-sm transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                          Alt Text
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content.alt}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, alt: e.target.value },
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700/60 dark:text-white text-sm transition-all"
                        />
                      </div>
                    </>
                  )}

                  {selectedBlock.type === 'button' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content.text}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, text: e.target.value },
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700/60 dark:text-white text-sm transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                          Link URL
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content.url}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, url: e.target.value },
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700/60 dark:text-white text-sm transition-all"
                        />
                      </div>
                    </>
                  )}

                  {selectedBlock.type === 'spacer' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                        Height
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.height || '20px'}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, height: e.target.value },
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700/60 dark:text-white text-sm transition-all"
                      />
                    </div>
                  )}

                  {/* Common Style Settings */}
                  <div className="pt-5 mt-5 border-t border-gray-200 dark:border-gray-700/50">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wider">
                      Layout
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                          Alignment
                        </label>
                        <div className="flex space-x-2">
                          {['left', 'center', 'right'].map((align) => (
                            <button
                              key={align}
                              onClick={() =>
                                updateBlock(selectedBlock.id, {
                                  styles: {
                                    ...selectedBlock.styles,
                                    textAlign: align as 'left' | 'center' | 'right',
                                  },
                                })
                              }
                              className={`flex-1 p-2.5 border rounded-xl transition-all ${
                                selectedBlock.styles.textAlign === align
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 shadow-sm'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                              }`}
                            >
                              {align === 'left' && <FiAlignLeft className="w-4 h-4 mx-auto" />}
                              {align === 'center' && <FiAlignCenter className="w-4 h-4 mx-auto" />}
                              {align === 'right' && <FiAlignRight className="w-4 h-4 mx-auto" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                          Padding
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.styles.padding || '15px'}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              styles: { ...selectedBlock.styles, padding: e.target.value },
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700/60 dark:text-white text-sm transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                          Background Color
                        </label>
                        <input
                          type="color"
                          value={selectedBlock.styles.backgroundColor || '#ffffff'}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              styles: {
                                ...selectedBlock.styles,
                                backgroundColor: e.target.value,
                              },
                            })
                          }
                          className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
