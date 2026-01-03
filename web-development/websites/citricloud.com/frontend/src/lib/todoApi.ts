import api from './api';

export const todoAPI = {
  getTodos: () => api.get('/todos/todos'),
  createTodo: (data: { text: string; done?: boolean }) => api.post('/todos/todos', data),
  updateTodo: (id: number, data: { text: string; done: boolean }) => api.put(`/todos/todos/${id}`, data),
  deleteTodo: (id: number) => api.delete(`/todos/todos/${id}`),
};
