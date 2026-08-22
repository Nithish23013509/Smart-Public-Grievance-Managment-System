import api from './api';

const complaintService = {
  createComplaint: async (data) => {
    const response = await api.post('/complaints', data);
    return response.data;
  },

  createComplaintWithImage: async (formData) => {
    const response = await api.post('/complaints/with-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getMyComplaints: async (page = 0, size = 10) => {
    const response = await api.get(`/complaints/my?page=${page}&size=${size}`);
    return response.data;
  },

  getComplaintById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  getComplaintHistory: async (id) => {
    const response = await api.get(`/complaints/${id}/history`);
    return response.data;
  },

  closeComplaint: async (id) => {
    const response = await api.put(`/complaints/${id}/close`);
    return response.data;
  },

  // Officer Endpoints
  getOfficerComplaints: async (status, page = 0, size = 10) => {
    const queryParams = new URLSearchParams({ page, size });
    if (status) queryParams.append('status', status);
    
    const response = await api.get(`/officer/complaints?${queryParams.toString()}`);
    return response.data;
  },

  updateComplaintStatus: async (id, data) => {
    const response = await api.put(`/officer/complaints/${id}/status`, data);
    return response.data;
  },

  uploadResolutionProof: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/officer/complaints/${id}/resolution-proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Admin Endpoints
  getAllComplaints: async (page = 0, size = 10) => {
    const response = await api.get(`/admin/complaints?page=${page}&size=${size}`);
    return response.data;
  },

  assignComplaint: async (id, departmentId, officerId) => {
    const response = await api.put(`/admin/complaints/${id}/assign`, {
      departmentId,
      officerId
    });
    return response.data;
  },

  // AI Review Queue (Admin/Officer)
  getAiReviewQueue: async (page = 0, size = 10) => {
    const response = await api.get(`/admin/complaints/ai-review-queue?page=${page}&size=${size}`);
    return response.data;
  },

  submitAiReview: async (id, data) => {
    const response = await api.post(`/admin/complaints/${id}/ai-review`, data);
    return response.data;
  },

  // AI Analytics (Admin)
  getAiAnalytics: async () => {
    const response = await api.get('/admin/complaints/ai/analytics');
    return response.data;
  }
};

export default complaintService;
