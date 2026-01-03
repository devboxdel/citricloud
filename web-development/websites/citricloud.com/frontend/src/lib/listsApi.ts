import api from './api';

export const listsAPI = {
  getLists: () => api.get('/lists/lists'),
  createList: (data: { name: string }) => api.post('/lists/lists', data),
  updateList: (id: number, data: { name: string }) => api.put(`/lists/lists/${id}`, data),
  deleteList: (id: number) => api.delete(`/lists/lists/${id}`),
  addItem: (listId: number, data: { text: string; checked?: boolean; priority?: string }) => api.post(`/lists/lists/${listId}/items`, data),
  updateItem: (listId: number, itemId: number, data: { text: string; checked: boolean; priority?: string }) => api.put(`/lists/lists/${listId}/items/${itemId}`, data),
  deleteItem: (listId: number, itemId: number) => api.delete(`/lists/lists/${listId}/items/${itemId}`),
};
