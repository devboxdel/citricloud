import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { withCredentials: true }
        );

        const { access_token, user } = response.data;
        useAuthStore.getState().setAuth(user, access_token, refreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = 'https://my.citricloud.com/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Hosting API endpoints
export const hostingAPI = {
  // Servers
  getServers: (params?: { page?: number; page_size?: number }) =>
    apiClient.get('/hosting/servers', { params }).then((res) => res.data),
  
  createServer: (data: {
    name: string;
    plan: string;
    os: string;
    datacenter: string;
  }) => apiClient.post('/hosting/servers', data).then((res) => res.data),
  
  getServer: (id: number) =>
    apiClient.get(`/hosting/servers/${id}`).then((res) => res.data),
  
  deleteServer: (id: number) =>
    apiClient.delete(`/hosting/servers/${id}`).then((res) => res.data),
  
  controlServer: (id: number, action: 'start' | 'stop' | 'restart' | 'reboot') =>
    apiClient.post(`/hosting/servers/${id}/${action}`).then((res) => res.data),

  // VPN
  getVPNs: (params?: { page?: number; page_size?: number }) =>
    apiClient.get('/hosting/vpn', { params }).then((res) => res.data),
  
  createVPN: (data: {
    name: string;
    protocol: string;
    location: string;
  }) => apiClient.post('/hosting/vpn', data).then((res) => res.data),
  
  getVPNConfig: (id: number) =>
    apiClient.get(`/hosting/vpn/${id}/config`).then((res) => res.data),

  // Domains
  getDomains: (params?: { page?: number; page_size?: number }) =>
    apiClient.get('/hosting/domains', { params }).then((res) => res.data),
  
  searchDomain: (domain: string) =>
    apiClient.get(`/hosting/domains/search?domain=${domain}`).then((res) => res.data),
  
  registerDomain: (data: {
    domain: string;
    years: number;
    auto_renew: boolean;
  }) => apiClient.post('/hosting/domains/register', data).then((res) => res.data),
  
  transferDomain: (data: {
    domain: string;
    auth_code: string;
  }) => apiClient.post('/hosting/domains/transfer', data).then((res) => res.data),

  // DNS
  getDNSZones: (params?: { page?: number; page_size?: number }) =>
    apiClient.get('/hosting/dns/zones', { params }).then((res) => res.data),
  
  getDNSRecords: (zoneId: number) =>
    apiClient.get(`/hosting/dns/zones/${zoneId}/records`).then((res) => res.data),
  
  createDNSRecord: (zoneId: number, data: {
    type: string;
    name: string;
    content: string;
    ttl: number;
    priority?: number;
  }) => apiClient.post(`/hosting/dns/zones/${zoneId}/records`, data).then((res) => res.data),
  
  updateDNSRecord: (zoneId: number, recordId: number, data: any) =>
    apiClient.put(`/hosting/dns/zones/${zoneId}/records/${recordId}`, data).then((res) => res.data),
  
  deleteDNSRecord: (zoneId: number, recordId: number) =>
    apiClient.delete(`/hosting/dns/zones/${zoneId}/records/${recordId}`).then((res) => res.data),

  // Email
  getEmailAccounts: (params?: { page?: number; page_size?: number }) =>
    apiClient.get('/hosting/email/accounts', { params }).then((res) => res.data),
  
  createEmailAccount: (data: {
    email: string;
    password: string;
    quota: number;
  }) => apiClient.post('/hosting/email/accounts', data).then((res) => res.data),
  
  getEmailForwarders: (domain: string) =>
    apiClient.get(`/hosting/email/forwarders?domain=${domain}`).then((res) => res.data),

  // WordPress
  getWordPressSites: (params?: { page?: number; page_size?: number }) =>
    apiClient.get('/hosting/wordpress', { params }).then((res) => res.data),
  
  installWordPress: (data: {
    domain: string;
    admin_email: string;
    admin_password: string;
    title: string;
  }) => apiClient.post('/hosting/wordpress/install', data).then((res) => res.data),
  
  getWordPressPlugins: (siteId: number) =>
    apiClient.get(`/hosting/wordpress/${siteId}/plugins`).then((res) => res.data),
  
  updateWordPress: (siteId: number) =>
    apiClient.post(`/hosting/wordpress/${siteId}/update`).then((res) => res.data),

  // Control Panels
  getControlPanels: () =>
    apiClient.get('/hosting/control-panels').then((res) => res.data),
  
  installControlPanel: (data: {
    server_id: number;
    panel_type: string;
  }) => apiClient.post('/hosting/control-panels/install', data).then((res) => res.data),
  
  getControlPanelAccess: (id: number) =>
    apiClient.get(`/hosting/control-panels/${id}/access`).then((res) => res.data),
};

export default apiClient;
