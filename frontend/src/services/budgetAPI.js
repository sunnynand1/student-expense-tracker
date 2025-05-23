import axios from 'axios';
import { getToken, removeToken } from '../utils/auth';

// Backend server URL with fallback
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5001/api' 
    : 'https://student-expense-tracker-om9t.vercel.app/api');

console.log('API URL:', API_URL); // For debugging

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // Enable credentials for CORS
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Navigation will be handled by React Router's useNavigate hook
let navigate = null;

export const setNavigate = (navigateFn) => {
  navigate = navigateFn;
};

// Add request interceptor to include token in every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token') || getToken();
    
    // Add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Request]', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers
      });
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Response]', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
    }
    return response;
  },
  (error) => {
    // Log error details
    console.error('[API Error]', error);
    
    // Handle network errors
    if (!error.response) {
      console.error('API Network Error:', error);
      const message = 'Network error occurred. Please check your connection and try again.';
      return Promise.reject(new Error(message));
    }

    // Get error message from response
    const message = error.response?.data?.message || error.response?.data?.error || error.message;

    // Handle specific error cases
    switch (error.response.status) {
      case 400:
        // Bad request - validation error
        return Promise.reject(new Error(message || 'Invalid input. Please check your data.'));
      case 401:
        // Unauthorized - clear auth state and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        removeToken();
        if (navigate) {
          navigate('/login');
        } else {
          window.location.href = '/login';
        }
        return Promise.reject(new Error(message || 'Your session has expired. Please log in again.'));
      case 403:
        // Forbidden
        return Promise.reject(new Error(message || 'You do not have permission to perform this action.'));
      case 404:
        // Not Found
        return Promise.reject(new Error(message || 'The requested resource was not found.'));
      case 500:
        // Server error
        return Promise.reject(new Error(message || 'An internal server error occurred. Please try again later.'));
      default:
        // Other errors
        return Promise.reject(new Error(message || 'An unexpected error occurred.'));
    }
  }
);

// Function to get the auth token and user data
const getAuthData = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      token: user?.token || '',
      user: user || null
    };
  } catch (error) {
    console.error('Error getting auth data:', error);
    return { token: '', user: null };
  }
};

// Auth API
export const authAPI = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify-token');
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }
};

// Expenses API
export const expensesAPI = {
  // Get all expenses
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/expenses', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },

  // Get expense by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching expense ${id}:`, error);
      throw error;
    }
  },

  // Create new expense
  create: async (expenseData) => {
    try {
      const response = await api.post('/expenses', expenseData);
      return response.data;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  },

  // Update expense
  update: async (id, expenseData) => {
    try {
      const response = await api.put(`/expenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      console.error(`Error updating expense ${id}:`, error);
      throw error;
    }
  },

  // Delete expense
  delete: async (id) => {
    try {
      const response = await api.delete(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting expense ${id}:`, error);
      throw error;
    }
  },

  // Get expense statistics
  getStats: async () => {
    try {
      const response = await api.get('/expenses/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching expense stats:', error);
      throw error;
    }
  }
};

// Analytics API
export const analyticsAPI = {
  // Get monthly trend data
  getMonthlyTrend: async (timeframe = 'month') => {
    try {
      const response = await api.get('/analytics/trend', { params: { timeframe } });
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly trend:', error);
      throw error;
    }
  },

  // Get category distribution
  getCategoryDistribution: async (timeframe = 'month') => {
    try {
      const response = await api.get('/analytics/categories', { params: { timeframe } });
      return response.data;
    } catch (error) {
      console.error('Error fetching category distribution:', error);
      throw error;
    }
  },

  // Get weekly comparison
  getWeeklyComparison: async () => {
    try {
      const response = await api.get('/analytics/weekly-comparison');
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly comparison:', error);
      throw error;
    }
  },

  // Get insights
  getInsights: async (timeframe = 'month') => {
    try {
      const response = await api.get('/analytics/insights', { params: { timeframe } });
      return response.data;
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  }
};

// Categories API
export const categoriesAPI = {
  // Get all categories
  getAll: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Create new category
  create: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category
  update: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },

  // Delete category
  delete: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }
};

// Budgets API
export const getBudgets = async () => {
  try {
    console.log('Fetching budgets from /api/budgets');
    const response = await api.get('/budgets');
    console.log('Budgets response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching budgets:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    }
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch budgets');
  }
};

// Create or update a budget
export const saveBudget = async (budgetData) => {
  try {
    const { id, ...data } = budgetData;
    const method = id ? 'put' : 'post';
    const url = id ? `/budgets/${id}` : '/budgets';
    
    console.log('Saving budget:', budgetData);
    const response = await api[method](url, data);
    return response.data;
  } catch (error) {
    console.error('Error saving budget:', error);
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    throw new Error(error.response?.data?.message || 'Failed to save budget');
  }
};

// Delete a budget
export const deleteBudget = async (id) => {
  try {
    console.log('Deleting budget with id:', id);
    const response = await api.delete(`/budgets/${id}`);
    console.log('Delete budget response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting budget:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    }
    throw error;
  }
};
