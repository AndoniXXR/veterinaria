import React, { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getUserOrders();
      if (response.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Error al cargar las órdenes');
      toast.error('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'PAID':
        return 'Pagado';
      case 'SHIPPED':
        return 'Enviado';
      case 'DELIVERED':
        return 'Entregado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUserOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mis Órdenes</h1>
          <p className="text-gray-600">Revisa el historial de tus compras</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No has realizado ninguna orden</h2>
            <p className="text-gray-600 mb-6">
              Cuando realices tu primera compra, aparecerá aquí.
            </p>
            <a
              href="/productos"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Ver Productos
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Orden #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Realizada el {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <p className="text-lg font-bold text-gray-800 mt-2">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Productos</h4>
                  <div className="space-y-3">
                    {order.orderItems?.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        {item.product?.image && (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                          />
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-800">
                            {item.product?.name || 'Producto no disponible'}
                          </h5>
                          <p className="text-sm text-gray-600">
                            Cantidad: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.payment && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Método de pago:</span>
                        <span className="font-medium text-gray-800 capitalize">
                          {order.payment.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-gray-600">Estado del pago:</span>
                        <span className={`font-medium ${
                          order.payment.status === 'completed' 
                            ? 'text-green-600' 
                            : order.payment.status === 'pending'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {order.payment.status === 'completed' ? 'Completado' : 
                           order.payment.status === 'pending' ? 'Pendiente' : 'Fallido'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;