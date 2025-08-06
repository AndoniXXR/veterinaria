import api from './api';

class PaymentService {
  // Crear una orden
  async createOrder(items) {
    try {
      const response = await api.post('/orders', { items });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Procesar el pago de una orden
  async processPayment(orderId, paymentMethod = 'card') {
    try {
      const response = await api.post(`/orders/${orderId}/payment`, { 
        paymentMethod 
      });
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Confirmar el pago después de que Stripe lo procese
  async confirmOrderPayment(orderId, paymentIntentId) {
    try {
      const response = await api.post(`/orders/${orderId}/confirm-payment`, {
        paymentIntentId
      });
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  // Obtener órdenes del usuario
  async getUserOrders(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/orders?${queryString}` : '/orders';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  // Obtener una orden específica
  async getOrder(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Cancelar una orden
  async cancelOrder(orderId) {
    try {
      const response = await api.delete(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }
}

export default new PaymentService();