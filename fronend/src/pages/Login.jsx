import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Email validation
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      
      toast.success(response.message || 'Welcome back!');
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (field) => {
    if (!touched[field]) return '';
    
    switch (field) {
      case 'email':
        if (!formData.email.trim()) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) 
          return 'Please enter a valid email address';
        break;
      case 'password':
        if (!formData.password) return 'Password is required';
        break;
      default:
        return '';
    }
    return '';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section - Decorative */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="w-full flex items-center justify-center p-12">
          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h1 className="text-4xl font-bold mb-6">Student Expense Tracker</h1>
              <p className="text-xl mb-8 text-primary-100">
                Take control of your finances with our easy-to-use expense tracking solution.
              </p>
              <div className="space-y-4 text-primary-100">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center mr-4">
                    <span className="text-white">✓</span>
                  </div>
                  <p>Track your daily expenses effortlessly</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center mr-4">
                    <span className="text-white">✓</span>
                  </div>
                  <p>Visualize spending patterns</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center mr-4">
                    <span className="text-white">✓</span>
                  </div>
                  <p>Set and manage budgets</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-3 text-gray-600">Sign in to manage your expenses</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6 bg-white p-8 rounded-2xl shadow-soft"
            onSubmit={handleSubmit}
          >
            <div className="space-y-5">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  className={`input focus:ring-primary-500 focus:border-primary-500 ${
                    touched.email && getFieldError('email') ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {touched.email && getFieldError('email') && (
                  <p className="mt-1 text-sm text-red-500">{getFieldError('email')}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    className={`input pr-10 focus:ring-primary-500 focus:border-primary-500 ${
                      touched.password && getFieldError('password') ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {touched.password && getFieldError('password') && (
                  <p className="mt-1 text-sm text-red-500">{getFieldError('password')}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-colors"
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className={`text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors ${
                  isLoading ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                Forgot password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign in
                  </div>
                )}
              </button>
            </div>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className={`font-medium text-primary-600 hover:text-primary-500 transition-colors ${
                  isLoading ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                Sign up now
              </Link>
            </p>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Login; 