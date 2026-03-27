import api from './api';

export const getCustomerConnections = async () => {
  const { data } = await api.get('/customer/connections');
  return data;
};

export const getCustomerBills = async () => {
  const { data } = await api.get('/customer/bills');
  return data;
};

export const getCustomerPackages = async () => {
  const { data } = await api.get('/customer/packages');
  return data;
};

export const requestConnection = async (payload) => {
  const { data } = await api.post('/customer/request-connection', payload);
  return data;
};

export const requestUpgrade = async (payload) => {
  const { data } = await api.post('/customer/upgrade-request', payload);
  return data;
};

export const markBillPaid = async (billId, payload = {}) => {
  const { data } = await api.post(`/billing/mark-paid/${billId}`, payload);
  return data;
};

export const payAllBills = async () => {
  const { data } = await api.post('/billing/pay-all');
  return data;
};

export const getCustomerProfile = async () => {
  const { data } = await api.get('/customer/profile');
  return data;
};

export const updateCustomerProfile = async (payload) => {
  const { data } = await api.put('/customer/profile', payload);
  return data;
};

export const changeCustomerPassword = async (payload) => {
  const { data } = await api.put('/customer/change-password', payload);
  return data;
};

export const getCustomerPayments = async () => {
  const { data } = await api.get('/customer/payments');
  return data;
};
