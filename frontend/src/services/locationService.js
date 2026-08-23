import api from './api';

// Keeping these mocked for now since they are secondary dropdowns.
// Real apps would have similar reference endpoints for these.
const MOCK_DIVISIONS = [
  { id: 1, districtId: 1, name: 'North Chennai' },
  { id: 2, districtId: 1, name: 'South Chennai' },
  { id: 3, districtId: 2, name: 'Coimbatore North' }
];

const MOCK_TALUKS = [
  { id: 1, revenueDivisionId: 1, name: 'Tondiarpet' },
  { id: 2, revenueDivisionId: 2, name: 'Guindy' },
  { id: 3, revenueDivisionId: 2, name: 'Mylapore' }
];

const MOCK_LOCAL_BODIES = [
  { id: 1, districtId: 1, name: 'Greater Chennai Corporation', type: 'CORPORATION' }
];

const locationService = {
  getDistricts: async () => {
    try {
      const response = await api.get('/reference/districts');
      return response.data;
    } catch (error) {
      console.error('Error fetching districts:', error);
      return { data: [], success: false };
    }
  },
  
  getRevenueDivisions: async (districtId) => {
    const filtered = MOCK_DIVISIONS.filter(d => d.districtId === Number(districtId));
    return { data: filtered, success: true };
  },
  
  getTaluks: async (revenueDivisionId) => {
    const filtered = MOCK_TALUKS.filter(t => t.revenueDivisionId === Number(revenueDivisionId));
    return { data: filtered, success: true };
  },
  
  getLocalBodies: async (districtId) => {
    const filtered = MOCK_LOCAL_BODIES.filter(l => l.districtId === Number(districtId));
    return { data: filtered, success: true };
  }
};

export default locationService;
