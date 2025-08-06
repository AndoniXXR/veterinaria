import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const UPLOADS_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't override Content-Type for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Only clear auth data and redirect if it's not a login attempt
          if (!error.config.url.includes('/auth/login')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            
            if (window.location.pathname !== '/login') {
              toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
              window.location.href = '/login';
            }
          }
          break;
          
        case 403:
          toast.error(data?.error?.message || 'Acceso denegado');
          break;
          
        case 404:
          toast.error(data?.error?.message || 'Recurso no encontrado');
          break;
          
        case 422:
          // Validation errors are handled by individual components
          break;
          
        case 429:
          toast.error('Demasiadas solicitudes. Por favor, intenta más tarde.');
          break;
          
        case 500:
          toast.error('Error interno del servidor. Por favor, intenta más tarde.');
          break;
          
        default:
          if (data?.error?.message) {
            toast.error(data.error.message);
          } else {
            toast.error('Ocurrió un error inesperado');
          }
      }
    } else if (error.request) {
      // Network error
      toast.error('Error de conexión. Por favor, verifica tu conexión.');
    } else {
      // Other error
      toast.error('Ocurrió un error inesperado');
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle file uploads
export const createFormData = (data, fileFields = []) => {
  console.log('🔧 Creating FormData with data:', data);
  console.log('🔧 File fields:', fileFields);
  
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (fileFields.includes(key) && value instanceof File) {
      console.log(`📎 Adding file to FormData: ${key} = ${value.name} (${value.size} bytes)`);
      formData.append(key, value);
    } else if (value !== null && value !== undefined) {
      console.log(`📝 Adding field to FormData: ${key} = ${value}`);
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
    }
  });
  
  console.log('📦 FormData created successfully');
  return formData;
};

// Helper function to handle query parameters
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  return searchParams.toString();
};

// Helper function to generate image URLs
export const getImageUrl = (imagePath, folder = 'users') => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a data URL (base64), return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Construct the full URL
  return `${UPLOADS_BASE_URL}/uploads/${folder}/${imagePath}`;
};

export default api;