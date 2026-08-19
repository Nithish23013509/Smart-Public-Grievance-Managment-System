import api from './api';

// For phase 1, Notification APIs are largely in the database but the REST controller isn't built yet in step 5
// Mocking the responses so the UI works until the backend endpoints are added

const notificationService = {
  getMyNotifications: async () => {
    // TODO: return await api.get('/notifications');
    return {
      success: true,
      data: [
        { id: 1, title: 'Welcome', message: 'Welcome to Smart Grievance System', isRead: false, createdAt: new Date().toISOString() }
      ]
    };
  },

  markAsRead: async (id) => {
    // TODO: return await api.put(`/notifications/${id}/read`);
    return { success: true };
  }
};

export default notificationService;
