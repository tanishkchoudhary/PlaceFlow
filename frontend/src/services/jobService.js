import apiRequest from './api';

export const jobService = {
  getJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.job_type) params.append('job_type', filters.job_type);
    if (filters.location) params.append('location', filters.location);
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.status_filter) params.append('status_filter', filters.status_filter);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/api/jobs${queryString}`);
  },

  getJobById: async (jobId) => {
    return await apiRequest(`/api/jobs/${jobId}`);
  },

  checkEligibility: async (jobId) => {
    return await apiRequest(`/api/jobs/${jobId}/eligibility`);
  },

  createJob: async (data) => {
    return await apiRequest('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateJob: async (jobId, data) => {
    return await apiRequest(`/api/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateJobStatus: async (jobId, status) => {
    return await apiRequest(`/api/jobs/${jobId}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
    });
  },

  getJobApplicants: async (jobId) => {
    return await apiRequest(`/api/jobs/${jobId}/applicants`);
  },
};

export default jobService;
