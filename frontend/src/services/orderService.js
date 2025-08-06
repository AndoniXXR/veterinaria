import api from './api';

export const orderService = {
  // Get sales statistics for admin
  getSalesStats: async () => {
    try {
      const response = await api.get('/orders/admin/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all orders (admin)
  getAllOrders: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const url = queryParams.toString() ? `/orders/admin/all?${queryParams}` : '/orders/admin/all';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user orders
  getUserOrders: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const url = queryParams.toString() ? `/orders?${queryParams}` : '/orders';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get specific order
  getOrder: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create order
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update order status (admin)
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/orders/admin/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      const response = await api.delete(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Process payment
  processPayment: async (orderId, paymentData) => {
    try {
      const response = await api.post(`/orders/${orderId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Confirm payment
  confirmPayment: async (orderId, paymentIntentId) => {
    try {
      const response = await api.post(`/orders/${orderId}/confirm-payment`, { paymentIntentId });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default orderService;