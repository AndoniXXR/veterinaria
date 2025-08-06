import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUsers, FiFileText, FiActivity } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import vetService from '../services/vetService';
import dashboardService from '../services/dashboardService';

const VetDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    activity: [],
    vetData: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));
        
        // For now, just set default data for vet dashboard
        setDashboardData({
          stats: {
            users: { clients: 0, veterinarians: 1 },
            orders: { pending: 0 },
            products: { active: 0 }
          },
          activity: [],
          vetData: {
            todayAppointments: [],
            pendingDiagnoses: [],
            stats: {},
            patients: []
          },
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error setting dashboard data:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cargar los datos del dashboard'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  const veterinarianActions = [
    {
      title: 'Calendario de Citas',
      description: 'Ver y gestionar citas programadas',
      icon: FiCalendar,
      href: '/vet/calendario',
      color: 'bg-blue-500',
      count: dashboardData.loading ? '...' : `${dashboardData.vetData?.todayAppointments?.length || 0} hoy`
    },
    {
      title: 'Mis Pacientes',
      description: 'Historial y expedientes de pacientes',
      icon: FiUsers,
      href: '/vet/pacientes',
      color: 'bg-green-500',
      count: dashboardData.loading ? '...' : `${dashboardData.vetData?.patients?.length || 0} total`
    },
    {
      title: 'Diagnósticos',
      description: 'Crear y revisar diagnósticos médicos',
      icon: FiFileText,
      href: '/vet/diagnosticos',
      color: 'bg-purple-500',
      count: dashboardData.loading ? '...' : `${dashboardData.vetData?.pendingDiagnoses?.length || 0} pendientes`
    },
    {
      title: 'Reportes',
      description: 'Estadísticas y reportes médicos',
      icon: FiActivity,
      href: '/vet/reportes',
      color: 'bg-orange-500',
      count: 'Ver más'
    }
  ];

  return (
    <div className="container py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Bienvenido, Dr. {user?.name}
        </h1>
        <p className="text-neutral-600">
          Panel veterinario para gestionar pacientes, citas y diagnósticos médicos.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {dashboardData.loading ? '...' : dashboardData.vetData?.todayAppointments?.length || 0}
            </div>
            <div className="text-sm text-neutral-600">Citas Hoy</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {dashboardData.loading ? '...' : dashboardData.vetData?.patients?.length || 0}
            </div>
            <div className="text-sm text-neutral-600">Mis Pacientes</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {dashboardData.loading ? '...' : dashboardData.vetData?.pendingDiagnoses?.length || 0}
            </div>
            <div className="text-sm text-neutral-600">Diagnósticos Pendientes</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {dashboardData.loading ? '...' : dashboardData.stats?.users?.veterinarians || 1}
            </div>
            <div className="text-sm text-neutral-600">Veterinarios Activos</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {veterinarianActions.map((action, index) => {
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

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-neutral-900">
              Agenda de Hoy
            </h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {dashboardData.loading ? (
                <div className="text-center py-4">
                  <div className="text-neutral-500">Cargando citas...</div>
                </div>
              ) : dashboardData.error ? (
                <div className="text-center py-4">
                  <div className="text-red-500">{dashboardData.error}</div>
                </div>
              ) : dashboardData.vetData?.todayAppointments?.length > 0 ? (
                <>
                  {dashboardData.vetData.todayAppointments.slice(0, 3).map((appointment, index) => {
                    const statusColor = appointment.status === 'CONFIRMED' ? 'blue' : 
                                      appointment.status === 'PENDING' ? 'yellow' :
                                      appointment.status === 'COMPLETED' ? 'green' : 'gray';
                    const statusText = appointment.status === 'CONFIRMED' ? 'Confirmada' :
                                     appointment.status === 'PENDING' ? 'Pendiente' :
                                     appointment.status === 'COMPLETED' ? 'Completada' : 'Cancelada';
                    
                    return (
                      <div key={appointment.id} className={`flex items-center space-x-4 p-3 bg-${statusColor}-50 rounded-lg`}>
                        <div className={`w-2 h-12 bg-${statusColor}-500 rounded`}></div>
                        <div className="flex-1">
                          <div className="font-medium text-neutral-900">
                            {new Date(appointment.date).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - {appointment.reason}
                          </div>
                          <div className="text-sm text-neutral-600">
                            {appointment.pet?.name} ({appointment.pet?.species}) - {appointment.user?.name}
                          </div>
                        </div>
                        <div className={`text-xs text-${statusColor}-600 bg-${statusColor}-100 px-2 py-1 rounded`}>
                          {statusText}
                        </div>
                      </div>
                    );
                  })}
                  <div className="text-center py-4">
                    <Link to="/vet/calendario" className="btn btn-primary">
                      Ver Calendario Completo
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📅</div>
                  <div className="text-neutral-500 mb-4">No hay citas programadas para hoy</div>
                  <Link to="/vet/calendario" className="btn btn-outline">
                    Ver Calendario
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-neutral-900">
              Actividad Reciente
            </h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {dashboardData.loading ? (
                <div className="text-center py-4">
                  <div className="text-neutral-500">Cargando actividad...</div>
                </div>
              ) : dashboardData.error ? (
                <div className="text-center py-4">
                  <div className="text-red-500">{dashboardData.error}</div>
                </div>
              ) : dashboardData.activity.length > 0 ? (
                dashboardData.activity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full mt-2`}></div>
                    <div>
                      <div className="text-sm font-medium text-neutral-900">
                        {activity.title}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <div className="text-neutral-500">No hay actividad reciente</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetDashboardPage;