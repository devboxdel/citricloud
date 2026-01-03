# HTTP Error Pages Documentation

This documentation covers the comprehensive HTTP error pages implementation in CITRICLOUD.

## Overview

The error pages system provides:
- **Frontend**: Interactive error page browser and dedicated error pages
- **Backend**: API endpoints for retrieving HTTP status code information
- **Utilities**: Reusable error handling components and utilities

## Frontend Components

### Error Pages Browser (`/error-pages`)

A comprehensive reference page showing all HTTP status codes organized by category:
- Search and filter functionality
- Category-based organization
- Interactive cards with detailed information
- Modal view for detailed status code information

**Categories:**
- Informational (1xx)
- Success (2xx)
- Redirection (3xx)
- Client Error (4xx)
- Server Error (5xx)

### Dedicated Error Pages

Individual error pages for common HTTP errors:
- `/error/400` - Bad Request
- `/error/401` - Unauthorized
- `/error/403` - Forbidden
- `/error/404` - Not Found
- `/error/418` - I'm a teapot (Easter egg!)
- `/error/429` - Too Many Requests
- `/error/500` - Internal Server Error
- `/error/502` - Bad Gateway
- `/error/503` - Service Unavailable
- `/error/504` - Gateway Timeout

Each page includes:
- Large, prominent error code
- Clear title and description
- Category badge
- RFC information (where applicable)
- Action buttons (Go Back, Retry, Go Home)
- Links to support and error reference

### Error Page Component

Reusable `ErrorPage` component for creating custom error pages:

```tsx
import ErrorPage from '../components/ErrorPage';

export default function CustomError() {
  return (
    <ErrorPage
      code={403}
      title="Forbidden"
      description="You don't have permission to access this resource."
      category="Client Error"
    />
  );
}
```

## Backend API

### Endpoints

#### Get All Status Codes
```
GET /api/v1/status-codes/
```

Query Parameters:
- `category` - Filter by category (Informational, Success, Redirection, Client Error, Server Error)
- `code` - Filter by specific status code

Example:
```bash
curl http://localhost:8000/api/v1/status-codes/?category=Client%20Error
```

#### Get Status Code Categories
```
GET /api/v1/status-codes/categories
```

Returns list of available categories.

#### Get Specific Status Code
```
GET /api/v1/status-codes/{code}
```

Example:
```bash
curl http://localhost:8000/api/v1/status-codes/404
```

#### Get Status Codes by Category
```
GET /api/v1/status-codes/category/{category_name}
```

Example:
```bash
curl http://localhost:8000/api/v1/status-codes/category/Server%20Error
```

### Python Utilities

#### HTTPStatusManager

Utility class for managing HTTP status codes:

```python
from app.core.http_status import HTTPStatusManager

# Get all status codes
all_codes = HTTPStatusManager.get_all_status_codes()

# Get specific status code
status = HTTPStatusManager.get_status_by_code(404)

# Get codes by category
client_errors = HTTPStatusManager.get_status_by_category("Client Error")
```

#### Create HTTP Exception

Helper function for creating HTTPException with proper status information:

```python
from app.core.http_status import create_http_exception

# Raise with default message
raise create_http_exception(404)

# Raise with custom message
raise create_http_exception(403, detail="You don't have permission to access this resource")
```

## Status Codes Included

### 1xx Informational
- 100 Continue

### 2xx Success
- 200 OK
- 201 Created
- 202 Accepted
- 203 Non-Authoritative Information
- 204 No Content
- 205 Reset Content
- 206 Partial Content
- 207 Multi-Status (WebDAV)
- 208 Already Reported (WebDAV)
- 226 IM Used

### 3xx Redirection
- 300 Multiple Choices
- 301 Moved Permanently
- 302 Found
- 303 See Other
- 304 Not Modified
- 305 Use Proxy
- 306 Switch Proxy
- 307 Temporary Redirect
- 308 Permanent Redirect

### 4xx Client Error
- 400 Bad Request
- 401 Unauthorized
- 402 Payment Required
- 403 Forbidden
- 404 Not Found
- 405 Method Not Allowed
- 406 Not Acceptable
- 407 Proxy Authentication Required
- 408 Request Timeout
- 409 Conflict
- 410 Gone
- 411 Length Required
- 412 Precondition Failed
- 413 Payload Too Large
- 414 URI Too Long
- 415 Unsupported Media Type
- 416 Range Not Satisfiable
- 417 Expectation Failed
- 418 I'm a teapot
- 421 Misdirected Request
- 422 Unprocessable Content
- 423 Locked (WebDAV)
- 424 Failed Dependency (WebDAV)
- 425 Too Early
- 426 Upgrade Required
- 428 Precondition Required
- 429 Too Many Requests
- 431 Request Header Fields Too Large
- 451 Unavailable For Legal Reasons

#### IIS-specific
- 440 Login Time-out
- 449 Retry With
- 450 Blocked by Windows Parental Controls

#### nginx-specific
- 444 No Response
- 494 Request header too large
- 495 SSL Certificate Error
- 496 SSL Certificate Required
- 497 HTTP Request Sent to HTTPS Port
- 499 Client Closed Request

### 5xx Server Error
- 500 Internal Server Error
- 501 Not Implemented
- 502 Bad Gateway
- 503 Service Unavailable
- 504 Gateway Timeout
- 505 HTTP Version Not Supported
- 506 Variant Also Negotiates
- 507 Insufficient Storage (WebDAV)
- 508 Loop Detected (WebDAV)
- 510 Not Extended
- 511 Network Authentication Required

## Usage Examples

### Frontend

#### Navigate to Error Page
```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/error/404');
```

#### Show Error Browser
```tsx
<a href="/error-pages">View all HTTP status codes</a>
```

### Backend

#### Raise Custom HTTP Error
```python
from app.core.http_status import create_http_exception

@router.get("/resource")
async def get_resource():
    if not resource_exists:
        raise create_http_exception(404, detail="Resource not found")
    return resource
```

#### Get Status Information
```python
from app.core.http_status import HTTPStatusManager

status_info = HTTPStatusManager.get_status_by_code(429)
print(f"{status_info['code']} - {status_info['title']}")
print(status_info['description'])
```

## Integration with Existing Code

### Error Handling in API

Update your API error handlers to use the status code system:

```python
from fastapi import FastAPI
from app.core.http_status import create_http_exception

app = FastAPI()

@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    raise create_http_exception(400, detail=str(exc))
```

### Frontend Error Boundaries

Redirect to appropriate error pages on API errors:

```tsx
try {
  const response = await api.get('/endpoint');
} catch (error) {
  if (error.response?.status) {
    navigate(`/error/${error.response.status}`);
  }
}
```

## Styling and Theming

Error pages support both light and dark modes automatically through your theme provider. The color scheme adapts based on the error category:

- **Informational**: Blue
- **Success**: Green
- **Redirection**: Yellow
- **Client Error**: Orange
- **Server Error**: Red

## Navigation

Error pages can be accessed from:
- Footer "Developers" section → "Error Pages"
- Direct URL: `/error-pages`
- Individual error URLs: `/error/{code}`

## Best Practices

1. **Use Specific Status Codes**: Choose the most appropriate status code for each situation
2. **Provide Context**: Include helpful information in error messages
3. **Offer Actions**: Give users clear next steps (retry, go back, go home)
4. **Log Errors**: Log server errors for debugging and monitoring
5. **User-Friendly Messages**: Translate technical errors into user-friendly language

## Future Enhancements

Potential improvements:
- Add more dedicated error pages
- Implement error analytics
- Add animated illustrations for each error type
- Create error page templates for different use cases
- Add internationalization (i18n) support
