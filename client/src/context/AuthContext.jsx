import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('muit_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage and verify profile
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('muit_token');
      const storedUser = localStorage.getItem('muit_user');

      if (storedToken) {
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error('Failed to parse cached user', e);
          }
        }

        try {
          const res = await authAPI.getProfile();
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('muit_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('Session validation error:', error);
          // Only clear if 401
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data?.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('muit_token', newToken);
      localStorage.setItem('muit_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.data?.success) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('muit_token', newToken);
      localStorage.setItem('muit_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return newUser;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('muit_token');
    localStorage.removeItem('muit_user');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('muit_user', JSON.stringify(updatedUser));
  };

  const isStudent = user?.role === 'student';
  const isOrganizer = user?.role === 'organizer';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        isStudent,
        isOrganizer,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
