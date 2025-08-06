import React, { useState, useRef, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiCalendar, FiFileText, FiCamera, FiX, FiLoader } from 'react-icons/fi';
import Modal, { ModalBody, ModalFooter } from '../components/common/Modal';
import petService from '../services/petService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PetsPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    gender: 'MALE'
  });
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  // Load pets on component mount
  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const response = await petService.getUserPets();
      
      if (response.success) {
        setPets(response.data.pets || []);
      } else {
        toast.error('Error al cargar las mascotas');
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      toast.error('Error al conectar con el servidor');
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPet = () => {
    setSelectedPet(null);
    setFormData({
      name: '',
      species: '',
      breed: '',
      age: '',
      weight: '',
      gender: 'MALE'
    });
    setPhotoPreview(null);
    setSelectedPhoto(null);
    setRemoveExistingPhoto(false);
    setShowAddModal(true);
  };

  const handleEditPet = (pet) => {
    setSelectedPet(pet);
    setFormData({
      name: pet.name || '',
      species: pet.species || '',
      breed: pet.breed || '',
      age: pet.age?.toString() || '',
      weight: pet.weight?.toString() || '',
      gender: pet.gender || 'MALE'
    });
    setPhotoPreview(pet.photo); // Set existing photo as preview
    setSelectedPhoto(null); // No new photo selected yet
    setRemoveExistingPhoto(false); // Reset removal flag
    setShowAddModal(true);
  };

  const handleDeletePet = async (pet) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${pet.name}?`)) {
      try {
        await petService.deletePet(pet.id);
        toast.success(`${pet.name} ha sido eliminado exitosamente`);
        fetchPets(); // Refresh pets list
      } catch (error) {
        console.error('Error deleting pet:', error);
        toast.error('Error al eliminar la mascota');
      }
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setSelectedPet(null);
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setRemoveExistingPhoto(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoSelect = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event) => {
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

      setSelectedPhoto(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      console.log('Foto seleccionada:', file.name, 'Tamaño:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    
    // If we're editing a pet with an existing photo, mark it for removal
    if (selectedPet && selectedPet.photo) {
      setRemoveExistingPhoto(true);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }
    if (!formData.species) {
      toast.error('La especie es requerida');
      return false;
    }
    if (formData.age && (isNaN(formData.age) || formData.age < 0 || formData.age > 30)) {
      toast.error('La edad debe ser un número entre 0 y 30');
      return false;
    }
    if (formData.weight && (isNaN(formData.weight) || formData.weight <= 0)) {
      toast.error('El peso debe ser un número mayor a 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      const petData = {
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed.trim() || null,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        gender: formData.gender
      };

      // Handle photo logic
      if (selectedPhoto) {
        // New photo selected
        console.log('📸 Uploading new photo:', selectedPhoto.name);
        petData.photo = selectedPhoto;
      } else if (removeExistingPhoto && selectedPet) {
        // User wants to remove existing photo
        console.log('🗑️ Removing existing photo for pet:', selectedPet.name);
        petData.removePhoto = true;
      }

      console.log('📝 Pet data being sent:', {
        name: petData.name,
        hasPhoto: !!petData.photo,
        removePhoto: petData.removePhoto,
        isUpdate: !!selectedPet
      });

      let response;
      if (selectedPet) {
        // Update existing pet
        response = await petService.updatePet(selectedPet.id, petData);
        toast.success(`${formData.name} actualizado exitosamente`);
      } else {
        // Create new pet
        response = await petService.createPet(petData);
        toast.success(`${formData.name} registrado exitosamente`);
      }

      closeModal();
      fetchPets(); // Refresh pets list
      
    } catch (error) {
      console.error('Error saving pet:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          (selectedPet ? 'Error al actualizar la mascota' : 'Error al registrar la mascota');
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getGenderLabel = (gender) => {
    const labels = {
      'MALE': 'Macho',
      'FEMALE': 'Hembra',
      'UNKNOWN': 'No especificado'
    };
    return labels[gender] || gender;
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Mis Mascotas
          </h1>
          <p className="text-neutral-600">
            Gestiona la información de todas tus mascotas en un solo lugar.
          </p>
        </div>
        <button
          onClick={handleAddPet}
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" size={16} />
          Registrar Mascota
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <FiLoader className="animate-spin text-primary-600" size={32} />
          <span className="ml-3 text-neutral-600">Cargando mascotas...</span>
        </div>
      ) : pets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div key={pet.id} className="card card-hover">
              {/* Pet Photo */}
              <div className="aspect-square bg-neutral-100 rounded-t-xl flex items-center justify-center relative">
                {pet.photo ? (
                  <img
                    src={pet.photo}
                    alt={pet.name}
                    className="w-full h-full object-cover rounded-t-xl"
                  />
                ) : (
                  <span className="text-8xl">
                    {pet.species === 'Perro' ? '🐶' : pet.species === 'Gato' ? '🐱' : '🐹'}
                  </span>
                )}
                
                {/* Gender badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium ${
                  pet.gender === 'MALE'
                    ? 'bg-blue-100 text-blue-800'
                    : pet.gender === 'FEMALE'
                    ? 'bg-pink-100 text-pink-800'
                    : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {getGenderLabel(pet.gender)}
                </div>
              </div>
              
              <div className="card-body">
                {/* Pet Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-1">
                    {pet.name}
                  </h3>
                  <p className="text-neutral-600 mb-2">
                    {pet.species} • {pet.breed}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
                    <div>
                      <span className="font-medium">Edad:</span> {pet.age} años
                    </div>
                    <div>
                      <span className="font-medium">Peso:</span> {pet.weight} kg
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center text-neutral-600">
                    <FiCalendar className="mr-1" size={14} />
                    {pet.appointments} citas
                  </div>
                  <div className="flex items-center text-neutral-600">
                    <FiFileText className="mr-1" size={14} />
                    {pet.diagnoses} diagnósticos
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditPet(pet)}
                    className="flex-1 btn btn-outline btn-sm flex items-center justify-center"
                  >
                    <FiEdit className="mr-1" size={14} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeletePet(pet)}
                    className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-8xl mb-6">🐶</div>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Aún no has registrado mascotas
          </h2>
          <p className="text-neutral-600 mb-8 max-w-md mx-auto">
            Registra a tu primera mascota para comenzar a gestionar su información médica y agendar citas.
          </p>
          <button
            onClick={handleAddPet}
            className="btn btn-primary btn-lg flex items-center mx-auto"
          >
            <FiPlus className="mr-2" size={16} />
            Registrar Mi Primera Mascota
          </button>
        </div>
      )}

      {/* Add/Edit Pet Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={closeModal}
        title={selectedPet ? `Editar ${selectedPet.name}` : 'Registrar Nueva Mascota'}
        size="md"
      >
        <ModalBody>
          <form className="space-y-6">
            {/* Photo Upload */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-32 h-32 bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-neutral-200">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Vista previa" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">
                      {selectedPet?.species === 'Perro' ? '🐶' : 
                       selectedPet?.species === 'Gato' ? '🐱' : '🐹'}
                    </span>
                  )}
                </div>
                
                {/* Photo actions */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <button
                    type="button"
                    onClick={handlePhotoSelect}
                    className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                    title="Seleccionar foto"
                  >
                    <FiCamera size={14} />
                  </button>
                  
                  {(photoPreview || selectedPhoto) && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                      title="Eliminar foto"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* File info */}
              {selectedPhoto && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <FiCamera className="text-green-600 mr-2" size={16} />
                    <span className="text-sm font-medium text-green-800">Nueva foto seleccionada</span>
                  </div>
                  <p className="text-sm text-green-700">
                    <strong>Nombre:</strong> {selectedPhoto.name}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Tamaño:</strong> {(selectedPhoto.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
              
              {/* Remove photo confirmation */}
              {removeExistingPhoto && !selectedPhoto && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <FiX className="text-red-600 mr-2" size={16} />
                    <span className="text-sm font-medium text-red-800">Foto será eliminada</span>
                  </div>
                  <p className="text-sm text-red-700">
                    La foto actual se eliminará al guardar los cambios.
                  </p>
                </div>
              )}
              
              {/* Guidelines */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  Recomendaciones para la foto:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Formatos: JPG, PNG, GIF</li>
                  <li>• Tamaño máximo: 25MB</li>
                  <li>• Resolución recomendada: 400x400px</li>
                </ul>
              </div>
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoChange}
            />
            
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                className="input"
                placeholder="Nombre de tu mascota"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            
            {/* Species and Breed */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Especie *</label>
                <select 
                  className="input" 
                  value={formData.species}
                  onChange={(e) => handleInputChange('species', e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                  <option value="Ave">Ave</option>
                  <option value="Conejo">Conejo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Raza</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: Labrador"
                  value={formData.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                />
              </div>
            </div>
            
            {/* Age, Weight, Gender */}
            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Edad (años)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="3"
                  min="0"
                  max="30"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Peso (kg)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="5.2"
                  step="0.1"
                  min="0.1"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Género</label>
                <select 
                  className="input" 
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="MALE">Macho</option>
                  <option value="FEMALE">Hembra</option>
                  <option value="UNKNOWN">No especificado</option>
                </select>
              </div>
            </div>
          </form>
        </ModalBody>
        
        <ModalFooter>
          <button 
            onClick={closeModal} 
            className="btn btn-outline"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            className="btn btn-primary flex items-center"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <FiLoader className="animate-spin mr-2" size={16} />
                {selectedPet ? 'Actualizando...' : 'Registrando...'}
              </>
            ) : (
              <>
                {selectedPet ? 'Actualizar' : 'Registrar'} Mascota
              </>
            )}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PetsPage;