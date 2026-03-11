import api from './axios.js';

export const productService = {
  getAll:    (params) => api.get('/products', { params }),
  getBySlug: (slug)   => api.get(`/products/${slug}`),
  getRelated:(id)     => api.get(`/products/${id}/related`),
};