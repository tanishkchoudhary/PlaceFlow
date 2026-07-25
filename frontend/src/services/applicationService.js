import apiRequest from './api';

export const applicationService = {
  applyToJob: async (jobId) => {
    return await apiRequest(`/api/applications/jobs/${jobId}/apply`, {
      method: 'POST',
    });
  },

  getMyApplications: async () => {
    return await apiRequest('/api/applications/me');
  },

  updateApplicationStatus: async (appId, status) => {
    return await apiRequest(`/api/applications/${appId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

export default applicationService;
