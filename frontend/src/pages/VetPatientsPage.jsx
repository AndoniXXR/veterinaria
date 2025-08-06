import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import petService from '../services/petService';
import api from '../services/api';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

const VetPatientsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [diagnosisForm, setDiagnosisForm] = useState({
    description: '',
    prescription: '',
    files: null
  });
  const [submittingDiagnosis, setSubmittingDiagnosis] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchAllPatients();
  }, []);

  const fetchAllPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all pets with their owner information
      const response = await petService.getAllPets();
      if (response.success) {
        setPatients(response.data || []);
      } else {
        setError('Error al cargar los pacientes');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Error al cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.breed && patient.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.owner && patient.owner.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openDiagnosisModal = (patient, diagnosis = null) => {
    setSelectedPatient(patient);
    setEditingDiagnosis(diagnosis);
    setDiagnosisForm({
      description: diagnosis?.description || '',
      prescription: diagnosis?.prescription || '',
      files: null
    });
    setShowDiagnosisModal(true);
  };

  const closeDiagnosisModal = () => {
    setShowDiagnosisModal(false);
    setEditingDiagnosis(null);
    setDiagnosisForm({
      description: '',
      prescription: '',
      files: null
    });
    // Don't clear selectedPatient if history modal is open
    if (!showHistoryModal) {
      setSelectedPatient(null);
    }
  };

  const openHistoryModal = async (patient) => {
    setSelectedPatient(patient);
    setShowHistoryModal(true);
    await fetchPatientHistory(patient.id);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    // Don't clear selectedPatient if diagnosis modal is open
    if (!showDiagnosisModal) {
      setSelectedPatient(null);
    }
    setPatientHistory([]);
  };

  const clearAllModals = () => {
    setShowHistoryModal(false);
    setShowDiagnosisModal(false);
    setSelectedPatient(null);
    setEditingDiagnosis(null);
    setPatientHistory([]);
    setDiagnosisForm({
      description: '',
      prescription: '',
      files: null
    });
  };

  const fetchPatientHistory = async (petId) => {
    try {
      setLoadingHistory(true);
      console.log('🔍 Fetching history for pet:', petId);
      console.log('👤 Current user:', user);
      
      // Check if token exists
      const token = localStorage.getItem('authToken');
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token length:', token?.length);
      
      const response = await api.get(`/diagnosis/pet/${petId}`);
      console.log('📋 History response:', response.data);
      
      if (response.data.success) {
        setPatientHistory(response.data.data.diagnoses || []);
      } else {
        toast.error('Error al cargar el historial');
      }
    } catch (error) {
      console.error('❌ Error fetching patient history:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error('Error al cargar el historial');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setDiagnosisForm(prev => ({
      ...prev,
      files: files
    }));
  };

  const handleSubmitDiagnosis = async (e) => {
    e.preventDefault();
    
    console.log('🏥 Submit diagnosis:', {
      selectedPatient: selectedPatient,
      editingDiagnosis: editingDiagnosis,
      diagnosisForm: diagnosisForm
    });
    
    // Check if selectedPatient exists
    if (!selectedPatient) {
      console.error('❌ No patient selected');
      toast.error('Error: No se ha seleccionado un paciente');
      return;
    }
    
    // Only require description for new diagnoses, allow optional fields for updates
    if (!editingDiagnosis && !diagnosisForm.description.trim()) {
      toast.error('La descripción del diagnóstico es requerida para crear un nuevo diagnóstico');
      return;
    }

    try {
      setSubmittingDiagnosis(true);
      
      let response;
      
      if (editingDiagnosis) {
        // Update existing diagnosis
        const updateData = {};
        if (diagnosisForm.description.trim()) updateData.description = diagnosisForm.description;
        if (diagnosisForm.prescription.trim()) updateData.prescription = diagnosisForm.prescription;
        
        response = await api.put(`/diagnosis/${editingDiagnosis.id}`, updateData);
        
        // Handle file uploads separately for existing diagnosis
        if (diagnosisForm.files && diagnosisForm.files.length > 0) {
          const formData = new FormData();
          diagnosisForm.files.forEach((file) => {
            formData.append('files', file);
          });
          
          await api.post(`/diagnosis/${editingDiagnosis.id}/files`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
        
        toast.success('Diagnóstico actualizado exitosamente');
      } else {
        // Create new diagnosis
        const formData = new FormData();
        formData.append('petId', selectedPatient.id);
        formData.append('description', diagnosisForm.description);
        if (diagnosisForm.prescription.trim()) {
          formData.append('prescription', diagnosisForm.prescription);
        }
        
        // Add files if any
        if (diagnosisForm.files && diagnosisForm.files.length > 0) {
          diagnosisForm.files.forEach((file) => {
            formData.append('files', file);
          });
        }

        response = await api.post('/diagnosis', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        toast.success('Diagnóstico creado exitosamente');
      }

      if (response.data.success) {
        // Refresh patient data first
        await fetchAllPatients();
        
        // If history modal is open, refresh history and keep it open
        if (showHistoryModal && selectedPatient) {
          await fetchPatientHistory(selectedPatient.id);
          closeDiagnosisModal(); // Only close diagnosis modal
        } else {
          clearAllModals(); // Close everything if no history modal
        }
      } else {
        toast.error(response.data.error?.message || 'Error al procesar el diagnóstico');
      }
    } catch (error) {
      console.error('Error processing diagnosis:', error);
      toast.error('Error al procesar el diagnóstico');
    } finally {
      setSubmittingDiagnosis(false);
    }
  };

  const PatientCard = ({ patient }) => (
    <div className="card">
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              {patient.photo ? (
                <img 
                  src={patient.photo} 
                  alt={patient.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl">🐾</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">{patient.name}</h3>
              <p className="text-sm text-neutral-600">
                {patient.species} • {patient.breed || 'Sin raza específica'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => openHistoryModal(patient)}
              className="btn btn-outline btn-sm"
              title="Ver historial"
            >
              <span className="w-4 h-4 mr-1">📋</span>
              Historial
            </button>
            <button
              onClick={() => openDiagnosisModal(patient)}
              className="btn btn-primary btn-sm"
              title="Crear diagnóstico"
            >
              <span className="w-4 h-4 mr-1">➕</span>
              Diagnóstico
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div>
            <span className="text-neutral-500">Edad:</span>
            <div className="font-medium">{patient.age ? `${patient.age} años` : 'N/A'}</div>
          </div>
          <div>
            <span className="text-neutral-500">Peso:</span>
            <div className="font-medium">{patient.weight ? `${patient.weight} kg` : 'N/A'}</div>
          </div>
          <div>
            <span className="text-neutral-500">Género:</span>
            <div className="font-medium">
              {patient.gender === 'MALE' ? 'Macho' : 
               patient.gender === 'FEMALE' ? 'Hembra' : 'Desconocido'}
            </div>
          </div>
          <div>
            <span className="text-neutral-500">Dueño:</span>
            <div className="font-medium">{patient.owner?.name || 'N/A'}</div>
          </div>
        </div>

        {patient.owner && (
          <div className="bg-neutral-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-neutral-600">👤</span>
              <span className="text-sm font-medium text-neutral-900">Información del Propietario</span>
            </div>
            <div className="text-sm text-neutral-600 space-y-1">
              <div>Email: {patient.owner.email}</div>
              {patient.owner.phone && <div>Teléfono: {patient.owner.phone}</div>}
              {patient.owner.address && <div>Dirección: {patient.owner.address}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Error al cargar</h2>
          <p className="text-neutral-600 mb-4">{error}</p>
          <button onClick={fetchAllPatients} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Todos los Pacientes
        </h1>
        <p className="text-neutral-600">
          Gestiona todos los pacientes registrados en el sistema
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, especie, raza o propietario..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{patients.length}</div>
            <div className="text-sm text-neutral-600">Total Pacientes</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{filteredPatients.length}</div>
            <div className="text-sm text-neutral-600">Resultados Filtrados</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">Dr. {user?.name}</div>
            <div className="text-sm text-neutral-600">Veterinario</div>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            No se encontraron pacientes
          </h3>
          <p className="text-neutral-600">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay pacientes registrados'}
          </p>
        </div>
      )}

      {/* Diagnosis Modal */}
      <Modal 
        isOpen={showDiagnosisModal}
        onClose={closeDiagnosisModal}
        title={`${editingDiagnosis ? 'Editar' : 'Crear'} Diagnóstico - ${selectedPatient?.name}`}
      >
        <form onSubmit={handleSubmitDiagnosis} className="space-y-6">
          {/* Patient Info */}
          {selectedPatient && (
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">🐾</span>
                <div>
                  <h4 className="font-semibold text-neutral-900">{selectedPatient.name}</h4>
                  <p className="text-sm text-neutral-600">
                    {selectedPatient.species} • {selectedPatient.breed || 'Sin raza específica'}
                  </p>
                </div>
              </div>
              <div className="text-sm text-neutral-600">
                Propietario: {selectedPatient.owner?.name || 'N/A'}
              </div>
            </div>
          )}

          {/* Diagnosis Description */}
          <div className="form-group">
            <label className="form-label">
              Descripción del Diagnóstico {!editingDiagnosis && '*'}
            </label>
            <textarea
              className="input min-h-[120px] resize-none"
              placeholder="Describe el diagnóstico, síntomas observados, hallazgos, etc..."
              value={diagnosisForm.description}
              onChange={(e) => setDiagnosisForm(prev => ({
                ...prev,
                description: e.target.value
              }))}
              required={!editingDiagnosis}
            />
          </div>

          {/* Prescription */}
          <div className="form-group">
            <label className="form-label">Prescripción / Tratamiento</label>
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="Medicamentos, dosis, tratamientos recomendados..."
              value={diagnosisForm.prescription}
              onChange={(e) => setDiagnosisForm(prev => ({
                ...prev,
                prescription: e.target.value
              }))}
            />
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label className="form-label">Archivos Adjuntos (PDF, Imágenes)</label>
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
              <span className="text-2xl mx-auto mb-2">📤</span>
              <div className="text-neutral-600 mb-2">
                Arrastra archivos aquí o haz clic para seleccionar
              </div>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="diagnosis-files"
              />
              <label htmlFor="diagnosis-files" className="btn btn-outline btn-sm">
                Seleccionar Archivos
              </label>
            </div>
            
            {/* Selected Files Preview */}
            {diagnosisForm.files && diagnosisForm.files.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium text-neutral-700 mb-2">
                  Archivos seleccionados:
                </div>
                <div className="space-y-2">
                  {Array.from(diagnosisForm.files).map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-neutral-50 p-2 rounded">
                      <span className="text-sm text-neutral-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = Array.from(diagnosisForm.files).filter((_, i) => i !== index);
                          setDiagnosisForm(prev => ({
                            ...prev,
                            files: newFiles.length > 0 ? newFiles : null
                          }));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <span>❌</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeDiagnosisModal}
              className="btn btn-outline"
              disabled={submittingDiagnosis}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingDiagnosis}
            >
              {submittingDiagnosis ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  {editingDiagnosis ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  {editingDiagnosis ? (
                    <><span className="mr-2">✏️</span>Actualizar Diagnóstico</>
                  ) : (
                    <><span className="mr-2">➕</span>Crear Diagnóstico</>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Patient History Modal */}
      <Modal 
        isOpen={showHistoryModal}
        onClose={closeHistoryModal}
        title={`Historial Médico - ${selectedPatient?.name}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Patient Info */}
          {selectedPatient && (
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">🐾</span>
                <div>
                  <h4 className="font-semibold text-neutral-900">{selectedPatient.name}</h4>
                  <p className="text-sm text-neutral-600">
                    {selectedPatient.species} • {selectedPatient.breed || 'Sin raza específica'}
                  </p>
                </div>
              </div>
              <div className="text-sm text-neutral-600">
                Propietario: {selectedPatient.owner?.name || 'N/A'}
              </div>
            </div>
          )}

          {/* Add New Diagnosis Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-neutral-900">Historial de Diagnósticos</h3>
            <button
              onClick={() => openDiagnosisModal(selectedPatient)}
              className="btn btn-primary btn-sm"
            >
              <span className="mr-2">➕</span>
              Nuevo Diagnóstico
            </button>
          </div>

          {/* History Content */}
          {loadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-neutral-600">Cargando historial...</p>
            </div>
          ) : patientHistory.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {patientHistory.map((diagnosis) => (
                <div key={diagnosis.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-primary-600">📄</span>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          Dr. {diagnosis.veterinarian?.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {new Date(diagnosis.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openDiagnosisModal(selectedPatient, diagnosis)}
                        className="btn btn-outline btn-xs"
                        title="Editar diagnóstico"
                      >
                        <span>✏️</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-1">Diagnóstico:</h4>
                      <p className="text-sm text-neutral-600">{diagnosis.description}</p>
                    </div>
                    
                    {diagnosis.prescription && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-700 mb-1">Prescripción:</h4>
                        <p className="text-sm text-neutral-600">{diagnosis.prescription}</p>
                      </div>
                    )}
                    
                    {diagnosis.files && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-700 mb-1">Archivos:</h4>
                        <div className="flex flex-wrap gap-2">
                          {JSON.parse(diagnosis.files).map((fileUrl, index) => {
                            const fileName = fileUrl.split('/').pop();
                            const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
                            return (
                              <a
                                key={index}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-1 bg-neutral-100 text-xs text-neutral-700 rounded hover:bg-neutral-200"
                              >
                                {isImage ? <span className="mr-1">👁️</span> : <span className="mr-1">📥</span>}
                                {fileName}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-6xl text-neutral-300 mx-auto mb-3">📄</span>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Sin historial médico</h3>
              <p className="text-neutral-600 mb-4">
                Este paciente aún no tiene diagnósticos registrados.
              </p>
              <button
                onClick={() => openDiagnosisModal(selectedPatient)}
                className="btn btn-primary"
              >
                <span className="mr-2">➕</span>
                Crear Primer Diagnóstico
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default VetPatientsPage;