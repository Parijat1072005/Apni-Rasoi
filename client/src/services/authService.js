import api from './axios.js';

export const authService = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  logout:         ()     => api.post('/auth/logout'),
  getMe:          ()     => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (token, data) => api.post(`/auth/reset-password/${token}`, data),
  changePassword: (data) => api.post('/auth/change-password', data),
  refreshToken:   ()     => api.post('/auth/refresh'),
};