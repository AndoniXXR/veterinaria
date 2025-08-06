import React from 'react';
import { FiCalendar, FiClock, FiUser, FiMapPin, FiEdit, FiX } from 'react-icons/fi';

const AppointmentCard = ({ appointment, onEdit, onCancel }) => {
  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'CONFIRMED': 'bg-blue-100 text-blue-800 border-blue-200',
      'COMPLETED': 'bg-green-100 text-green-800 border-green-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-neutral-100 text-neutral-800 border-neutral-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmada',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada'
    };
    return labels[status] || status;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'CONSULTATION': '🩺',
      'VACCINATION': '💉',
      'SURGERY': '🏥',
      'EMERGENCY': '🚨',
      'CHECKUP': '📋',
      'DENTAL': '🦷'
    };
    return icons[type] || '🩺';
  };

  const getTypeLabel = (type) => {
    const labels = {
      'CONSULTATION': 'Consulta General',
      'VACCINATION': 'Vacunación',
      'SURGERY': 'Cirugía',
      'EMERGENCY': 'Emergencia',
      'CHECKUP': 'Revisión',
      'DENTAL': 'Dental'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  const isUpcoming = () => {
    if (!appointment.date) return false;
    const appointmentDate = new Date(appointment.date);
    if (isNaN(appointmentDate.getTime())) return false;
    return appointmentDate > new Date() && appointment.status !== 'CANCELLED';
  };

  const canEdit = () => {
    return appointment.status === 'PENDING' || appointment.status === 'CONFIRMED';
  };

  const canCancel = () => {
    return (appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && isUpcoming();
  };

  return (
    <div className={`card transition-all duration-200 ${
      isUpcoming() ? 'border-primary-200 shadow-sm' : 'border-neutral-200'
    }`}>
      <div className="card-body">
        {/* Header with status and type */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getTypeIcon(appointment.type)}</div>
            <div>
              <h3 className="font-semibold text-neutral-900">
                {getTypeLabel(appointment.type)}
              </h3>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                getStatusColor(appointment.status)
              }`}>
                {getStatusLabel(appointment.status)}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            {canEdit() && (
              <button
                onClick={() => onEdit(appointment)}
                className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Editar cita"
              >
                <FiEdit size={16} />
              </button>
            )}
            {canCancel() && (
              <button
                onClick={() => onCancel(appointment)}
                className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cancelar cita"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Pet info */}
        <div className="flex items-center space-x-2 mb-3">
          <FiUser className="text-neutral-400" size={16} />
          <span className="text-sm text-neutral-600">
            <span className="font-medium text-neutral-900">{appointment.pet?.name}</span>
            {appointment.pet?.species && (
              <span> • {appointment.pet.species}</span>
            )}
            {appointment.pet?.breed && (
              <span> ({appointment.pet.breed})</span>
            )}
          </span>
        </div>

        {/* Date and time */}
        <div className="flex items-center space-x-2 mb-3">
          <FiCalendar className="text-neutral-400" size={16} />
          <span className="text-sm text-neutral-900 font-medium">
            {formatDate(appointment.date)}
          </span>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <FiClock className="text-neutral-400" size={16} />
          <span className="text-sm text-neutral-900 font-medium">
            {formatTime(appointment.date)}
          </span>
        </div>

        {/* Veterinarian */}
        {appointment.veterinarian && (
          <div className="flex items-center space-x-2 mb-3">
            <FiMapPin className="text-neutral-400" size={16} />
            <span className="text-sm text-neutral-600">
              Dr. {appointment.veterinarian.name}
            </span>
          </div>
        )}

        {/* Notes or symptoms */}
        {appointment.notes && (
          <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-700">
              <span className="font-medium">Notas:</span> {appointment.notes}
            </p>
          </div>
        )}

        {/* Urgency indicator for upcoming appointments */}
        {isUpcoming() && (
          <div className="mt-4 pt-4 border-t border-neutral-100">
            {(() => {
              if (!appointment.date) return null;
              const now = new Date();
              const appointmentDate = new Date(appointment.date);
              if (isNaN(appointmentDate.getTime())) return null;
              const diffInHours = (appointmentDate - now) / (1000 * 60 * 60);
              
              if (diffInHours < 24) {
                return (
                  <div className="flex items-center space-x-2 text-orange-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">
                      {diffInHours < 1 ? 'En menos de 1 hora' : `En ${Math.floor(diffInHours)} horas`}
                    </span>
                  </div>
                );
              } else if (diffInHours < 72) {
                return (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      En {Math.floor(diffInHours / 24)} días
                    </span>
                  </div>
                );
              }
              
              return null;
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;