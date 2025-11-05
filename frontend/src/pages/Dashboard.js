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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    // Trigger animation after component mounts
    setTimeout(() => setIsVisible(true), 100);
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
        if (booksResponse?.data?.data?.pagination?.totalItems !== undefined) {
          totalBooks = booksResponse.data.data.pagination.totalItems;
        }
      } catch (err) {
        console.warn('Could not fetch books:', err?.message || err);
      }

      // Fetch members count
      try {
        const membersResponse = await membersAPI.getMembers({ limit: 1 });
        if (membersResponse?.data?.data?.pagination?.totalItems !== undefined) {
          totalMembers = membersResponse.data.data.pagination.totalItems;
        }
      } catch (err) {
        console.warn('Could not fetch members:', err?.message || err);
      }

      // Fetch transactions count
      try {
        const transactionsResponse = await transactionsAPI.getTransactions({ limit: 1 });
        if (transactionsResponse?.data?.data?.pagination?.totalItems !== undefined) {
          activeTransactions = transactionsResponse.data.data.pagination.totalItems;
        }
      } catch (err) {
        console.warn('Could not fetch transactions:', err?.message || err);
      }

      // Fetch overdue books
      try {
        const overdueResponse = await transactionsAPI.getOverdueBooks();
        if (overdueResponse?.data?.data?.overdueBooks) {
          overdueBooksList = overdueResponse.data.data.overdueBooks;
        }
      } catch (err) {
        console.warn('Could not fetch overdue books:', err?.message || err);
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
        if (recentResponse?.data?.data?.transactions) {
          setRecentTransactions(recentResponse.data.data.transactions);
        }
      } catch (err) {
        console.warn('Could not fetch recent transactions:', err?.message || err);
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

  // Number counter animation component
  const AnimatedNumber = ({ value, duration = 1000 }) => {
    const [displayValue, setDisplayValue] = useState(0);
    
    useEffect(() => {
      let startTime = null;
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setDisplayValue(Math.floor(easeOutQuart * value));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
        }
      };
      requestAnimationFrame(animate);
    }, [value, duration]);
    
    return <>{displayValue}</>;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your library management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: 'bg-blue-500 dark:bg-blue-600',
            green: 'bg-green-500 dark:bg-green-600',
            purple: 'bg-purple-500 dark:bg-purple-600',
            red: 'bg-red-500 dark:bg-red-600'
          };
          
          return (
            <div 
              key={card.name} 
              className={`bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg transition-all duration-500 hover:shadow-xl hover:scale-105 hover:-translate-y-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${colorClasses[card.color]} transform transition-transform duration-300 hover:scale-110 hover:rotate-6`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {card.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                          <AnimatedNumber value={card.value} />
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold transition-all duration-300 ${
                          card.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          <TrendingUp className={`h-3 w-3 mr-1 ${card.changeType === 'positive' ? '' : 'rotate-180'}`} />
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
        <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg transition-all duration-500 hover:shadow-xl ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`} style={{ transitionDelay: '400ms' }}>
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Recent Transactions
            </h3>
            <div className="mt-5">
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <div 
                      key={transaction.transactionId} 
                      className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105 ${
                        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                      }`}
                      style={{ transitionDelay: `${500 + index * 100}ms` }}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <BookOpen className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform duration-300 hover:scale-110" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.book.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.member.firstName} {transaction.member.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-110 ${
                          transaction.status === 'ISSUED' 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : transaction.status === 'RETURNED'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent transactions</p>
              )}
            </div>
          </div>
        </div>

        {/* Overdue Books */}
        <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg transition-all duration-500 hover:shadow-xl ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`} style={{ transitionDelay: '400ms' }}>
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500 animate-pulse" />
              Overdue Books
            </h3>
            <div className="mt-5">
              {overdueBooks.length > 0 ? (
                <div className="space-y-3">
                  {overdueBooks.map((book, index) => (
                    <div 
                      key={book.transactionId} 
                      className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-md hover:scale-105 border-l-4 border-red-500 ${
                        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                      }`}
                      style={{ transitionDelay: `${500 + index * 100}ms` }}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-400 dark:text-red-500 transition-transform duration-300 hover:scale-110 animate-pulse" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {book.book.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {book.member.firstName} {book.member.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                          ${book.fineAmount}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {new Date(book.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 animate-fade-in">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-400 dark:text-green-500 animate-bounce" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No overdue books</p>
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
