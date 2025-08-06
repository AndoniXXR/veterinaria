import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiPackage, FiShoppingCart, FiBarChart2, FiSettings, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    activity: [],
    actionCounts: null
  });

  // Cargar datos del dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getAllDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Función para formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(value);
  };

  // Función para formatear tiempo relativo
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace menos de 1 minuto';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  };

  // Función para obtener acciones de admin con conteos reales
  const getAdminActions = () => [
    {
      title: 'Gestionar Usuarios',
      description: 'Administrar usuarios y veterinarios',
      icon: FiUsers,
      href: '/admin/usuarios',
      color: 'bg-blue-500',
      count: dashboardData.actionCounts?.users || 'Cargando...'
    },
    {
      title: 'Gestionar Productos',
      description: 'Catálogo e inventario de productos',
      icon: FiPackage,
      href: '/admin/productos',
      color: 'bg-green-500',
      count: dashboardData.actionCounts?.products || 'Cargando...'
    },
    {
      title: 'Gestionar Órdenes',
      description: 'Ver y procesar órdenes de compra',
      icon: FiShoppingCart,
      href: '/admin/ordenes',
      color: 'bg-purple-500',
      count: dashboardData.actionCounts?.orders || 'Cargando...'
    },
    {
      title: 'Reportes',
      description: 'Análisis y estadísticas del negocio',
      icon: FiBarChart2,
      href: '/admin/reportes',
      color: 'bg-orange-500',
      count: dashboardData.actionCounts?.reports || 'Ver más'
    },
    {
      title: 'Configuración',
      description: 'Configuración del sistema',
      icon: FiSettings,
      href: '/admin/configuracion',
      color: 'bg-gray-500',
      count: dashboardData.actionCounts?.config || 'Sistema'
    },
    {
      title: 'Analytics',
      description: 'Métricas y rendimiento',
      icon: FiTrendingUp,
      href: '/admin/analytics',
      color: 'bg-red-500',
      count: dashboardData.actionCounts?.analytics || 'Tiempo real'
    }
  ];

  return (
    <div className="container py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Panel de Administración
        </h1>
        <p className="text-neutral-600">
          Bienvenido {user?.name}, controla y gestiona todos los aspectos de VetCare.
        </p>
      </div>

      {/* Key Metrics */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="card">
              <div className="card-body">
                <div className="animate-pulse">
                  <div className="h-8 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded mb-4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {dashboardData.stats?.users?.total || 0}
                  </div>
                  <div className="text-sm text-neutral-600">Usuarios Totales</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${dashboardData.stats?.users?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dashboardData.stats?.users?.change >= 0 ? '+' : ''}{dashboardData.stats?.users?.change?.toFixed(1) || 0}%
                </span>
                <span className="text-neutral-500 ml-1">vs semana pasada</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {formatCurrency(dashboardData.stats?.sales?.currentMonth || 0)}
                  </div>
                  <div className="text-sm text-neutral-600">Ventas del Mes</div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FiTrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${dashboardData.stats?.sales?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dashboardData.stats?.sales?.change >= 0 ? '+' : ''}{dashboardData.stats?.sales?.change?.toFixed(1) || 0}%
                </span>
                <span className="text-neutral-500 ml-1">vs mes pasado</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {dashboardData.stats?.products?.active || 0}
                  </div>
                  <div className="text-sm text-neutral-600">Productos Activos</div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FiPackage className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">
                  +{dashboardData.stats?.products?.newThisWeek || 0}
                </span>
                <span className="text-neutral-500 ml-1">esta semana</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {dashboardData.stats?.orders?.pending || 0}
                  </div>
                  <div className="text-sm text-neutral-600">Órdenes Pendientes</div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FiShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-orange-600 font-medium">
                  {dashboardData.stats?.orders?.pending > 0 ? 'Requieren atención' : 'Todo al día'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {getAdminActions().map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.href}
              className="card card-hover group"
            >
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                    {action.count}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-neutral-600">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-neutral-900">
              Actividad Reciente
            </h2>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-neutral-200 rounded-full mt-2 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-neutral-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/3 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardData.activity.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.activity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full mt-2`}></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-900">
                        {activity.title}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {formatRelativeTime(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-neutral-400 mb-2">No hay actividad reciente</div>
                <div className="text-sm text-neutral-500">
                  Las actividades aparecerán aquí cuando ocurran eventos en el sistema.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-neutral-900">
              Acciones Rápidas
            </h2>
          </div>
          <div className="card-body space-y-4">
            <button className="w-full btn btn-primary text-left">
              Crear Nuevo Producto
            </button>
            <button className="w-full btn btn-secondary text-left">
              Enviar Notificación Global
            </button>
            <button className="w-full btn btn-outline text-left">
              Generar Reporte Mensual
            </button>
            <button className="w-full btn btn-outline text-left">
              Configurar Promociones
            </button>
            <div className="pt-4 border-t border-neutral-200">
              <Link to="/admin/configuracion" className="text-sm text-primary-600 hover:text-primary-700">
                Ver todas las opciones →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;