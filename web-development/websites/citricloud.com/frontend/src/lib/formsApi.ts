import api from './api';

export const formsAPI = {
  // Backend forms router uses nested path: /api/v1/forms/forms
  getForms: () => api.get('/forms/forms'),
  createForm: (data: any) => api.post('/forms/forms', data),
  updateForm: (id: number, data: any) => api.put(`/forms/forms/${id}`, data),
  deleteForm: (id: number) => api.delete(`/forms/forms/${id}`),
  addQuestion: (formId: number, data: any) => api.post(`/forms/forms/${formId}/questions`, data),
  updateQuestion: (formId: number, questionId: number, data: any) => api.put(`/forms/forms/${formId}/questions/${questionId}`, data),
  deleteQuestion: (formId: number, questionId: number) => api.delete(`/forms/forms/${formId}/questions/${questionId}`),
};
