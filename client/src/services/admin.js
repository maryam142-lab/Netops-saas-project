import api from './api';

export const getCustomers = async () => {
  const { data } = await api.get('/admin/customers');
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to load customers');
  }
  return data?.data ?? data;
};

export const createCustomer = async (payload) => {
  const { data } = await api.post('/admin/customers', payload);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to create customer');
  }
  return data?.data ?? data;
};

export const updateCustomer = async (id, payload) => {
  const { data } = await api.put(`/admin/customers/${id}`, payload);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to update customer');
  }
  return data?.data ?? data;
};

export const deleteCustomer = async (id) => {
  const { data } = await api.delete(`/admin/customers/${id}`);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to delete customer');
  }
  return data?.data ?? data;
};

export const getPendingConnections = async () => {
  const { data } = await api.get('/connections/pending');
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to load pending connections');
  }
  return data?.data ?? data;
};

export const approveConnection = async (id) => {
  const { data } = await api.post(`/connections/approve/${id}`);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to approve connection');
  }
  return data?.data ?? data;
};

export const rejectConnection = async (id) => {
  const { data } = await api.post(`/connections/reject/${id}`);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to reject connection');
  }
  return data?.data ?? data;
};

export const getBills = async (params = {}) => {
  const { data } = await api.get('/billing', { params });
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to load bills');
  }
  return data?.data ?? data;
};

export const runMonthlyBilling = async () => {
  const { data } = await api.post('/billing/run-monthly');
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to run billing');
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

export const getRevenueSummary = async (months = 12) => {
  const { data } = await api.get('/admin/revenue-summary', { params: { months } });
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to load revenue summary');
  }
  return data?.data ?? data;
};

export const getPackages = async () => {
  const { data } = await api.get('/packages');
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to load packages');
  }
  return data?.data ?? data;
};

export const createPackage = async (payload) => {
  const { data } = await api.post('/packages', payload);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to create package');
  }
  return data?.data ?? data;
};

export const updatePackage = async (id, payload) => {
  const { data } = await api.put(`/packages/${id}`, payload);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to update package');
  }
  return data?.data ?? data;
};

export const deletePackage = async (id) => {
  const { data } = await api.delete(`/packages/${id}`);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to delete package');
  }
  return data?.data ?? data;
};

export const getSupportTickets = async () => {
  const { data } = await api.get('/admin/support');
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to load support tickets');
  }
  return data?.data ?? data;
};

export const getSupportTicketById = async (ticketId) => {
  const { data } = await api.get(`/support/${ticketId}`);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to load support ticket');
  }
  return data?.data ?? data;
};

export const replySupportTicket = async (ticketId, payload) => {
  const { data } = await api.post(`/support/reply/${ticketId}`, payload);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to reply to support ticket');
  }
  return data?.data ?? data;
};

export const closeSupportTicket = async (ticketId) => {
  const { data } = await api.put(`/support/close/${ticketId}`);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to close support ticket');
  }
  return data?.data ?? data;
};

export const getAdminSettings = async () => {
  const { data } = await api.get('/admin/settings');
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to load admin settings');
  }
  return data?.data ?? data;
};

export const updateAdminSettings = async (payload) => {
  const { data } = await api.put('/admin/settings', payload);
  if (data?.success === false) {
    throw new Error(data?.message || 'Unable to update admin settings');
  }
  return data?.data ?? data;
};
