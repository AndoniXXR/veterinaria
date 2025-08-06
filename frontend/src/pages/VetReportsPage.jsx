import React, { useState, useEffect } from 'react';
import { 
  FiDownload, 
  FiCalendar, 
  FiActivity, 
  FiUsers, 
  FiFileText, 
  FiBarChart2,
  FiFilter,
  FiClock
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const VetReportsPage = () => {
  const { user, getToken } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Cargar datos de reportes
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/vet/reports?range=${range}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener reportes');
      }

      const data = await response.json();
      setReportData(data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  // Cargar historial de reportes
  const fetchReportHistory = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/vet/reports/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener historial');
      }

      const data = await response.json();
      setReportHistory(data.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  // Descargar reporte en Excel
  const downloadExcel = async () => {
    try {
      toast.loading('Generando reporte Excel...');
      
      const response = await fetch(`http://localhost:3001/api/vet/reports/export?range=${range}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al generar reporte');
      }

      // Crear blob y descargar
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Reporte_Veterinario_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.dismiss();
      toast.success('Reporte descargado exitosamente');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.dismiss();
      toast.error('Error al descargar el reporte');
    }
  };

  useEffect(() => {
    fetchReports();
    fetchReportHistory();
  }, [range]);

  const getRangeName = (range) => {
    switch (range) {
      case '7d': return 'Últimos 7 días';
      case '30d': return 'Últimos 30 días';
      case '90d': return 'Últimos 90 días';
      case '12m': return 'Últimos 12 meses';
      default: return 'Últimos 30 días';
    }
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Reportes Médicos
        </h1>
        <p className="text-neutral-600">
          Estadísticas detalladas de tu actividad veterinaria
        </p>
      </div>

      {/* Controls */}
      <div className="card mb-8">
        <div className="card-body">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FiFilter className="w-5 h-5 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700">Período:</span>
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="select select-bordered select-sm"
                >
                  <option value="7d">Últimos 7 días</option>
                  <option value="30d">Últimos 30 días</option>
                  <option value="90d">Últimos 90 días</option>
                  <option value="12m">Últimos 12 meses</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={downloadExcel}
                className="btn btn-primary btn-sm"
                disabled={loading || !reportData}
              >
                <FiDownload className="w-4 h-4" />
                Descargar Excel
              </button>
              <button
                onClick={fetchReports}
                className="btn btn-outline btn-sm"
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-bordered mb-6">
        <button
          className={`tab tab-lg ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiBarChart2 className="w-4 h-4 mr-2" />
          Resumen
        </button>
        <button
          className={`tab tab-lg ${activeTab === 'details' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <FiFileText className="w-4 h-4 mr-2" />
          Detalles
        </button>
        <button
          className={`tab tab-lg ${activeTab === 'history' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FiClock className="w-4 h-4 mr-2" />
          Historial
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="text-neutral-500 mt-4">Cargando reportes...</p>
        </div>
      )}

      {!loading && reportData && activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-blue-50 border-blue-200">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {reportData.summary.totalAppointments}
                    </div>
                    <div className="text-sm text-blue-700">Total de Citas</div>
                  </div>
                  <FiCalendar className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="card bg-green-50 border-green-200">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {reportData.summary.completedAppointments}
                    </div>
                    <div className="text-sm text-green-700">Completadas</div>
                  </div>
                  <FiActivity className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>

            <div className="card bg-purple-50 border-purple-200">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {reportData.summary.totalDiagnoses}
                    </div>
                    <div className="text-sm text-purple-700">Diagnósticos</div>
                  </div>
                  <FiFileText className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            <div className="card bg-orange-50 border-orange-200">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {reportData.summary.uniquePets}
                    </div>
                    <div className="text-sm text-orange-700">Mascotas Únicas</div>
                  </div>
                  <FiUsers className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Species Distribution */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-semibold text-neutral-900">
                  Distribución por Especies
                </h3>
              </div>
              <div className="card-body">
                {reportData.speciesDistribution.length > 0 ? (
                  <div className="space-y-4">
                    {reportData.speciesDistribution.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}></div>
                          <span className="text-neutral-700">{item.species}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-neutral-900">
                            {item.appointments} citas
                          </div>
                          <div className="text-xs text-neutral-500">
                            {item.pets} mascotas
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-neutral-500 py-8">
                    No hay datos de especies para mostrar
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Distribution */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-semibold text-neutral-900">
                  Citas por Día de la Semana
                </h3>
              </div>
              <div className="card-body">
                {reportData.weeklyDistribution.length > 0 ? (
                  <div className="space-y-3">
                    {reportData.weeklyDistribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 text-sm text-neutral-600">
                          {item.day}
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.max(5, (item.appointments / Math.max(...reportData.weeklyDistribution.map(d => d.appointments))) * 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-neutral-900 w-8 text-right">
                          {item.appointments}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-neutral-500 py-8">
                    No hay datos semanales para mostrar
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Diagnoses */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-semibold text-neutral-900">
                Diagnósticos Más Frecuentes
              </h3>
            </div>
            <div className="card-body">
              {reportData.topDiagnoses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportData.topDiagnoses.slice(0, 6).map((diagnosis, index) => (
                    <div key={index} className="bg-neutral-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-700">
                          #{index + 1}
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {diagnosis.count}
                        </span>
                      </div>
                      <div className="text-sm text-neutral-900 line-clamp-2">
                        {diagnosis.diagnosis}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-neutral-500 py-8">
                  No hay diagnósticos para mostrar
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed View */}
      {!loading && reportData && activeTab === 'details' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-semibold text-neutral-900">
              Citas Detalladas - {getRangeName(range)}
            </h3>
          </div>
          <div className="card-body">
            {reportData.appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table table-hover w-full">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Mascota</th>
                      <th>Propietario</th>
                      <th>Motivo</th>
                      <th>Estado</th>
                      <th>Diagnóstico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.appointments.slice(0, 50).map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="text-sm">
                          {new Date(appointment.date).toLocaleDateString()}
                        </td>
                        <td>
                          <div>
                            <div className="font-medium text-neutral-900">
                              {appointment.pet.name}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {appointment.pet.species} - {appointment.pet.breed}
                            </div>
                          </div>
                        </td>
                        <td className="text-sm text-neutral-700">
                          {appointment.user.name}
                        </td>
                        <td className="text-sm text-neutral-600">
                          {appointment.reason}
                        </td>
                        <td>
                          <span className={`badge badge-sm ${
                            appointment.status === 'COMPLETED' ? 'badge-success' :
                            appointment.status === 'PENDING' ? 'badge-warning' :
                            appointment.status === 'CONFIRMED' ? 'badge-info' : 'badge-error'
                          }`}>
                            {appointment.status === 'COMPLETED' ? 'Completada' :
                             appointment.status === 'PENDING' ? 'Pendiente' :
                             appointment.status === 'CONFIRMED' ? 'Confirmada' : 'Cancelada'}
                          </span>
                        </td>
                        <td className="text-sm text-neutral-600">
                          {appointment.diagnosis?.description || 'Sin diagnóstico'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.appointments.length > 50 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-neutral-500">
                      Mostrando 50 de {reportData.appointments.length} citas. 
                      Descarga el reporte Excel para ver todos los datos.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-neutral-500 py-8">
                <FiFileText className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
                <p>No hay citas en el período seleccionado</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-semibold text-neutral-900">
              Historial de Reportes
            </h3>
          </div>
          <div className="card-body">
            {reportHistory.length > 0 ? (
              <div className="space-y-4">
                {reportHistory.map((report) => (
                  <div key={report.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-neutral-900">
                          {report.type}
                        </h4>
                        <p className="text-sm text-neutral-600">
                          {report.period}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Generado el {new Date(report.generatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-neutral-600 space-y-1">
                          <div>{report.stats.appointments} citas</div>
                          <div>{report.stats.diagnoses} diagnósticos</div>
                          <div>{report.stats.pets} mascotas</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-neutral-500 py-8">
                <FiClock className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
                <p>No hay historial de reportes disponible</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VetReportsPage;