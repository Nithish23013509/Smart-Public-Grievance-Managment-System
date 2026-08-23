import api from './api';

const departmentService = {
  getDepartments: async () => {
    try {
      const response = await api.get('/reference/departments');
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      return { data: [], success: false };
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/reference/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: [], success: false };
    }
  }
};

export default departmentService;
