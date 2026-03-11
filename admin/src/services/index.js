import api from './axios.js';

export const authService = {
  login:  (data) => api.post('/auth/login', data),
  logout: ()     => api.post('/auth/logout'),
  getMe:  ()     => api.get('/auth/me'),
};

export const dashboardService = {
  getStats: () => api.get('/orders/admin/stats'),
};

export const productService = {
  getAll:       (params) => api.get('/products/admin/all', { params }),
  getBySlug:    (slug)   => api.get(`/products/${slug}`),
  create:       (data)   => api.post('/products', data),
  update:       (id, data) => api.put(`/products/${id}`, data),
  delete:       (id)     => api.delete(`/products/${id}`),
  updateStock:  (id, data) => api.patch(`/products/${id}/stock`, data),
};

export const categoryService = {
  getAll:   (params) => api.get('/categories', { params }),
  create:   (data)   => api.post('/categories', data),
  update:   (id, data) => api.put(`/categories/${id}`, data),
  delete:   (id)     => api.delete(`/categories/${id}`),
};

export const orderService = {
  getAll:        (params) => api.get('/orders/admin/all', { params }),
  getById:       (id)     => api.get(`/orders/${id}`),
  updateStatus:  (id, data) => api.patch(`/orders/admin/${id}/status`, data),
};

export const userService = {
  getAll:       (params) => api.get('/users', { params }),
  getById:      (id)     => api.get(`/users/${id}`),
  updateRole:   (id, role) => api.patch(`/users/${id}/role`, { role }),
  blockUser:    (id)     => api.patch(`/users/${id}/block`),
};

export const reviewService = {
  getAll:         (params) => api.get('/reviews/admin/all', { params }),
  updateStatus:   (id, isApproved) => api.patch(`/reviews/admin/${id}/status`, { isApproved }),
  delete:         (id)     => api.delete(`/reviews/admin/${id}`),
};

export const couponService = {
  getAll:   (params) => api.get('/coupons/admin', { params }),
  create:   (data)   => api.post('/coupons/admin', data),
  update:   (id, data) => api.put(`/coupons/admin/${id}`, data),
  delete:   (id)     => api.delete(`/coupons/admin/${id}`),
};