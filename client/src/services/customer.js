import api from './api';

export const getCustomerConnections = async () => {
  const { data } = await api.get('/customer/connections');
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to load connections');
  }
  return data?.data ?? data;
};

export const getCustomerBills = async () => {
  const { data } = await api.get('/customer/bills');
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to load bills');
  }
  return data?.data ?? data;
};

export const getCustomerPackages = async () => {
  const { data } = await api.get('/customer/packages');
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to load packages');
  }
  return data?.data ?? data;
};

export const requestConnection = async (payload) => {
  const { data } = await api.post('/customer/request-connection', payload);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to request connection');
  }
  return data?.data ?? data;
};

export const requestUpgrade = async (payload) => {
  const { data } = await api.post('/customer/upgrade-request', payload);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to request upgrade');
  }
  return data?.data ?? data;
};

export const markBillPaid = async (billId, payload = {}) => {
  const { data } = await api.post(`/billing/mark-paid/${billId}`, payload);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to mark bill paid');
  }
  return data?.data ?? data;
};

export const payAllBills = async () => {
  const { data } = await api.post('/billing/pay-all');
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to pay all bills');
  }
  return data?.data ?? data;
};

export const getCustomerProfile = async () => {
  const { data } = await api.get('/customer/profile');
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to load profile');
  }
  return data?.data ?? data;
};

export const updateCustomerProfile = async (payload) => {
  const { data } = await api.put('/customer/profile', payload);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to update profile');
  }
  return data?.data ?? data;
};

export const changeCustomerPassword = async (payload) => {
  const { data } = await api.put('/customer/change-password', payload);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to update password');
  }
  return data?.data ?? data;
};

export const getCustomerPayments = async () => {
  const { data } = await api.get('/customer/payments');
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to load payments');
  }
  return data?.data ?? data;
};
