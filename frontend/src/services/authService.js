import api from './api';

// Auth service
export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        return { user, token };
      }
      
      throw new Error(response.data.error?.message || 'Registration failed');
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        return { user, token };
      }
      
      throw new Error(response.data.error?.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Clear auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/refresh', { refreshToken });
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        return { user, token };
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      // Clear auth data on refresh failure
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      
      if (response.data.success) {
        const user = response.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
      
      throw new Error('Failed to get profile');
    } catch (error) {
      throw error;
    }
  },

  // Get stored user data
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Get stored auth token
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const user = authService.getCurrentUser();
    return !!(token && user);
  },

  // Check user role
  hasRole: (requiredRoles) => {
    const user = authService.getCurrentUser();
    if (!user || !user.role) return false;
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    
    return user.role === requiredRoles;
  },

  // Check if user is admin
  isAdmin: () => {
    return authService.hasRole('ADMIN');
  },

  // Check if user is veterinarian
  isVeterinarian: () => {
    return authService.hasRole('VETERINARIAN');
  },

  // Check if user is regular user
  isUser: () => {
    return authService.hasRole('USER');
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error(response.data.error?.message || 'Failed to request password reset');
    } catch (error) {
      throw error;
    }
  },

  // Validate reset token
  validateResetToken: async (token) => {
    try {
      const response = await api.post('/auth/validate-reset-token', { token });
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error(response.data.error?.message || 'Invalid reset token');
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        token, 
        password: newPassword 
      });
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error(response.data.error?.message || 'Failed to reset password');
    } catch (error) {
      throw error;
    }
  },

  // Upload profile photo
  uploadProfilePhoto: async (photoFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      console.log('Uploading profile photo:', photoFile.name);
      
      const response = await api.post('/auth/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      
      throw new Error(response.data.error?.message || 'Failed to upload photo');
    } catch (error) {
      console.error('Upload photo error:', error);
      throw error;
    }
  },

  // Remove profile photo
  removeProfilePhoto: async () => {
    try {
      console.log('Removing profile photo');
      
      const response = await api.delete('/auth/profile/photo');
      
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      
      throw new Error(response.data.error?.message || 'Failed to remove photo');
    } catch (error) {
      console.error('Remove photo error:', error);
      throw error;
    }
  }
};

export default authService;