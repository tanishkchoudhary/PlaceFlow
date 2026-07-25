import apiRequest from './api';

export const adminService = {
  getStudents: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.branch) params.append('branch', filters.branch);
    if (filters.search) params.append('search', filters.search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/api/admin/students${queryString}`);
  },

  toggleStudentStatus: async (studentId, isActive) => {
    return await apiRequest(`/api/admin/students/${studentId}/status?is_active=${isActive}`, {
      method: 'PUT',
    });
  },

  getRecruiters: async (statusFilter) => {
    const queryString = statusFilter ? `?status_filter=${encodeURIComponent(statusFilter)}` : '';
    return await apiRequest(`/api/admin/recruiters${queryString}`);
  },

  updateRecruiterStatus: async (recruiterId, status) => {
    return await apiRequest(`/api/admin/recruiters/${recruiterId}/status?verification_status=${encodeURIComponent(status)}`, {
      method: 'PUT',
    });
  },

  getCompanies: async () => {
    return await apiRequest('/api/admin/companies');
  },

  getJobs: async () => {
    return await apiRequest('/api/admin/jobs');
  },

  getApplications: async () => {
    return await apiRequest('/api/admin/applications');
  },

  getAuditLogs: async () => {
    return await apiRequest('/api/admin/audit-logs');
  },
};

export default adminService;
