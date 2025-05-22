import axios from 'axios';
import { getToken, removeToken } from '../utils/auth';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Backend API base URL
  withCredentials: true, // Important for sending cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token in every request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (process.env.NODE_ENV === 'development') {
      // In development, use test token if available
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
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
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url
      });
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.warn('Authentication required, redirecting to login');
        removeToken();
        window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Get all budgets for the current user
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
