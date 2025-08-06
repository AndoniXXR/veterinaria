import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiUser, FiClock, FiMapPin } from 'react-icons/fi';
import Modal, { ModalBody, ModalFooter } from '../common/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VetCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // 'week', 'day', 'month'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔗 Fetching calendar appointments...');
      
      // Get date range for current month to improve performance
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      const params = {
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString()
      };
      
      const response = await api.get('/appointments/vet/calendar', { params });
      console.log('📅 Calendar appointments response:', response.data);
      
      if (response.data.success) {
        const appointmentsData = response.data.data || [];
        
        // Transform the data to match calendar format
        const transformedAppointments = appointmentsData.map(appointment => {
          const appointmentDate = new Date(appointment.date);
          
          return {
            id: appointment.id,
            title: `${appointment.reason || 'Consulta'} - ${appointment.pet?.name || 'Mascota'}`,
            start: appointmentDate,
            end: new Date(appointmentDate.getTime() + 30 * 60000), // Add 30 minutes
            type: appointment.type || 'CONSULTATION',
            pet: {
              name: appointment.pet?.name || 'N/A',
              species: appointment.pet?.species || 'N/A',
              owner: appointment.user?.name || 'Propietario desconocido'
            },
            status: appointment.status || 'PENDING',
            notes: appointment.notes || appointment.reason || '',
            hasDiagnosis: appointment.hasDiagnosis || false
          };
        });
        
        console.log('📋 Transformed appointments:', transformedAppointments);
        setAppointments(transformedAppointments);
      } else {
        setError('Error al cargar las citas');
      }
      
    } catch (error) {
      console.error('❌ Error fetching calendar appointments:', error);
      setError('Error al cargar las citas del calendario');
      toast.error('Error al cargar las citas del calendario');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Fetch appointments when component mounts or when month changes
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const getTypeColor = (type) => {
    const colors = {
      'CONSULTATION': 'bg-blue-100 border-blue-300 text-blue-800',
      'VACCINATION': 'bg-green-100 border-green-300 text-green-800',
      'SURGERY': 'bg-red-100 border-red-300 text-red-800',
      'EMERGENCY': 'bg-orange-100 border-orange-300 text-orange-800',
      'CHECKUP': 'bg-purple-100 border-purple-300 text-purple-800',
      'DENTAL': 'bg-indigo-100 border-indigo-300 text-indigo-800'
    };
    return colors[type] || 'bg-neutral-100 border-neutral-300 text-neutral-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'CONFIRMED': 'text-green-600 bg-green-50 border-green-200',
      'COMPLETED': 'text-blue-600 bg-blue-50 border-blue-200',
      'CANCELLED': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-neutral-600 bg-neutral-50 border-neutral-200';
  };

  const getStatusText = (status) => {
    const texts = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmada',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada'
    };
    return texts[status] || status;
  };

  const getTypeText = (type) => {
    const texts = {
      'CONSULTATION': 'Consulta',
      'VACCINATION': 'Vacunación',
      'SURGERY': 'Cirugía',
      'EMERGENCY': 'Emergencia',
      'CHECKUP': 'Chequeo',
      'DENTAL': 'Dental'
    };
    return texts[type] || type;
  };

  const handleEventClick = (appointment) => {
    setSelectedEvent(appointment);
    setShowEventModal(true);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const closeModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => 
      apt.start.toDateString() === date.toDateString()
    ).sort((a, b) => a.start - b.start);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction * 7));
    setSelectedDate(newDate);
  };

  const navigateDay = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(selectedDate);
    const timeSlots = [];
    for (let hour = 8; hour <= 18; hour++) {
      timeSlots.push(hour);
    }

    return (
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid grid-cols-8 border-b border-neutral-200">
            <div className="p-4 text-sm font-medium text-neutral-500">Hora</div>
            {weekDates.map((date, index) => (
              <div key={index} className="p-4 text-center border-l border-neutral-200">
                <div className="text-sm font-medium text-neutral-900">
                  {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-semibold ${
                  date.toDateString() === new Date().toDateString() 
                    ? 'text-primary-600' 
                    : 'text-neutral-700'
                }`}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {timeSlots.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-neutral-100">
              <div className="p-4 text-sm text-neutral-500 border-r border-neutral-200">
                {hour}:00
              </div>
              {weekDates.map((date, dateIndex) => {
                const dayAppointments = getAppointmentsForDate(date).filter(apt => 
                  apt.start.getHours() === hour
                );
                
                return (
                  <div key={dateIndex} className="p-2 border-l border-neutral-100 min-h-[60px]">
                    {dayAppointments.map(appointment => (
                      <div
                        key={appointment.id}
                        onClick={() => handleEventClick(appointment)}
                        className={`p-2 rounded-lg border cursor-pointer text-xs mb-1 ${getTypeColor(appointment.type)} hover:shadow-sm transition-shadow`}
                      >
                        <div className="font-medium truncate">{appointment.title}</div>
                        <div className="text-xs opacity-75">
                          {formatTime(appointment.start)} - {formatTime(appointment.end)}
                        </div>
                        <div className={`text-xs font-medium mt-1 ${getStatusColor(appointment.status).split(' ')[0]}`}>
                          {getStatusText(appointment.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(selectedDate);
    const timeSlots = [];
    for (let hour = 8; hour <= 18; hour++) {
      timeSlots.push(hour);
    }

    return (
      <div>
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold text-neutral-900">
            {formatDate(selectedDate)}
          </h3>
        </div>

        <div className="space-y-2">
          {timeSlots.map(hour => {
            const hourAppointments = dayAppointments.filter(apt => 
              apt.start.getHours() === hour
            );

            return (
              <div key={hour} className="flex">
                <div className="w-20 p-4 text-sm text-neutral-500">
                  {hour}:00
                </div>
                <div className="flex-1 p-4 border-l border-neutral-200 min-h-[60px]">
                  {hourAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      onClick={() => handleEventClick(appointment)}
                      className={`p-3 rounded-lg border cursor-pointer mb-2 ${getTypeColor(appointment.type)} hover:shadow-sm transition-shadow`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{appointment.title}</div>
                          <div className="text-sm opacity-75">
                            {formatTime(appointment.start)} - {formatTime(appointment.end)}
                          </div>
                          <div className="text-xs mt-1 opacity-60">
                            {getTypeText(appointment.type)}
                          </div>
                        </div>
                        <div className={`text-sm font-medium px-2 py-1 rounded border ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-neutral-900">
            Calendario
          </h2>
          
          {/* View Mode Selector */}
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'day' 
                  ? 'bg-white text-neutral-900 shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'week' 
                  ? 'bg-white text-neutral-900 shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Semana
            </button>
          </div>
        </div>

        <button
          onClick={handleAddEvent}
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" size={16} />
          Nueva Cita
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => viewMode === 'week' ? navigateWeek(-1) : navigateDay(-1)}
            className="btn btn-outline"
          >
            ←
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="btn btn-outline"
          >
            Hoy
          </button>
          <button
            onClick={() => viewMode === 'week' ? navigateWeek(1) : navigateDay(1)}
            className="btn btn-outline"
          >
            →
          </button>
        </div>

        <div className="text-lg font-semibold text-neutral-900">
          {viewMode === 'week' ? (
            `Semana del ${getWeekDates(selectedDate)[0].getDate()} al ${getWeekDates(selectedDate)[6].getDate()} de ${selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
          ) : (
            formatDate(selectedDate)
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="card">
          <div className="card-body text-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-600">Cargando calendario...</p>
          </div>
        </div>
      ) : error ? (
        <div className="card">
          <div className="card-body text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Error al cargar</h3>
            <p className="text-neutral-600 mb-4">{error}</p>
            <button onClick={fetchAppointments} className="btn btn-primary">
              Reintentar
            </button>
          </div>
        </div>
      ) : (
        /* Calendar Content */
        <div className="card">
          <div className="card-body p-0">
            {viewMode === 'week' ? renderWeekView() : renderDayView()}
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <Modal
          isOpen={showEventModal}
          onClose={closeModal}
          title={selectedEvent ? 'Detalles de la Cita' : 'Nueva Cita'}
          size="md"
        >
          <ModalBody>
            {selectedEvent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {selectedEvent.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(selectedEvent.type)}`}>
                      {getTypeText(selectedEvent.type)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedEvent.status)}`}>
                      {getStatusText(selectedEvent.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FiUser className="text-neutral-400" size={16} />
                    <span className="text-sm">
                      <strong>{selectedEvent.pet.name}</strong> ({selectedEvent.pet.species}) - {selectedEvent.pet.owner}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FiClock className="text-neutral-400" size={16} />
                    <span className="text-sm">
                      {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FiMapPin className="text-neutral-400" size={16} />
                    <span className={`text-sm font-medium px-2 py-1 rounded border ${getStatusColor(selectedEvent.status)}`}>
                      {getStatusText(selectedEvent.status)}
                    </span>
                    {selectedEvent.hasDiagnosis && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Con diagnóstico
                      </span>
                    )}
                  </div>
                </div>

                {selectedEvent.notes && (
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-700">
                      <strong>Notas:</strong> {selectedEvent.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-600">
                  Formulario para crear nueva cita
                </p>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <button onClick={closeModal} className="btn btn-outline">
              Cerrar
            </button>
            {selectedEvent && (
              <div className="flex space-x-2">
                <button className="btn btn-outline text-blue-600 border-blue-300 hover:bg-blue-50">
                  <FiEdit className="mr-1" size={14} />
                  Editar
                </button>
                <button className="btn btn-outline text-red-600 border-red-300 hover:bg-red-50">
                  <FiTrash2 className="mr-1" size={14} />
                  Cancelar
                </button>
              </div>
            )}
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default VetCalendar;