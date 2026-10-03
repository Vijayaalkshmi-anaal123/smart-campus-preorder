import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campus_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campus_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate or refresh session on initial mount
  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('campus_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error("Session verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('campus_token', res.data.token);
      localStorage.setItem('campus_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('campus_token', res.data.token);
      localStorage.setItem('campus_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('campus_token');
    localStorage.removeItem('campus_user');
  };

  const quickLogin = async (email, password) => {
    return await login(email, password);
  };

  const isStudent = user?.role === 'student';
  const isShopOwner = user?.role === 'shop_owner';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      quickLogin,
      isStudent,
      isShopOwner,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
