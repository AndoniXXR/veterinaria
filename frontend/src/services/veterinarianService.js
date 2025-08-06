import api from './api';

const veterinarianService = {
  // Obtener todos los veterinarios
  getAllVeterinarians: async () => {
    try {
      console.log('🔍 Fetching all veterinarians...');
      const response = await api.get('/veterinarians');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching veterinarians:', error);
      throw error;
    }
  },

  // Crear nuevo veterinario
  createVeterinarian: async (veterinarianData) => {
    try {
      console.log('📝 Creating veterinarian:', veterinarianData);
      
      const formData = new FormData();
      formData.append('name', veterinarianData.name);
      formData.append('email', veterinarianData.email);
      formData.append('password', veterinarianData.password);
      
      if (veterinarianData.photo) {
        formData.append('photo', veterinarianData.photo);
      }

      const response = await api.post('/veterinarians', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating veterinarian:', error);
      throw error;
    }
  },

  // Obtener veterinario por ID
  getVeterinarianById: async (id) => {
    try {
      console.log('🔍 Fetching veterinarian by ID:', id);
      const response = await api.get(`/veterinarians/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching veterinarian:', error);
      throw error;
    }
  },

  // Actualizar veterinario
  updateVeterinarian: async (id, veterinarianData) => {
    try {
      console.log('📝 Updating veterinarian:', id, veterinarianData);
      
      const formData = new FormData();
      if (veterinarianData.name) formData.append('name', veterinarianData.name);
      if (veterinarianData.email) formData.append('email', veterinarianData.email);
      if (veterinarianData.password) formData.append('password', veterinarianData.password);
      
      if (veterinarianData.photo) {
        formData.append('photo', veterinarianData.photo);
      }

      const response = await api.put(`/veterinarians/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating veterinarian:', error);
      throw error;
    }
  },

  // Eliminar veterinario
  deleteVeterinarian: async (id) => {
    try {
      console.log('🗑️ Deleting veterinarian:', id);
      const response = await api.delete(`/veterinarians/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting veterinarian:', error);
      throw error;
    }
  },

  // Cambiar estado del veterinario
  toggleVeterinarianStatus: async (id, isActive) => {
    try {
      console.log('🔄 Toggling veterinarian status:', id, isActive);
      const response = await api.patch(`/veterinarians/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error('❌ Error toggling veterinarian status:', error);
      throw error;
    }
  }
};

export default veterinarianService;
