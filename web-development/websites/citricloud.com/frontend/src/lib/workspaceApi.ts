import api from './api';

export const workspaceAPI = {
  getItems: (app?: string, key?: string) => api.get('/workspace/items', { params: { app, key } }),
  createOrUpdateItem: (data: { app_name: string; item_key: string; data: any }) => api.post('/workspace/items', data),
  updateItem: (id: number, data: any) => api.put(`/workspace/items/${id}`, { data }),
  deleteItem: (id: number) => api.delete(`/workspace/items/${id}`),
};
