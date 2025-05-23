import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  PieChart,
  BarChart,
} from 'lucide-react';
import { analyticsAPI } from '../services/budgetAPI';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState({
    monthlyTrend: [],
    categoryDistribution: [],
    weeklyComparison: [],
    insights: [],
  });

  useEffect(() => {
    // Simulated API call
    setTimeout(() => {
      setData({
        monthlyTrend: [1200, 1350, 1100, 1500, 1300, 1450],
        categoryDistribution: [
          { name: 'Food', amount: 450, color: '#FF6384' },
          { name: 'Transport', amount: 300, color: '#36A2EB' },
          { name: 'Shopping', amount: 250, color: '#FFCE56' },
          { name: 'Entertainment', amount: 200, color: '#4BC0C0' },
          { name: 'Bills', amount: 400, color: '#9966FF' },
          { name: 'Others', amount: 150, color: '#FF9F40' },
        ],
        weeklyComparison: [
          { day: 'Mon', thisWeek: 120, lastWeek: 150 },
          { day: 'Tue', thisWeek: 90, lastWeek: 80 },
          { day: 'Wed', thisWeek: 75, lastWeek: 100 },
          { day: 'Thu', thisWeek: 85, lastWeek: 70 },
          { day: 'Fri', thisWeek: 130, lastWeek: 120 },
          { day: 'Sat', thisWeek: 200, lastWeek: 180 },
          { day: 'Sun', thisWeek: 160, lastWeek: 140 },
        ],
        insights: [
          {
            title: 'Spending Trend',
            description: 'Your spending increased by 12% compared to last month',
            trend: 'up',
            value: 12,
          },
          {
            title: 'Top Category',
            description: 'Food expenses are your highest category this month',
            trend: 'neutral',
            value: 450,
          },
          {
            title: 'Savings Potential',
            description: 'You could save $200 by reducing entertainment expenses',
            trend: 'down',
            value: 200,
          },
        ],
      });
      setLoading(false);
    }, 1000);
  }, [timeframe]);

  const monthlyTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Expenses',
        data: data.monthlyTrend,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const categoryData = {
    labels: data.categoryDistribution.map(cat => cat.name),
    datasets: [
      {
        data: data.categoryDistribution.map(cat => cat.amount),
        backgroundColor: data.categoryDistribution.map(cat => cat.color),
        borderWidth: 1,
      },
    ],
  };

  const weeklyComparisonData = {
    labels: data.weeklyComparison.map(day => day.day),
    datasets: [
      {
        label: 'This Week',
        data: data.weeklyComparison.map(day => day.thisWeek),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
      {
        label: 'Last Week',
        data: data.weeklyComparison.map(day => day.lastWeek),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 1,
      },
    ],
  };

  const InsightCard = ({ title, description, trend, value, icon: Icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-sm"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <div className={`p-3 rounded-lg ${
          trend === 'up' ? 'bg-red-50' : 
          trend === 'down' ? 'bg-green-50' : 
          'bg-gray-50'
        }`}>
          <Icon className={`w-6 h-6 ${
            trend === 'up' ? 'text-red-600' : 
            trend === 'down' ? 'text-green-600' : 
            'text-gray-600'
          }`} />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {trend === 'up' ? (
          <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
        ) : trend === 'down' ? (
          <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
        ) : null}
        <span className={`text-sm font-medium ${
          trend === 'up' ? 'text-red-500' : 
          trend === 'down' ? 'text-green-500' : 
          'text-gray-500'
        }`}>
          {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
        </span>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.insights.map((insight, index) => (
          <InsightCard
            key={index}
            {...insight}
            icon={index === 0 ? Calendar : index === 1 ? PieChart : DollarSign}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Trend</h3>
          <Line data={monthlyTrendData} options={{ responsive: true }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
          <Doughnut data={categoryData} options={{ responsive: true }} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Comparison</h3>
        <Bar data={weeklyComparisonData} options={{ responsive: true }} />
      </motion.div>
    </div>
  );
};

export default Analytics; 