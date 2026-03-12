import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Mock admin check - in production this would call backend API
const MOCK_ADMIN_EXISTS = () => {
  // Check localStorage for existing admin
  const savedUser = localStorage.getItem('fixitnow_user');
  if (savedUser) {
    const user = JSON.parse(savedUser);
    if (user.role === 'admin') return true;
  }
  return false;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('fixitnow_user');
    const savedToken = localStorage.getItem('fixitnow_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('fixitnow_user', JSON.stringify(userData));
    localStorage.setItem('fixitnow_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fixitnow_user');
    localStorage.removeItem('fixitnow_token');
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('fixitnow_user', JSON.stringify(updated));
  };

  // Check if admin already exists (frontend check - backend will enforce)
  const isAdminExists = () => MOCK_ADMIN_EXISTS();

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading, isAdminExists }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
