import api from './axios';

export const createOrder = (data) => api.post('/orders', data);
export const getMyOrders = (params) => api.get('/orders', { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const cancelOrder = (id, reason) => api.put(`/orders/${id}/cancel`, { reason });
