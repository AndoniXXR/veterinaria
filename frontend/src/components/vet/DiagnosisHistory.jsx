import React, { useState, useEffect } from 'react';
import { FiClock, FiUser, FiFileText, FiCalendar, FiCheck, FiAlertCircle, FiX } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DiagnosisHistory = ({ petId, petName, isOpen, onClose }) => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusSummary, setStatusSummary] = useState({});

  useEffect(() => {
    if (isOpen && petId) {
      fetchDiagnosisHistory();
    }
  }, [isOpen, petId, statusFilter]);

  const fetchDiagnosisHistory = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await api.get(`/diagnosis/pet/${petId}/history`, { params });
      
      if (response.data.success) {
        setDiagnoses(response.data.data.diagnoses);
        setStatusSummary(response.data.data.statusSummary || {});
      }
    } catch (error) {
      console.error('Error fetching diagnosis history:', error);
      toast.error('Error al cargar el historial de diagnósticos');
    } finally {
      setLoading(false);
    }
  };

  const updateDiagnosisStatus = async (diagnosisId, newStatus) => {
    try {
      const response = await api.put(`/diagnosis/${diagnosisId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        toast.success('Estado actualizado exitosamente');
        fetchDiagnosisHistory(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating diagnosis status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: FiClock,
        label: 'Pendiente'
      },
      REVIEWED: {
        color: 'bg-blue-100 text-blue-800',
        icon: FiAlertCircle,
        label: 'Revisado'
      },
      COMPLETED: {
        color: 'bg-green-100 text-green-800',
        icon: FiCheck,
        label: 'Completado'
      }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              Historial de Diagnósticos
            </h2>
            <p className="text-neutral-600">Mascota: {petName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Status Filter */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Todos ({Object.values(statusSummary).reduce((a, b) => a + b, 0) || 0})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'PENDING'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
              }`}
            >
              Pendientes ({statusSummary.PENDING || 0})
            </button>
            <button
              onClick={() => setStatusFilter('REVIEWED')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'REVIEWED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              Revisados ({statusSummary.REVIEWED || 0})
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'COMPLETED'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              Completados ({statusSummary.COMPLETED || 0})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : diagnoses.length === 0 ? (
            <div className="text-center py-8">
              <FiFileText className="mx-auto text-neutral-400 mb-4" size={48} />
              <p className="text-neutral-600">No hay diagnósticos disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {diagnoses.map((diagnosis) => (
                <div key={diagnosis.id} className="border border-neutral-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(diagnosis.status)}
                      <span className="text-sm text-neutral-500">
                        {formatDate(diagnosis.createdAt)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {diagnosis.status !== 'REVIEWED' && (
                        <button
                          onClick={() => updateDiagnosisStatus(diagnosis.id, 'REVIEWED')}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                        >
                          Marcar Revisado
                        </button>
                      )}
                      {diagnosis.status !== 'COMPLETED' && (
                        <button
                          onClick={() => updateDiagnosisStatus(diagnosis.id, 'COMPLETED')}
                          className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                        >
                          Marcar Completado
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-neutral-900 mb-1">Diagnóstico</h4>
                    <p className="text-neutral-700 text-sm">{diagnosis.description}</p>
                  </div>

                  {diagnosis.prescription && (
                    <div className="mb-3">
                      <h4 className="font-medium text-neutral-900 mb-1">Tratamiento</h4>
                      <p className="text-neutral-700 text-sm">{diagnosis.prescription}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-neutral-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <FiUser size={14} />
                        <span>Dr. {diagnosis.veterinarian?.name}</span>
                      </div>
                      {diagnosis.appointment && (
                        <div className="flex items-center gap-1">
                          <FiCalendar size={14} />
                          <span>Cita: {formatDate(diagnosis.appointment.date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-500 text-white rounded-lg hover:bg-neutral-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisHistory;