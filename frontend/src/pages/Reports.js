import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BookOpen, 
  Users, 
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { transactionsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await transactionsAPI.getAnalytics();
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'object' ? JSON.stringify(value) : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No analytics data available</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comprehensive insights into library operations
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Fine Statistics */}
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Fines</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                Rs{analytics.fineStats.pendingFines.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid Fines</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                Rs{analytics.fineStats.paidFines.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Count</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics.fineStats.pendingCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid Count</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics.fineStats.paidCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Books */}
      <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '400ms' }}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Most Popular Books</h3>
          </div>
          <button
            onClick={() => exportToCSV(analytics.popularBooks, 'popular-books.csv')}
            className="inline-flex items-center px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Borrow Count</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analytics.popularBooks.map((book, index) => (
                <tr key={book.bookId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {book.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {book.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {book.borrowCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Activity */}
      <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`} style={{ transitionDelay: '500ms' }}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Most Active Members</h3>
          </div>
          <button
            onClick={() => exportToCSV(analytics.memberActivity, 'member-activity.csv')}
            className="inline-flex items-center px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Member Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Transaction Count</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analytics.memberActivity.map((member, index) => (
                <tr key={member.memberId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {member.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {member.transactionCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Distribution */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-purple-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Category Distribution</h3>
            </div>
            <button
              onClick={() => exportToCSV(analytics.categoryDistribution, 'category-distribution.csv')}
              className="inline-flex items-center px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          <div className="space-y-3">
            {analytics.categoryDistribution.map((cat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">{cat.category}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(cat.bookCount / analytics.categoryDistribution.reduce((sum, c) => sum + c.bookCount, 0)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">{cat.bookCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Transactions */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Monthly Transactions</h3>
            </div>
            <button
              onClick={() => exportToCSV(analytics.monthlyTransactions, 'monthly-transactions.csv')}
              className="inline-flex items-center px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          <div className="space-y-3">
            {analytics.monthlyTransactions.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">{month.month}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(month.count / Math.max(...analytics.monthlyTransactions.map(m => m.count))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">{month.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

