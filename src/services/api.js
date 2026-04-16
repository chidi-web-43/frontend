const API_URL = 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, method = 'GET', data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'API call failed');
    }
    
    return responseData;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Auth APIs
export const adminLogin = async (username, password) => {
  return apiCall('/auth/admin-login', 'POST', { username, password });
};

export const sendOTP = async (matricNumber, electionYear) => {
  return apiCall('/auth/send-otp', 'POST', { matricNumber, electionYear });
};

export const verifyOTP = async (studentId, otp) => {
  return apiCall('/auth/verify-otp', 'POST', { studentId, otp });
};

// Student APIs (requires token)
export const getDashboard = async (token, electionYear) => {
  return apiCall(`/student/dashboard?year=${electionYear}`, 'GET', null, token);
};

export const getCandidates = async (token, electionYear) => {
  return apiCall(`/student/candidates?year=${electionYear}`, 'GET', null, token);
};

export const submitVote = async (token, votes, electionYear) => {
  return apiCall('/student/vote', 'POST', { votes, electionYear }, token);
};

// Admin APIs (requires token)
export const getAdminDashboard = async (token, electionYear) => {
  return apiCall(`/admin/dashboard?year=${electionYear}`, 'GET', null, token);
};

export const getStudents = async (token, electionYear) => {
  return apiCall(`/admin/students?year=${electionYear}`, 'GET', null, token);
};

export const addStudent = async (token, studentData) => {
  return apiCall('/admin/students', 'POST', studentData, token);
};

export const bulkUploadStudents = async (token, students, electionYear) => {
  return apiCall('/admin/students/bulk', 'POST', { students, electionYear }, token);
};

export const deleteStudent = async (token, studentId) => {
  return apiCall(`/admin/students/${studentId}`, 'DELETE', null, token);
};

export const getCandidatesList = async (token, electionYear) => {
  return apiCall(`/admin/candidates?year=${electionYear}`, 'GET', null, token);
};

export const addCandidate = async (token, formData) => {
  const response = await fetch(`${API_URL}/admin/candidates`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  return response.json();
};

export const deleteCandidate = async (token, candidateId) => {
  return apiCall(`/admin/candidates/${candidateId}`, 'DELETE', null, token);
};

export const controlVoting = async (token, electionYear, status) => {
  return apiCall('/admin/election/status', 'PUT', { electionYear, status }, token);
};

export const getElectionYears = async (token) => {
  return apiCall('/admin/election/years', 'GET', null, token);
};

export const initializeElection = async (token, year) => {
  return apiCall('/admin/election/initialize', 'POST', { year }, token);
};

export const getAuditLogs = async (token, electionYear) => {
  return apiCall(`/admin/audit-logs?year=${electionYear}`, 'GET', null, token);
};

// Public APIs
export const getPublicResults = async (electionYear) => {
  return apiCall(`/results?year=${electionYear}`, 'GET');
};

export default {
  adminLogin,
  sendOTP,
  verifyOTP,
  getDashboard,
  getCandidates,
  submitVote,
  getAdminDashboard,
  getStudents,
  addStudent,
  bulkUploadStudents,
  deleteStudent,
  getCandidatesList,
  addCandidate,
  deleteCandidate,
  controlVoting,
  getElectionYears,
  initializeElection,
  getAuditLogs,
  getPublicResults,
};