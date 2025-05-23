import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { expensesAPI, analyticsAPI } from '../services/budgetAPI';
import { 
  BanknotesIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI, expensesAPI } from '../services/budgetAPI';
import { useAuth } from '../contexts/AuthContext';

// Custom color palette
const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  success: {
    100: '#dcfce7',
    500: '#22c55e',
    700: '#15803d',
  },
  warning: {
    100: '#fef3c7',
    500: '#f59e0b',
    700: '#b45309',
  },
  danger: {
    100: '#fee2e2',
    500: '#ef4444',
    700: '#b91c1c',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
};

const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalExpenses: 0,
    monthlyBudget: 0,
    recentTransactions: [],
    categories: [],
    spendingTrend: []
  });

  // Wrap fetchDashboardData in useCallback
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // In development mode, use mock data if API is not available
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Using mock data');
        
        // Mock data for development
        const mockData = {
          totalExpenses: 1250.75,
          monthlyBudget: 2000.00,
          recentTransactions: [
            {
              id: 1,
              description: 'Grocery Shopping',
              amount: -125.50,
              category: 'Food',
              date: new Date().toISOString(),
              paymentMethod: 'Credit Card'
            },
            {
              id: 2,
              description: 'Salary Deposit',
              amount: 3000.00,
              category: 'Income',
              date: new Date().toISOString(),
              paymentMethod: 'Bank Transfer'
            }
          ],
          categories: [
            { name: 'Food', amount: 450.25 },
            { name: 'Transportation', amount: 200.50 },
            { name: 'Entertainment', amount: 150.00 },
            { name: 'Utilities', amount: 300.00 }
          ],
          spendingTrend: Array(6).fill(0).map((_, i) => ({
            month: new Date(new Date().setMonth(new Date().getMonth() - (5 - i))).toLocaleString('default', { month: 'short' }),
            amount: Math.random() * 1000 + 500
          }))
        };

        // Calculate percentages for categories
        const totalExpenses = mockData.totalExpenses;
        mockData.categories = mockData.categories.map(cat => ({
          ...cat,
          percentage: Math.round((cat.amount / totalExpenses) * 100)
        }));

        setDashboardData(mockData);
        setIsLoading(false);
        return;
      }

      // Production API calls
      const expensesResponse = await expensesAPI.getAll();
      const expenses = expensesResponse?.data || [];
      
      // Calculate total expenses
      const totalExpenses = expenses.reduce(
        (sum, expense) => sum + parseFloat(expense.amount || 0), 
        0
      );
      
      // Get user's monthly budget
      const budgetResponse = await expensesAPI.getStats();
      const monthlyBudget = budgetResponse?.data?.data?.monthlyBudget || 0;
      
      // Group expenses by category
      const expensesByCategory = expenses.reduce((acc, expense) => {
        const category = expense.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += parseFloat(expense.amount || 0);
        return acc;
      }, {});
      
      // Generate spending trend (last 6 months)
      const currentDate = new Date();
      const spendingTrend = Array(6).fill(0).map((_, index) => {
        const date = new Date();
        date.setMonth(currentDate.getMonth() - (5 - index));
        const monthExpenses = expenses.filter(expense => {
          if (!expense.date) return false;
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === date.getMonth() && 
                 expenseDate.getFullYear() === date.getFullYear();
        });
        
        return {
          month: date.toLocaleString('default', { month: 'short' }),
          amount: monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)
        };
      });
      
      setDashboardData({
        totalExpenses,
        monthlyBudget,
        recentTransactions: expenses.slice(0, 5),
        categories: Object.entries(expensesByCategory).map(([name, amount]) => ({
          name,
          amount,
          percentage: Math.round((amount / (totalExpenses || 1)) * 100) || 0
        })),
        spendingTrend
      });
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
      
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Chart data for spending trend
  const spendingTrendData = {
    labels: dashboardData.spendingTrend.map(item => item.month) || [],
    datasets: [
      {
        label: 'Monthly Spending',
        data: dashboardData.spendingTrend.map(item => item.amount) || [],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const spendingTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: value => `$${value}`
        }
      },
      x: { grid: { display: false } }
    }
  };

  // Calculate budget usage percentage
  const budgetUsage = Math.min(
    Math.round((dashboardData.totalExpenses / (dashboardData.monthlyBudget || 1)) * 100),
    100
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-20 absolute animate-ping"></div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center relative">
                <BanknotesIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          <p className="text-sm text-gray-400 mt-1">Just a moment please</p>
        </motion.div>
      </div>
    );
  }

  // Calculate if spending is within budget
  const isWithinBudget = dashboardData.totalExpenses <= dashboardData.monthlyBudget;
  const remainingBudget = Math.max(0, dashboardData.monthlyBudget - dashboardData.totalExpenses);
  const percentageUsed = Math.min(Math.round((dashboardData.totalExpenses / (dashboardData.monthlyBudget || 1)) * 100), 100);

  // Get current date for greeting
  const currentHour = new Date().getHours();
  let greeting = 'Good evening';
  if (currentHour < 12) greeting = 'Good morning';
  else if (currentHour < 18) greeting = 'Good afternoon';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {greeting}, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-500">Here's your spending overview</p>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="mt-4 md:mt-0 flex items-center space-x-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur opacity-10"></div>
            <div className="relative bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <span className="flex items-center text-sm font-medium text-gray-700">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                {user?.email || 'user@example.com'}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
      >
        {/* Total Expenses */}
        <motion.div 
          variants={fadeInUp}
          className="relative group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                ${dashboardData.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="mt-2 flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  dashboardData.totalExpenses > dashboardData.monthlyBudget 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {dashboardData.totalExpenses > dashboardData.monthlyBudget ? (
                    <>
                      <ArrowTrendingUpIcon className="-ml-0.5 mr-1 h-3 w-3" />
                      Over Budget
                    </>
                  ) : (
                    <>
                      <ArrowTrendingDownIcon className="-ml-0.5 mr-1 h-3 w-3" />
                      Under Budget
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600">
              <BanknotesIcon className="h-6 w-6" />
            </div>
          </div>
        </motion.div>

        {/* Monthly Budget */}
        <motion.div 
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
          className="relative group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Monthly Budget</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                ${dashboardData.monthlyBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                ${remainingBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-600">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
          </div>
        </motion.div>

        {/* Budget Usage */}
        <motion.div 
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
          className="relative group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Budget Used</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {percentageUsed}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600">
                <ChartBarIcon className="h-6 w-6" />
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  percentageUsed > 90 ? 'bg-red-500' : 
                  percentageUsed > 70 ? 'bg-amber-500' : 'bg-green-500'
                }`} 
                style={{ 
                  width: `${percentageUsed}%`,
                  backgroundImage: `linear-gradient(90deg, ${
                    percentageUsed > 90 ? '#ef4444' : 
                    percentageUsed > 70 ? '#f59e0b' : '#10b981'
                  }, ${
                    percentageUsed > 90 ? '#dc2626' : 
                    percentageUsed > 70 ? '#d97706' : '#059669'
                  })`
                }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-gray-500 text-right">
              {isWithinBudget ? 'Within budget' : 'Over budget'}
            </p>
          </div>
        </motion.div>

        {/* Recent Transactions Count */}
        <motion.div 
          variants={fadeInUp}
          transition={{ delay: 0.3 }}
          className="relative group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Recent Transactions</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {dashboardData.recentTransactions.length}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {dashboardData.recentTransactions.length > 0 ? 'Last added today' : 'No recent transactions'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 text-purple-600">
              <ClockIcon className="h-6 w-6" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8"
      >
        {/* Spending Trend */}
        <motion.div 
          variants={fadeInUp}
          className="relative group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Spending Trend</h3>
                <p className="text-sm text-gray-500">Last 6 months overview</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <ArrowTrendingUpIcon className="-ml-0.5 mr-1 h-3 w-3" />
                  {dashboardData.spendingTrend.length > 1 ? 
                    `${Math.round((dashboardData.spendingTrend[dashboardData.spendingTrend.length - 1].amount / 
                      (dashboardData.spendingTrend[dashboardData.spendingTrend.length - 2].amount || 1) - 1) * 100)}%` : 
                    '0%'}
                </span>
              </div>
            </div>
            <div className="h-64">
              <Line 
                data={{
                  ...spendingTrendData,
                  datasets: [{
                    ...spendingTrendData.datasets[0],
                    borderColor: colors.primary[500],
                    backgroundColor: (context) => {
                      const ctx = context.chart.ctx;
                      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                      gradient.addColorStop(0, `${colors.primary[400]}40`);
                      gradient.addColorStop(1, `${colors.primary[400]}00`);
                      return gradient;
                    },
                    borderWidth: 2,
                    pointBackgroundColor: colors.primary[500],
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6,
                    pointHoverBorderWidth: 2,
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4
                  }]
                }} 
                options={{
                  ...spendingTrendOptions,
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    intersect: false,
                    mode: 'index',
                  },
                  plugins: {
                    tooltip: {
                      backgroundColor: 'white',
                      titleColor: colors.gray[800],
                      bodyColor: colors.gray[600],
                      borderColor: colors.gray[200],
                      borderWidth: 1,
                      padding: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      usePointStyle: true,
                      callbacks: {
                        label: function(context) {
                          return ` ${context.dataset.label}: $${context.raw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        },
                        labelColor: function() {
                          return {
                            borderColor: colors.primary[500],
                            backgroundColor: colors.primary[500],
                            borderWidth: 2,
                            borderRadius: 2,
                          };
                        }
                      }
                    },
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: colors.gray[100],
                        borderDash: [5, 5],
                        drawTicks: false,
                      },
                      border: {
                        display: false
                      },
                      ticks: {
                        padding: 10,
                        color: colors.gray[500],
                        font: {
                          size: 12
                        },
                        callback: function(value) {
                          return '$' + value.toLocaleString('en-US');
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false,
                        drawBorder: false
                      },
                      ticks: {
                        padding: 10,
                        color: colors.gray[500],
                        font: {
                          size: 12
                        }
                      },
                      border: {
                        display: false
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </motion.div>

        {/* Categories Breakdown */}
        <motion.div 
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
          className="relative group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Spending by Category</h3>
                <p className="text-sm text-gray-500">Your expense distribution</p>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {dashboardData.categories.length} categories
                </span>
              </div>
            </div>
            <div className="h-64">
              {dashboardData.categories.length > 0 ? (
                <div className="flex h-full">
                  <div className="w-1/2 h-full">
                    <Doughnut
                      data={{
                        labels: dashboardData.categories.map(cat => cat.name),
                        datasets: [{
                          data: dashboardData.categories.map(cat => cat.amount),
                          backgroundColor: [
                            colors.primary[400],
                            colors.primary[500],
                            colors.primary[600],
                            `${colors.primary[400]}80`,
                            `${colors.primary[500]}80`,
                            `${colors.primary[600]}80`
                          ],
                          borderWidth: 0,
                          borderRadius: 4,
                          spacing: 2,
                          hoverOffset: 8
                        }]
                      }}
                      options={{
                        cutout: '70%',
                        radius: '90%',
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            backgroundColor: 'white',
                            titleColor: colors.gray[800],
                            bodyColor: colors.gray[600],
                            borderColor: colors.gray[200],
                            borderWidth: 1,
                            padding: 12,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            usePointStyle: true,
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return ` ${label}: $${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${percentage}%)`;
                              },
                              labelColor: function(context) {
                                return {
                                  borderColor: context.dataset.backgroundColor[context.dataIndex],
                                  backgroundColor: context.dataset.backgroundColor[context.dataIndex],
                                  borderWidth: 2,
                                  borderRadius: 2,
                                };
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="w-1/2 pl-4 overflow-y-auto max-h-64 pr-2">
                    <div className="space-y-4">
                      {[...dashboardData.categories]
                        .sort((a, b) => b.amount - a.amount)
                        .map((category, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{
                                  backgroundColor: [
                                    colors.primary[400],
                                    colors.primary[500],
                                    colors.primary[600],
                                    `${colors.primary[400]}80`,
                                    `${colors.primary[500]}80`,
                                    `${colors.primary[600]}80`
                                  ][index % 6]
                                }}
                              />
                              <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                                {category.name}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                ${category.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-gray-500">{category.percentage}%</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <ChartBarIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-gray-700 font-medium mb-1">No category data</h4>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Start adding expenses to see your spending distribution by category
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div 
        variants={fadeInUp}
        className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
              <p className="text-sm text-gray-500 mt-1">Your latest expense records</p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                type="button"
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                title="Refresh"
                onClick={() => fetchDashboardData()}
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>
              <button 
                type="button"
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                title="View all"
                onClick={() => navigate('/expenses')}
              >
                <EllipsisHorizontalIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {dashboardData.recentTransactions.length > 0 ? (
            <AnimatePresence>
              {dashboardData.recentTransactions.slice(0, 5).map((transaction, index) => (
                <motion.div 
                  key={transaction.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group p-4 hover:bg-gray-50/50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      <div className={`p-2 rounded-xl mr-3 ${
                        transaction.amount > 0 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {transaction.amount > 0 ? (
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        ) : (
                          <ArrowUpTrayIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {transaction.description}
                        </p>
                        <div className="flex items-center mt-0.5">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {transaction.category || 'Uncategorized'}
                          </span>
                          <span className="mx-1 text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(transaction.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4 whitespace-nowrap">
                      <p className={`text-sm font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {transaction.amount > 0 ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </p>
                      <div className="flex items-center justify-end mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          {transaction.paymentMethod || 'Cash'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 text-center"
            >
              <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                <CurrencyDollarIcon className="h-8 w-8" />
              </div>
              <h3 className="text-base font-medium text-gray-900">No transactions yet</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
                Start tracking your expenses by adding your first transaction.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/expenses/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                  Add Transaction
                </button>
              </div>
            </motion.div>
          )}
        </div>
        
        {dashboardData.recentTransactions.length > 0 && (
          <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Showing {Math.min(dashboardData.recentTransactions.length, 5)} of {dashboardData.recentTransactions.length} transactions
            </p>
            <button
              type="button"
              onClick={() => navigate('/expenses')}
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 group transition-colors duration-200"
            >
              View all transactions
              <ArrowRightIcon className="ml-1.5 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
