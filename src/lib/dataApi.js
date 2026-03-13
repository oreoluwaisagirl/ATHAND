import { apiRequest } from './api';

export const workersApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/workers${query ? `?${query}` : ''}`);
  },
  create: (payload) => apiRequest('/workers', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (workerId, payload) => apiRequest(`/workers/${workerId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  remove: (workerId) => apiRequest(`/workers/${workerId}`, {
    method: 'DELETE',
  }),
  me: () => apiRequest('/workers/me'),
  bookings: (workerId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/workers/${workerId}/bookings${query ? `?${query}` : ''}`);
  },
  emergencyCategories: () => apiRequest('/workers/emergency/categories'),
  emergencyNearby: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/workers/emergency/nearby${query ? `?${query}` : ''}`);
  },
};

export const adminApi = {
  stats: () => apiRequest('/admin/stats'),
  users: () => apiRequest('/users'),
  bookings: () => apiRequest('/admin/bookings'),
  chatConversations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/chats/conversations${query ? `?${query}` : ''}`);
  },
  chatMessages: (roomId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/chats/messages/${roomId}${query ? `?${query}` : ''}`);
  },
};

export const bookingsApi = {
  myBookings: () => apiRequest('/bookings/my-bookings'),
  create: (payload) => apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateStatus: (bookingId, payload) => apiRequest(`/bookings/${bookingId}/status`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  updateEmergencyStatus: (bookingId, payload) => apiRequest(`/bookings/${bookingId}/emergency-status`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
};
