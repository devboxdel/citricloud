import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, RefreshCw, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ErrorPageData {
  code: number;
  title: string;
  category: string;
  description: string;
  rfc?: string;
}

const errorPages: ErrorPageData[] = [
  // 1xx Informational
  { code: 100, title: 'Continue', category: 'Informational', description: 'The server has received the request headers and the client should proceed to send the request body.' },
  
  // 2xx Success
  { code: 200, title: 'OK', category: 'Success', description: 'The request has succeeded. The information returned with the response is dependent on the method used in the request.' },
  { code: 201, title: 'Created', category: 'Success', description: 'The request has been fulfilled and resulted in a new resource being created.' },
  { code: 202, title: 'Accepted', category: 'Success', description: 'The request has been accepted for processing, but the processing has not been completed.' },
  { code: 203, title: 'Non-Authoritative Information', category: 'Success', description: 'The server successfully processed the request, but is returning information that may be from another source.', rfc: 'HTTP/1.1' },
  { code: 204, title: 'No Content', category: 'Success', description: 'The server successfully processed the request, but is not returning any content.' },
  { code: 205, title: 'Reset Content', category: 'Success', description: 'The server successfully processed the request, but is not returning any content. The client should reset the document view.' },
  { code: 206, title: 'Partial Content', category: 'Success', description: 'The server is delivering only part of the resource due to a range header sent by the client.' },
  { code: 207, title: 'Multi-Status', category: 'Success', description: 'The message body that follows is an XML message and can contain a number of separate response codes.', rfc: 'WebDAV; RFC 4918' },
  { code: 208, title: 'Already Reported', category: 'Success', description: 'The members of a DAV binding have already been enumerated in a previous reply to this request.', rfc: 'WebDAV; RFC 5842' },
  { code: 226, title: 'IM Used', category: 'Success', description: 'The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.', rfc: 'RFC 3229' },
  
  // 3xx Redirection
  { code: 300, title: 'Multiple Choices', category: 'Redirection', description: 'Indicates multiple options for the resource that the client may follow.' },
  { code: 301, title: 'Moved Permanently', category: 'Redirection', description: 'This and all future requests should be directed to the given URI.' },
  { code: 302, title: 'Found', category: 'Redirection', description: 'The resource was found, but at a different URI.' },
  { code: 303, title: 'See Other', category: 'Redirection', description: 'The response to the request can be found under another URI using a GET method.', rfc: 'HTTP/1.1' },
  { code: 304, title: 'Not Modified', category: 'Redirection', description: 'Indicates that the resource has not been modified since the version specified by the request headers.' },
  { code: 305, title: 'Use Proxy', category: 'Redirection', description: 'The requested resource is only available through a proxy.', rfc: 'HTTP/1.1' },
  { code: 306, title: 'Switch Proxy', category: 'Redirection', description: 'No longer used. Originally meant "Subsequent requests should use the specified proxy."' },
  { code: 307, title: 'Temporary Redirect', category: 'Redirection', description: 'The request should be repeated with another URI; however, future requests should still use the original URI.', rfc: 'HTTP/1.1' },
  { code: 308, title: 'Permanent Redirect', category: 'Redirection', description: 'The request and all future requests should be repeated using another URI.' },
  
  // 4xx Client Error
  { code: 400, title: 'Bad Request', category: 'Client Error', description: 'The server cannot or will not process the request due to an apparent client error.' },
  { code: 401, title: 'Unauthorized', category: 'Client Error', description: 'Authentication is required and has failed or has not yet been provided.' },
  { code: 402, title: 'Payment Required', category: 'Client Error', description: 'Reserved for future use. The original intention was that this code might be used as part of some form of digital cash or micropayment scheme.' },
  { code: 403, title: 'Forbidden', category: 'Client Error', description: 'The request was valid, but the server is refusing action. The user might not have the necessary permissions for a resource.' },
  { code: 404, title: 'Not Found', category: 'Client Error', description: 'The requested resource could not be found but may be available in the future.' },
  { code: 405, title: 'Method Not Allowed', category: 'Client Error', description: 'A request method is not supported for the requested resource.' },
  { code: 406, title: 'Not Acceptable', category: 'Client Error', description: 'The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.' },
  { code: 407, title: 'Proxy Authentication Required', category: 'Client Error', description: 'The client must first authenticate itself with the proxy.' },
  { code: 408, title: 'Request Timeout', category: 'Client Error', description: 'The server timed out waiting for the request.' },
  { code: 409, title: 'Conflict', category: 'Client Error', description: 'Indicates that the request could not be processed because of conflict in the request.' },
  { code: 410, title: 'Gone', category: 'Client Error', description: 'Indicates that the resource requested is no longer available and will not be available again.' },
  { code: 411, title: 'Length Required', category: 'Client Error', description: 'The request did not specify the length of its content, which is required by the requested resource.' },
  { code: 412, title: 'Precondition Failed', category: 'Client Error', description: 'The server does not meet one of the preconditions that the requester put on the request.' },
  { code: 413, title: 'Payload Too Large', category: 'Client Error', description: 'The request is larger than the server is willing or able to process.' },
  { code: 414, title: 'URI Too Long', category: 'Client Error', description: 'The URI provided was too long for the server to process.' },
  { code: 415, title: 'Unsupported Media Type', category: 'Client Error', description: 'The request entity has a media type which the server or resource does not support.' },
  { code: 416, title: 'Range Not Satisfiable', category: 'Client Error', description: 'The client has asked for a portion of the file, but the server cannot supply that portion.' },
  { code: 417, title: 'Expectation Failed', category: 'Client Error', description: 'The server cannot meet the requirements of the Expect request-header field.' },
  { code: 418, title: "I'm a teapot", category: 'Client Error', description: 'This code was defined in 1998 as one of the traditional IETF April Fools\' jokes.', rfc: 'RFC 2324, RFC 7168' },
  { code: 421, title: 'Misdirected Request', category: 'Client Error', description: 'The request was directed at a server that is not able to produce a response.' },
  { code: 422, title: 'Unprocessable Content', category: 'Client Error', description: 'The request was well-formed but was unable to be followed due to semantic errors.' },
  { code: 423, title: 'Locked', category: 'Client Error', description: 'The resource that is being accessed is locked.', rfc: 'WebDAV; RFC 4918' },
  { code: 424, title: 'Failed Dependency', category: 'Client Error', description: 'The request failed due to failure of a previous request.', rfc: 'WebDAV; RFC 4918' },
  { code: 425, title: 'Too Early', category: 'Client Error', description: 'Indicates that the server is unwilling to risk processing a request that might be replayed.', rfc: 'RFC 8470' },
  { code: 426, title: 'Upgrade Required', category: 'Client Error', description: 'The client should switch to a different protocol.' },
  { code: 428, title: 'Precondition Required', category: 'Client Error', description: 'The origin server requires the request to be conditional.', rfc: 'RFC 6585' },
  { code: 429, title: 'Too Many Requests', category: 'Client Error', description: 'The user has sent too many requests in a given amount of time.', rfc: 'RFC 6585' },
  { code: 431, title: 'Request Header Fields Too Large', category: 'Client Error', description: 'The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large.', rfc: 'RFC 6585' },
  { code: 451, title: 'Unavailable For Legal Reasons', category: 'Client Error', description: 'A server operator has received a legal demand to deny access to a resource or to a set of resources.', rfc: 'RFC 7725' },
  
  // IIS
  { code: 440, title: 'Login Time-out', category: 'Client Error', description: 'The client\'s session has expired and must log in again. (IIS)' },
  { code: 449, title: 'Retry With', category: 'Client Error', description: 'The server cannot honour the request because the user has not provided the required information. (IIS)' },
  { code: 450, title: 'Blocked by Windows Parental Controls', category: 'Client Error', description: 'Windows Parental Controls are turned on and are blocking access to the given webpage. (IIS)' },
  
  // nginx
  { code: 444, title: 'No Response', category: 'Client Error', description: 'Used to indicate that the server has returned no information to the client and closed the connection. (nginx)' },
  { code: 494, title: 'Request header too large', category: 'Client Error', description: 'Client sent too large request or too long header line. (nginx)' },
  { code: 495, title: 'SSL Certificate Error', category: 'Client Error', description: 'An expansion of the 400 Bad Request response code, used when the client has provided an invalid client certificate. (nginx)' },
  { code: 496, title: 'SSL Certificate Required', category: 'Client Error', description: 'An expansion of the 400 Bad Request response code, used when a client certificate is required but not provided. (nginx)' },
  { code: 497, title: 'HTTP Request Sent to HTTPS Port', category: 'Client Error', description: 'An expansion of the 400 Bad Request response code, used when the client has made a HTTP request to a port listening for HTTPS requests. (nginx)' },
  { code: 499, title: 'Client Closed Request', category: 'Client Error', description: 'Used when the client has closed the request before the server could send a response. (nginx)' },
  
  // 5xx Server Error
  { code: 500, title: 'Internal Server Error', category: 'Server Error', description: 'A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.' },
  { code: 501, title: 'Not Implemented', category: 'Server Error', description: 'The server either does not recognize the request method, or it lacks the ability to fulfill the request.' },
  { code: 502, title: 'Bad Gateway', category: 'Server Error', description: 'The server was acting as a gateway or proxy and received an invalid response from the upstream server.' },
  { code: 503, title: 'Service Unavailable', category: 'Server Error', description: 'The server is currently unavailable (because it is overloaded or down for maintenance).' },
  { code: 504, title: 'Gateway Timeout', category: 'Server Error', description: 'The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.' },
  { code: 505, title: 'HTTP Version Not Supported', category: 'Server Error', description: 'The server does not support the HTTP protocol version used in the request.' },
  { code: 506, title: 'Variant Also Negotiates', category: 'Server Error', description: 'Transparent content negotiation for the request results in a circular reference.', rfc: 'RFC 2295' },
  { code: 507, title: 'Insufficient Storage', category: 'Server Error', description: 'The server is unable to store the representation needed to complete the request.', rfc: 'WebDAV; RFC 4918' },
  { code: 508, title: 'Loop Detected', category: 'Server Error', description: 'The server detected an infinite loop while processing the request.', rfc: 'WebDAV; RFC 5842' },
  { code: 510, title: 'Not Extended', category: 'Server Error', description: 'Further extensions to the request are required for the server to fulfill it.', rfc: 'RFC 2774' },
  { code: 511, title: 'Network Authentication Required', category: 'Server Error', description: 'The client needs to authenticate to gain network access.', rfc: 'RFC 6585' },
];

export default function ErrorPages() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedError, setSelectedError] = useState<ErrorPageData | null>(null);

  const categories = ['All', 'Informational', 'Success', 'Redirection', 'Client Error', 'Server Error'];

  const filteredErrors = errorPages.filter(error => {
    const matchesCategory = selectedCategory === 'All' || error.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      error.code.toString().includes(searchTerm) ||
      error.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Informational': return 'blue';
      case 'Success': return 'green';
      case 'Redirection': return 'yellow';
      case 'Client Error': return 'orange';
      case 'Server Error': return 'red';
      default: return 'gray';
    }
  };

  const getCategoryClasses = (category: string) => {
    const color = getCategoryColor(category);
    return {
      bg: `bg-${color}-100 dark:bg-${color}-900/20`,
      text: `text-${color}-800 dark:text-${color}-200`,
      border: `border-${color}-200 dark:border-${color}-800`,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  HTTP Status Codes
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Complete reference of HTTP status codes
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by code, title, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredErrors.map((error) => {
            const classes = getCategoryClasses(error.category);
            const hasErrorPage = [400, 401, 403, 404, 418, 429, 500, 502, 503, 504].includes(error.code);
            
            return (
              <div
                key={error.code}
                onClick={() => setSelectedError(error)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`text-4xl font-bold ${classes.text}`}>
                    {error.code}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${classes.bg} ${classes.text}`}>
                    {error.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {error.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {error.description}
                </p>
                {error.rfc && (
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                    {error.rfc}
                  </div>
                )}
                {hasErrorPage && (
                  <div className="mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/error/${error.code}`);
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View full page →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredErrors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 text-lg">
              No error codes found matching your criteria
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedError && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedError(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`text-6xl font-bold ${getCategoryClasses(selectedError.category).text}`}>
                  {selectedError.code}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedError.title}
                  </h2>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium mt-2 ${getCategoryClasses(selectedError.category).bg} ${getCategoryClasses(selectedError.category).text}`}>
                    {selectedError.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedError(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedError.description}
                </p>
              </div>
              
              {selectedError.rfc && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Specification
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedError.rfc}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setSelectedError(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${selectedError.code} ${selectedError.title}`);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copy Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
