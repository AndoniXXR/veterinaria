import React, { useState, useEffect } from 'react';
import { FiPackage, FiTruck, FiCheck, FiX, FiEye, FiSearch, FiFilter } from 'react-icons/fi';
import Modal, { ModalBody, ModalFooter } from '../common/Modal';
import orderService from '../../services/orderService';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      // Note: search functionality would need to be implemented in backend
      
      const response = await orderService.getAllOrders(params);
      if (response.success) {
        setOrders(response.data.orders);
      } else {
        toast.error('Error al cargar órdenes');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Load orders on component mount and when filters change
  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const statusOptions = [
    { value: 'all', label: 'Todos', count: orders.length },
    { value: 'PENDING', label: 'Pendientes', count: orders.filter(o => o.status === 'PENDING').length },
    { value: 'PROCESSING', label: 'Procesando', count: orders.filter(o => o.status === 'PROCESSING').length },
    { value: 'SHIPPED', label: 'Enviados', count: orders.filter(o => o.status === 'SHIPPED').length },
    { value: 'DELIVERED', label: 'Entregados', count: orders.filter(o => o.status === 'DELIVERED').length }
  ];

  const filteredOrders = orders.filter(order => {
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    const searchMatch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user?.email && order.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return statusMatch && searchMatch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PROCESSING': 'bg-blue-100 text-blue-800 border-blue-200',
      'SHIPPED': 'bg-purple-100 text-purple-800 border-purple-200',
      'DELIVERED': 'bg-green-100 text-green-800 border-green-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-neutral-100 text-neutral-800 border-neutral-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'Pendiente',
      'PROCESSING': 'Procesando',
      'SHIPPED': 'Enviado',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'PENDING': FiPackage,
      'PROCESSING': FiPackage,
      'SHIPPED': FiTruck,
      'DELIVERED': FiCheck,
      'CANCELLED': FiX
    };
    return icons[status] || FiPackage;
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleUpdateStatus = async (order, newStatus) => {
    try {
      setUpdating(true);
      const response = await orderService.updateOrderStatus(order.id, newStatus);
      
      if (response.success) {
        toast.success(`Orden actualizada a ${getStatusLabel(newStatus)}`);
        await fetchOrders(); // Refresh orders list
      } else {
        toast.error('Error al actualizar la orden');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error al actualizar la orden');
    } finally {
      setUpdating(false);
    }
  };

  const closeModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalRevenue = () => {
    return orders
      .filter(order => order.status === 'DELIVERED')
      .reduce((sum, order) => sum + order.total, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Gestión de Órdenes
          </h2>
          <p className="text-neutral-600">
            Administra y procesa todas las órdenes de compra.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FiPackage className="text-blue-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-neutral-900">{orders.length}</div>
            <div className="text-sm text-neutral-600">Órdenes Totales</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FiPackage className="text-yellow-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {orders.filter(o => o.status === 'PENDING').length}
            </div>
            <div className="text-sm text-neutral-600">Pendientes</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FiTruck className="text-purple-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {orders.filter(o => o.status === 'SHIPPED').length}
            </div>
            <div className="text-sm text-neutral-600">En Tránsito</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FiCheck className="text-green-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {formatPrice(getTotalRevenue())}
            </div>
            <div className="text-sm text-neutral-600">Ingresos</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por número de orden, cliente o email..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                statusFilter === option.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {option.label}
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                statusFilter === option.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-200 text-neutral-600'
              }`}>
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-neutral-600">Cargando órdenes...</span>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            
            return (
              <div key={order.id} className="card">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="text-neutral-600" size={20} />
                          <h3 className="font-semibold text-neutral-900">
                            Orden #{order.id}
                          </h3>
                        </div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Customer Info */}
                        <div>
                          <h4 className="font-medium text-neutral-900 mb-1">Cliente</h4>
                          <p className="text-sm text-neutral-600">{order.user?.name || 'N/A'}</p>
                          <p className="text-sm text-neutral-600">{order.user?.email || 'N/A'}</p>
                          <p className="text-sm text-neutral-600">{order.user?.phone || 'N/A'}</p>
                        </div>

                        {/* Order Details */}
                        <div>
                          <h4 className="font-medium text-neutral-900 mb-1">Detalles</h4>
                          <p className="text-sm text-neutral-600">
                            {order.orderItems?.length || 0} producto{(order.orderItems?.length || 0) !== 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-neutral-600">
                            Total: {formatPrice(order.total)}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>

                        {/* Status Info */}
                        <div>
                          <h4 className="font-medium text-neutral-900 mb-1">Estado</h4>
                          <p className="text-sm text-neutral-600">
                            Pago: {order.payment?.status || 'Pendiente'}
                          </p>
                          <p className="text-sm text-neutral-600">
                            Método: {order.payment?.paymentMethod || 'N/A'}
                          </p>
                          {order.status === 'DELIVERED' && order.deliveredAt ? (
                            <p className="text-sm text-green-600">
                              Entregado: {formatDate(order.deliveredAt)}
                            </p>
                          ) : (
                            <p className="text-sm text-neutral-600">
                              Estado: {getStatusLabel(order.status)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="btn btn-outline btn-sm flex items-center"
                      >
                        <FiEye className="mr-1" size={14} />
                        Ver
                      </button>
                      
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(order, 'PROCESSING')}
                          className="btn btn-primary btn-sm"
                        >
                          Procesar
                        </button>
                      )}
                      
                      {order.status === 'PROCESSING' && (
                        <button
                          onClick={() => handleUpdateStatus(order, 'SHIPPED')}
                          className="btn btn-primary btn-sm"
                        >
                          Enviar
                        </button>
                      )}
                      
                      {order.status === 'SHIPPED' && (
                        <button
                          onClick={() => handleUpdateStatus(order, 'DELIVERED')}
                          className="btn btn-primary btn-sm"
                        >
                          Marcar Entregado
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-8xl mb-6">📦</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">
            No se encontraron órdenes
          </h3>
          <p className="text-neutral-600">
            {searchTerm ? 'Intenta ajustar los términos de búsqueda.' : 'Aún no hay órdenes registradas.'}
          </p>
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={closeModal}
        title={`Orden #${selectedOrder?.id}`}
        size="lg"
      >
        <ModalBody>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusLabel(selectedOrder.status)}
                </div>
                <div className="text-sm text-neutral-500">
                  {formatDate(selectedOrder.createdAt)}
                </div>
              </div>

              {/* Customer Info */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">Información del Cliente</h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-neutral-700">Nombre:</span>
                      <p>{selectedOrder.user?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Email:</span>
                      <p>{selectedOrder.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Teléfono:</span>
                      <p>{selectedOrder.user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">Información de Pago</h3>
                </div>
                <div className="card-body text-sm">
                  <p><span className="font-medium">Estado del pago:</span> {selectedOrder.payment?.status || 'Pendiente'}</p>
                  <p><span className="font-medium">Método de pago:</span> {selectedOrder.payment?.paymentMethod || 'N/A'}</p>
                  <p><span className="font-medium">Monto:</span> {formatPrice(selectedOrder.payment?.amount || selectedOrder.total)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">Productos</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    {selectedOrder.orderItems?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900">{item.product?.name || 'Producto N/A'}</p>
                          <p className="text-sm text-neutral-600">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</p>
                          <p className="text-sm text-neutral-600">{formatPrice(item.unitPrice)} c/u</p>
                        </div>
                      </div>
                    )) || <p className="text-neutral-500">No hay items disponibles</p>}
                  </div>
                  
                  <div className="border-t border-neutral-200 pt-4 mt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-primary-600">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Order Info */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">Información Adicional</h3>
                </div>
                <div className="card-body text-sm">
                  <p><span className="font-medium">Fecha de creación:</span> {formatDate(selectedOrder.createdAt)}</p>
                  <p><span className="font-medium">Última actualización:</span> {formatDate(selectedOrder.updatedAt)}</p>
                  {selectedOrder.status === 'DELIVERED' && selectedOrder.deliveredAt && (
                    <p><span className="font-medium">Fecha de entrega:</span> {formatDate(selectedOrder.deliveredAt)}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        
        <ModalFooter>
          <button onClick={closeModal} className="btn btn-outline">
            Cerrar
          </button>
          {selectedOrder && selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLED' && (
            <div className="flex space-x-2">
              {selectedOrder.status === 'PENDING' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder, 'PROCESSING')}
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? 'Procesando...' : 'Procesar Orden'}
                </button>
              )}
              {selectedOrder.status === 'PROCESSING' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder, 'SHIPPED')}
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? 'Actualizando...' : 'Marcar como Enviado'}
                </button>
              )}
              {selectedOrder.status === 'SHIPPED' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder, 'DELIVERED')}
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? 'Actualizando...' : 'Marcar como Entregado'}
                </button>
              )}
            </div>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default OrderManagement;