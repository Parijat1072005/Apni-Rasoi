import api from './axios.js';

export const orderService = {
  createRazorpayOrder: ()           => api.post('/orders/razorpay'),
  placeOrder:          (data)       => api.post('/orders/place', data),
  getMyOrders:         (params)     => api.get('/orders/my', { params }),
  getById:             (id)         => api.get(`/orders/${id}`),
  cancelOrder:         (id, data)   => api.patch(`/orders/${id}/cancel`, data),
};