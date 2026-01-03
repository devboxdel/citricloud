import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  code: number;
  title: string;
  description: string;
  category?: string;
  rfc?: string;
}

export default function ErrorPage({ code, title, description, category, rfc }: ErrorPageProps) {
  const navigate = useNavigate();

  const getCategoryColor = (cat?: string) => {
    if (!cat) return 'gray';
    if (cat.includes('Client Error')) return 'orange';
    if (cat.includes('Server Error')) return 'red';
    if (cat.includes('Success')) return 'green';
    if (cat.includes('Redirection')) return 'yellow';
    if (cat.includes('Informational')) return 'blue';
    return 'gray';
  };

  const color = getCategoryColor(category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center">
          {/* Error Code */}
          <div className={`text-6xl sm:text-7xl lg:text-9xl font-black mb-4 bg-gradient-to-r from-${color}-500 to-${color}-700 bg-clip-text text-transparent`}>
            {code}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>

          {/* Category Badge */}
          {category && (
            <div className="inline-block mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold bg-${color}-100 dark:bg-${color}-900/30 text-${color}-800 dark:text-${color}-200`}>
                {category}
              </span>
            </div>
          )}

          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            {description}
          </p>

          {/* RFC Info */}
          {rfc && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
              {rfc}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Retry</span>
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If the problem persists, please{' '}
              <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
                contact support
              </a>
              {' '}or view our{' '}
              <a href="/error-pages" className="text-blue-600 dark:text-blue-400 hover:underline">
                complete error reference
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
