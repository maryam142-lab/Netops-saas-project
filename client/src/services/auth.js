import api from './api';

export const registerUser = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  if (data?.success === false) {
    throw new Error(data?.message || 'Registration failed');
  }
  return data?.data ?? data;
};

export const loginUser = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  if (data?.success === false) {
    throw new Error(data?.message || 'Login failed');
  }
  return data?.data ?? data;
};

export const fetchProfile = async () => {
  const { data } = await api.get('/auth/profile');
  if (data?.success === false) {
    throw new Error(data?.message || 'Profile load failed');
  }
  return data?.data ?? data;
};
