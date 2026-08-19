import api from './api';

// MOCK DATA FOR PHASE 1 - Real endpoints to be added in future steps
const MOCK_DEPARTMENTS = [
  { id: 1, name: 'Municipal Administration and Water Supply' },
  { id: 2, name: 'Revenue and Disaster Management' },
  { id: 3, name: 'Highways' },
  { id: 4, name: 'Health and Family Welfare' },
  { id: 5, name: 'School Education' }
];

const MOCK_CATEGORIES = [
  { id: 1, name: 'Roads' },
  { id: 2, name: 'Water Supply' },
  { id: 3, name: 'Street Lights' },
  { id: 4, name: 'Garbage' },
  { id: 5, name: 'Drainage' },
  { id: 6, name: 'Other' }
];

const departmentService = {
  getDepartments: async () => {
    // TODO: Connect to backend when GET /departments is available
    // const response = await api.get('/departments');
    // return response.data;
    
    return { data: MOCK_DEPARTMENTS, success: true };
  },

  getCategories: async () => {
    // TODO: Connect to backend when GET /complaint-categories is available
    return { data: MOCK_CATEGORIES, success: true };
  }
};

export default departmentService;
