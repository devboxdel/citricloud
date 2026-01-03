import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = 'https://my.citricloud.com/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API] Adding auth token to request');
    } else {
      console.log('[API] No auth token available');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Request made and server responded with error status
      console.log('[API] Error response status:', error.response.status);
      console.log('[API] Error response data:', JSON.stringify(error.response.data, null, 2));
      
      // If 401 Unauthorized on protected endpoints (not login/register), clear auth
      if (error.response.status === 401 && !error.config?.url?.includes('/auth/')) {
        console.log('[API] 401 Unauthorized on protected endpoint - clearing auth state');
        useAuthStore.getState().logout();
      }
    } else if (error.request) {
      // Request made but no response received
      console.log('[API] No response received:', error.request);
    } else {
      // Error in request setup
      console.log('[API] Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;
    console.log('[API] Login response:', JSON.stringify(data, null, 2));
    
    // If 2FA is required, return the temp token
    if (data.requires_2fa) {
      console.log('[API] 2FA required, returning temp_token');
      return {
        requires_2fa: true,
        temp_token: data.temp_token
      };
    }
    
    if (!data.access_token) {
      throw new Error('No access token in login response');
    }
    
    // If no user in response, create a minimal user object from email
    if (!data.user) {
      console.log('[API] No user in login response, creating minimal user object');
      data.user = {
        id: 0,
        email: email,
        username: email.split('@')[0],
        full_name: email,
        role: 'user',
        is_active: true,
      };
    }
    
    return data;
  },
  verify2FA: async (temp_token: string, code: string) => {
    const response = await api.post('/auth/verify-2fa', { temp_token, code });
    const data = response.data;
    console.log('[API] 2FA verification response:', JSON.stringify(data, null, 2));
    
    if (!data.access_token) {
      throw new Error('No access token in 2FA verification response');
    }
    
    // If no user in response, create a minimal user object
    if (!data.user) {
      console.log('[API] No user in 2FA response, creating minimal user object from token');
      // Try to decode the JWT to get user info
      try {
        const payload = JSON.parse(atob(data.access_token.split('.')[1]));
        data.user = {
          id: payload.sub || 0,
          email: payload.email || '',
          username: payload.email?.split('@')[0] || 'user',
          full_name: payload.email || 'User',
          role: payload.role || 'user',
          is_active: true,
        };
      } catch (e) {
        console.error('[API] Failed to decode token:', e);
        data.user = {
          id: 0,
          email: '',
          username: 'user',
          full_name: 'User',
          role: 'user',
          is_active: true,
        };
      }
    }
    
    return data;
  },
  register: async (email: string, password: string, username: string) => {
    const response = await api.post('/auth/register', { email, password, username });
    const data = response.data;
    console.log('[API] Register response:', JSON.stringify(data, null, 2));
    
    // If no user in response, create a minimal user object from email
    if (!data.user) {
      console.log('[API] No user in register response, creating minimal user object');
      data.user = {
        id: 0,
        email: email,
        username: username,
        full_name: username,
        role: 'user',
        is_active: true,
      };
    }
    
    if (!data.access_token) {
      throw new Error('Invalid register response: missing access_token');
    }
    
    return data;
  },
  changePassword: async (data: { current_password: string; new_password: string }) => {
    // Prefer primary endpoint; fall back to alternates if needed
    const candidates = [
      { method: 'post', url: '/auth/change-password' },
      { method: 'post', url: '/auth/password/change' },
      { method: 'post', url: '/auth/update-password' },
    ] as const;

    const errors: any[] = [];
    for (const c of candidates) {
      try {
        const response = await api.request({ method: c.method, url: c.url, data });
        return response.data;
      } catch (err: any) {
        errors.push({ url: c.url, status: err?.response?.status, data: err?.response?.data });
      }
    }
    console.error('[API] All change password endpoints failed', JSON.stringify(errors, null, 2));
    throw new Error('Password change not available. Please try again later.');
  },
  getProfile: async () => {
    try {
      const response = await api.get('/crm/users/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Try alternate endpoints
        try {
          const altResponse = await api.get('/auth/me');
          return altResponse.data;
        } catch (e1) {
          try {
            const fallback = await api.get('/auth/profile');
            return fallback.data;
          } catch (e2) {
            console.log('[API] Profile endpoints unavailable');
            return null;
          }
        }
      }
      throw error;
    }
  },
  updateProfile: async (data: Partial<any>) => {
    // Filter to only allowed fields per backend schema
    const payload = {
      full_name: (data as any)?.full_name ?? (data as any)?.name,
      phone: (data as any)?.phone ?? (data as any)?.phone_number,
    };

    const candidates: Array<{ method: 'put' | 'patch'; url: string }> = [
      { method: 'put', url: '/crm/users/me' },
      { method: 'patch', url: '/crm/users/me' },
      { method: 'put', url: '/auth/me' },
      { method: 'put', url: '/auth/profile' },
    ];

    const errors: any[] = [];
    for (const c of candidates) {
      try {
        const response = await api.request({ method: c.method, url: c.url, data: payload });
        return response.data;
      } catch (err: any) {
        errors.push({ url: c.url, status: err?.response?.status, data: err?.response?.data });
      }
    }
    console.error('[API] All profile update endpoints failed', JSON.stringify(errors, null, 2));
    throw new Error('Profile update not available. Please try again later.');
  }
};

export const profileAPI = {
  getStats: async () => {
    try {
      console.log('[API] Fetching profile stats from /auth/profile/stats');
      const response = await api.get('/auth/profile/stats');
      return response.data;
    } catch (error) {
      console.log('[API] Profile stats endpoint unavailable:', error);
      return { orders: 0, invoices: 0, tickets: 0 };
    }
  },
  getLicense: async () => {
    try {
      console.log('[API] Fetching license from /auth/profile/stats');
      const response = await api.get('/auth/profile/stats');
      console.log('[API] License response:', JSON.stringify(response.data, null, 2));
      return response.data?.license || response.data;
    } catch (error) {
      console.log('[API] License endpoint unavailable:', error);
      return null;
    }
  },
  getUsage: async () => {
    try {
      console.log('[API] Fetching usage from /auth/profile/stats');
      const response = await api.get('/auth/profile/stats');
      console.log('[API] Usage response:', JSON.stringify(response.data, null, 2));
      return response.data?.usage || response.data;
    } catch (error) {
      console.log('[API] Usage endpoint unavailable:', error);
      return null;
    }
  },
  updatePreferences: async (data: any) => {
    try {
      console.log('[API] Updating preferences to /crm/users/me/preferences');
      const response = await api.put('/crm/users/me/preferences', data);
      return response.data;
    } catch (error: any) {
      console.log('[API] Update preferences failed:', error?.response?.status);
      // Don't throw - just return null to prevent crashes
      return null;
    }
  },
  getPreferences: async () => {
    try {
      console.log('[API] Fetching preferences from /crm/users/me/preferences');
      const response = await api.get('/crm/users/me/preferences');
      return response.data;
    } catch (error) {
      console.log('[API] Get preferences failed:', error);
      return {};
    }
  },
  getEmailAliases: async () => {
    try {
      console.log('[API] Fetching email aliases from /email-aliases/');
      const response = await api.get('/email-aliases/');
      console.log('[API] Email aliases response:', JSON.stringify(response.data, null, 2));
      return response.data?.aliases || response.data;
    } catch (error) {
      console.log('[API] Email aliases endpoint unavailable:', error);
      return [];
    }
  },
  createEmailAlias: async (alias: string, forwardTo: string) => {
    const response = await api.post('/email-aliases/', { 
      alias, 
      display_name: alias,
      description: `Forwarding to ${forwardTo}`
    });
    return response.data;
  },
  getProducts: async () => {
    try {
      console.log('[API] Fetching products from /shop/products?owned=true');
      const response = await api.get('/shop/products?owned=true');
      console.log('[API] Products response:', JSON.stringify(response.data, null, 2));
      return response.data?.items || response.data;
    } catch (error) {
      console.log('[API] Products endpoint unavailable:', error);
      return [];
    }
  },
  getOrders: async () => {
    try {
      console.log('[API] Fetching orders from /auth/profile/orders');
      const response = await api.get('/auth/profile/orders');
      console.log('[API] Orders response:', JSON.stringify(response.data, null, 2));
      return response.data?.items || response.data;
    } catch (error: any) {
      // Fallback to ERP my-orders if profile endpoint fails (e.g., 500)
      try {
        console.log('[API] Falling back to /erp/my-orders');
        const alt = await api.get('/erp/my-orders');
        return alt.data?.items || alt.data || [];
      } catch (e2) {
        console.log('[API] Orders endpoint unavailable:', e2);
        return [];
      }
    }
  },
  getInvoices: async () => {
    try {
      console.log('[API] Fetching invoices from /auth/profile/invoices');
      const response = await api.get('/auth/profile/invoices');
      console.log('[API] Invoices response:', JSON.stringify(response.data, null, 2));
      return response.data?.items || response.data;
    } catch (error: any) {
      // Fallback to ERP invoices if profile endpoint fails
      try {
        console.log('[API] Falling back to /erp/invoices');
        const alt = await api.get('/erp/invoices');
        return alt.data?.items || alt.data || [];
      } catch (e2) {
        console.log('[API] Invoices endpoint unavailable:', e2);
        return [];
      }
    }
  },
  getPaymentMethods: async () => {
    // Not implemented on backend yet
    console.log('[API] Payment methods not implemented');
    return [];
  },
  createPaymentMethod: async (data: any) => {
    console.log('[API] Create payment method not implemented');
    throw new Error('Payment methods are not available yet.');
  },
  getSubscriptions: async () => {
    // Subscriptions endpoint not yet available on backend
    console.log('[API] Subscriptions not yet implemented');
    return [];
  },
  getTickets: async () => {
    try {
      // Try primary endpoint first
      console.log('[API] Fetching tickets from /erp/tickets');
      const response = await api.get('/erp/tickets');
      console.log('[API] Tickets response:', JSON.stringify(response.data, null, 2));
      return response.data?.items || response.data;
    } catch (error: any) {
      console.log('[API] /erp/tickets failed, trying alternative endpoints');
      
      // Try alternate endpoint
      try {
        console.log('[API] Trying /support/tickets');
        const response = await api.get('/support/tickets');
        console.log('[API] Support tickets response:', JSON.stringify(response.data, null, 2));
        return response.data?.items || response.data;
      } catch (e1) {
        try {
          console.log('[API] Trying /auth/profile/tickets');
          const response = await api.get('/auth/profile/tickets');
          console.log('[API] Profile tickets response:', JSON.stringify(response.data, null, 2));
          return response.data?.items || response.data;
        } catch (e2) {
          console.log('[API] All ticket endpoints failed:', error);
          return [];
        }
      }
    }
  },
  createTicket: async (subject: string, message: string, priority?: string) => {
    try {
      // Try primary endpoint first
      console.log('[API] Creating ticket on /erp/tickets');
      const response = await api.post('/erp/tickets', { 
        subject, 
        description: message, 
        priority 
      });
      console.log('[API] Ticket created successfully:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.log('[API] /erp/tickets creation failed, trying alternative endpoints');
      
      // Try alternate endpoint
      try {
        console.log('[API] Trying /support/tickets');
        const response = await api.post('/support/tickets', { 
          subject, 
          description: message, 
          priority 
        });
        console.log('[API] Ticket created on /support/tickets:', JSON.stringify(response.data, null, 2));
        return response.data;
      } catch (e1) {
        try {
          console.log('[API] Trying /auth/profile/tickets');
          const response = await api.post('/auth/profile/tickets', { 
            subject, 
            description: message, 
            priority 
          });
          console.log('[API] Ticket created on /auth/profile/tickets:', JSON.stringify(response.data, null, 2));
          return response.data;
        } catch (e2) {
          console.log('[API] All ticket creation endpoints failed');
          throw error; // Throw original error
        }
      }
    }
  },
  deleteTicket: async (ticketId: number) => {
    try {
      // Try primary endpoint first
      console.log('[API] Deleting ticket from /erp/tickets/' + ticketId);
      const response = await api.delete(`/erp/tickets/${ticketId}`);
      console.log('[API] Ticket deleted successfully:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.log('[API] /erp/tickets delete failed, trying alternative endpoints');
      
      // Try alternate endpoint
      try {
        console.log('[API] Trying /support/tickets/' + ticketId);
        const response = await api.delete(`/support/tickets/${ticketId}`);
        console.log('[API] Ticket deleted on /support/tickets:', JSON.stringify(response.data, null, 2));
        return response.data;
      } catch (e1) {
        try {
          console.log('[API] Trying /auth/profile/tickets/' + ticketId);
          const response = await api.delete(`/auth/profile/tickets/${ticketId}`);
          console.log('[API] Ticket deleted on /auth/profile/tickets:', JSON.stringify(response.data, null, 2));
          return response.data;
        } catch (e2) {
          console.log('[API] All ticket deletion endpoints failed');
          throw error; // Throw original error
        }
      }
    }
  },
};

export const blogAPI = {
  getPosts: async (categoryId?: number | null) => {
    try {
      const params = categoryId ? `?page=1&page_size=50&category_id=${categoryId}` : '?page=1&page_size=50';
      const response = await api.get(`/cms/public/blog/posts${params}`);
      // Backend returns paginated response with items array
      const data = response.data;
      return {
        items: Array.isArray(data) ? data : (data?.items || data?.posts || []),
        ...data
      };
    } catch (error) {
      console.log('[API] Internal blog endpoint failed:', error);
      try {
        const params = categoryId ? `?page=1&page_size=50&category_id=${categoryId}` : '?page=1&page_size=50';
        const response = await axios.get(`https://blog.citricloud.com/api/posts${params}`, {
          headers: { Accept: 'application/json' },
        });
        const data = response.data;
        return {
          items: Array.isArray(data) ? data : (data?.items || data?.posts || []),
          ...data
        };
      } catch (e) {
        console.log('[API] Blog posts endpoint unavailable');
        return { items: [] };
      }
    }
  },
  getCategories: async () => {
    try {
      const response = await api.get('/cms/public/blog/categories');
      return Array.isArray(response.data) ? response.data : (response.data?.items || []);
    } catch (error) {
      console.log('[API] Blog categories endpoint unavailable');
      return [];
    }
  },
  getPost: async (id: string | number) => {
    // Prefer public CMS endpoint for a single post by ID
    try {
      const response = await api.get(`/cms/public/blog/posts/${id}`);
      return response.data;
    } catch (error) {
      try {
        const response = await axios.get(`https://blog.citricloud.com/api/posts/${id}`, {
          headers: { Accept: 'application/json' },
        });
        return response.data;
      } catch (e) {
        console.log('[API] Blog post endpoint unavailable');
        return null;
      }
    }
  },
    // Comment endpoints
    getComments: async (postId: string | number) => {
      try {
        // Try the modern endpoint first
        const response = await api.get(`/cms/public/blog/posts/${postId}/comments`);
        return Array.isArray(response.data) ? response.data : (response.data?.items || []);
      } catch (error) {
        try {
          // Fallback to filtered endpoint
          const response = await api.get('/cms/public/blog/comments', { params: { post_id: postId } });
          const items = response.data?.items || response.data;
          return Array.isArray(items) ? items : [];
        } catch (e) {
          console.log('[API] Blog comments endpoint unavailable');
          return [];
        }
      }
    },
    createComment: async (postId: string | number, content: string, platform?: string) => {
      try {
        const response = await api.post('/cms/public/blog/comments', { 
          post_id: postId, 
          content,
          platform: platform || 'mobile'
        });
        return response.data;
      } catch (error) {
        console.log('[API] Failed to create comment:', error);
        throw error;
      }
    },
    deleteComment: async (postId: string | number, commentId: number) => {
      try {
        await api.delete(`/cms/public/blog/posts/${postId}/comments/${commentId}`);
        return true;
      } catch (error) {
        try {
          await api.delete(`/cms/public/blog/comments/${commentId}`);
          return true;
        } catch (e) {
          console.log('[API] Failed to delete comment:', error);
          throw error;
        }
      }
    },
    likeComment: async (postId: string | number, commentId: number) => {
      try {
        const response = await api.post(`/cms/public/blog/posts/${postId}/comments/${commentId}/like`);
        return response.data;
      } catch (error) {
        try {
          const response = await api.post(`/cms/public/blog/comments/${commentId}/like`);
          return response.data;
        } catch (e) {
          console.log('[API] Failed to like comment:', error);
          throw error;
        }
      }
    },
    dislikeComment: async (postId: string | number, commentId: number) => {
      try {
        const response = await api.post(`/cms/public/blog/posts/${postId}/comments/${commentId}/dislike`);
        return response.data;
      } catch (error) {
        try {
          const response = await api.post(`/cms/public/blog/comments/${commentId}/dislike`);
          return response.data;
        } catch (e) {
          console.log('[API] Failed to dislike comment:', error);
          throw error;
        }
      }
    },
    reportComment: async (postId: string | number, commentId: number, reason: string) => {
      try {
        const response = await api.post(`/cms/public/blog/posts/${postId}/comments/${commentId}/report`, { reason });
        return response.data;
      } catch (error) {
        console.log('[API] Failed to report comment:', error);
        throw error;
      }
    },
};

export const erpAPI = {
  createOrder: async (data: any) => {
    const response = await api.post('/erp/orders', data);
    return response.data;
  },
};

export const shopAPI = {
  getProducts: async (categoryId?: number | null) => {
    try {
      const params = categoryId ? `?page=1&page_size=100&category_id=${categoryId}` : '?page=1&page_size=100';
      const response = await api.get(`/shop/products${params}`);
      // Backend returns paginated response with items array
      const data = response.data;
      return {
        items: Array.isArray(data) ? data : (data?.items || data?.products || []),
        ...data
      };
    } catch (error) {
      console.log('[API] Internal shop endpoint failed:', error);
      try {
        const params = categoryId ? `?page=1&page_size=100&category_id=${categoryId}` : '?page=1&page_size=100';
        const response = await axios.get(`https://shop.citricloud.com/api/products${params}`, {
          headers: { Accept: 'application/json' },
        });
        const data = response.data;
        return {
          items: Array.isArray(data) ? data : (data?.items || data?.products || []),
          ...data
        };
      } catch (e) {
        console.log('[API] Shop products endpoint unavailable');
        return { items: [] };
      }
    }
  },
  getCategories: async () => {
    try {
      const response = await api.get('/shop/categories?page_size=100');
      return Array.isArray(response.data) ? response.data : (response.data?.items || []);
    } catch (error) {
      console.log('[API] Shop categories endpoint unavailable');
      return [];
    }
  },
  getProduct: async (id: string) => {
    try {
      const response = await api.get(`/shop/products/${id}`);
      return response.data;
    } catch (error) {
      try {
        const response = await axios.get(`https://shop.citricloud.com/api/products/${id}`, {
          headers: { Accept: 'application/json' },
        });
        return response.data;
      } catch (e) {
        console.log('[API] Shop product endpoint unavailable');
        return null;
      }
    }
  },
  getProductBySlug: async (slug: string) => {
    try {
      const response = await api.get(`/shop/products/${slug}`);
      return response.data;
    } catch (error) {
      try {
        const response = await axios.get(`https://shop.citricloud.com/api/products/${slug}`, {
          headers: { Accept: 'application/json' },
        });
        return response.data;
      } catch (e) {
        console.log('[API] Shop product by slug endpoint unavailable');
        return null;
      }
    }
  },
  purchaseProduct: async (productId: string, quantity: number = 1) => {
    const response = await api.post('/shop/orders', { product_id: productId, quantity });
    return response.data;
  },
};

export const crmAPI = {
  getRoles: async (params?: any) => {
    const response = await api.get('/crm/roles', { params });
    return response.data;
  },
  getMyMessages: async (params?: { status_filter?: string; page?: number; page_size?: number }) => {
    const response = await api.get('/crm/messages/my', { params });
    return response.data;
  },
  getMessage: async (id: number) => {
    const response = await api.get(`/crm/messages/${id}`);
    return response.data;
  },
  updateMessageStatus: async (id: number, status: string) => {
    const response = await api.patch(`/crm/messages/${id}`, { status });
    return response.data;
  },
  deleteMessage: async (id: number) => {
    const response = await api.delete(`/crm/messages/${id}`);
    return response.data;
  },
};

export const securityAPI = {
  // Two-Factor Authentication
  get2FAStatus: async () => {
    try {
      const response = await api.get('/auth/2fa/status');
      return response.data;
    } catch (error) {
      console.log('[API] 2FA status endpoint unavailable:', error);
      return { enabled: false };
    }
  },
  enable2FA: async () => {
    try {
      const response = await api.post('/auth/2fa/enable');
      return response.data;
    } catch (error) {
      console.log('[API] Enable 2FA endpoint unavailable:', error);
      throw error;
    }
  },
  verify2FASetup: async (code: string) => {
    try {
      const response = await api.post('/auth/2fa/verify-setup', { code });
      return response.data;
    } catch (error) {
      console.log('[API] Verify 2FA setup endpoint unavailable:', error);
      throw error;
    }
  },
  disable2FA: async (code: string) => {
    try {
      const response = await api.post('/auth/2fa/disable', { code });
      return response.data;
    } catch (error) {
      console.log('[API] Disable 2FA endpoint unavailable:', error);
      throw error;
    }
  },
  
  // Active Sessions
  getSessions: async () => {
    try {
      const response = await api.get('/auth/sessions');
      return response.data;
    } catch (error) {
      console.log('[API] Sessions endpoint unavailable:', error);
      return [];
    }
  },
  revokeSession: async (sessionId: string) => {
    try {
      const response = await api.delete(`/auth/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.log('[API] Revoke session endpoint unavailable:', error);
      throw error;
    }
  },
  revokeAllSessions: async () => {
    try {
      const response = await api.post('/auth/sessions/revoke-all');
      return response.data;
    } catch (error) {
      console.log('[API] Revoke all sessions endpoint unavailable:', error);
      throw error;
    }
  },
};
