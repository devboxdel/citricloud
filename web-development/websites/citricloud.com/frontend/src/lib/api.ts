import axios from 'axios';

// Resolve API base URL (prefer same-origin). VITE_API_URL can override.
function resolveBaseURL(): string {
  const envBase = import.meta.env.VITE_API_URL || '/api/v1';
  return envBase;
}

const BASE_URL = resolveBaseURL();

// Create axios instance
const api = axios.create({
  // Prefer same-origin proxy; fallback to main domain on app subdomain
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // send cookies for cross-subdomain auth
  timeout: 60000, // 60 second timeout for most requests
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For FormData requests, don't set Content-Type - let axios handle it with proper boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't try to refresh if we're already on the refresh endpoint
      if (originalRequest.url?.includes('/auth/refresh')) {
        // Clear auth data and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        if (!window.location.href.includes('my.citricloud.com/login')) {
          window.location.href = 'https://my.citricloud.com/login';
        }
        return Promise.reject(error);
      }

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        // If no refresh token, clear everything and redirect to login
        if (!refreshToken) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          if (!window.location.href.includes('my.citricloud.com/login')) {
            window.location.href = 'https://my.citricloud.com/login';
          }
          return Promise.reject(error);
        }

        const response = await api.post(
          '/auth/refresh',
          `refresh_token=${encodeURIComponent(refreshToken)}`,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token, refresh_token: newRefreshToken } = response.data;
        if (access_token && newRefreshToken) {
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);
          // Update user info from new token
          try {
            const payload = JSON.parse(atob(access_token.split('.')[1]));
            const user = {
              id: payload.sub,
              email: payload.email,
              username: payload.email.split('@')[0],
              role: payload.role,
              is_active: true,
            };
            localStorage.setItem('user', JSON.stringify(user));
          } catch (e) {}

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } else {
          // No tokens in response, clear and redirect
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          if (!window.location.href.includes('my.citricloud.com/login')) {
            window.location.href = 'https://my.citricloud.com/login';
          }
          return Promise.reject(error);
        }
      } catch (refreshError: any) {
        // Token refresh failed, clear auth and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        if (!window.location.href.includes('my.citricloud.com/login')) {
          window.location.href = 'https://my.citricloud.com/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API functions
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/auth/change-password', data),
  deleteAccount: () => api.delete('/auth/account'),
  
  // Two-Factor Authentication
  verify2FA: (temp_token: string, code: string) => api.post('/auth/verify-2fa', { temp_token, code }),
  enable2FA: () => api.post('/auth/2fa/enable', {}),
  disable2FA: (password: string) => api.post('/auth/2fa/disable', { password }),
  get2FAStatus: () => api.get('/auth/2fa/status'),
  
  // Active Sessions
  getSessions: () => api.get('/auth/sessions'),
  terminateSession: (sessionId: number) => api.post(`/auth/sessions/${sessionId}/terminate`, {}),
  terminateAllOtherSessions: () => api.post('/auth/sessions/terminate-others', {}),
  
  // Notification Settings
  getNotificationSettings: () => api.get('/auth/notification-settings'),
  updateNotificationSettings: (data: any) => api.put('/auth/notification-settings', data),
  
  // User Preferences
  updateLanguagePreference: (language: string) => api.put('/auth/preferences/language', { language }),
  updateDateFormatPreference: (dateFormat: string) => api.put('/auth/preferences/date-format', { date_format: dateFormat }),
  updateTimezonePreference: (timezone: string) => api.put('/auth/preferences/timezone', { timezone }),
  getUserPreferences: () => api.get('/auth/preferences'),
  
  // Password Reset
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, new_password: string) => api.post('/auth/reset-password', { token, new_password }),
};

export const crmAPI = {
  getUsers: (params?: any) => api.get('/crm/users', { params }),
  getUser: (id: number) => api.get(`/crm/users/${id}`),
  createUser: (data: any) => api.post('/crm/users', data),
  updateUser: (id: number, data: any) => api.put(`/crm/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/crm/users/${id}`),
  assignUserRole: (userId: number, roleId: number) => api.put(`/crm/users/${userId}/role/${roleId}`),
  getStats: () => api.get('/crm/stats'),
  
  // Roles
  getRoles: (params?: any) => api.get('/crm/roles', { params }),
  getRole: (id: number) => api.get(`/crm/roles/${id}`),
  createRole: (data: any) => api.post('/crm/roles', data),
  updateRole: (id: number, data: any) => api.put(`/crm/roles/${id}`, data),
  deleteRole: (id: number) => api.delete(`/crm/roles/${id}`),
  initializeRoles: () => api.post('/crm/roles/initialize', {}),
  getRoleUsers: (roleId: number, params?: any) => api.get(`/crm/roles/${roleId}/users`, { params }),
  
  // Messages
  getMessages: (params?: any) => api.get('/crm/messages', { params }),
  getMyMessages: (params?: any) => api.get('/crm/messages/my', { params }),
  getMessage: (id: number) => api.get(`/crm/messages/${id}`),
  createMessage: (data: any) => api.post('/crm/messages', data),
  updateMessageStatus: (id: number, status: string) => api.patch(`/crm/messages/${id}`, { status }),
  deleteMessage: (id: number) => api.delete(`/crm/messages/${id}`),
};

export const profileAPI = {
  getMe: () => api.get('/crm/users/me'),
  updateMe: (data: any) => api.put('/crm/users/me', data),
  updatePreferences: (data: any) => api.put('/crm/users/me/preferences', data),
  getPreferences: () => api.get('/crm/users/me/preferences'),
};

export const cmsAPI = {
  // Pages
  getPages: (params?: any) => api.get('/cms/pages', { params }),
  getPage: (id: number) => api.get(`/cms/pages/${id}`),
  createPage: (data: any) => api.post('/cms/pages', data),
  updatePage: (id: number, data: any) => api.put(`/cms/pages/${id}`, data),
  deletePage: (id: number) => api.delete(`/cms/pages/${id}`),

  // Blog (Admin)
  getBlogPosts: (params?: any) => api.get('/cms/blog/posts', { params }),
  createBlogPost: (data: any) => api.post('/cms/blog/posts', data),
  updateBlogPost: (id: number, data: any) => api.put(`/cms/blog/posts/${id}`, data),
  deleteBlogPost: (id: number) => api.delete(`/cms/blog/posts/${id}`),
  getBlogCategories: () => api.get('/cms/blog/categories'),
  createBlogCategory: (data: any) => api.post('/cms/blog/categories', data),
  updateBlogCategory: (id: number, data: any) => api.put(`/cms/blog/categories/${id}`, data),
  deleteBlogCategory: (id: number) => api.delete(`/cms/blog/categories/${id}`),

  // Blog Comments & Reports
  getBlogComments: (params?: any) => api.get('/cms/blog/comments', { params }),
  updateBlogComment: (id: number, data: any) => api.patch(`/cms/blog/comments/${id}`, data),
  deleteBlogComment: (id: number) => api.delete(`/cms/blog/comments/${id}`),
  submitBlogComment: (data: any) => api.post('/cms/public/blog/comments', data),
  getPublicBlogComments: async (postId: number | string) => {
    try {
      // Preferred endpoint scoped to post
      return await api.get(`/cms/public/blog/posts/${postId}/comments`);
    } catch (error) {
      // Fallback to filtered comments list
      return api.get('/cms/public/blog/comments', { params: { post_id: postId } });
    }
  },
  likePublicBlogComment: async (postId: number | string, commentId: number | string) => {
    try {
      return await api.post(`/cms/public/blog/posts/${postId}/comments/${commentId}/like`);
    } catch (error) {
      return api.post(`/cms/public/blog/comments/${commentId}/like`);
    }
  },
  dislikePublicBlogComment: async (postId: number | string, commentId: number | string) => {
    try {
      return await api.post(`/cms/public/blog/posts/${postId}/comments/${commentId}/dislike`);
    } catch (error) {
      return api.post(`/cms/public/blog/comments/${commentId}/dislike`);
    }
  },
  reportPublicBlogComment: async (postId: number | string, commentId: number | string, reason: string) => {
    try {
      return await api.post(`/cms/public/blog/posts/${postId}/comments/${commentId}/report`, { reason });
    } catch (error) {
      return api.post(`/cms/public/blog/comments/${commentId}/report`, { reason });
    }
  },
  addCommentReaction: (commentId: number | string, emoji: string, userIdentifier: string, platform?: string) => 
    api.post(`/cms/public/blog/comments/${commentId}/reaction`, { 
      emoji, 
      user_identifier: userIdentifier,
      platform: platform || 'web'
    }),
  removeCommentReaction: (commentId: number | string, userIdentifier: string) =>
    api.delete(`/cms/public/blog/comments/${commentId}/reaction`, { params: { user_identifier: userIdentifier } }),
  getUserReaction: (commentId: number | string, userIdentifier: string) =>
    api.get(`/cms/public/blog/comments/${commentId}/user-reaction`, { params: { user_identifier: userIdentifier } }),
  getBlogReports: (params?: any) => api.get('/cms/blog/reports', { params }),
  updateBlogReport: (id: number, data: any) => api.patch(`/cms/blog/reports/${id}`, data),
  submitBlogReport: (data: any) => api.post('/cms/public/blog/reports', data),
  
  // Blog (Public - no auth required)
  getPublicBlogPosts: (params?: any) => api.get('/cms/public/blog/posts', { params }),
  getPublicBlogPost: (id: number) => api.get(`/cms/public/blog/posts/${id}`),
  getPublicBlogPostBySlug: (slug: string) => api.get(`/cms/public/blog/posts/slug/${slug}`),
  getPublicBlogCategories: () => api.get('/cms/public/blog/categories'),

  // Products
  getProducts: (params?: any) => api.get('/cms/products', { params }),
  createProduct: (data: any) => api.post('/cms/products', data),
  updateProduct: (id: number, data: any) => api.put(`/cms/products/${id}`, data),
  getProductCategories: () => api.get('/cms/products/categories'),
  getPublicProductCategories: () => api.get('/cms/public/products/categories'),

  // Menus
  getMenus: () => api.get('/cms/menus'),
  getMenuByLocation: (location: string) => api.get('/cms/menus', { params: { location } }),
  
  // Media
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/cms/media/upload', formData);
  },
  getMedia: () => api.get('/cms/media'),
  deleteMedia: (filename: string) => {
    return api.delete(`/cms/media/${filename}`);
  },
  
  getStats: () => api.get('/cms/stats'),
};

export const erpAPI = {
  // Orders
  getOrders: (params?: any) => api.get('/erp/orders', { params }),
  getOrder: (id: number) => api.get(`/erp/orders/${id}`),
  createOrder: (data: any) => api.post('/erp/orders', data),
  updateOrder: (id: number, data: any) => api.put(`/erp/orders/${id}`, data),
  updateOrderStatus: (id: number, status: string) => api.patch(`/erp/orders/${id}/status`, null, { params: { status } }),
  getMyOrders: (params?: any) => api.get('/erp/my-orders', { params }),

  // Invoices
  getInvoices: (params?: any) => api.get('/erp/invoices', { params }),
  getInvoice: (id: number) => api.get(`/erp/invoices/${id}`),
  createInvoice: (data: any) => api.post('/erp/invoices', data),
  updateInvoice: (id: number, data: any) => api.put(`/erp/invoices/${id}`, data),

  // Tickets
  getTickets: (params?: any) => api.get('/erp/tickets', { params }),
  getTicket: (id: number) => api.get(`/erp/tickets/${id}`),
  createTicket: (data: any) => api.post('/erp/tickets', data),
  updateTicket: (id: number, data: any) => api.put(`/erp/tickets/${id}`, data),
  getMyTickets: (params?: any) => api.get('/erp/my-tickets', { params }),

  // Suppliers
  getSuppliers: (params?: any) => api.get('/erp/suppliers', { params }),
  createSupplier: (data: any) => api.post('/erp/suppliers', data),
  updateSupplier: (id: number, data: any) => api.put(`/erp/suppliers/${id}`, data),

  // Reports
  getReports: (params?: any) => api.get('/erp/reports', { params }),
  generateReport: (data: any) => api.post('/erp/reports', data),

  // Products
  getProducts: (params?: any) => api.get('/erp/products', { params }),
  createProduct: (data: any) => {
    console.warn('🔵 erpAPI.createProduct called with data:', data);
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('❌ No auth token found');
      throw new Error('Not authenticated');
    }
    
    // Decode token to check role
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.warn('✅ Token decoded - Role:', decoded.role, 'Email:', decoded.email);
    } catch (e) {
      console.warn('⚠️ Could not decode token');
    }
    
    // Use resolved base URL for fetch requests
    return fetch(`${BASE_URL}/erp/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        console.warn('✅ Fetch response status:', response.status);
        if (!response.ok) {
          return response.json().then(data => {
              console.warn('❌ Fetch error response:', JSON.stringify(data, null, 2));
              console.warn('❌ Error detail:', data.detail);
              throw new Error(data.detail || data.message || `HTTP ${response.status}`);
            }).catch(jsonError => {
              console.warn('❌ Could not parse error JSON:', jsonError);
              throw new Error(`HTTP ${response.status}`);
          });
        }
        return response.json();
      })
      .then(responseData => {
        console.warn('✅ erpAPI.createProduct response:', responseData);
        return { data: responseData };
      })
      .catch(error => {
        console.warn('❌ erpAPI.createProduct fetch error:', error);
        throw error;
      });
  },
  updateProduct: (id: number, data: any) => {
    console.warn('🔵 erpAPI.updateProduct called with id:', id, 'data:', data);
    
    // Use a fallback direct fetch if axios has issues
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('❌ No auth token found');
      throw new Error('Not authenticated');
    }
    
    // Decode token to check role
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.warn('✅ Token decoded - Role:', decoded.role, 'Email:', decoded.email);
    } catch (e) {
      console.warn('⚠️ Could not decode token');
    }
    
    // Use resolved base URL for fetch requests
    return fetch(`${BASE_URL}/erp/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        console.warn('✅ Fetch response status:', response.status);
        if (!response.ok) {
          return response.json().then(data => {
            console.warn('❌ Fetch error response:', data);
            throw new Error(data.detail || `HTTP ${response.status}`);
          });
        }
        return response.json();
      })
      .then(responseData => {
        console.warn('✅ erpAPI.updateProduct response:', responseData);
        return { data: responseData };
      })
      .catch(error => {
        console.warn('❌ erpAPI.updateProduct fetch error:', error);
        throw error;
      });
  },
  deleteProduct: (id: number | string) => api.delete(`/erp/products/${id}`),

  // Categories
  getCategories: (params?: any) => api.get('/erp/categories', { params }),
  createCategory: (data: any) => api.post('/erp/categories', data),
  updateCategory: (id: number, data: any) => api.put(`/erp/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/erp/categories/${id}`),

  // Stock Management
  getStockLevels: (params?: any) => api.get('/erp/stock', { params }),
  updateStock: (productId: number, payload: { quantity: number; reason?: string; note?: string }) => api.put(`/erp/stock/${productId}`, payload),
  getStockMovements: (params?: any) => api.get('/erp/stock/movements', { params }),
  bulkAdjustStock: (payload: any) => api.post('/erp/stock/bulk-adjust', payload),

  // Image Uploads
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/erp/upload-image', formData, {
      timeout: 120000, // 120 second timeout for file uploads
    });
  },

  getStats: () => api.get('/erp/stats'),
};

export const shopAPI = {
  // Public shop endpoints (no auth required)
  getProducts: (params?: any) => api.get('/shop/products', { params }),
  getProductBySlug: (slug: string) => api.get(`/shop/products/${slug}`),
  getCategories: (params?: any) => api.get('/shop/categories', { params }),
};

export const userAPI = {
  getProfile: () => api.get('/auth/me'),
  getOrders: (params?: any) => api.get('/auth/profile/orders', { params }),
  getInvoices: (params?: any) => api.get('/auth/profile/invoices', { params }),
  getTickets: (params?: any) => api.get('/auth/profile/tickets', { params }),
  getStats: () => api.get('/auth/profile/stats'),
};

export const emailAPI = {
  // Email operations
  getEmails: (params?: {
    folder?: string;
    is_starred?: boolean;
    is_read?: boolean;
    search?: string;
    to_address?: string;
    skip?: number;
    limit?: number;
  }) => api.get('/email/', { params }),
  
  getEmail: (id: number) => api.get(`/email/${id}`),
  
  sendEmail: (data: {
    to_addresses: string[];
    subject: string;
    body_text?: string;
    body_html?: string;
    cc_addresses?: string[];
    bcc_addresses?: string[];
    from_email?: string;
    labels?: string[];
    attachments?: Array<{ filename: string; content_type: string; content_base64: string }>;
  }) => api.post('/email/send', data),
  
  saveDraft: (data: {
    to_addresses: string[];
    subject: string;
    body_text?: string;
    body_html?: string;
    cc_addresses?: string[];
    bcc_addresses?: string[];
    labels?: string[];
  }) => api.post('/email/drafts', data),
  
  updateEmail: (id: number, data: {
    is_read?: boolean;
    is_starred?: boolean;
    is_important?: boolean;
    folder?: string;
    labels?: string[];
  }) => api.patch(`/email/${id}`, data),
  
  deleteEmail: (id: number, permanent: boolean = false) => 
    api.delete(`/email/${id}`, { params: { permanent } }),
  
  replyToEmail: (id: number, data: {
    body_text?: string;
    body_html?: string;
    cc_addresses?: string[];
  }) => api.post(`/email/${id}/reply`, data),
  
  forwardEmail: (id: number, data: {
    to_addresses: string[];
    cc_addresses?: string[];
    body_text?: string;
    body_html?: string;
  }) => api.post(`/email/${id}/forward`, data),
  
  // Email signature
  getSignature: () => api.get('/email/signature'),
  
  saveSignature: (data: {
    signature_html: string;
    signature_text: string;
    is_enabled: boolean;
  }) => api.post('/email/signature', data),
  
  // Folder counts
  getFolderCounts: () => api.get('/email/folders/counts'),
  
  // ========== Advanced Resend API Operations ==========
  
  // Batch send emails
  sendBatchEmails: (emails: Array<{
    to_addresses: string[];
    subject: string;
    body_text?: string;
    body_html?: string;
    cc_addresses?: string[];
    bcc_addresses?: string[];
    labels?: string[];
  }>) => api.post('/email/batch/send', emails),
  
  // Get email details from Resend
  getResendEmailDetails: (resendEmailId: string) => 
    api.get(`/email/resend/${resendEmailId}/details`),
  
  // Reschedule email
  rescheduleEmail: (resendEmailId: string, minutesFromNow: number = 1) => 
    api.post(`/email/resend/${resendEmailId}/reschedule`, null, {
      params: { minutes_from_now: minutesFromNow }
    }),
  
  // Cancel scheduled email
  cancelScheduledEmail: (resendEmailId: string) => 
    api.post(`/email/resend/${resendEmailId}/cancel`),
  
  // List email attachments (sent)
  listEmailAttachments: (resendEmailId: string) => 
    api.get(`/email/resend/${resendEmailId}/attachments`),
  
  // Get attachment details (sent)
  getEmailAttachment: (resendEmailId: string, attachmentId: string) => 
    api.get(`/email/resend/${resendEmailId}/attachments/${attachmentId}`),
  
  // List all sent emails from Resend
  listAllSentEmails: () => api.get('/email/resend/list/all'),
  
  // List received emails
  listReceivedEmails: () => api.get('/email/received/list'),
  
  // Get received email details
  getReceivedEmailDetails: (resendEmailId: string) => 
    api.get(`/email/received/${resendEmailId}`),
  
  // List received email attachments
  listReceivedEmailAttachments: (resendEmailId: string) => 
    api.get(`/email/received/${resendEmailId}/attachments`),
  
  // Get received email attachment
  getReceivedEmailAttachment: (resendEmailId: string, attachmentId: string) => 
    api.get(`/email/received/${resendEmailId}/attachments/${attachmentId}`),
};

export const emailAliasAPI = {
  // List all email aliases for current user
  listAliases: () => api.get('/email-aliases/'),
  
  // Get specific email alias
  getAlias: (aliasId: number) => api.get(`/email-aliases/${aliasId}`),
  
  // Create new email alias
  createAlias: (data: {
    alias: string;
    display_name?: string;
    description?: string;
  }) => api.post('/email-aliases/', data),
  
  // Update email alias
  updateAlias: (aliasId: number, data: {
    display_name?: string;
    description?: string;
    is_active?: boolean;
  }) => api.patch(`/email-aliases/${aliasId}`, data),
  
  // Delete email alias
  deleteAlias: (aliasId: number) => api.delete(`/email-aliases/${aliasId}`),
};

export const sharedEmailAPI = {
  // List all shared emails
  listSharedEmails: () => api.get('/shared-emails/'),
  
  // Get specific shared email
  getSharedEmail: (sharedEmailId: number) => api.get(`/shared-emails/${sharedEmailId}`),
  
  // Create new shared email
  createSharedEmail: (data: {
    email_name: string;
    display_name?: string;
    description?: string;
  }) => api.post('/shared-emails/', data),
  
  // Update shared email
  updateSharedEmail: (sharedEmailId: number, data: {
    display_name?: string;
    description?: string;
    is_active?: boolean;
  }) => api.patch(`/shared-emails/${sharedEmailId}`, data),
  
  // Delete shared email
  deleteSharedEmail: (sharedEmailId: number) => api.delete(`/shared-emails/${sharedEmailId}`),
  
  // Add member to shared email (sends invitation)
  addMember: (sharedEmailId: number, data: {
    user_email: string;
  }) => api.post(`/shared-emails/${sharedEmailId}/members`, data),
  
  // Remove member from shared email
  removeMember: (sharedEmailId: number, userId: number) => 
    api.delete(`/shared-emails/${sharedEmailId}/members/${userId}`),
  
  // Get pending invites for current user
  getPendingInvites: () => api.get('/shared-emails/invites'),
  
  // Accept invite
  acceptInvite: (inviteId: number) => api.post(`/shared-emails/invites/${inviteId}/accept`),
  
  // Decline invite
  declineInvite: (inviteId: number) => api.post(`/shared-emails/invites/${inviteId}/decline`),
  
  // Shared email messaging
  getSharedEmailMessages: (sharedEmailId: number) => api.get(`/shared-emails/${sharedEmailId}/messages`),
  
  sendSharedEmail: (sharedEmailId: number, data: {
    to: string;
    subject: string;
    body: string;
  }) => api.post(`/shared-emails/${sharedEmailId}/send`, data),
  
  // Send batch emails
  sendBatchEmails: (sharedEmailId: number, emails: Array<{
    to: string;
    subject: string;
    body: string;
  }>) => api.post(`/shared-emails/${sharedEmailId}/send-batch`, emails),
  
  // List sent emails from Resend
  listSentEmails: (sharedEmailId: number) => api.get(`/shared-emails/${sharedEmailId}/emails`),
  
  // Update email metadata (folder, starred, read status)
  updateMessageMetadata: (sharedEmailId: number, messageId: number, data: {
    folder?: 'inbox' | 'archived' | 'deleted';
    is_starred?: boolean;
    is_read?: boolean;
  }) => api.patch(`/shared-emails/${sharedEmailId}/messages/${messageId}`, data),
  
  // Permanently delete a message
  deleteMessage: (sharedEmailId: number, messageId: number) => 
    api.delete(`/shared-emails/${sharedEmailId}/messages/${messageId}`),
  
  // Get specific email details
  getEmailDetails: (sharedEmailId: number, emailId: string) => 
    api.get(`/shared-emails/${sharedEmailId}/emails/${emailId}`),
  
  // Update scheduled email
  updateEmail: (sharedEmailId: number, emailId: string, data: { scheduled_at?: string }) => 
    api.patch(`/shared-emails/${sharedEmailId}/emails/${emailId}`, data),
  
  // Cancel scheduled email
  cancelEmail: (sharedEmailId: number, emailId: string) => 
    api.post(`/shared-emails/${sharedEmailId}/emails/${emailId}/cancel`),
  
  // List email attachments
  listEmailAttachments: (sharedEmailId: number, emailId: string) => 
    api.get(`/shared-emails/${sharedEmailId}/emails/${emailId}/attachments`),
  
  // Get specific attachment
  getEmailAttachment: (sharedEmailId: number, emailId: string, attachmentId: string) => 
    api.get(`/shared-emails/${sharedEmailId}/emails/${emailId}/attachments/${attachmentId}`),
};

export const notificationAPI = {
  // Get user notifications
  getNotifications: (params?: { skip?: number; limit?: number; unread_only?: boolean; type?: string; priority?: string }) => 
    api.get('/notifications', { params }),
  
  // Get unread notification count
  getCount: () => api.get('/notifications/count'),
  
  // Get notification statistics
  getStats: () => api.get('/notifications/stats'),
  
  // Get specific notification
  getNotification: (notificationId: number) => api.get(`/notifications/${notificationId}`),
  
  // Create notification
  createNotification: (data: {
    title: string;
    message: string;
    type?: string;
    priority?: string;
    link?: string;
    icon?: string;
    action_label?: string;
    action_url?: string;
    expires_at?: string;
    user_id?: number;
  }) => api.post('/notifications/', data),
  
  // Update notification (mark as read/archived)
  updateNotification: (notificationId: number, data: { is_read?: boolean; is_archived?: boolean }) => 
    api.patch(`/notifications/${notificationId}`, data),
  
  // Mark all as read
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
  
  
  // Delete notification
  deleteNotification: (notificationId: number) => api.delete(`/notifications/${notificationId}`),
  
  // Get notification settings
  getSettings: () => api.get('/notifications/settings/me'),
  
  // Update notification settings
  updateSettings: (data: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    sms_notifications?: boolean;
    notification_types?: string;
    quiet_hours_start?: string;
    quiet_hours_end?: string;
  }) => api.put('/notifications/settings/me', data),
};

// ==================== SRM (Server Resources Management) API ====================
export const srmAPI = {
  // System overview
  getSystemOverview: () => api.get('/srm/system/overview'),
  
  // CPU information
  getCPUUsage: () => api.get('/srm/cpu/usage'),
  
  // Storage information
  getStorageOverview: () => api.get('/srm/storage/overview'),
  
  // Network information
  getNetworkStats: () => api.get('/srm/network/stats'),
  
  // Processes
  getProcesses: (limit: number = 20) => api.get(`/srm/processes?limit=${limit}`),
  
  // Backups
  listBackups: () => api.get('/srm/backups'),
  
  // Snapshots
  listSnapshots: () => api.get('/srm/snapshots'),
  
  // Databases
  listDatabases: () => api.get('/srm/databases'),
  
  // API Endpoints
  listAPIEndpoints: () => api.get('/srm/api-endpoints'),
  
  // Terminal commands
  executeCommand: (command: string) => api.post(`/srm/terminal/execute?command=${encodeURIComponent(command)}`),
  
  // NEW: Caches
  getCachesOverview: () => api.get('/srm/caches/overview'),
  
  // NEW: Domains
  getDomainsOverview: () => api.get('/srm/domains/overview'),
  
  // NEW: IP Address
  getIPAddressOverview: () => api.get('/srm/ipaddress/overview'),
  
  // NEW: SSL/TLS
  getSSLTLSOverview: () => api.get('/srm/ssl-tls/overview'),
  
  // NEW: Performance
  getPerformanceOverview: () => api.get('/srm/performance/overview'),
  
  // NEW: Traffic
  getTrafficOverview: () => api.get('/srm/traffic/overview'),
  
  // NEW: CDN
  getCDNOverview: () => api.get('/srm/cdn/overview'),
};

// ==================== DMS (Document Management System) API ====================
export const dmsAPI = {
  // Files and folders
  getFiles: (params?: { folder_id?: string; type?: string; search?: string }) => 
    api.get('/workspace/drive/items', { params }),
  uploadFile: (formData: FormData) => 
    api.post('/workspace/drive/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  createFolder: (name: string, parent_id?: string) => 
    api.post('/workspace/drive/folder', { name, parent_id }),
  deleteItem: (id: string) => api.delete(`/workspace/drive/items/${id}`),
  renameItem: (id: string, name: string) => 
    api.patch(`/workspace/drive/items/${id}`, { name }),
  moveItem: (id: string, parent_id: string) => 
    api.patch(`/workspace/drive/items/${id}/move`, { parent_id }),
  
  // Shared files
  getSharedFiles: (type?: 'with-me' | 'by-me') => 
    api.get('/workspace/drive/shared', { params: { type } }),
  shareFile: (file_id: string, data: { emails: string[]; permission: 'view' | 'edit' | 'full'; message?: string }) => 
    api.post(`/workspace/drive/items/${file_id}/share`, data),
  updateSharePermission: (share_id: string, permission: 'view' | 'edit' | 'full') => 
    api.patch(`/workspace/drive/shared/${share_id}`, { permission }),
  removeShare: (share_id: string) => api.delete(`/workspace/drive/shared/${share_id}`),
  
  // Activity and recent
  getRecentActivity: (limit: number = 50) => 
    api.get('/workspace/drive/activity', { params: { limit } }),
  getRecentFiles: (limit: number = 10) => 
    api.get('/workspace/drive/recent', { params: { limit } }),
  
  // Storage and stats
  getStorageStats: () => api.get('/workspace/drive/storage'),
  getFileTypeStats: () => api.get('/workspace/drive/stats/file-types'),
  getOverviewStats: () => api.get('/workspace/drive/stats/overview'),
  
  // Star/favorite
  toggleStar: (file_id: string) => api.post(`/workspace/drive/items/${file_id}/star`),
  getStarred: () => api.get('/workspace/drive/starred'),
};

// ========== Invoices API ==========
export const invoicesAPI = {
  // Get all invoices with filtering
  getInvoices: (params?: {
    page?: number;
    page_size?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
    search?: string;
    min_amount?: number;
    max_amount?: number;
  }) => api.get('/invoices', { params }),

  // Get single invoice
  getInvoice: (invoice_id: number) => api.get(`/invoices/${invoice_id}`),

  // Download invoice as PDF
  downloadInvoice: (invoice_id: number) => 
    api.get(`/invoices/${invoice_id}/download`, { responseType: 'blob' }),

  // Mark invoice as paid
  markInvoicePaid: (invoice_id: number) => 
    api.post(`/invoices/${invoice_id}/mark-paid`),

  // Resend invoice email
  resendInvoice: (invoice_id: number) => 
    api.post(`/invoices/${invoice_id}/resend`),

  // Get invoice statistics
  getStatistics: () => api.get('/invoices/statistics/summary'),
};

export const siteSettingsAPI = {
  // Get current site settings
  getSettings: () => api.get('/site-settings'),

  // Update site settings (admin only)
  updateSettings: (data: {
    maintenance_mode?: boolean;
    site_name?: string;
    enable_blog?: boolean;
    enable_shop?: boolean;
    enable_community?: boolean;
    enable_workspace?: boolean;
    dark_mode_default?: boolean;
    logo_url?: string;
    favicon_url?: string;
    primary_color?: string;
    accent_color?: string;
    font_family?: string;
    header_layout?: string;
    footer_layout?: string;
    custom_css?: string;
    custom_js?: string;
  }) => api.put('/site-settings', data),

  // Check if maintenance mode is active (public endpoint)
  checkMaintenance: () => api.get('/site-settings/maintenance'),

  // Toggle maintenance mode (admin only)
  toggleMaintenance: () => api.post('/site-settings/maintenance/toggle'),
};

// Export api instance for direct use
export { api };

