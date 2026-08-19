// MOCK DATA FOR PHASE 1 - Real endpoints to be added in future steps
const MOCK_DISTRICTS = [
  { id: 1, name: 'Chennai', code: 'CHN' },
  { id: 2, name: 'Coimbatore', code: 'CBE' },
  { id: 3, name: 'Madurai', code: 'MDU' }
];

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
    // TODO: Connect to backend GET /districts
    return { data: MOCK_DISTRICTS, success: true };
  },
  
  getRevenueDivisions: async (districtId) => {
    // TODO: Connect to backend GET /districts/{id}/revenue-divisions
    const filtered = MOCK_DIVISIONS.filter(d => d.districtId === Number(districtId));
    return { data: filtered, success: true };
  },
  
  getTaluks: async (revenueDivisionId) => {
    // TODO: Connect to backend GET /revenue-divisions/{id}/taluks
    const filtered = MOCK_TALUKS.filter(t => t.revenueDivisionId === Number(revenueDivisionId));
    return { data: filtered, success: true };
  },
  
  getLocalBodies: async (districtId) => {
    // TODO: Connect to backend GET /districts/{id}/local-bodies
    const filtered = MOCK_LOCAL_BODIES.filter(l => l.districtId === Number(districtId));
    return { data: filtered, success: true };
  }
};

export default locationService;
