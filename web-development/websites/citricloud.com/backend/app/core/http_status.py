"""
HTTP Status Code Management
Provides comprehensive HTTP status code definitions and utilities
"""

from enum import Enum
from typing import Dict, Optional
from fastapi import HTTPException


class HTTPStatusCategory(str, Enum):
    """HTTP Status Code Categories"""
    INFORMATIONAL = "Informational"
    SUCCESS = "Success"
    REDIRECTION = "Redirection"
    CLIENT_ERROR = "Client Error"
    SERVER_ERROR = "Server Error"


class HTTPStatusCode:
    """Comprehensive HTTP Status Code Definitions"""
    
    # 1xx Informational
    CONTINUE = (100, "Continue", "The server has received the request headers and the client should proceed to send the request body.")
    
    # 2xx Success
    OK = (200, "OK", "The request has succeeded.")
    CREATED = (201, "Created", "The request has been fulfilled and resulted in a new resource being created.")
    ACCEPTED = (202, "Accepted", "The request has been accepted for processing, but the processing has not been completed.")
    NON_AUTHORITATIVE_INFORMATION = (203, "Non-Authoritative Information", "The server successfully processed the request, but is returning information that may be from another source.")
    NO_CONTENT = (204, "No Content", "The server successfully processed the request, but is not returning any content.")
    RESET_CONTENT = (205, "Reset Content", "The server successfully processed the request, but is not returning any content. The client should reset the document view.")
    PARTIAL_CONTENT = (206, "Partial Content", "The server is delivering only part of the resource due to a range header sent by the client.")
    MULTI_STATUS = (207, "Multi-Status", "The message body that follows is an XML message and can contain a number of separate response codes.")
    ALREADY_REPORTED = (208, "Already Reported", "The members of a DAV binding have already been enumerated in a previous reply to this request.")
    IM_USED = (226, "IM Used", "The server has fulfilled a GET request for the resource.")
    
    # 3xx Redirection
    MULTIPLE_CHOICES = (300, "Multiple Choices", "Indicates multiple options for the resource that the client may follow.")
    MOVED_PERMANENTLY = (301, "Moved Permanently", "This and all future requests should be directed to the given URI.")
    FOUND = (302, "Found", "The resource was found, but at a different URI.")
    SEE_OTHER = (303, "See Other", "The response to the request can be found under another URI using a GET method.")
    NOT_MODIFIED = (304, "Not Modified", "Indicates that the resource has not been modified since the version specified by the request headers.")
    USE_PROXY = (305, "Use Proxy", "The requested resource is only available through a proxy.")
    SWITCH_PROXY = (306, "Switch Proxy", "No longer used. Originally meant 'Subsequent requests should use the specified proxy.'")
    TEMPORARY_REDIRECT = (307, "Temporary Redirect", "The request should be repeated with another URI; however, future requests should still use the original URI.")
    PERMANENT_REDIRECT = (308, "Permanent Redirect", "The request and all future requests should be repeated using another URI.")
    
    # 4xx Client Error
    BAD_REQUEST = (400, "Bad Request", "The server cannot or will not process the request due to an apparent client error.")
    UNAUTHORIZED = (401, "Unauthorized", "Authentication is required and has failed or has not yet been provided.")
    PAYMENT_REQUIRED = (402, "Payment Required", "Reserved for future use.")
    FORBIDDEN = (403, "Forbidden", "The request was valid, but the server is refusing action.")
    NOT_FOUND = (404, "Not Found", "The requested resource could not be found but may be available in the future.")
    METHOD_NOT_ALLOWED = (405, "Method Not Allowed", "A request method is not supported for the requested resource.")
    NOT_ACCEPTABLE = (406, "Not Acceptable", "The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.")
    PROXY_AUTHENTICATION_REQUIRED = (407, "Proxy Authentication Required", "The client must first authenticate itself with the proxy.")
    REQUEST_TIMEOUT = (408, "Request Timeout", "The server timed out waiting for the request.")
    CONFLICT = (409, "Conflict", "Indicates that the request could not be processed because of conflict in the request.")
    GONE = (410, "Gone", "Indicates that the resource requested is no longer available and will not be available again.")
    LENGTH_REQUIRED = (411, "Length Required", "The request did not specify the length of its content, which is required by the requested resource.")
    PRECONDITION_FAILED = (412, "Precondition Failed", "The server does not meet one of the preconditions that the requester put on the request.")
    PAYLOAD_TOO_LARGE = (413, "Payload Too Large", "The request is larger than the server is willing or able to process.")
    URI_TOO_LONG = (414, "URI Too Long", "The URI provided was too long for the server to process.")
    UNSUPPORTED_MEDIA_TYPE = (415, "Unsupported Media Type", "The request entity has a media type which the server or resource does not support.")
    RANGE_NOT_SATISFIABLE = (416, "Range Not Satisfiable", "The client has asked for a portion of the file, but the server cannot supply that portion.")
    EXPECTATION_FAILED = (417, "Expectation Failed", "The server cannot meet the requirements of the Expect request-header field.")
    IM_A_TEAPOT = (418, "I'm a teapot", "This code was defined in 1998 as one of the traditional IETF April Fools' jokes.")
    MISDIRECTED_REQUEST = (421, "Misdirected Request", "The request was directed at a server that is not able to produce a response.")
    UNPROCESSABLE_CONTENT = (422, "Unprocessable Content", "The request was well-formed but was unable to be followed due to semantic errors.")
    LOCKED = (423, "Locked", "The resource that is being accessed is locked.")
    FAILED_DEPENDENCY = (424, "Failed Dependency", "The request failed due to failure of a previous request.")
    TOO_EARLY = (425, "Too Early", "Indicates that the server is unwilling to risk processing a request that might be replayed.")
    UPGRADE_REQUIRED = (426, "Upgrade Required", "The client should switch to a different protocol.")
    PRECONDITION_REQUIRED = (428, "Precondition Required", "The origin server requires the request to be conditional.")
    TOO_MANY_REQUESTS = (429, "Too Many Requests", "The user has sent too many requests in a given amount of time.")
    REQUEST_HEADER_FIELDS_TOO_LARGE = (431, "Request Header Fields Too Large", "The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large.")
    UNAVAILABLE_FOR_LEGAL_REASONS = (451, "Unavailable For Legal Reasons", "A server operator has received a legal demand to deny access to a resource or to a set of resources.")
    
    # IIS
    LOGIN_TIMEOUT = (440, "Login Time-out", "The client's session has expired and must log in again.")
    RETRY_WITH = (449, "Retry With", "The server cannot honour the request because the user has not provided the required information.")
    BLOCKED_BY_WINDOWS_PARENTAL_CONTROLS = (450, "Blocked by Windows Parental Controls", "Windows Parental Controls are turned on and are blocking access to the given webpage.")
    
    # nginx
    NO_RESPONSE = (444, "No Response", "Used to indicate that the server has returned no information to the client and closed the connection.")
    REQUEST_HEADER_TOO_LARGE = (494, "Request header too large", "Client sent too large request or too long header line.")
    SSL_CERTIFICATE_ERROR = (495, "SSL Certificate Error", "An expansion of the 400 Bad Request response code, used when the client has provided an invalid client certificate.")
    SSL_CERTIFICATE_REQUIRED = (496, "SSL Certificate Required", "An expansion of the 400 Bad Request response code, used when a client certificate is required but not provided.")
    HTTP_REQUEST_SENT_TO_HTTPS_PORT = (497, "HTTP Request Sent to HTTPS Port", "An expansion of the 400 Bad Request response code, used when the client has made a HTTP request to a port listening for HTTPS requests.")
    CLIENT_CLOSED_REQUEST = (499, "Client Closed Request", "Used when the client has closed the request before the server could send a response.")
    
    # 5xx Server Error
    INTERNAL_SERVER_ERROR = (500, "Internal Server Error", "A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.")
    NOT_IMPLEMENTED = (501, "Not Implemented", "The server either does not recognize the request method, or it lacks the ability to fulfill the request.")
    BAD_GATEWAY = (502, "Bad Gateway", "The server was acting as a gateway or proxy and received an invalid response from the upstream server.")
    SERVICE_UNAVAILABLE = (503, "Service Unavailable", "The server is currently unavailable (because it is overloaded or down for maintenance).")
    GATEWAY_TIMEOUT = (504, "Gateway Timeout", "The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.")
    HTTP_VERSION_NOT_SUPPORTED = (505, "HTTP Version Not Supported", "The server does not support the HTTP protocol version used in the request.")
    VARIANT_ALSO_NEGOTIATES = (506, "Variant Also Negotiates", "Transparent content negotiation for the request results in a circular reference.")
    INSUFFICIENT_STORAGE = (507, "Insufficient Storage", "The server is unable to store the representation needed to complete the request.")
    LOOP_DETECTED = (508, "Loop Detected", "The server detected an infinite loop while processing the request.")
    NOT_EXTENDED = (510, "Not Extended", "Further extensions to the request are required for the server to fulfill it.")
    NETWORK_AUTHENTICATION_REQUIRED = (511, "Network Authentication Required", "The client needs to authenticate to gain network access.")


class HTTPStatusManager:
    """Manager for HTTP Status Codes"""
    
    @staticmethod
    def get_all_status_codes() -> list:
        """Get all HTTP status codes as a list of dictionaries"""
        status_codes = []
        
        for attr_name in dir(HTTPStatusCode):
            if not attr_name.startswith('_'):
                attr = getattr(HTTPStatusCode, attr_name)
                if isinstance(attr, tuple) and len(attr) == 3:
                    code, title, description = attr
                    category = HTTPStatusManager._get_category(code)
                    rfc = HTTPStatusManager._get_rfc(code)
                    
                    status_codes.append({
                        'code': code,
                        'title': title,
                        'category': category,
                        'description': description,
                        'rfc': rfc
                    })
        
        return sorted(status_codes, key=lambda x: x['code'])
    
    @staticmethod
    def _get_category(code: int) -> str:
        """Get category based on status code"""
        if 100 <= code < 200:
            return HTTPStatusCategory.INFORMATIONAL
        elif 200 <= code < 300:
            return HTTPStatusCategory.SUCCESS
        elif 300 <= code < 400:
            return HTTPStatusCategory.REDIRECTION
        elif 400 <= code < 500:
            return HTTPStatusCategory.CLIENT_ERROR
        elif 500 <= code < 600:
            return HTTPStatusCategory.SERVER_ERROR
        return "Unknown"
    
    @staticmethod
    def _get_rfc(code: int) -> Optional[str]:
        """Get RFC information for specific status codes"""
        rfc_map = {
            203: "HTTP/1.1",
            207: "WebDAV; RFC 4918",
            208: "WebDAV; RFC 5842",
            226: "RFC 3229",
            303: "HTTP/1.1",
            305: "HTTP/1.1",
            307: "HTTP/1.1",
            418: "RFC 2324, RFC 7168",
            423: "WebDAV; RFC 4918",
            424: "WebDAV; RFC 4918",
            425: "RFC 8470",
            428: "RFC 6585",
            429: "RFC 6585",
            431: "RFC 6585",
            451: "RFC 7725",
            506: "RFC 2295",
            507: "WebDAV; RFC 4918",
            508: "WebDAV; RFC 5842",
            510: "RFC 2774",
            511: "RFC 6585",
        }
        return rfc_map.get(code)
    
    @staticmethod
    def get_status_by_code(code: int) -> Optional[Dict]:
        """Get status information by code"""
        all_codes = HTTPStatusManager.get_all_status_codes()
        for status in all_codes:
            if status['code'] == code:
                return status
        return None
    
    @staticmethod
    def get_status_by_category(category: str) -> list:
        """Get all status codes in a category"""
        all_codes = HTTPStatusManager.get_all_status_codes()
        return [status for status in all_codes if status['category'] == category]


def create_http_exception(
    status_code: int,
    detail: Optional[str] = None,
    headers: Optional[Dict[str, str]] = None
) -> HTTPException:
    """
    Create an HTTPException with proper status code information
    
    Args:
        status_code: HTTP status code
        detail: Optional custom detail message
        headers: Optional response headers
        
    Returns:
        HTTPException instance
    """
    status_info = HTTPStatusManager.get_status_by_code(status_code)
    
    if not detail and status_info:
        detail = f"{status_info['title']}: {status_info['description']}"
    elif not detail:
        detail = f"HTTP {status_code}"
    
    return HTTPException(
        status_code=status_code,
        detail=detail,
        headers=headers
    )
