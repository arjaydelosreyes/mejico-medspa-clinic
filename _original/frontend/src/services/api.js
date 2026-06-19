import axios from 'axios';
import { auth } from '../firebase';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000/api';

const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiService.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access, redirecting to login');
      // You might want to redirect to login page here
    }
    return Promise.reject(error);
  }
);

export const login = async (userData) => {
  const response = await apiService.post('/auth/login', userData);
  if (response.data && response.data.role) {
    localStorage.setItem('userRole', response.data.role);
  }
  return response.data;
};
// export const login = (userData) => apiService.post('/auth/login', userData);

export const register = (userData) => apiService.post('/auth/register', userData);

export const logout = async () => {
  await auth.signOut();
  localStorage.removeItem('userRole');
  return apiService.post('/auth/logout');
};

export const getProtectedData = () => apiService.get('/protected-route');

export const getUserRole = () => {
  return localStorage.getItem('userRole');
};

export default apiService;