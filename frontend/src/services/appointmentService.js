import api, { buildQueryString } from './api';

export const appointmentService = {
  // Create new appointment
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user appointments
  getUserAppointments: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      const url = queryString ? `/appointments?${queryString}` : '/appointments';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get specific appointment
  getAppointment: async (appointmentId) => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update appointment
  updateAppointment: async (appointmentId, appointmentData) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}`, appointmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId) => {
    try {
      const response = await api.delete(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Veterinarian endpoints
  getVetAppointments: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      const url = queryString ? `/appointments/vet/calendar?${queryString}` : '/appointments/vet/calendar';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update appointment status (for veterinarians)
  updateAppointmentStatus: async (appointmentId, statusData) => {
    try {
      const response = await api.put(`/appointments/vet/${appointmentId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get appointment types
  getAppointmentTypes: async () => {
    try {
      const response = await api.get('/appointments/types');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get available veterinarians
  getAvailableVeterinarians: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      const url = queryString ? `/appointments/veterinarians?${queryString}` : '/appointments/veterinarians';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get available time slots for a specific date
  getAvailableSlots: async (date) => {
    try {
      const response = await api.get(`/appointments/available-slots?date=${date}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Format appointment for calendar display
  formatAppointmentForCalendar: (appointment) => {
    const statusColors = {
      PENDING: '#f59e0b',     // amber
      CONFIRMED: '#3b82f6',   // blue
      COMPLETED: '#10b981',   // green
      CANCELLED: '#ef4444'    // red
    };

    return {
      id: appointment.id,
      title: `${appointment.pet?.name} - ${appointment.reason}`,
      start: appointment.date,
      end: new Date(new Date(appointment.date).getTime() + 60 * 60 * 1000), // +1 hour
      backgroundColor: statusColors[appointment.status] || '#6b7280',
      borderColor: statusColors[appointment.status] || '#6b7280',
      extendedProps: {
        appointment: appointment,
        status: appointment.status,
        petName: appointment.pet?.name,
        petSpecies: appointment.pet?.species,
        ownerName: appointment.user?.name,
        ownerPhone: appointment.user?.phone,
        veterinarianName: appointment.veterinarian?.name
      }
    };
  },

  // Get appointment status label
  getStatusLabel: (status) => {
    const labels = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada'
    };
    return labels[status] || status;
  },

  // Get appointment status badge class
  getStatusBadgeClass: (status) => {
    const classes = {
      PENDING: 'badge-warning',
      CONFIRMED: 'badge-primary',
      COMPLETED: 'badge-success',
      CANCELLED: 'badge-danger'
    };
    return classes[status] || 'badge-neutral';
  }
};

export default appointmentService;