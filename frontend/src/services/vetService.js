import api from './api';

class VetService {
  // Obtener citas del veterinario
  async getVetAppointments(params = {}) {
    try {
      const response = await api.get('/appointments/vet', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching vet appointments:', error);
      throw error;
    }
  }

  // Obtener citas de hoy
  async getTodayAppointments() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/appointments/vet?date=${today}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching today appointments:', error);
      throw error;
    }
  }

  // Obtener diagnósticos pendientes
  async getPendingDiagnoses() {
    try {
      const response = await api.get('/diagnosis/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending diagnoses:', error);
      throw error;
    }
  }

  // Obtener estadísticas del veterinario
  async getVetStats() {
    try {
      const response = await api.get('/appointments/vet/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching vet stats:', error);
      throw error;
    }
  }

  // Obtener pacientes asignados
  async getVetPatients() {
    try {
      const response = await api.get('/appointments/vet/patients');
      return response.data;
    } catch (error) {
      console.error('Error fetching vet patients:', error);
      throw error;
    }
  }

  // Obtener datos completos del dashboard veterinario
  async getVetDashboardData() {
    try {
      const [appointments, pendingDiagnoses, stats, patients] = await Promise.all([
        this.getTodayAppointments(),
        this.getPendingDiagnoses(),
        this.getVetStats(),
        this.getVetPatients()
      ]);

      return {
        todayAppointments: appointments.data || [],
        pendingDiagnoses: pendingDiagnoses.data || [],
        stats: stats.data || {},
        patients: patients.data || []
      };
    } catch (error) {
      console.error('Error fetching vet dashboard data:', error);
      throw error;
    }
  }
}

export default new VetService();