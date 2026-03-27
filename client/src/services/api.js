import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const resolvePath = (config) => {
  let url = config.url || '';
  if (!url.startsWith('/')) {
    url = `/${url}`;
  }
  if (url.startsWith('http')) {
    try {
      url = new URL(url).pathname;
    } catch (err) {
      return url;
    }
  }
  if (url.startsWith('/api/')) {
    url = url.replace('/api', '');
  }
  return url;
};

const getRoleBlockMessage = (role, path) => {
  if (role === 'admin' && path.startsWith('/customer')) {
    return 'You do not have permission to access customer resources.';
  }
  if (role === 'customer' && path.startsWith('/admin')) {
    return 'You do not have permission to access admin resources.';
  }
  return '';
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const role = localStorage.getItem('role');
  const path = resolvePath(config);
  const blockMessage = getRoleBlockMessage(role, path);
  if (blockMessage) {
    toast.error(blockMessage);
    return Promise.reject(new Error(blockMessage));
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      toast.error('Session expired. Please login again.');
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
