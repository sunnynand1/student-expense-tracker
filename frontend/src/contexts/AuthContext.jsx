import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/budgetAPI';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // The auth token is automatically handled by the API interceptor in budgetAPI.js
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user: registeredUser, message } = response.data;

      // Don't automatically log in after registration
      // Just return the success message and data
      return {
        success: true,
        message: message || 'Registration successful! Please log in.',
        user: registeredUser
      };
    } catch (error) {
      // Handle specific error cases
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 409) {
        throw new Error('Username or email already exists');
      } else if (error.response?.status === 400) {
        throw new Error('Please check your input and try again');
      } else {
        throw new Error('Registration failed. Please try again later.');
      }
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData, message } = response.data;

      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // The authorization header is set by the API interceptor in budgetAPI.js

      setUser(userData);
      return {
        success: true,
        message: message || 'Login successful!',
        user: userData
      };
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else {
        throw new Error('Login failed. Please try again later.');
      }
    }
  };

  const logout = () => {
    try {
      // Call the logout API if needed
      authAPI.logout().catch(error => {
        console.error('Logout API error:', error);
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // The API interceptor will handle removing the auth header for future requests
      
      setUser(null);
      navigate('/login');
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
