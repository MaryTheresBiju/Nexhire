import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const loginApi = (credentials) => api.post('/auth/login', credentials);
export const signupApi = (userData) => api.post('/auth/signup', userData);
export const getUserProfile = (id) => api.get(`/users/${id}`);

export const getJobs = () => api.get('/jobs');
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const getJobsByEmployer = (employerId) => api.get(`/jobs/employer/${employerId}`);
export const postJob = (jobData) => api.post('/jobs', jobData);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);

export const submitApplication = (appData) => api.post('/applications', appData);
export const getMyApplications = (candidateId) => api.get(`/applications/candidate/${candidateId}`);
export const getJobApplications = (jobId) => api.get(`/applications/job/${jobId}`);
export const updateApplicationStatus = (appId, status) => api.put(`/applications/${appId}/status`, { status });

export default api;
