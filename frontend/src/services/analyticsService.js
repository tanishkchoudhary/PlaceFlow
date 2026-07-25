import apiRequest from './api';

export const analyticsService = {
  getDashboardAnalytics: async () => {
    return await apiRequest('/api/analytics/dashboard');
  },
};

export default analyticsService;
