import api from './api';

// Mocking User Management for Admin in Phase 1
const userService = {
  getOfficersByDepartment: async (departmentId) => {
    // TODO: Implement backend API GET /admin/officers?departmentId={id}
    // Hardcoding test officer for testing Assignment functionality
    return {
      success: true,
      data: [
        { id: 2, fullName: 'Test Officer', email: 'officer@test.com', role: 'OFFICER' }
      ]
    };
  },
  
  getAllUsers: async () => {
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
