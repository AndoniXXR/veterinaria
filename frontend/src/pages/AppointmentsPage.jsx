import React, { useState, useEffect } from 'react';
import { FiPlus, FiCalendar, FiFilter, FiSearch, FiLoader } from 'react-icons/fi';
import AppointmentBooking from '../components/appointments/AppointmentBooking';
import AppointmentCard from '../components/appointments/AppointmentCard';
import appointmentService from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AppointmentsPage = () => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await appointmentService.getUserAppointments();
      
      if (response.success) {
        setAppointments(response.data.appointments || []);
      } else {
        setError('Error al cargar las citas');
        toast.error('Error al cargar las citas');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Error de conexión al servidor');
      toast.error('Error al conectar con el servidor');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'Todas las citas', count: appointments.length },
    { value: 'upcoming', label: 'Próximas', count: appointments.filter(apt => new Date(apt.date) > new Date() && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED').length },
    { value: 'pending', label: 'Pendientes', count: appointments.filter(apt => apt.status === 'PENDING').length },
    { value: 'confirmed', label: 'Confirmadas', count: appointments.filter(apt => apt.status === 'CONFIRMED').length },
    { value: 'completed', label: 'Completadas', count: appointments.filter(apt => apt.status === 'COMPLETED').length }
  ];

  const filteredAppointments = appointments.filter(appointment => {
    // Filter by status
    let statusMatch = true;
    switch (selectedFilter) {
      case 'upcoming':
        statusMatch = new Date(appointment.date) > new Date() && appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED';
        break;
      case 'pending':
        statusMatch = appointment.status === 'PENDING';
        break;
      case 'confirmed':
        statusMatch = appointment.status === 'CONFIRMED';
        break;
      case 'completed':
        statusMatch = appointment.status === 'COMPLETED';
        break;
      default:
        statusMatch = true;
    }

    // Filter by search term
    const searchMatch = searchTerm === '' || 
      appointment.pet?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.veterinarian?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });

  const handleEditAppointment = (appointment) => {
    console.log('Editing appointment:', appointment);
    // TODO: Implementar modal de edición de cita
    toast('Funcionalidad de edición en desarrollo', {
      icon: '⚠️',
    });
  };

  const handleCancelAppointment = async (appointment) => {
    if (window.confirm(`¿Estás seguro de que quieres cancelar la cita de ${appointment.pet?.name}?`)) {
      try {
        await appointmentService.cancelAppointment(appointment.id);
        toast.success('Cita cancelada exitosamente');
        // Refresh appointments list
        fetchAppointments();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        toast.error('Error al cancelar la cita');
      }
    }
  };

  const groupAppointmentsByDate = (appointments) => {
    const groups = {};
    appointments.forEach(appointment => {
      const date = new Date(appointment.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appointment);
    });
    return groups;
  };

  const groupedAppointments = groupAppointmentsByDate(filteredAppointments);
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Mis Citas
          </h1>
          <p className="text-neutral-600">
            Gestiona todas las citas médicas de tus mascotas.
          </p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" size={16} />
          Agendar Cita
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por mascota, veterinario o tipo de cita..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                selectedFilter === option.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {option.label}
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                selectedFilter === option.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-200 text-neutral-600'
              }`}>
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <FiLoader className="animate-spin text-primary-600" size={32} />
          <span className="ml-3 text-neutral-600">Cargando citas...</span>
        </div>
      ) : error ? (
        /* Error State */
        <div className="text-center py-16">
          <div className="text-8xl mb-6">⚠️</div>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Error al cargar las citas
          </h2>
          <p className="text-neutral-600 mb-8">
            {error}
          </p>
          <button
            onClick={fetchAppointments}
            className="btn btn-primary"
          >
            Intentar nuevamente
          </button>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-8">
          {sortedDates.map(dateString => {
            const date = new Date(dateString);
            const isToday = date.toDateString() === new Date().toDateString();
            const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();
            
            let dateLabel = date.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            
            if (isToday) dateLabel = 'Hoy';
            else if (isTomorrow) dateLabel = 'Mañana';
            
            return (
              <div key={dateString}>
                <div className="flex items-center mb-4">
                  <FiCalendar className="mr-2 text-neutral-400" size={20} />
                  <h2 className={`text-lg font-semibold capitalize ${
                    isToday ? 'text-primary-600' : 'text-neutral-900'
                  }`}>
                    {dateLabel}
                  </h2>
                  <div className="flex-1 ml-4 border-t border-neutral-200"></div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {groupedAppointments[dateString].map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onEdit={handleEditAppointment}
                      onCancel={handleCancelAppointment}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-8xl mb-6">📅</div>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            {searchTerm || selectedFilter !== 'all' 
              ? 'No se encontraron citas' 
              : 'Aún no tienes citas programadas'
            }
          </h2>
          <p className="text-neutral-600 mb-8 max-w-md mx-auto">
            {searchTerm || selectedFilter !== 'all'
              ? 'Intenta ajustar los filtros o términos de búsqueda.'
              : 'Agenda tu primera cita médica para mantener a tus mascotas saludables.'
            }
          </p>
          {(!searchTerm && selectedFilter === 'all') && (
            <button
              onClick={() => setShowBookingModal(true)}
              className="btn btn-primary btn-lg flex items-center mx-auto"
            >
              <FiPlus className="mr-2" size={16} />
              Agendar Mi Primera Cita
            </button>
          )}
        </div>
      )}

      {/* Appointment Booking Modal */}
      <AppointmentBooking
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSuccess={() => {
          setShowBookingModal(false);
          fetchAppointments(); // Refresh appointments after creating new one
          toast.success('Cita agendada exitosamente');
        }}
      />
    </div>
  );
};

export default AppointmentsPage;