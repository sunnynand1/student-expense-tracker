import axios from 'axios';

// Backend server URL with fallback
const API_URL = "https://student-expense-tracker-om9t.vercel.app/api"

// Navigation will be handled by React Router's useNavigate hook
let navigate = null;

const setNavigate = (navigateFn) => {
  navigate = navigateFn;
};

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

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
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
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
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
        if (navigate) {
          navigate('/login', { 
            state: { message: 'Your session has expired. Please login again.' },
            replace: true 
          });
        }
        return Promise.reject(new Error(message || 'Please log in to continue.'));
      case 403:
        return Promise.reject(new Error(message || 'Access denied.'));
      case 404:
        return Promise.reject(new Error(message || 'Resource not found.'));
      case 409:
        return Promise.reject(new Error(message || 'Resource already exists.'));
      case 500:
        return Promise.reject(new Error(message || 'Server error. Please try again later.'));
      case 503:
        return Promise.reject(new Error(message || 'Service unavailable. Please try again later.'));
      default:
        return Promise.reject(new Error(message || 'An unexpected error occurred.'));
    }
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set default Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove Authorization header
    delete api.defaults.headers.common['Authorization'];
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  verifyToken: () => api.get('/auth/verify')
};

// Expenses API
export const expensesAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/expenses', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  create: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  update: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  getStats: () => api.get('/expenses/stats')
};

// Analytics API
export const analyticsAPI = {
  getMonthlyTrend: async (timeframe = 'month') => {
    const response = await api.get('/analytics/trend', { params: { timeframe } });
    return response.data;
  },

  getCategoryDistribution: async (timeframe = 'month') => {
    const response = await api.get('/analytics/categories', { params: { timeframe } });
    return response.data;
  },

  getWeeklyComparison: async () => {
    const response = await api.get('/analytics/weekly-comparison');
    return response.data;
  },

  getInsights: async (timeframe = 'month') => {
    const response = await api.get('/analytics/insights', { params: { timeframe } });
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  create: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Export the API instance and other utilities
export { setNavigate };
export default api;
