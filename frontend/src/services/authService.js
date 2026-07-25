import apiRequest from './api';

export const authService = {
  login: async (credentials) => {
    return await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  registerStudent: async (data) => {
    return await apiRequest('/api/auth/register/student', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  registerRecruiter: async (data) => {
    return await apiRequest('/api/auth/register/recruiter', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCurrentUser: async () => {
    return await apiRequest('/api/auth/me');
  },
};

export default authService;
