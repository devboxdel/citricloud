import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiCopy, FiBarChart2, 
  FiEye, FiSend, FiMoreVertical, FiCalendar, FiSearch, FiFilter,
  FiCheckSquare, FiType, FiAlignLeft, FiToggleLeft, FiChevronDown,
  FiStar, FiArchive, FiShare2, FiDownload, FiAlertTriangle
} from 'react-icons/fi';
import { RichTextEditor } from '../../components/RichTextEditor';
import { useEffect } from 'react';
import { formsAPI } from '../../lib/formsApi';
import { createPortal } from 'react-dom';

type Form = {
  id: number;
  title: string;
  description: string;
  responses: number;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'active' | 'closed';
  is_starred: boolean;
  category: string;
  questions?: Question[];
};

type QuestionType = 'short-text' | 'long-text' | 'multiple-choice' | 'checkboxes' | 'dropdown' | 'rating' | 'date';

type Question = {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  required: boolean;
};

type FormTemplate = {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  questions: Question[];
};

let tempIdSeed = Date.now();
function nextId(): number {
  return tempIdSeed++;
}

export default function FormsApp() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'responses'>('list');
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'active' | 'closed'>('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFormMenu, setShowFormMenu] = useState<number | null>(null);
  
  const [forms, setForms] = useState<Form[]>([]);

  // Fetch forms from backend on mount
  useEffect(() => {
    formsAPI.getForms().then(res => setForms(res.data));
  }, []);

  // Load form data when editing
  useEffect(() => {
    if (currentView === 'edit' && selectedForm) {
      setFormTitle(selectedForm.title);
      setFormDescription(selectedForm.description || '');
      // Normalize questions and parse options if needed
      const normalized = (selectedForm.questions || []).map((q) => {
        let opts: string[] | undefined = undefined;
        if (q.options) {
          if (Array.isArray(q.options)) {
            opts = q.options as string[];
          } else if (typeof q.options === 'string') {
            try {
              const parsed = JSON.parse(q.options as unknown as string);
              if (Array.isArray(parsed)) opts = parsed;
            } catch {}
          }
        }
        return { ...q, options: opts };
      });
      setFormQuestions(normalized);
    }
  }, [currentView, selectedForm]);

  const [formQuestions, setFormQuestions] = useState<Question[]>([]);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  const templates: FormTemplate[] = [
    {
      id: 't1',
      name: 'Customer Feedback',
      description: 'Collect customer satisfaction and feedback',
      icon: FiBarChart2,
      category: 'Survey',
      questions: [
        { id: nextId(), type: 'rating', question: 'How satisfied are you with our service?', required: true },
        { id: nextId(), type: 'long-text', question: 'What can we improve?', required: false },
        { id: nextId(), type: 'multiple-choice', question: 'Would you recommend us?', options: ['Yes', 'No', 'Maybe'], required: true }
      ]
    },
    {
      id: 't2',
      name: 'Event Registration',
      description: 'Register attendees for events',
      icon: FiCalendar,
      category: 'Registration',
      questions: [
        { id: nextId(), type: 'short-text', question: 'Full Name', required: true },
        { id: nextId(), type: 'short-text', question: 'Email Address', required: true },
        { id: nextId(), type: 'checkboxes', question: 'Dietary Restrictions', options: ['Vegetarian', 'Vegan', 'Gluten-free', 'None'], required: false }
      ]
    },
    {
      id: 't3',
      name: 'Contact Form',
      description: 'Simple contact information form',
      icon: FiSend,
      category: 'Contact',
      questions: [
        { id: nextId(), type: 'short-text', question: 'Name', required: true },
        { id: nextId(), type: 'short-text', question: 'Email', required: true },
        { id: nextId(), type: 'long-text', question: 'Message', required: true }
      ]
    },
    {
      id: 't4',
      name: 'Job Application',
      description: 'Collect job applicant information',
      icon: FiCheckSquare,
      category: 'HR',
      questions: [
        { id: nextId(), type: 'short-text', question: 'Full Name', required: true },
        { id: nextId(), type: 'short-text', question: 'Email', required: true },
        { id: nextId(), type: 'short-text', question: 'Phone Number', required: true },
        { id: nextId(), type: 'long-text', question: 'Why do you want to join us?', required: true }
      ]
    }
  ];

  const questionTypes: { value: QuestionType; label: string; icon: any }[] = [
    { value: 'short-text', label: 'Short Text', icon: FiType },
    { value: 'long-text', label: 'Long Text', icon: FiAlignLeft },
    { value: 'multiple-choice', label: 'Multiple Choice', icon: FiToggleLeft },
    { value: 'checkboxes', label: 'Checkboxes', icon: FiCheckSquare },
    { value: 'dropdown', label: 'Dropdown', icon: FiChevronDown },
    { value: 'rating', label: 'Rating', icon: FiStar },
    { value: 'date', label: 'Date', icon: FiCalendar }
  ];

  const addQuestion = async (type: QuestionType) => {
    // In create mode, add locally; in edit mode, persist to API
    if (!selectedForm || currentView === 'create') {
      const newQuestion: Question = {
        id: nextId(),
        type,
        question: '',
        options: (type === 'multiple-choice' || type === 'checkboxes' || type === 'dropdown') ? ['Option 1'] : undefined,
        required: false,
      };
      setFormQuestions([...formQuestions, newQuestion]);
      return;
    }
    const res = await formsAPI.addQuestion(selectedForm.id, {
      type,
      question: '',
      options: (type === 'multiple-choice' || type === 'checkboxes' || type === 'dropdown') ? JSON.stringify(['Option 1']) : undefined,
      required: false,
      order: formQuestions.length
    });
    // Ensure options are parsed into array for UI
    const created = res.data;
    let opts: string[] | undefined = undefined;
    if (created.options) {
      try {
        const parsed = JSON.parse(created.options);
        if (Array.isArray(parsed)) opts = parsed;
      } catch {}
    }
    setFormQuestions([...formQuestions, { ...created, options: opts }]);
  };

  const updateQuestion = async (id: number, updates: Partial<Question>) => {
    const q = formQuestions.find(q => q.id === id);
    if (!q) return;
    // In create mode, update local state only
    if (!selectedForm || currentView === 'create') {
      setFormQuestions(formQuestions.map(item => item.id === id ? { ...item, ...updates } : item));
      return;
    }
    const res = await formsAPI.updateQuestion(selectedForm.id, id, {
      ...q,
      ...updates,
      options: updates.options ? JSON.stringify(updates.options) : q.options ? JSON.stringify(q.options) : undefined
    });
    const updated = res.data;
    let opts: string[] | undefined = undefined;
    if (updated.options) {
      try {
        const parsed = JSON.parse(updated.options);
        if (Array.isArray(parsed)) opts = parsed;
      } catch {}
    }
    setFormQuestions(formQuestions.map(item => item.id === id ? { ...updated, options: opts } : item));
  };

  const deleteQuestion = async (id: number) => {
    // In create mode, just remove locally
    if (!selectedForm || currentView === 'create') {
      setFormQuestions(formQuestions.filter(q => q.id !== id));
      return;
    }
    await formsAPI.deleteQuestion(selectedForm.id, id);
    setFormQuestions(formQuestions.filter(q => q.id !== id));
  };

  const addOption = (questionId: number) => {
    setFormQuestions(formQuestions.map(q => {
      if (q.id === questionId && q.options) {
        return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
      }
      return q;
    }));
  };

  const updateOption = (questionId: number, optionIndex: number, value: string) => {
    setFormQuestions(formQuestions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const deleteOption = (questionId: number, optionIndex: number) => {
    setFormQuestions(formQuestions.map(q => {
      if (q.id === questionId && q.options) {
        return { ...q, options: q.options.filter((_, i) => i !== optionIndex) };
      }
      return q;
    }));
  };

  const createForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormQuestions([]);
    setCurrentView('create');
  };

  const useTemplate = (template: FormTemplate) => {
    setFormTitle(template.name);
    setFormDescription(template.description);
    setFormQuestions(template.questions);
    setCurrentView('create');
    setShowTemplates(false);
  };

  const saveForm = async (publish: boolean = false) => {
    try {
      if (currentView === 'edit' && selectedForm) {
      // Update existing form
        const res = await formsAPI.updateForm(selectedForm.id, {
          title: formTitle || 'Untitled Form',
          description: formDescription,
          status: publish ? 'active' : selectedForm.status,
          is_starred: selectedForm.is_starred,
          category: selectedForm.category,
        });
        setForms(forms.map(f => f.id === selectedForm.id ? res.data : f));
      } else {
      // Create new form
        const res = await formsAPI.createForm({
          title: formTitle || 'Untitled Form',
          description: formDescription,
          status: publish ? 'active' : 'draft',
          is_starred: false,
          category: 'General',
          questions: formQuestions.map((q, idx) => ({
            type: q.type,
            question: q.question,
            options: q.options ? JSON.stringify(q.options) : undefined,
            required: q.required,
            order: idx
          }))
        });
        setForms([res.data, ...forms]);
        setSelectedForm(res.data);
      }
      setCurrentView('list');
      setSelectedForm(null);
    } catch (e: any) {
      const status = e?.response?.status;
      const detail = e?.response?.data?.detail || e?.message || 'Unknown error';
      console.error('Save form failed:', e);
      alert(`Failed to save form (${status || 'error'}): ${detail}`);
    }
  };

  const toggleStar = (id: number) => {
    setForms(forms.map(f => f.id === id ? { ...f, is_starred: !f.is_starred } : f));
  };

  const deleteForm = async (id: number) => {
    await formsAPI.deleteForm(id);
    setForms(forms.filter(f => f.id !== id));
    setShowFormMenu(null);
  };

  const duplicateForm = (form: Form) => {
    const duplicate: Form = {
      ...form,
      id: nextId(),
      title: `${form.title} (Copy)`,
      responses: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setForms([duplicate, ...forms]);
    setShowFormMenu(null);
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || form.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return 'Unknown';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return 'Unknown';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Header Bar */}
      <div className="bg-purple-600 text-white px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="flex items-center gap-2">
            <>
              <img src="/lightmode.svg?v=8" alt="CITRICLOUD Forms" className="h-3 sm:h-4 w-auto hidden" />
              <img src="/darkmode.svg?v=8" alt="CITRICLOUD Forms" className="h-3 sm:h-4 w-auto" />
            </>
            <span className="text-white font-semibold text-sm">Forms</span>
          </div>
          {currentView === 'list' && (
            <div className="relative flex-1 max-w-md hidden md:block">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 dark:text-white/70" />
              <input
                type="text"
                placeholder="Search forms"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 bg-purple-700 dark:bg-purple-800 text-white placeholder-white/70 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {currentView === 'list' && (
            <div className="hidden lg:flex items-center text-sm text-white/90 mr-2 px-3 py-1 bg-white/10 rounded">
              <FiCheckSquare className="w-4 h-4 mr-1.5" />
              <span>{forms.length} forms</span>
            </div>
          )}
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
      <div className="flex-1 overflow-y-auto">
        {currentView === 'list' && (
          <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={createForm}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  New Form
                </button>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Templates
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-2 sm:px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Templates Section */}
            {showTemplates && (
              <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Start with a template</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => useTemplate(template)}
                      className="text-left bg-white dark:bg-gray-800 rounded-lg p-3 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-purple-500"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                          <template.icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">{template.category}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{template.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Forms List */}
            {filteredForms.length === 0 ? (
              <div className="text-center py-16">
                <FiCheckSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {searchQuery ? 'No forms found matching your search' : 'No forms yet'}
                </p>
                <button
                  onClick={createForm}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Create your first form
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredForms.map((form) => (
                  <div
                    key={form.id}
                    className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                            {form.title}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {form.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => toggleStar(form.id)}
                            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              form.is_starred ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            <FiStar className={`w-4 h-4 ${form.is_starred ? 'fill-current' : ''}`} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setShowFormMenu(showFormMenu === form.id ? null : form.id)}
                              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                            >
                              <FiMoreVertical className="w-4 h-4" />
                            </button>
                            {showFormMenu === form.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                <button
                                  onClick={() => {
                                    setSelectedForm(form);
                                    setCurrentView('responses');
                                    setShowFormMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <FiBarChart2 className="w-4 h-4" />
                                  View Responses
                                </button>
                                <button
                                  onClick={() => duplicateForm(form)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <FiCopy className="w-4 h-4" />
                                  Duplicate
                                </button>
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <FiShare2 className="w-4 h-4" />
                                  Share
                                </button>
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <FiDownload className="w-4 h-4" />
                                  Export
                                </button>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                <button
                                  onClick={() => deleteForm(form.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiBarChart2 className="w-3 h-3" />
                          {form.responses} responses
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          form.status === 'active' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : form.status === 'draft'
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {form.status}
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Modified {formatDate(form.updated_at)}</span>
                          <button
                            onClick={() => {
                              setSelectedForm(form);
                              setCurrentView('edit');
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(currentView === 'create' || currentView === 'edit') && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Form Title"
                  className="w-full text-lg sm:text-xl lg:text-2xl font-bold mb-3 bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-400"
                />
                <RichTextEditor
                  value={formDescription}
                  onChange={setFormDescription}
                  placeholder="Form description (optional)"
                  minHeight="80px"
                  compact={true}
                />
              </div>

              {/* Questions */}
              <div className="p-6 space-y-4">
                {formQuestions.map((question, index) => (
                  <div key={question.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        <div className="mb-2">
                          <RichTextEditor
                            value={question.question}
                            onChange={(value) => updateQuestion(question.id, { question: value })}
                            placeholder="Enter your question"
                            minHeight="60px"
                            compact={true}
                          />
                        </div>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(question.id, { type: e.target.value as QuestionType })}
                          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {questionTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>

                        {/* Options for choice questions */}
                        {(question.type === 'multiple-choice' || question.type === 'checkboxes' || question.type === 'dropdown') && question.options && (
                          <div className="mt-3 space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                  placeholder={`Option ${optIndex + 1}`}
                                  className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {question.options && question.options.length > 1 && (
                                  <button
                                    onClick={() => deleteOption(question.id, optIndex)}
                                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => addOption(question.id)}
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              + Add option
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteQuestion(question.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ml-6">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Required
                    </label>
                  </div>
                ))}

                {/* Add Question Buttons */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Add a question:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {questionTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => addQuestion(type.value)}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={() => setCurrentView('list')}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  <FiEye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => saveForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <FiSend className="w-4 h-4" />
                  Save & Publish
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'responses' && selectedForm && (
          <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => setCurrentView('list')}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to forms
              </button>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedForm.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedForm.description}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Responses ({selectedForm.responses})
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/forms/${selectedForm.id}`;
                      setShareUrl(url);
                      navigator.clipboard.writeText(url).catch(() => {});
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    <FiShare2 className="w-4 h-4" />
                    Copy Share Link
                  </button>
                  <button
                    onClick={() => {
                      const data = {
                        id: selectedForm.id,
                        title: selectedForm.title,
                        description: selectedForm.description,
                        questions: selectedForm.questions || [],
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `form-${selectedForm.id}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <FiDownload className="w-4 h-4" />
                    Export JSON
                  </button>
                </div>
              </div>

              {selectedForm.responses === 0 ? (
                <div className="text-center py-12">
                  <FiBarChart2 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No responses yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Share your form to start collecting responses</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Response analytics and individual submissions would be displayed here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {showPreview && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPreview(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-[90vw] max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preview: {formTitle || 'Untitled Form'}</h3>
              <button onClick={() => setShowPreview(false)} className="px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Close</button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">Description</h4>
                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formDescription }} />
              </div>
              <div className="space-y-4">
                {formQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">{idx + 1}. <span dangerouslySetInnerHTML={{ __html: q.question }} /></div>
                    {q.type === 'short-text' && (
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm" placeholder="Your answer" />
                    )}
                    {q.type === 'long-text' && (
                      <textarea className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm" rows={3} placeholder="Your answer" />
                    )}
                    {(q.type === 'multiple-choice' || q.type === 'dropdown') && q.options && (
                      <div className="space-y-2">
                        {q.type === 'multiple-choice' ? (
                          q.options.map((opt, i) => (
                            <label key={i} className="flex items-center gap-2 text-sm">
                              <input type="radio" name={`q_${q.id}`} /> {opt}
                            </label>
                          ))
                        ) : (
                          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm">
                            {q.options.map((opt, i) => (
                              <option key={i}>{opt}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                    {q.type === 'checkboxes' && q.options && (
                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          <label key={i} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" /> {opt}
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === 'rating' && (
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map((s) => (
                          <span key={s} className="text-yellow-500">★</span>
                        ))}
                      </div>
                    )}
                    {q.type === 'date' && (
                      <input type="date" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>, document.body)}
    </div>
  );
}
