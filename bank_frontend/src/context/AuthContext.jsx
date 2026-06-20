import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { authService, userService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await userService.getProfile();
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login({ email, password });
      const { access, refresh, user } = response.data;
      
      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);
      setUser(user);
      
      toast.success('Welcome back! 🎉');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      const { access, refresh, user } = response.data;
      
      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);
      setUser(user);
      
      toast.success('Account created successfully! 🎉');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        await authService.logout(refresh);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const deposit = async (amount) => {
    try {
      setError(null);
      const response = await userService.deposit({ amount });
      setUser(prev => ({ ...prev, balance: response.data.newBalance }));
      toast.success(`Deposited $${amount.toFixed(2)} successfully!`);
      return { success: true, newBalance: response.data.newBalance };
    } catch (error) {
      const message = error.response?.data?.message || 'Deposit failed';
      setError(message);
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    setUser,
    loading,
    error,
    login,
    register,
    logout,
    deposit,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};