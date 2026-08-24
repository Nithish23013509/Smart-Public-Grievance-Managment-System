import api from './api';

const userService = {
  getOfficersByDepartment: async (departmentId) => {
    try {
      const response = await api.get(`/admin/officers?departmentId=${departmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching officers:', error.response?.status, error.response?.data || error.message);
      return { data: [], success: false };
    }
  },
  
  getAllUsers: async () => {
    // Left as mock for now unless there's a real endpoint
    return {
      success: true,
      data: [
        { id: 1, fullName: 'Test Citizen', email: 'citizen@test.com', role: 'CITIZEN', mobileNumber: '9000000001' },
        { id: 2, fullName: 'Test Officer', email: 'officer@test.com', role: 'OFFICER', mobileNumber: '9000000002' },
        { id: 3, fullName: 'Test Admin', email: 'admin@test.com', role: 'ADMIN', mobileNumber: '9000000003' },
      ]
    };
  }
};

export default userService;
