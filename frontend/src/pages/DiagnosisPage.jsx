import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiFileText, FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import DiagnosisForm from '../components/vet/DiagnosisForm';
import DiagnosisHistory from '../components/vet/DiagnosisHistory';
import Modal, { ModalBody } from '../components/common/Modal';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DiagnosisPage = () => {
  const { user } = useAuth();
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(null); // Track which pet photo is being uploaded
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPetForPhoto, setSelectedPetForPhoto] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showDiagnosisHistory, setShowDiagnosisHistory] = useState(false);
  const [selectedPetForHistory, setSelectedPetForHistory] = useState(null);

  // Add authentication check
  useEffect(() => {
    if (!user) {
      console.warn('⚠️ User not found in context');
      return;
    }
    
    if (user.role !== 'VETERINARIAN' && user.role !== 'ADMIN') {
      console.warn('⚠️ User does not have veterinarian permissions:', user.role);
      setError('No tienes permisos para acceder a esta página');
      return;
    }
    
    console.log('✅ User has veterinarian permissions:', user);
  }, [user]);

  useEffect(() => {
    const initializePage = async () => {
      const token = localStorage.getItem('authToken');
      console.log('🔍 Auth Debug - Token exists:', !!token);
      console.log('🔍 Auth Debug - User from context:', user);
      
      if (!token) {
        setError('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      // Test token with profile endpoint first
      try {
        const profileResponse = await api.get('/auth/profile');
        console.log('✅ Token is valid, profile:', profileResponse.data);
        
        const profileUser = profileResponse.data.data;
        if (profileUser.role !== 'VETERINARIAN' && profileUser.role !== 'ADMIN') {
          setError('No tienes permisos de veterinario para acceder a esta página.');
          setLoading(false);
          return;
        }

        // If we get here, authentication is good, proceed with data fetch
        if (user || profileUser) {
          fetchAppointmentsAndDiagnoses();
        }
        
      } catch (error) {
        console.error('❌ Token validation failed:', error.response?.data || error.message);
        setError('Token de autenticación inválido. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        // Clear invalid token
        localStorage.removeItem('authToken');
      }
    };
    
    initializePage();
  }, []); // Remove user dependency to avoid infinite loop

  const fetchAppointmentsAndDiagnoses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔗 Making request to /appointments/vet');
      const appointmentsResponse = await api.get('/appointments/vet');
      console.log('📅 Appointments response:', appointmentsResponse.data);
      
      // Fetch diagnoses created by the veterinarian
      const diagnosesResponse = await api.get('/diagnosis/vet/list');
      console.log('🏥 Diagnoses response:', diagnosesResponse.data);
      
      if (appointmentsResponse.data.success) {
        const appointmentsData = appointmentsResponse.data.data || [];
        console.log('📋 Raw appointments data:', appointmentsData);
        
        // Process appointments to add hasDiagnosis flag
        const processedAppointments = appointmentsData.map(appointment => {
          console.log(`🐾 Pet ${appointment.pet?.name} photo:`, appointment.pet?.photo);
          return {
            ...appointment,
            hasDiagnosis: appointment.diagnosis ? true : false
          };
        });
        
        console.log('📋 Processed appointments:', processedAppointments);
        setAppointments(processedAppointments);
      } else {
        setError('Error al cargar las citas');
      }
      
      if (diagnosesResponse.data.success) {
        setDiagnoses(diagnosesResponse.data.data.diagnoses || []);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos');
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'Todas', count: appointments.length },
    { value: 'pending', label: 'Pendientes', count: appointments.filter(apt => !apt.hasDiagnosis).length },
    { value: 'completed', label: 'Completadas', count: appointments.filter(apt => apt.hasDiagnosis).length }
  ];

  const filteredAppointments = appointments.filter(appointment => {
    // Filter by status
    let statusMatch = true;
    if (filterStatus === 'pending') {
      statusMatch = !appointment.hasDiagnosis;
    } else if (filterStatus === 'completed') {
      statusMatch = appointment.hasDiagnosis;
    }

    // Filter by search term
    const searchMatch = searchTerm === '' || 
      (appointment.pet?.name && appointment.pet.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.user?.name && appointment.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.reason && appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    return statusMatch && searchMatch;
  });

  const handleCreateDiagnosis = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDiagnosisForm(true);
  };

  const handleSaveDiagnosis = async (diagnosisData) => {
    try {
      console.log('Saving diagnosis:', diagnosisData);
      
      const formData = new FormData();
      formData.append('petId', selectedAppointment.pet.id);
      formData.append('description', diagnosisData.diagnosis);
      if (diagnosisData.treatment) {
        formData.append('prescription', diagnosisData.treatment);
      }
      if (selectedAppointment.id) {
        formData.append('appointmentId', selectedAppointment.id);
      }
      
      // Add files if any
      if (diagnosisData.files && diagnosisData.files.length > 0) {
        diagnosisData.files.forEach((file) => {
          formData.append('files', file);
        });
      }
      
      const response = await api.post('/diagnosis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        toast.success('Diagnóstico guardado exitosamente');
        setShowDiagnosisForm(false);
        setSelectedAppointment(null);
        // Refresh data
        await fetchAppointmentsAndDiagnoses();
      } else {
        toast.error('Error al guardar el diagnóstico');
      }
      
    } catch (error) {
      console.error('Error saving diagnosis:', error);
      toast.error('Error al guardar el diagnóstico');
    }
  };

  const handleCancelDiagnosis = () => {
    setShowDiagnosisForm(false);
    setSelectedAppointment(null);
  };

  const handleShowHistory = (pet) => {
    setSelectedPetForHistory(pet);
    setShowDiagnosisHistory(true);
  };

  const handleCloseHistory = () => {
    setShowDiagnosisHistory(false);
    setSelectedPetForHistory(null);
  };

  const handlePetPhotoUpload = async (petId, file) => {
    try {
      console.log('🔄 Starting photo upload for pet:', petId);
      setUploadingPhoto(petId);
      
      const formData = new FormData();
      formData.append('photo', file);
      
      console.log('📤 Sending photo upload request...');
      const response = await api.put(`/pets/${petId}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('📥 Upload response:', response.data);
      
      if (response.data.success) {
        toast.success('Foto de mascota actualizada exitosamente');
        console.log('✅ Photo uploaded successfully, refreshing data...');
        // Refresh appointments to show the new photo
        await fetchAppointmentsAndDiagnoses();
        console.log('🔄 Data refreshed');
      } else {
        console.error('❌ Upload failed:', response.data);
        toast.error('Error al subir la foto');
      }
    } catch (error) {
      console.error('❌ Error uploading pet photo:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Error al subir la foto de la mascota');
    } finally {
      setUploadingPhoto(null);
    }
  };

  const handlePhotoInputChange = (petId, event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen válida');
        return;
      }
      
      // Validate file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast.error('La imagen es muy grande. Máximo 25MB');
        return;
      }
      
      handlePetPhotoUpload(petId, file);
    }
  };

  const handleOpenPhotoModal = (pet) => {
    setSelectedPetForPhoto(pet);
    setPreviewImage(null);
    setShowPhotoModal(true);
  };

  const handleClosePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPetForPhoto(null);
    setPreviewImage(null);
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen válida');
        return;
      }
      
      // Validate file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast.error('La imagen es muy grande. Máximo 25MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage({
          file,
          url: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSelectedPhoto = async () => {
    if (previewImage && selectedPetForPhoto) {
      console.log('🔄 Starting upload process for pet:', selectedPetForPhoto.id);
      await handlePetPhotoUpload(selectedPetForPhoto.id, previewImage.file);
      console.log('✅ Upload completed, closing modal');
      handleClosePhotoModal();
      
      // Force a complete refresh after a short delay to ensure backend has processed
      setTimeout(async () => {
        console.log('🔄 Forcing data refresh...');
        await fetchAppointmentsAndDiagnoses();
      }, 1000);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUploadingPhoto(selectedPetForPhoto.id);
      
      const response = await api.delete(`/pets/${selectedPetForPhoto.id}/photo`);
      
      if (response.data.success) {
        toast.success('Foto eliminada exitosamente');
        await fetchAppointmentsAndDiagnoses();
        handleClosePhotoModal();
      } else {
        toast.error('Error al eliminar la foto');
      }
    } catch (error) {
      console.error('Error removing pet photo:', error);
      toast.error('Error al eliminar la foto de la mascota');
    } finally {
      setUploadingPhoto(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Diagnósticos Médicos
          </h1>
          <p className="text-neutral-600">
            Gestiona diagnósticos y historiales médicos de tus pacientes.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por mascota, propietario o tipo de consulta..."
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
              onClick={() => setFilterStatus(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                filterStatus === option.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {option.label}
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                filterStatus === option.value
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
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando citas y diagnósticos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Error al cargar</h2>
          <p className="text-neutral-600 mb-4">{error}</p>
          <button onClick={fetchAppointmentsAndDiagnoses} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="card">
              <div className="card-body">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="relative group cursor-pointer"
                      onClick={() => handleOpenPhotoModal(appointment.pet)}
                    >
                      {appointment.pet?.photo ? (
                        <div className="relative">
                          <img 
                            src={`${appointment.pet.photo.startsWith('http') ? appointment.pet.photo : `http://localhost:3001${appointment.pet.photo}`}?t=${Date.now()}`}
                            alt={appointment.pet.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              // Fallback to emoji if image fails to load
                              console.log('❌ Image failed to load:', e.target.src);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <span 
                            className="text-2xl"
                            style={{
                              display: 'none'
                            }}
                          >
                            {appointment.pet?.species === 'Perro' || appointment.pet?.species === 'DOG' ? '🐶' : 
                             appointment.pet?.species === 'Gato' || appointment.pet?.species === 'CAT' ? '🐱' : '🐾'}
                          </span>
                          {/* Overlay for changing photo */}
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs">📷</span>
                          </div>
                          {/* Tooltip */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Gestionar foto
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full border-2 border-dashed border-gray-300 group-hover:border-primary-400 transition-colors">
                          <span className="text-2xl">
                            {appointment.pet?.species === 'Perro' || appointment.pet?.species === 'DOG' ? '🐶' : 
                             appointment.pet?.species === 'Gato' || appointment.pet?.species === 'CAT' ? '🐱' : '🐾'}
                          </span>
                          {/* Add photo overlay */}
                          <div className="absolute inset-0 bg-primary-500 bg-opacity-80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs">+📷</span>
                          </div>
                          {/* Tooltip */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Agregar foto
                          </div>
                        </div>
                      )}
                      
                      {/* Loading indicator */}
                      {uploadingPhoto === appointment.pet.id && (
                        <div className="absolute inset-0 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                          <div className="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        {appointment.pet?.name || 'Mascota sin nombre'}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {appointment.pet?.species || 'N/A'} • {appointment.pet?.breed || 'Sin raza'}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.hasDiagnosis
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.hasDiagnosis ? 'Completado' : 'Pendiente'}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    <FiUser size={14} />
                    <span>{appointment.user?.name || 'Propietario desconocido'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    <FiCalendar size={14} />
                    <span>{formatDate(appointment.date)} - {formatTime(appointment.date)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    <FiFileText size={14} />
                    <span>{appointment.reason || 'Sin motivo especificado'}</span>
                  </div>
                </div>

                {/* Notes */}
                {appointment.notes && (
                  <div className="p-3 bg-neutral-50 rounded-lg mb-4">
                    <p className="text-sm text-neutral-700">
                      <span className="font-medium">Notas:</span> {appointment.notes}
                    </p>
                  </div>
                )}

                {/* Action */}
                <div className="pt-4 border-t border-neutral-200">
                  <div className="space-y-2">
                  {appointment.hasDiagnosis ? (
                    <button className="btn btn-outline btn-sm w-full">
                      Ver Diagnóstico
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCreateDiagnosis(appointment)}
                      className="btn btn-primary btn-sm w-full flex items-center justify-center"
                    >
                      <FiPlus className="mr-2" size={14} />
                      Crear Diagnóstico
                    </button>
                  )}
                  <button
                    onClick={() => handleShowHistory(appointment.pet)}
                    className="btn btn-outline btn-sm w-full flex items-center justify-center"
                  >
                    <FiClock className="mr-2" size={14} />
                    Historial
                  </button>
                </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-8xl mb-6">📋</div>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'No se encontraron consultas' 
              : 'No hay consultas pendientes'
            }
          </h2>
          <p className="text-neutral-600 mb-8 max-w-md mx-auto">
            {searchTerm || filterStatus !== 'all'
              ? 'Intenta ajustar los filtros o términos de búsqueda.'
              : 'Las consultas completadas aparecerán aquí para crear sus diagnósticos.'
            }
          </p>
        </div>
      )}

      {/* Recent Diagnoses */}
      {diagnoses.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">
            Diagnósticos Recientes
          </h2>
          <div className="space-y-4">
            {diagnoses.map((diagnosis) => (
              <div key={diagnosis.id} className="card">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Pet photo */}
                      <div className="flex-shrink-0">
                        {diagnosis.pet?.photo ? (
                          <img 
                            src={`${diagnosis.pet?.photo?.startsWith('http') ? diagnosis.pet.photo : `http://localhost:3001${diagnosis.pet.photo}`}?t=${Date.now()}`}
                            alt={diagnosis.pet.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              console.log('❌ Diagnosis image failed to load:', e.target.src);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <span 
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg"
                          style={{
                            display: diagnosis.pet?.photo ? 'none' : 'flex'
                          }}
                        >
                          {diagnosis.pet?.species === 'Perro' || diagnosis.pet?.species === 'DOG' ? '🐶' : 
                           diagnosis.pet?.species === 'Gato' || diagnosis.pet?.species === 'CAT' ? '🐱' : '🐾'}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-neutral-900">
                            {diagnosis.pet?.name || 'Mascota'} ({diagnosis.pet?.species || 'N/A'})
                          </h4>
                          <span className="text-sm text-neutral-500">
                            • {diagnosis.pet?.owner?.name || 'Propietario desconocido'}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-700 mb-2">
                          <span className="font-medium">Diagnóstico:</span> {diagnosis.description}
                        </p>
                        {diagnosis.prescription && (
                          <p className="text-sm text-neutral-600">
                            <span className="font-medium">Tratamiento:</span> {diagnosis.prescription}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-neutral-500">
                      {formatDate(diagnosis.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnosis Form Modal */}
      <Modal
        isOpen={showDiagnosisForm}
        onClose={handleCancelDiagnosis}
        title="Crear Diagnóstico Médico"
        size="xl"
      >
        <ModalBody>
          <DiagnosisForm
            appointment={selectedAppointment}
            onSave={handleSaveDiagnosis}
            onCancel={handleCancelDiagnosis}
          />
        </ModalBody>
      </Modal>

      {/* Photo Management Modal */}
      <Modal
        isOpen={showPhotoModal}
        onClose={handleClosePhotoModal}
        title={`Gestionar foto de ${selectedPetForPhoto?.name || 'mascota'}`}
        size="md"
      >
        <ModalBody>
          <div className="space-y-6">
            {/* Current Photo Display */}
            <div className="text-center">
              <div className="relative inline-block">
                {selectedPetForPhoto?.photo ? (
                  <img 
                    src={`${selectedPetForPhoto?.photo?.startsWith('http') ? selectedPetForPhoto.photo : `http://localhost:3001${selectedPetForPhoto.photo}`}?t=${Date.now()}`}
                    alt={selectedPetForPhoto.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 mx-auto"
                    onError={(e) => {
                      console.log('❌ Modal image failed to load:', e.target.src);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-32 h-32 rounded-full bg-gray-100 border-4 border-dashed border-gray-300 mx-auto flex items-center justify-center text-4xl"
                  style={{
                    display: selectedPetForPhoto?.photo ? 'none' : 'flex'
                  }}
                >
                  {selectedPetForPhoto?.species === 'Perro' || selectedPetForPhoto?.species === 'DOG' ? '🐶' : 
                   selectedPetForPhoto?.species === 'Gato' || selectedPetForPhoto?.species === 'CAT' ? '🐱' : '🐾'}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Foto actual de {selectedPetForPhoto?.name}
              </p>
            </div>

            {/* Preview of new photo */}
            {previewImage && (
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-2">Vista previa de la nueva foto:</h4>
                <img 
                  src={previewImage.url}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-200 mx-auto"
                />
              </div>
            )}

            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar nueva foto
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                disabled={uploadingPhoto === selectedPetForPhoto?.id}
              />
              <p className="mt-1 text-xs text-gray-500">
                Formatos soportados: JPG, PNG, GIF. Máximo 25MB.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between space-x-3">
              {/* Remove Photo Button */}
              {selectedPetForPhoto?.photo && (
                <button
                  onClick={handleRemovePhoto}
                  disabled={uploadingPhoto === selectedPetForPhoto?.id}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingPhoto === selectedPetForPhoto?.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full mr-2"></div>
                      Eliminando...
                    </div>
                  ) : (
                    'Eliminar foto'
                  )}
                </button>
              )}
              
              <div className="flex space-x-3 ml-auto">
                {/* Cancel Button */}
                <button
                  onClick={handleClosePhotoModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>
                
                {/* Upload Button */}
                {previewImage && (
                  <button
                    onClick={handleUploadSelectedPhoto}
                    disabled={uploadingPhoto === selectedPetForPhoto?.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingPhoto === selectedPetForPhoto?.id ? (
                      <div className="flex items-center">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Subiendo...
                      </div>
                    ) : (
                      'Actualizar foto'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Diagnosis History Modal */}
      <DiagnosisHistory
        isOpen={showDiagnosisHistory}
        onClose={handleCloseHistory}
        petId={selectedPetForHistory?.id}
        petName={selectedPetForHistory?.name}
      />
    </div>
  );
};

export default DiagnosisPage;