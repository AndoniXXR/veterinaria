import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiMail, FiCalendar, FiEye, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import veterinarianService from '../services/veterinarianService';
import Modal, { ModalBody, ModalFooter } from '../components/common/Modal';

const AdminVeterinariansPage = () => {
  const [veterinarians, setVeterinarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVeterinarian, setSelectedVeterinarian] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Cargar veterinarios
  const fetchVeterinarians = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await veterinarianService.getAllVeterinarians();
      if (response.success) {
        setVeterinarians(response.data);
      } else {
        setError('Error al cargar veterinarios');
      }
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
      setError('Error al cargar veterinarios');
      toast.error('Error al cargar veterinarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVeterinarians();
  }, []);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambio de foto
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) { // 25MB
        toast.error('La imagen no puede ser mayor a 25MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setModalMode('create');
    setSelectedVeterinarian(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      photo: null
    });
    setPhotoPreview(null);
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEdit = (veterinarian) => {
    setModalMode('edit');
    setSelectedVeterinarian(veterinarian);
    setFormData({
      name: veterinarian.name,
      email: veterinarian.email,
      password: '',
      photo: null
    });
    setPhotoPreview(veterinarian.photo && !veterinarian.photo.includes('🩺') 
      ? `http://localhost:3001${veterinarian.photo}` 
      : null);
    setShowModal(true);
  };

  // Abrir modal para ver detalles
  const handleView = (veterinarian) => {
    setModalMode('view');
    setSelectedVeterinarian(veterinarian);
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedVeterinarian(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      photo: null
    });
    setPhotoPreview(null);
    // Limpiar el input file
    const fileInput = document.getElementById('photo');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || (modalMode === 'create' && !formData.password)) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setSubmitting(true);
      
      if (modalMode === 'create') {
        const response = await veterinarianService.createVeterinarian(formData);
        if (response.success) {
          toast.success('Veterinario creado exitosamente');
          fetchVeterinarians();
          closeModal();
        }
      } else if (modalMode === 'edit') {
        const response = await veterinarianService.updateVeterinarian(selectedVeterinarian.id, formData);
        if (response.success) {
          toast.success('Veterinario actualizado exitosamente');
          fetchVeterinarians();
          closeModal();
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar veterinario
  const handleDelete = async (veterinarian) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al veterinario ${veterinarian.name}?`)) {
      try {
        const response = await veterinarianService.deleteVeterinarian(veterinarian.id);
        if (response.success) {
          toast.success('Veterinario eliminado exitosamente');
          fetchVeterinarians();
        }
      } catch (error) {
        console.error('Error deleting veterinarian:', error);
        toast.error(error.response?.data?.message || 'Error al eliminar veterinario');
      }
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Renderizar foto del veterinario
  const renderVetPhoto = (veterinarian, size = 'sm') => {
    const sizeClasses = {
      sm: 'w-10 h-10',
      md: 'w-16 h-16', 
      lg: 'w-20 h-20'
    };
    
    const textSizeClasses = {
      sm: 'text-lg',
      md: 'text-2xl',
      lg: 'text-3xl'
    };

    if (veterinarian.photo && !veterinarian.photo.includes('🩺')) {
      return (
        <img
          src={`http://localhost:3001${veterinarian.photo}`}
          alt={veterinarian.name}
          className={`${sizeClasses[size]} rounded-full object-cover shadow-sm`}
        />
      );
    }
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-blue-100 flex items-center justify-center text-blue-600 ${textSizeClasses[size]} shadow-sm`}>
        🩺
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-900">Veterinarios</h1>
          </div>
          <div className="card">
            <div className="card-body text-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-neutral-600">Cargando veterinarios...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-900">Veterinarios</h1>
          </div>
          <div className="card">
            <div className="card-body text-center py-16">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Error al cargar</h3>
              <p className="text-neutral-600 mb-4">{error}</p>
              <button onClick={fetchVeterinarians} className="btn btn-primary">
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Veterinarios</h1>
            <p className="text-neutral-600 mt-1">Gestiona los veterinarios de la clínica</p>
          </div>
          <button
            onClick={handleCreate}
            className="btn btn-primary flex items-center"
          >
            <FiPlus className="mr-2" size={16} />
            Nuevo Veterinario
          </button>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUser className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Total Veterinarios</p>
                <p className="text-2xl font-bold text-neutral-900">{veterinarians.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiCalendar className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Citas Totales</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {veterinarians.reduce((sum, vet) => sum + (vet.appointmentCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiMail className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Registrados Hoy</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {veterinarians.filter(vet => 
                    new Date(vet.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de veterinarios */}
      <div className="card">
        <div className="card-body p-0">
          {veterinarians.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🩺</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No hay veterinarios</h3>
              <p className="text-neutral-600 mb-4">Comienza agregando el primer veterinario</p>
              <button onClick={handleCreate} className="btn btn-primary">
                <FiPlus className="mr-2" size={16} />
                Agregar Veterinario
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Veterinario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Citas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {veterinarians.map((veterinarian) => (
                    <tr key={veterinarian.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {renderVetPhoto(veterinarian)}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">
                              {veterinarian.name}
                            </div>
                            <div className="text-sm text-neutral-500">
                              ID: {veterinarian.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{veterinarian.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">
                          {veterinarian.appointmentCount || 0} citas
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">
                          {formatDate(veterinarian.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(veterinarian)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalles"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(veterinarian)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(veterinarian)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={
            modalMode === 'create' ? 'Nuevo Veterinario' :
            modalMode === 'edit' ? 'Editar Veterinario' :
            'Detalles del Veterinario'
          }
          size="xl"
        >
          <ModalBody>
            {modalMode === 'view' && selectedVeterinarian ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    {renderVetPhoto(selectedVeterinarian, 'lg')}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {selectedVeterinarian.name}
                    </h3>
                    <p className="text-neutral-600">{selectedVeterinarian.email}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Veterinario
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-t border-neutral-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedVeterinarian.appointmentCount || 0}
                    </div>
                    <div className="text-sm text-neutral-600">Citas Realizadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatDate(selectedVeterinarian.createdAt)}
                    </div>
                    <div className="text-sm text-neutral-600">Fecha de Registro</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {new Date(selectedVeterinarian.updatedAt).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-sm text-neutral-600">Última Actualización</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-200">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      ID del Veterinario
                    </label>
                    <p className="text-sm text-neutral-900 font-mono bg-neutral-50 px-3 py-2 rounded">
                      {selectedVeterinarian.id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Estado de la Cuenta
                    </label>
                    <span className="inline-flex items-center px-3 py-2 rounded text-sm font-medium bg-green-100 text-green-800">
                      ✓ Activa
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Nombre del veterinario"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="email@ejemplo.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                    Contraseña {modalMode === 'create' ? '*' : '(dejar vacío para mantener actual)'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Contraseña segura"
                    required={modalMode === 'create'}
                  />
                  {modalMode === 'edit' && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Solo completa este campo si deseas cambiar la contraseña actual.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="photo" className="block text-sm font-medium text-neutral-700 mb-2">
                    Foto del perfil
                  </label>
                  
                  {/* Vista previa actual y nueva */}
                  <div className="flex items-start space-x-6 mb-4">
                    {/* Foto actual (solo en modo edición) */}
                    {modalMode === 'edit' && selectedVeterinarian && (
                      <div className="text-center">
                        <p className="text-sm font-medium text-neutral-700 mb-2">Foto actual:</p>
                        {renderVetPhoto(selectedVeterinarian, 'lg')}
                        <p className="text-xs text-neutral-500 mt-1">Foto actual</p>
                      </div>
                    )}
                    
                    {/* Vista previa de la nueva foto */}
                    {photoPreview && (
                      <div className="text-center">
                        <p className="text-sm font-medium text-neutral-700 mb-2">
                          {modalMode === 'edit' ? 'Nueva foto:' : 'Vista previa:'}
                        </p>
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-primary-200 shadow-sm"
                        />
                        <p className="text-xs text-neutral-500 mt-1">Nueva imagen</p>
                      </div>
                    )}
                    
                    {/* Placeholder si no hay foto */}
                    {!photoPreview && modalMode === 'create' && (
                      <div className="text-center">
                        <p className="text-sm font-medium text-neutral-700 mb-2">Vista previa:</p>
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl border-2 border-blue-200">
                          🩺
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">Emoji por defecto</p>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="input"
                  />
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-neutral-500">
                      Si no se selecciona foto, se usará un emoji por defecto (🩺). Máximo 25MB.
                    </p>
                    <p className="text-xs text-neutral-400">
                      Formatos soportados: JPG, PNG, GIF, WebP
                    </p>
                    {modalMode === 'edit' && (
                      <p className="text-xs text-amber-600">
                        Si seleccionas una nueva foto, reemplazará la actual.
                      </p>
                    )}
                  </div>
                  
                  {/* Botón para remover foto seleccionada */}
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null);
                        setFormData(prev => ({ ...prev, photo: null }));
                        document.getElementById('photo').value = '';
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Remover foto seleccionada
                    </button>
                  )}
                </div>
              </form>
            )}
          </ModalBody>

          <ModalFooter>
            <button
              type="button"
              onClick={closeModal}
              className="btn btn-outline"
            >
              {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
            </button>
            {modalMode !== 'view' && (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  modalMode === 'create' ? 'Crear Veterinario' : 'Actualizar Veterinario'
                )}
              </button>
            )}
          </ModalFooter>
        </Modal>
      )}
      </div>
    </div>
  );
};

export default AdminVeterinariansPage;
