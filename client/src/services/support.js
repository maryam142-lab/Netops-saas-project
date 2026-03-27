import api from './api';

export const createTicket = async (payload) => {
  const { data } = await api.post('/support/create', payload);
  return data;
};

export const getMyTickets = async () => {
  const { data } = await api.get('/support/my-tickets');
  return data;
};
