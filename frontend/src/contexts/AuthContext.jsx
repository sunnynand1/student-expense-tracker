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
      console.log('Attempting to register user with data:', userData);
      
      // Basic validation
      if (!userData || !userData.username || !userData.email || !userData.password) {
        throw new Error('Please fill in all required fields');
      }
      
      // Log the API URL being used
      console.log('Making request to:', authAPI.defaults.baseURL);
      
      const response = await authAPI.register(userData).catch(error => {
        console.error('Axios error details:', {
          message: error.message,
          code: error.code,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            data: error.config?.data
          },
          response: error.response ? {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: error.response.headers,
            data: error.response.data
          } : 'No response',
          request: error.request ? 'Request was made but no response received' : 'No request was made'
        });
        throw error; // Re-throw to be caught by the outer catch
      });
      
      console.log('Registration response:', response);
      
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      const { token, user: registeredUser, message } = response.data;

      // Don't automatically log in after registration
      // Just return the success message and data
      return {
        success: true,
        message: message || 'Registration successful! Please log in.',
        user: registeredUser
      };
    } catch (error) {
      console.error('Registration error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        isAxiosError: error.isAxiosError,
        code: error.code,
        config: error.config,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response',
        request: error.request ? 'Request was made but no response received' : 'No request was made'
      });
      
      // Handle network errors
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to the server. Please check your internet connection and make sure the backend server is running.');
      }
      
      // Handle timeout errors
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your internet connection and try again.');
      }
      
      // Handle specific error cases
      if (error.response) {
        // Server responded with an error status code
        const { status, data } = error.response;
        
        if (status === 409) {
          throw new Error(data.message || 'Username or email already exists');
        } else if (status === 400) {
          throw new Error(data.message || 'Please check your input and try again');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later.');
        } else if (status === 404) {
          throw new Error('The requested resource was not found. Please check the API URL.');
        } else {
          throw new Error(data.message || `Registration failed with status ${status}. Please try again.`);
        }
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. The server might be down or there might be a network issue.');
      } else {
        // Something happened in setting up the request
        throw new Error(error.message || 'Registration failed. Please try again.');
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
