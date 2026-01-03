import api from './api';

export const bookingsAPI = {
  getBookings: () => api.get('/bookings/bookings'),
  createBooking: (data: { title: string; description?: string; start_time: string; end_time: string; location?: string }) => api.post('/bookings/bookings', data),
  updateBooking: (id: number, data: { title: string; description?: string; start_time: string; end_time: string; location?: string }) => api.put(`/bookings/bookings/${id}`, data),
  deleteBooking: (id: number) => api.delete(`/bookings/bookings/${id}`),
};
