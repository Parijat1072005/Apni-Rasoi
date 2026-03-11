import api from './axios.js';

export const categoryService = {
  getAll:     (params) => api.get('/categories', { params }),
  getBySlug:  (slug)   => api.get(`/categories/${slug}`),
  getSeasonal:()       => api.get('/categories/seasonal'),
};