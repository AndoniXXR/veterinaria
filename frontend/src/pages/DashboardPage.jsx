import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiHeart, FiShoppingBag, FiUser, FiLoader, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import { petService } from '../services/petService';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    appointments: [],
    pets: [],
    upcomingAppointments: []
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [appointmentsResponse, petsResponse] = await Promise.all([
          appointmentService.getUserAppointments({ limit: 5 }),
          petService.getUserPets()
        ]);

        if (appointmentsResponse.success) {
          const appointments = appointmentsResponse.data.appointments || [];
          const upcoming = appointments.filter(apt => 
            new Date(apt.date) > new Date() && 
            apt.status !== 'CANCELLED' && 
            apt.status !== 'COMPLETED'
          ).slice(0, 3);

          setDashboardData({
            appointments,
            pets: petsResponse.success ? petsResponse.data.pets || [] : [],
            upcomingAppointments: upcoming
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Hora no disponible';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Hora inválida';
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const quickActions = [
    {
      title: 'Agendar Cita',
      description: 'Programa una consulta veterinaria',
      icon: FiCalendar,
      href: '/citas',
      color: 'bg-blue-500'
    },
    {
      title: 'Mis Mascotas',
      description: 'Gestiona la información de tus mascotas',
      icon: FiHeart,
      href: '/mascotas',
      color: 'bg-pink-500'
    },
    {
      title: 'Tienda',
      description: 'Compra productos para tu mascota',
      icon: FiShoppingBag,
      href: '/productos',
      color: 'bg-green-500'
    },
    {
      title: 'Mi Perfil',
      description: 'Actualiza tu información personal',
      icon: FiUser,
      href: '/perfil',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="container py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          ¡Bienvenido, {user?.name}!
        </h1>
        <p className="text-neutral-600">
          Desde aquí puedes gestionar toda la información de tus mascotas y servicios.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.href}
              className="card card-hover group"
            >
              <div className="card-body text-center">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-neutral-900">
              Próximas Citas
            </h2>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <FiLoader className="animate-spin text-primary-600" size={24} />
                <span className="ml-3 text-neutral-600">Cargando...</span>
              </div>
            ) : dashboardData.upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-neutral-900">{appointment.pet?.name}</p>
                        <p className="text-sm text-neutral-600">{appointment.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-900">{formatDate(appointment.date)}</p>
                      <p className="text-xs text-neutral-500 flex items-center">
                        <FiClock className="mr-1" size={12} />
                        {formatTime(appointment.date)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Link to="/citas" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Ver todas las citas →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FiCalendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500 mb-4">No tienes citas próximas</p>
                <Link to="/citas" className="btn btn-primary">
                  Agendar Primera Cita
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* My Pets */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-neutral-900">
              Mis Mascotas
            </h2>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <FiLoader className="animate-spin text-primary-600" size={24} />
                <span className="ml-3 text-neutral-600">Cargando...</span>
              </div>
            ) : dashboardData.pets.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.pets.slice(0, 3).map((pet) => (
                  <div key={pet.id} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      {pet.photo ? (
                        <img src={pet.photo} alt={pet.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <FiHeart className="text-primary-600" size={16} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{pet.name}</p>
                      <p className="text-sm text-neutral-600">
                        {pet.species} {pet.breed && `• ${pet.breed}`}
                      </p>
                    </div>
                    {pet.age && (
                      <div className="text-right">
                        <p className="text-sm text-neutral-600">{pet.age} años</p>
                      </div>
                    )}
                  </div>
                ))}
                {dashboardData.pets.length > 3 && (
                  <div className="text-center pt-2">
                    <p className="text-sm text-neutral-500">
                      y {dashboardData.pets.length - 3} mascotas más
                    </p>
                  </div>
                )}
                <div className="pt-2">
                  <Link to="/mascotas" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Ver todas las mascotas →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FiHeart className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500 mb-4">Aún no has registrado mascotas</p>
                <Link to="/mascotas" className="btn btn-secondary">
                  Registrar Mascota
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;