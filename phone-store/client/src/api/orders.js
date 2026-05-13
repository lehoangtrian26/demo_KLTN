import api from './axios';

export const createOrder = (data) => api.post('/orders', data);
export const getMyOrders = (params) => api.get('/orders', { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const cancelOrder = (id, reason) => api.put(`/orders/${id}/cancel`, { reason });

// Return requests
export const createReturnRequest = (data) => api.post('/returns', data);
export const getMyReturns = () => api.get('/returns');
export const getReturnByOrder = (orderId) => api.get(`/returns/order/${orderId}`);
