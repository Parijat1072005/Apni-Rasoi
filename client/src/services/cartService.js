import api from './axios.js';

export const cartService = {
  getCart:        ()           => api.get('/cart'),
  addItem:        (data)       => api.post('/cart/add', data),
  updateItem:     (id, data)   => api.put(`/cart/item/${id}`, data),
  removeItem:     (id)         => api.delete(`/cart/item/${id}`),
  clearCart:      ()           => api.delete('/cart/clear'),
  applyCoupon:    (data)       => api.post('/cart/coupon', data),
  removeCoupon:   ()           => api.delete('/cart/coupon'),
};