import api from './api';

class DashboardService {
  // Obtener estadísticas principales del dashboard
  async getDashboardStats() {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Obtener actividad reciente
  async getRecentActivity(limit = 10) {
    try {
      const response = await api.get(`/dashboard/activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  // Obtener conteos para las acciones de admin
  async getAdminActionCounts() {
    try {
      const response = await api.get('/dashboard/action-counts');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin action counts:', error);
      throw error;
    }
  }

  // Obtener todos los datos del dashboard de una vez
  async getAllDashboardData() {
    try {
      const [stats, activity, actionCounts] = await Promise.all([
        this.getDashboardStats(),
        this.getRecentActivity(),
        this.getAdminActionCounts()
      ]);

      return {
        stats: stats.data,
        activity: activity.data,
        actionCounts: actionCounts.data
      };
    } catch (error) {
      console.error('Error fetching all dashboard data:', error);
      throw error;
    }
  }
}

export default new DashboardService();