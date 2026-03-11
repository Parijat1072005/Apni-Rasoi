import api from './axios.js';

export const userService = {
  getProfile:        ()           => api.get('/users/profile'),
  updateProfile:     (data)       => api.put('/users/profile', data),
  updateAvatar:      (data)       => api.post('/users/avatar', data),
  getWishlist:       ()           => api.get('/users/wishlist'),
  toggleWishlist:    (productId)  => api.post(`/users/wishlist/${productId}`),
  addAddress:        (data)       => api.post('/users/address', data),
  updateAddress:     (id, data)   => api.put(`/users/address/${id}`, data),
  deleteAddress:     (id)         => api.delete(`/users/address/${id}`),
  setDefaultAddress: (id)         => api.patch(`/users/address/${id}/default`),
};