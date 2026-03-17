import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, clearToken, getToken, setToken } from '../lib/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const USER_KEY = 'athand_user';
const ADMIN_EMAIL = 'oreoluwaisagirl@gmail.com';

const persistUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

const loadStoredUser = () => {
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(loadStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = getToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.me();
        const backendUser = response?.user || null;

        if (backendUser) {
          setUser(backendUser);
          persistUser(backendUser);
        }
      } catch {
        clearToken();
        localStorage.removeItem(USER_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async ({ email, password, ...fallbackUserData }) => {
    if (email && password) {
      const response = await authApi.login({ email, password });
      setToken(response.token);
      setUser(response.user);
      persistUser(response.user);
      return response;
    }

    // Fallback for legacy phone-only screens while backend OTP is not implemented.
    const localUser = {
      ...fallbackUserData,
      email: fallbackUserData.email || '',
      role: fallbackUserData.isAdmin ? 'admin' : 'user',
    };
    setUser(localUser);
    persistUser(localUser);
    return localUser;
  };

  const register = async ({ fullName, email, phone, password, role = 'user' }) => {
    const response = await authApi.register({ fullName, email, phone, password, role });
    setToken(response.token);
    setUser(response.user);
    persistUser(response.user);
    return response;
  };

  const requestProviderSignup = async ({ fullName, email, phone, password }) => {
    return authApi.requestProviderSignup({ fullName, email, phone, password });
  };

  const completeWorkerOnboarding = async (payload) => {
    const response = await authApi.completeWorkerOnboarding(payload);
    return response;
  };

  const passwordReset = async ({ email, otpToken, newPassword }) => {
    return authApi.passwordReset({ email, otpToken, newPassword });
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isWorker = user?.role === 'worker';

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    isWorker,
    login,
    register,
    requestProviderSignup,
    completeWorkerOnboarding,
    passwordReset,
    logout,
    adminEmail: ADMIN_EMAIL,
  }), [user, isLoading, isAdmin, isWorker]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
