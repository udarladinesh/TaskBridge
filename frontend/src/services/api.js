import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Request interceptor to attach JWT token & active mode
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const activeMode = localStorage.getItem('activeMode') || 'requester';
    config.headers['x-active-mode'] = activeMode;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for clear error message extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
