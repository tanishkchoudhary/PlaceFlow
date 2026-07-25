import apiRequest from './api';

export const studentService = {
  getProfile: async () => {
    return await apiRequest('/api/students/me');
  },

  updateProfile: async (data) => {
    return await apiRequest('/api/students/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await apiRequest('/api/students/me/resume', {
      method: 'POST',
      body: formData,
    });
  },

  getApplications: async () => {
    return await apiRequest('/api/students/me/applications');
  },

  getEligibleJobs: async () => {
    return await apiRequest('/api/students/me/eligible-jobs');
  },
};

export default studentService;
