import React, { useState, useRef } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit, FiSave, FiX, FiCamera, FiTrash2, FiUpload } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { getImageUrl } from '../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || ''
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [photoPreview, setPhotoPreview] = useState(getImageUrl(user?.photo) || null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPhotoPreview, setCurrentPhotoPreview] = useState(getImageUrl(user?.photo) || null);
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      zipCode: user?.zipCode || ''
    });
    setIsEditing(false);
  };

  // Photo handling functions
  const handlePhotoClick = () => {
    setCurrentPhotoPreview(photoPreview);
    setIsPhotoModalOpen(true);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen válida');
        return;
      }

      // Validate file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast.error('La imagen no puede ser mayor a 25MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL for the modal
      const reader = new FileReader();
      reader.onload = (e) => {
        setCurrentPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      console.log('Archivo seleccionado:', file.name, 'Tamaño:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedFile && !currentPhotoPreview) {
      toast.error('No hay imagen seleccionada');
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading('Subiendo imagen...');
      
      if (selectedFile) {
        // Call the real API to upload the photo
        console.log('Uploading file:', selectedFile.name);
        
        const updatedUser = await authService.uploadProfilePhoto(selectedFile);
        
        // Update the user context with the response from server
        updateUser(updatedUser);
        
        // Update local photo preview with the server URL
        setPhotoPreview(getImageUrl(updatedUser.photo));
      }
      
      // Reset modal state
      setIsPhotoModalOpen(false);
      setSelectedFile(null);
      setCurrentPhotoPreview(null);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.dismiss(loadingToast);
      toast.success('Foto de perfil actualizada exitosamente');
      
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || 'Error al subir la imagen');
      console.error('Photo upload error:', error);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const loadingToast = toast.loading('Eliminando foto...');
      
      // Call the real API to remove the photo
      const updatedUser = await authService.removeProfilePhoto();
      
      // Update the user context with the response from server
      updateUser(updatedUser);
      
      // Update all photo states
      setPhotoPreview(null);
      setCurrentPhotoPreview(null);
      setSelectedFile(null);
      setIsPhotoModalOpen(false);
      
      toast.dismiss(loadingToast);
      toast.success('Foto de perfil eliminada exitosamente');
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || 'Error al eliminar la foto');
      console.error('Photo removal error:', error);
    }
  };

  const closePhotoModal = () => {
    setIsPhotoModalOpen(false);
    setSelectedFile(null);
    // Reset to the current saved photo
    setCurrentPhotoPreview(photoPreview);
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: FiUser },
    { id: 'security', label: 'Seguridad', icon: FiEdit },
    { id: 'notifications', label: 'Notificaciones', icon: FiMail }
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-start space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
            {photoPreview ? (
              <img 
                src={photoPreview} 
                alt="Foto de perfil" 
                className="w-full h-full object-cover"
              />
            ) : (
              <FiUser className="text-primary-600" size={32} />
            )}
          </div>
          <button 
            onClick={handlePhotoClick}
            className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
            title="Cambiar foto de perfil"
          >
            <FiCamera size={14} />
          </button>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">{user?.name}</h2>
              <p className="text-neutral-600">{user?.email}</p>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user?.role === 'ADMIN' 
                    ? 'bg-purple-100 text-purple-800'
                    : user?.role === 'VETERINARIAN'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user?.role === 'ADMIN' ? 'Administrador' : 
                   user?.role === 'VETERINARIAN' ? 'Veterinario' : 'Usuario'}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`btn ${isEditing ? 'btn-outline' : 'btn-primary'} flex items-center`}
            >
              {isEditing ? (
                <>
                  <FiX className="mr-2" size={16} />
                  Cancelar
                </>
              ) : (
                <>
                  <FiEdit className="mr-2" size={16} />
                  Editar Perfil
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-neutral-900">Información Personal</h3>
        </div>
        <div className="card-body">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label flex items-center">
                  <FiUser className="mr-2" size={16} />
                  Nombre Completo
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label flex items-center">
                  <FiMail className="mr-2" size={16} />
                  Email
                </label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label flex items-center">
                  <FiPhone className="mr-2" size={16} />
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="input"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Ej: +1 234 567 8900"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label flex items-center">
                  <FiMapPin className="mr-2" size={16} />
                  Dirección
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Calle, número, apartamento"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-group">
                <label className="form-label">Ciudad</label>
                <input
                  type="text"
                  className="input"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Ciudad"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Estado/Provincia</label>
                <input
                  type="text"
                  className="input"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Estado"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Código Postal</label>
                <input
                  type="text"
                  className="input"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  disabled={!isEditing}
                  placeholder="12345"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-outline"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="btn btn-primary flex items-center"
                >
                  <FiSave className="mr-2" size={16} />
                  Guardar Cambios
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-neutral-900">Estadísticas de la Cuenta</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 mb-2">
                {user?.role === 'USER' ? '2' : user?.role === 'VETERINARIAN' ? '45' : '156'}
              </div>
              <div className="text-sm text-neutral-600">
                {user?.role === 'USER' ? 'Mascotas Registradas' : 
                 user?.role === 'VETERINARIAN' ? 'Pacientes Atendidos' : 'Usuarios Totales'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {user?.role === 'USER' ? '5' : user?.role === 'VETERINARIAN' ? '125' : '89'}
              </div>
              <div className="text-sm text-neutral-600">
                {user?.role === 'USER' ? 'Citas Completadas' : 
                 user?.role === 'VETERINARIAN' ? 'Diagnósticos Realizados' : 'Productos Activos'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
              </div>
              <div className="text-sm text-neutral-600">Miembro desde</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-neutral-900">Cambiar Contraseña</h3>
        </div>
        <div className="card-body">
          <form className="space-y-6">
            <div className="form-group">
              <label className="form-label">Contraseña Actual</label>
              <input
                type="password"
                className="input"
                placeholder="Ingresa tu contraseña actual"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Nueva Contraseña</label>
              <input
                type="password"
                className="input"
                placeholder="Ingresa tu nueva contraseña"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                className="input"
                placeholder="Confirma tu nueva contraseña"
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">
                Actualizar Contraseña
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-neutral-900">Autenticación de Dos Factores</h3>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-neutral-900 mb-1">
                Autenticación de Dos Factores (2FA)
              </h4>
              <p className="text-sm text-neutral-600">
                Agrega una capa extra de seguridad a tu cuenta
              </p>
            </div>
            <button className="btn btn-outline">
              Habilitar 2FA
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-neutral-900">Preferencias de Notificación</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-neutral-900">Notificaciones por Email</h4>
              <p className="text-sm text-neutral-600">Recibe actualizaciones importantes por correo</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-neutral-900">Recordatorios de Citas</h4>
              <p className="text-sm text-neutral-600">Recibe recordatorios antes de tus citas</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-neutral-900">Promociones y Ofertas</h4>
              <p className="text-sm text-neutral-600">Recibe información sobre descuentos y promociones</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-neutral-900">Actualizaciones del Sistema</h4>
              <p className="text-sm text-neutral-600">Notificaciones sobre mantenimiento y actualizaciones</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Mi Perfil
          </h1>
          <p className="text-neutral-600">
            Gestiona tu información personal y configuración de cuenta.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-neutral-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Icon className="mr-2" size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'security' && renderSecurityTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Photo Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Foto de Perfil
                </h3>
                <button
                  onClick={closePhotoModal}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Photo Preview */}
              <div className="mb-6">
                <div className="w-48 h-48 mx-auto bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-neutral-200">
                  {currentPhotoPreview ? (
                    <img 
                      src={currentPhotoPreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <FiUser className="text-neutral-400 mx-auto mb-2" size={64} />
                      <p className="text-sm text-neutral-500">Sin foto</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleFileSelect}
                  className="w-full btn btn-outline flex items-center justify-center"
                >
                  <FiUpload className="mr-2" size={16} />
                  {currentPhotoPreview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                </button>

                {/* Botón de Aceptar/Guardar - aparece cuando hay archivo seleccionado */}
                {selectedFile && (
                  <button
                    onClick={handleSavePhoto}
                    className="w-full btn btn-primary flex items-center justify-center"
                  >
                    <FiSave className="mr-2" size={16} />
                    Aceptar y Guardar
                  </button>
                )}

                {/* Botón de Eliminar - aparece cuando hay foto guardada */}
                {(currentPhotoPreview && !selectedFile) && (
                  <button
                    onClick={handleRemovePhoto}
                    className="w-full btn btn-outline text-red-600 border-red-300 hover:bg-red-50 flex items-center justify-center"
                  >
                    <FiTrash2 className="mr-2" size={16} />
                    Eliminar Foto
                  </button>
                )}

                {/* Botón de Cancelar - aparece cuando hay cambios sin guardar */}
                {selectedFile && (
                  <button
                    onClick={closePhotoModal}
                    className="w-full btn btn-outline text-neutral-600 border-neutral-300 hover:bg-neutral-50 flex items-center justify-center"
                  >
                    <FiX className="mr-2" size={16} />
                    Cancelar
                  </button>
                )}
              </div>

              {/* File Info */}
              {selectedFile && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FiUpload className="text-green-600 mr-2" size={16} />
                    <span className="text-sm font-medium text-green-800">Archivo seleccionado</span>
                  </div>
                  <p className="text-sm text-green-700">
                    <strong>Nombre:</strong> {selectedFile.name}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Tamaño:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Listo para guardar
                  </p>
                </div>
              )}

              {/* Guidelines */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Recomendaciones:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Formatos soportados: JPG, PNG, GIF</li>
                  <li>• Tamaño máximo: 25MB</li>
                  <li>• Resolución recomendada: 400x400px</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;