import api from './axios.js';

export const reviewService = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  addReview:         (productId, data)   => api.post(`/reviews/product/${productId}`, data),
};