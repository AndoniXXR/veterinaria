import api, { createFormData, buildQueryString } from './api';

export const petService = {
  // Get user's pets
  getUserPets: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      const url = queryString ? `/pets?${queryString}` : '/pets';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all pets (for veterinarians)
  getAllPets: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      const url = queryString ? `/pets/all?${queryString}` : '/pets/all';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get specific pet
  getPet: async (petId) => {
    try {
      const response = await api.get(`/pets/${petId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new pet
  createPet: async (petData) => {
    try {
      let requestData = petData;
      let headers = {};

      // Check if there's a photo file
      if (petData.photo instanceof File) {
        requestData = createFormData(petData, ['photo']);
        headers['Content-Type'] = 'multipart/form-data';
      }

      const response = await api.post('/pets', requestData, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update pet
  updatePet: async (petId, petData) => {
    try {
      let requestData = petData;
      let headers = {};

      // Check if there's a photo file
      if (petData.photo instanceof File) {
        requestData = createFormData(petData, ['photo']);
        headers['Content-Type'] = 'multipart/form-data';
      }

      const response = await api.put(`/pets/${petId}`, requestData, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete pet
  deletePet: async (petId) => {
    try {
      const response = await api.delete(`/pets/${petId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload pet photo
  uploadPetPhoto: async (petId, photoFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const response = await api.post(`/pets/${petId}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get pet diagnoses
  getPetDiagnoses: async (petId, params = {}) => {
    try {
      const queryString = buildQueryString(params);
      const url = queryString ? `/diagnosis/pet/${petId}?${queryString}` : `/diagnosis/pet/${petId}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default petService;