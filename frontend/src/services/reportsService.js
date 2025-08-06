import api from './api';

class ReportsService {
  // Obtener resumen general del dashboard
  async getDashboardOverview(range = '30d') {
    try {
      const response = await api.get(`/reports/overview?range=${range}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  }

  // Obtener reportes financieros
  async getFinancialReports(range = '30d') {
    try {
      const response = await api.get(`/reports/financial?range=${range}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching financial reports:', error);
      throw error;
    }
  }

  // Obtener reportes de clientes
  async getClientReports(range = '30d') {
    try {
      const response = await api.get(`/reports/clients?range=${range}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching client reports:', error);
      throw error;
    }
  }

  // Obtener reportes operacionales
  async getOperationalReports(range = '30d') {
    try {
      const response = await api.get(`/reports/operational?range=${range}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching operational reports:', error);
      throw error;
    }
  }

  // Obtener reportes clínicos
  async getClinicalReports(range = '30d') {
    try {
      const response = await api.get(`/reports/clinical?range=${range}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching clinical reports:', error);
      throw error;
    }
  }

  // Obtener distribución de servicios
  async getServicesDistribution(range = '30d') {
    try {
      const response = await api.get(`/reports/services?range=${range}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching services distribution:', error);
      throw error;
    }
  }

  // Obtener todos los datos del dashboard de una vez
  async getAllReportsData(range = '30d') {
    try {
      const [
        overview,
        financial,
        clients,
        operational,
        clinical,
        services
      ] = await Promise.all([
        this.getDashboardOverview(range),
        this.getFinancialReports(range),
        this.getClientReports(range),
        this.getOperationalReports(range),
        this.getClinicalReports(range),
        this.getServicesDistribution(range)
      ]);

      return {
        overview: overview.data,
        financial: financial.data,
        clients: clients.data,
        operational: operational.data,
        clinical: clinical.data,
        services: services.data
      };
    } catch (error) {
      console.error('Error fetching all reports data:', error);
      throw error;
    }
  }

  // Exportar reportes (preparado para implementación futura)
  async exportReports(type, format = 'pdf', range = '30d') {
    try {
      const response = await api.get(`/reports/export/${type}?format=${format}&range=${range}`, {
        responseType: 'blob'
      });
      
      // Crear un enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-${type}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting reports:', error);
      throw error;
    }
  }
}

export default new ReportsService();