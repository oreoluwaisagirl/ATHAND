const API_ORIGIN = import.meta.env.VITE_API_URL || '';
const FALLBACK_REMOTE_API_BASE_URL = 'https://athand-1.onrender.com/api';
const LOCAL_HOST_PATTERN = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|(?:\d{1,3}\.){3}\d{1,3})$/;

const resolveApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (API_ORIGIN) {
    return `${API_ORIGIN.replace(/\/+$/, '')}/api`;
  }

  if (typeof window !== 'undefined' && LOCAL_HOST_PATTERN.test(window.location.hostname)) {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }

  return FALLBACK_REMOTE_API_BASE_URL;
};

const API_BASE_URL = resolveApiBaseUrl();

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

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    const isNetworkFailure = error instanceof TypeError;
    if (isNetworkFailure) {
      throw new Error(`Unable to reach the server. Check your connection and confirm ${API_BASE_URL} allows this site.`);
    }
    throw error;
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const validationMessage = Array.isArray(payload?.errors)
      ? payload.errors.map((item) => item.msg).filter(Boolean).join(', ')
      : '';
    const message =
      typeof payload === 'object'
        ? payload.message || payload.error || validationMessage || 'Request failed'
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
    body: JSON.stringify({
      ...data,
      email: String(data?.email || '').trim().toLowerCase(),
    }),
  }),
  requestProviderSignup: (data) => apiRequest('/auth/provider-signup-request', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      email: String(data?.email || '').trim().toLowerCase(),
    }),
  }),
  login: (data) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      email: String(data?.email || '').trim().toLowerCase(),
    }),
  }),
  passwordReset: (data) => apiRequest('/auth/password-reset', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      email: String(data?.email || '').trim().toLowerCase(),
    }),
  }),
  completeWorkerOnboarding: (data) => apiRequest('/auth/worker-onboarding', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  me: () => apiRequest('/auth/me'),
};

export default API_BASE_URL;
