import api from './api';

export const userService = {
  // Get all users (admin)
  getAllUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const url = queryParams.toString() ? `/auth/admin/users?${queryParams}` : '/auth/admin/users';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user statistics (admin)
  getUserStats: async () => {
    try {
      const response = await api.get('/auth/admin/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create user (admin)
  createUser: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user (admin) - Note: This would need to be implemented in backend
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/auth/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete user (admin) - Note: This would need to be implemented in backend
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/auth/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update profile photo
  updateProfilePhoto: async (photoFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const response = await api.post('/auth/profile/photo', formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default userService;