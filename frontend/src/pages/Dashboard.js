import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { booksAPI, membersAPI, transactionsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    activeTransactions: 0,
    overdueBooks: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Initialize with defaults
      let totalBooks = 0;
      let totalMembers = 0;
      let activeTransactions = 0;
      let overdueBooksList = [];

      // Fetch books count
      try {
        const booksResponse = await booksAPI.getBooks({ limit: 1 });
        const booksData = booksResponse.data.data || booksResponse.data;
        totalBooks = booksData.pagination?.totalItems || 0;
      } catch (err) {
        console.warn('Could not fetch books:', err.message);
      }

      // Fetch members count
      try {
        const membersResponse = await membersAPI.getMembers({ limit: 1 });
        const membersData = membersResponse.data.data || membersResponse.data;
        totalMembers = membersData.pagination?.totalItems || 0;
      } catch (err) {
        console.warn('Could not fetch members:', err.message);
      }

      // Fetch transactions count
      try {
        const transactionsResponse = await transactionsAPI.getTransactions({ limit: 1 });
        const transactionsData = transactionsResponse.data.data || transactionsResponse.data;
        activeTransactions = transactionsData.pagination?.totalItems || 0;
      } catch (err) {
        console.warn('Could not fetch transactions:', err.message);
      }

      // Fetch overdue books
      try {
        const overdueResponse = await transactionsAPI.getOverdueBooks();
        const overdueData = overdueResponse.data.data || overdueResponse.data;
        overdueBooksList = overdueData.overdueBooks || [];
      } catch (err) {
        console.warn('Could not fetch overdue books:', err.message);
      }

      setStats({
        totalBooks,
        totalMembers,
        activeTransactions,
        overdueBooks: overdueBooksList.length
      });

      setOverdueBooks(overdueBooksList.slice(0, 5));

      // Fetch recent transactions
      try {
        const recentResponse = await transactionsAPI.getTransactions({ 
          limit: 5, 
          sortBy: 'transaction_id',
          sortOrder: 'DESC'
        });
        const recentData = recentResponse.data.data || recentResponse.data;
        setRecentTransactions(recentData.transactions || []);
      } catch (err) {
        console.warn('Could not fetch recent transactions:', err.message);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't show error toast - just log it
      console.log('Dashboard loaded with limited data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Books',
      value: stats.totalBooks,
      icon: BookOpen,
      color: 'blue',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      color: 'green',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Active Transactions',
      value: stats.activeTransactions,
      icon: FileText,
      color: 'purple',
      change: '+5%',
      changeType: 'positive'
    },
    {
      name: 'Overdue Books',
      value: stats.overdueBooks,
      icon: AlertTriangle,
      color: 'red',
      change: '-2%',
      changeType: 'negative'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your library management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            purple: 'bg-purple-500',
            red: 'bg-red-500'
          };
          
          return (
            <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${colorClasses[card.color]}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {card.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {card.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Transactions
            </h3>
            <div className="mt-5">
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.transactionId} className="flex items-center justify-between gap-2">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <BookOpen className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-3 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.book.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {transaction.member.firstName} {transaction.member.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          transaction.status === 'ISSUED' 
                            ? 'bg-blue-100 text-blue-800'
                            : transaction.status === 'RETURNED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No recent transactions</p>
              )}
            </div>
          </div>
        </div>

        {/* Overdue Books */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Overdue Books
            </h3>
            <div className="mt-5">
              {overdueBooks.length > 0 ? (
                <div className="space-y-3">
                  {overdueBooks.map((book) => (
                    <div key={book.transactionId} className="flex items-center justify-between gap-2">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {book.book.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {book.member.firstName} {book.member.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-red-600 whitespace-nowrap">
                          ${book.fineAmount}
                        </p>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          Due: {new Date(book.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                  <p className="mt-2 text-sm text-gray-500">No overdue books</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
