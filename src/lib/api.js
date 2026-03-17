const API_ORIGIN = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || (API_ORIGIN ? `${API_ORIGIN.replace(/\/+$/, '')}/api` : 'https://athand-1.onrender.com/api');

const TOKEN_KEY = 'athand_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const apiRequest = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === 'object'
        ? payload.message || payload.error || 'Request failed'
        : 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

export const authApi = {
  register: (data) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  requestProviderSignup: (data) => apiRequest('/auth/provider-signup-request', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  login: (data) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  requestOtp: (data) => apiRequest('/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  verifyOtp: (data) => apiRequest('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  passwordReset: (data) => apiRequest('/auth/password-reset', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  phoneLogin: (data) => apiRequest('/auth/phone-login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  emailLogin: (data) => apiRequest('/auth/email-login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  completeWorkerOnboarding: (data) => apiRequest('/auth/worker-onboarding', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  me: () => apiRequest('/auth/me'),
};

export default API_BASE_URL;
