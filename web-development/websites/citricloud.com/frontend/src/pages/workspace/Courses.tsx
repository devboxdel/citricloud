import React, { useState, useEffect } from 'react';
import * as coursesApi from '../../lib/coursesApi';
import { FiArrowLeft, FiChevronDown, FiChevronRight, FiMenu, FiRefreshCw, FiSearch, FiSettings, FiStar, FiTag, FiX, FiBookOpen, FiClock, FiFolder, FiAlertTriangle } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
// Footer intentionally hidden for Courses app (like Lists)

type Lesson = {
  id: number;
  title: string;
  content: string;
  completed?: boolean;
};

type Course = {
  id: number;
  title: string;
  category: string;
  duration: string; // e.g., '45 min'
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  snippet: string;
  created_at: string;
  is_favorite?: boolean;
  labels?: string[];
  lessons: Lesson[];
  completed?: boolean;
  progress?: number; // 0-100
};

export default function CoursesApp() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCourseList, setShowCourseList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCategoriesCollapse, setShowCategoriesCollapse] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<string>('All');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<number>(0);
  const [isInLessonMode, setIsInLessonMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => {
    setLoading(true);
    coursesApi.getCourses()
      .then(data => setCourses(data))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Getting Started', 'Email', 'Projects', 'Forms', 'Planner'];



  const filteredCourses = courses.filter(c =>
    (currentCategory === 'All' || c.category === currentCategory || c.labels?.includes(currentCategory)) &&
    (searchQuery.trim() === '' || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.snippet.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleFavorite = async (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    const updated = { ...course, is_favorite: !course.is_favorite };
    await coursesApi.updateCourse(courseId, updated);
    setCourses(prev => prev.map(c => c.id === courseId ? updated : c));
    if (selectedCourse?.id === courseId) {
      setSelectedCourse(updated);
    }
  };

  const startCourse = () => {
    setIsInLessonMode(true);
    setCurrentLesson(0);
    setShowCourseList(false);
  };

  const completeLesson = async (lessonId: number) => {
    if (!selectedCourse) return;
    const course = courses.find(c => c.id === selectedCourse.id);
    if (!course) return;
    const updatedLessons = course.lessons.map(lesson =>
      lesson.id === lessonId ? { ...lesson, completed: true } : lesson
    );
    const completedCount = updatedLessons.filter(l => l.completed).length;
    const progress = Math.round((completedCount / updatedLessons.length) * 100);
    const completed = completedCount === updatedLessons.length;
    const updatedCourse = { ...course, lessons: updatedLessons, progress, completed };
    await coursesApi.updateCourse(course.id, updatedCourse);
    setCourses(prev => prev.map(c => c.id === course.id ? updatedCourse : c));
    setSelectedCourse(updatedCourse);
  };

  const nextLesson = () => {
    if (selectedCourse && currentLesson < selectedCourse.lessons.length - 1) {
      setCurrentLesson(prev => prev + 1);
    }
  };

  const previousLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(prev => prev - 1);
    }
  };

  const exitLessonMode = () => {
    setIsInLessonMode(false);
    setCurrentLesson(0);
  };

  const completedCount = courses.filter(c => c.completed).length;
  const totalCount = courses.length;

  const handleSave = async () => {
    if (!selectedCourse) return;
    setIsSaving(true);
    try {
      await coursesApi.updateCourse(selectedCourse.id, selectedCourse);
    } catch (error) {
      console.error('Failed to save course:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Header Bar */}
      <div className="bg-amber-500 text-white px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-white/10 rounded lg:hidden" title="Toggle menu">
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-white font-semibold text-xs sm:text-sm" style={{ fontFamily: "'Source Code Pro', monospace" }}>CITRICLOUD.com</span>
              <span className="text-white/80 text-[8px] sm:text-[9px] tracking-wide" style={{ fontFamily: "'Source Code Pro', monospace" }}>Enterprise Cloud Platform</span>
            </div>
            <span className="text-white font-semibold text-sm">Courses</span>
          </div>
          <div className="relative flex-1 max-w-md hidden md:block">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              placeholder="Search courses"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 bg-amber-600 dark:bg-amber-700 text-white placeholder-white/70 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {selectedCourse && (
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              title="Save course progress"
            >
              <FiRefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          )}
          <div className="hidden sm:block">
          </div>
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-white/10 rounded hidden sm:block" title="Settings">
            <FiSettings className="w-5 h-5" />
          </button>
          <a href="/workspace" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-white/10 rounded transition-colors" title="Go back to Workspace">
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </a>
        </div>
      </div>


      {/* Settings Modal (simplified) */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Courses Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="p-4 text-sm text-gray-700 dark:text-gray-300">No configurable settings yet.</div>
          </div>
        </div>
      )}

      {/* Main Content - Email-like layout */}
      <div className="flex-1 flex overflow-hidden relative pt-[50px] lg:pt-0">
        {showSidebar && (<div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowSidebar(false)} />)}

        {/* Sidebar */}
        <aside className={`
          w-60 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col
          fixed lg:relative inset-y-0 left-0 z-50 transform transition-transform duration-300
          ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Categories */}
          <div className="px-3 mt-2 mb-1">
            <button onClick={() => setShowCategoriesCollapse(!showCategoriesCollapse)} className="w-full flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 py-1 hover:text-gray-900 dark:hover:text-gray-200">
              <span className="font-semibold">Categories</span>
              {showCategoriesCollapse ? <FiChevronDown className="w-3 h-3" /> : <FiChevronRight className="w-3 h-3" />}
            </button>
          </div>
          {showCategoriesCollapse && (
            <nav className="px-2 space-y-0.5 mb-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setCurrentCategory(cat); setSelectedCourse(null); setShowSidebar(false); setShowCourseList(true); }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                    currentCategory === cat ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FiFolder className="w-4 h-4" />
                    <span className="text-sm">{cat}</span>
                  </span>
                </button>
              ))}
            </nav>
          )}

          <div className="flex-1" />

          {/* Progress */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Courses completed: {completedCount} / {totalCount}</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(completedCount / totalCount) * 100}%` }} />
            </div>
          </div>
        </aside>

        {/* Course List Panel */}
        <div className={`
          w-full md:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col
          ${!showCourseList ? 'hidden md:flex' : 'flex'}
        `}>

          {/* Course List */}
          <div className="flex-1 overflow-y-auto">
            {filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <FiBookOpen className="w-12 h-12 mb-2 text-gray-300 dark:text-gray-600" />
                <div className="text-sm">No courses found</div>
              </div>
            ) : (
              filteredCourses.map(course => (
                <div
                  key={course.id}
                  onClick={() => { setSelectedCourse(course); setShowCourseList(false); }}
                  className={`px-3 sm:px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-800 transition-colors ${
                    selectedCourse?.id === course.id
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-600'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                      course.category === 'Getting Started' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                      course.category === 'Email' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                      course.category === 'Projects' ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      course.category === 'Forms' ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                      course.category === 'Planner' ? 'bg-gradient-to-br from-pink-400 to-pink-600' :
                      'bg-gradient-to-br from-green-400 to-green-600'
                    }`}>
                      {course.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{course.title}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                          {new Date(course.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{course.snippet}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{course.duration}</span>
                        <span>{course.level}</span>
                        {course.completed && <span className="text-green-600 dark:text-green-400">✓ Completed</span>}
                        {!course.completed && course.progress && course.progress > 0 && (
                          <span className="text-amber-600 dark:text-amber-400">{course.progress}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Course Detail Panel */}
        <div className={`
          flex-1 bg-white dark:bg-gray-900 flex flex-col
          ${showCourseList ? 'hidden md:flex' : 'flex'}
        `}>
          {selectedCourse ? (
            <div className="h-full flex flex-col">
              {isInLessonMode ? (
                /* Lesson View Mode */
                <>
                  {/* Lesson Toolbar */}
                  <div className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2 flex items-center gap-2">
                    <button onClick={exitLessonMode} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400" title="Exit lesson">
                      <FiX className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Lesson {currentLesson + 1} of {selectedCourse.lessons.length}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                        <div className="bg-amber-500 h-1 rounded-full transition-all" style={{ width: `${((currentLesson + 1) / selectedCourse.lessons.length) * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Lesson Content */}
                  <div className="flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 overflow-y-auto">
                    <div className="max-w-3xl mx-auto space-y-6">
                      <div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {selectedCourse.lessons[currentLesson].title}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{selectedCourse.category}</span>
                          <span>•</span>
                          <span>Lesson {currentLesson + 1}</span>
                          {selectedCourse.lessons[currentLesson].completed && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 dark:text-green-400">✓ Completed</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {selectedCourse.lessons[currentLesson].content}
                        </p>
                      </div>

                      {!selectedCourse.lessons[currentLesson].completed && (
                        <button
                          onClick={() => completeLesson(selectedCourse.lessons[currentLesson].id)}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-medium transition-colors"
                        >
                          Mark as Complete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lesson Navigation */}
                  <div className="border-t border-gray-200 dark:border-gray-700 px-3 sm:px-4 lg:px-6 py-4 flex items-center justify-between">
                    <button
                      onClick={previousLesson}
                      disabled={currentLesson === 0}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiArrowLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button
                      onClick={nextLesson}
                      disabled={currentLesson === selectedCourse.lessons.length - 1}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                /* Course Overview Mode */
                <>
                  {/* Toolbar */}
                  <div className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2 flex items-center gap-2">
                    <button onClick={() => { setShowCourseList(true); setSelectedCourse(null); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 md:hidden" title="Back to list">
                      <FiArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={() => toggleFavorite(selectedCourse.id)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                      title={selectedCourse.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <FiStar className={`w-4 h-4 ${selectedCourse.is_favorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* Header */}
                  <div className="px-3 sm:px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-1">{selectedCourse.title}</h2>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>{selectedCourse.category}</span>
                      <span>•</span>
                      <span>{selectedCourse.level}</span>
                      <span>•</span>
                      <span>{selectedCourse.duration}</span>
                      <span>•</span>
                      <span>{selectedCourse.lessons.length} lessons</span>
                      {selectedCourse.completed && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 dark:text-green-400">✓ Completed</span>
                        </>
                      )}
                    </div>
                    {selectedCourse.progress && selectedCourse.progress > 0 && !selectedCourse.completed && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Progress: {selectedCourse.progress}%</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${selectedCourse.progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 overflow-y-auto">
                    <div className="max-w-3xl space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">About this course</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedCourse.snippet}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Course lessons</h3>
                        <div className="space-y-2">
                          {selectedCourse.lessons.map((lesson, index) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                lesson.completed
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                              }`}>
                                {lesson.completed ? '✓' : index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{lesson.title}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{lesson.content.slice(0, 60)}...</div>
                              </div>
                              {lesson.completed && (
                                <span className="text-xs text-green-600 dark:text-green-400 flex-shrink-0">Completed</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={startCourse}
                        className="px-3 sm:px-4 lg:px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        {selectedCourse.progress && selectedCourse.progress > 0 ? 'Continue Course' : 'Start Course'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 opacity-20">
                  <svg viewBox="0 0 100 100" fill="currentColor" className="text-gray-400">
                    <path d="M20 25h60v8H20z M20 43h60v8H20z M20 61h60v8H20z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Select a course to view</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Nothing is selected</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer hidden on Courses app */}
    </div>
  );
}
