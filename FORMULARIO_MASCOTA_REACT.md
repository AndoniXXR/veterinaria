# Formulario React para Registrar Mascota

## Componente Principal

```jsx
// frontend/src/components/user/PetRegistrationForm.jsx
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { petService } from '../../services/petService';
import { uploadService } from '../../services/uploadService';

// Schema de validación con Yup
const petValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .required('El nombre es requerido'),
  
  species: Yup.string()
    .required('La especie es requerida'),
  
  breed: Yup.string()
    .max(50, 'La raza no puede exceder 50 caracteres'),
  
  age: Yup.number()
    .min(0, 'La edad no puede ser negativa')
    .max(30, 'La edad no puede exceder 30 años')
    .integer('La edad debe ser un número entero'),
  
  weight: Yup.number()
    .min(0.1, 'El peso debe ser mayor a 0')
    .max(200, 'El peso no puede exceder 200 kg'),
  
  gender: Yup.string()
    .oneOf(['MALE', 'FEMALE', 'UNKNOWN'], 'Género inválido')
    .required('El género es requerido')
});

const PetRegistrationForm = ({ onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const initialValues = {
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    gender: 'UNKNOWN'
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede exceder 5MB');
        return;
      }

      setPhotoFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setIsLoading(true);
      
      let photoUrl = null;

      // Subir foto si se seleccionó una
      if (photoFile) {
        const uploadResult = await uploadService.uploadImage(photoFile, 'pets');
        photoUrl = uploadResult.secure_url;
      }

      // Preparar datos para enviar
      const petData = {
        ...values,
        age: values.age ? parseInt(values.age) : null,
        weight: values.weight ? parseFloat(values.weight) : null,
        photo: photoUrl
      };

      // Crear mascota
      const response = await petService.createPet(petData);
      
      toast.success('Mascota registrada exitosamente');
      
      if (onSuccess) {
        onSuccess(response.data);
      }

    } catch (error) {
      console.error('Error registrando mascota:', error);
      
      if (error.response?.data?.error?.details) {
        // Manejar errores de validación del backend
        error.response.data.error.details.forEach(detail => {
          setFieldError(detail.field, detail.message);
        });
      } else {
        toast.error(error.response?.data?.error?.message || 'Error registrando mascota');
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Nueva Mascota</h2>
      
      <Formik
        initialValues={initialValues}
        validationSchema={petValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
          <Form className="space-y-6">
            
            {/* Foto de la mascota */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto de la mascota
              </label>
              
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-gray-400 text-sm text-center">Sin foto</span>
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mt-3 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <Field
                  name="name"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Max, Luna, Firulais"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              {/* Especie */}
              <div>
                <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-1">
                  Especie *
                </label>
                <Field
                  as="select"
                  name="species"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona una especie</option>
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                  <option value="Ave">Ave</option>
                  <option value="Conejo">Conejo</option>
                  <option value="Hámster">Hámster</option>
                  <option value="Pez">Pez</option>
                  <option value="Reptil">Reptil</option>
                  <option value="Otro">Otro</option>
                </Field>
                <ErrorMessage
                  name="species"
                  component="div"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              {/* Raza */}
              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
                  Raza
                </label>
                <Field
                  name="breed"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Labrador, Persa, Mestizo"
                />
                <ErrorMessage
                  name="breed"
                  component="div"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              {/* Género */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Género *
                </label>
                <Field
                  as="select"
                  name="gender"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MALE">Macho</option>
                  <option value="FEMALE">Hembra</option>
                  <option value="UNKNOWN">No especificado</option>
                </Field>
                <ErrorMessage
                  name="gender"
                  component="div"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              {/* Edad */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Edad (años)
                </label>
                <Field
                  name="age"
                  type="number"
                  min="0"
                  max="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 3"
                />
                <ErrorMessage
                  name="age"
                  component="div"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              {/* Peso */}
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Peso (kg)
                </label>
                <Field
                  name="weight"
                  type="number"
                  min="0.1"
                  max="200"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 15.5"
                />
                <ErrorMessage
                  name="weight"
                  component="div"
                  className="mt-1 text-sm text-red-600"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  disabled={isSubmitting || isLoading}
                >
                  Cancelar
                </button>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoading ? 'Registrando...' : 'Registrar Mascota'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PetRegistrationForm;
```

## Servicios de Soporte

```javascript
// frontend/src/services/petService.js
import api from './api';

export const petService = {
  // Crear mascota
  createPet: async (petData) => {
    const response = await api.post('/pets', petData);
    return response.data;
  },

  // Obtener mascotas del usuario
  getUserPets: async () => {
    const response = await api.get('/pets');
    return response.data;
  },

  // Obtener mascota específica
  getPet: async (petId) => {
    const response = await api.get(`/pets/${petId}`);
    return response.data;
  },

  // Actualizar mascota
  updatePet: async (petId, petData) => {
    const response = await api.put(`/pets/${petId}`, petData);
    return response.data;
  },

  // Eliminar mascota
  deletePet: async (petId) => {
    const response = await api.delete(`/pets/${petId}`);
    return response.data;
  },

  // Subir foto de mascota
  uploadPetPhoto: async (petId, photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    const response = await api.post(`/pets/${petId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
```

```javascript
// frontend/src/services/uploadService.js
import { Cloudinary } from '@cloudinary/url-gen';

// Configurar Cloudinary
const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
  }
});

export const uploadService = {
  uploadImage: async (file, folder = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Error subiendo imagen');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en upload:', error);
      throw error;
    }
  }
};
```

```javascript
// frontend/src/services/api.js
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

## Variables de Entorno para Frontend

```env
# .env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_CLOUDINARY_CLOUD_NAME=tu_cloudinary_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
```

## Uso del Componente

```jsx
// frontend/src/pages/Pets.jsx
import React, { useState } from 'react';
import PetRegistrationForm from '../components/user/PetRegistrationForm';
import Modal from '../components/common/Modal';

const PetsPage = () => {
  const [showForm, setShowForm] = useState(false);

  const handlePetCreated = (newPet) => {
    console.log('Nueva mascota creada:', newPet);
    setShowForm(false);
    // Refrescar lista de mascotas
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mis Mascotas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Registrar Mascota
        </button>
      </div>

      {/* Modal con formulario */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <PetRegistrationForm
          onSuccess={handlePetCreated}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Lista de mascotas existentes */}
      {/* ... resto del componente */}
    </div>
  );
};

export default PetsPage;
```

## Características del Formulario

✅ **Validación completa** con Yup
✅ **Subida de imágenes** a Cloudinary
✅ **Preview de imagen** antes de subir
✅ **Diseño responsive** con Tailwind CSS
✅ **Estados de loading** y feedback visual
✅ **Manejo de errores** del backend
✅ **Campos opcionales** y requeridos
✅ **Validación de tipos de archivo** y tamaño
✅ **Experiencia de usuario** intuitiva