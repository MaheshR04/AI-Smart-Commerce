import axios from 'axios';

// Create configured Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic JWT Authorization header injection
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response error handler interceptor (e.g. redirect on 401 token expiry)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Authentication token expired or invalid. Clearing credentials.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are on client browser, force-reload to auth state boundaries (handles routing redirects)
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register') &&
        !window.location.pathname.includes('/forgot-password') &&
        !window.location.pathname.includes('/reset-password')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
