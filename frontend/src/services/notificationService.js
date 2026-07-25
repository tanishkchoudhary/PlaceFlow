import apiRequest from './api';

export const notificationService = {
  getNotifications: async () => {
    return await apiRequest('/api/notifications');
  },

  markAsRead: async (notifId) => {
    return await apiRequest(`/api/notifications/${notifId}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async () => {
    return await apiRequest('/api/notifications/read-all', {
      method: 'PUT',
    });
  },
};

export default notificationService;
