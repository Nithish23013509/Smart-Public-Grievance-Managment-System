import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const storedUser = authService.getCurrentUser();
    const token = localStorage.getItem('accessToken');
    
    if (storedUser && token) {
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      // TEMP BYPASS FOR TESTING WITHOUT AUTH
      console.warn('⚠️ TEMPORARY DEV AUTH BYPASS ENABLED ⚠️');
      setUser({
        id: 999,
        fullName: 'Dev Admin',
        email: 'admin@example.com',
        role: 'ADMIN'
      });
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true, user: data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      await authService.register(userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.fieldErrors || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  if (loading) {
    return <div>Loading...</div>; // Could replace with a proper LoadingSpinner component later
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
