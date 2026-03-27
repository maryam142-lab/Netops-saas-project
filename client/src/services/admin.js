import api from './api';

export const getCustomers = async () => {
  const { data } = await api.get('/admin/customers');
  return data;
};

export const createCustomer = async (payload) => {
  const { data } = await api.post('/admin/customers', payload);
  return data;
};

export const updateCustomer = async (id, payload) => {
  const { data } = await api.put(`/admin/customers/${id}`, payload);
  return data;
};

export const deleteCustomer = async (id) => {
  const { data } = await api.delete(`/admin/customers/${id}`);
  return data;
};

export const getPendingConnections = async () => {
  const { data } = await api.get('/connections/pending');
  return data;
};

export const approveConnection = async (id) => {
  const { data } = await api.post(`/connections/approve/${id}`);
  return data;
};

export const rejectConnection = async (id) => {
  const { data } = await api.post(`/connections/reject/${id}`);
  return data;
};

export const getBills = async (params = {}) => {
  const { data } = await api.get('/billing', { params });
  return data;
};

export const runMonthlyBilling = async () => {
  const { data } = await api.post('/billing/run-monthly');
  return data;
};

export const markBillPaid = async (billId, payload = {}) => {
  const { data } = await api.post(`/billing/mark-paid/${billId}`, payload);
  return data;
};

export const getRevenueSummary = async (months = 12) => {
  const { data } = await api.get('/admin/revenue-summary', { params: { months } });
  return data;
};

export const getPackages = async () => {
  const { data } = await api.get('/packages');
  return data;
};

export const createPackage = async (payload) => {
  const { data } = await api.post('/packages', payload);
  return data;
};

export const updatePackage = async (id, payload) => {
  const { data } = await api.put(`/packages/${id}`, payload);
  return data;
};

export const deletePackage = async (id) => {
  const { data } = await api.delete(`/packages/${id}`);
  return data;
};

export const getSupportTickets = async () => {
  const { data } = await api.get('/admin/support');
  return data;
};

export const getSupportTicketById = async (ticketId) => {
  const { data } = await api.get(`/support/${ticketId}`);
  return data;
};

export const replySupportTicket = async (ticketId, payload) => {
  const { data } = await api.post(`/support/reply/${ticketId}`, payload);
  return data;
};

export const closeSupportTicket = async (ticketId) => {
  const { data } = await api.put(`/support/close/${ticketId}`);
  return data;
};

export const getAdminSettings = async () => {
  const { data } = await api.get('/admin/settings');
  return data;
};

export const updateAdminSettings = async (payload) => {
  const { data } = await api.put('/admin/settings', payload);
  return data;
};
