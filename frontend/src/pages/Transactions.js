import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  RotateCcw, 
  FileText,
  Filter,
  Eye,
  AlertTriangle,
  RefreshCw,
  Code
} from 'lucide-react';
import { transactionsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SQLVisualizationModal from '../components/SQLVisualizationModal';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('transaction_id');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [showSQLModal, setShowSQLModal] = useState(false);
  const [selectedTransactionForSQL, setSelectedTransactionForSQL] = useState(null);
  const [sqlOperation, setSqlOperation] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder
      };

      const response = await transactionsAPI.getTransactions(params);
      
      // Handle nested data structure
      const data = response.data.data || response.data;
      const transactionsData = data.transactions || [];
      const paginationData = data.pagination || { totalPages: 1, totalItems: 0 };
      
      setTransactions(transactionsData);
      setTotalPages(paginationData.totalPages);
      setTotalItems(paginationData.totalItems);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error(error.response?.data?.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (transactionId) => {
    if (window.confirm('Are you sure you want to return this book?')) {
      try {
        await transactionsAPI.returnBook(transactionId);
        toast.success('Book returned successfully');
        fetchTransactions();
      } catch (error) {
        console.error('Error returning book:', error);
        toast.error(error.response?.data?.message || 'Failed to return book');
      }
    }
  };

  const handleRenewBook = async (transactionId) => {
    const extensionDays = prompt('Enter number of days to extend (default: 14):', '14');
    if (!extensionDays) return;
    
    const days = parseInt(extensionDays);
    if (isNaN(days) || days <= 0) {
      toast.error('Please enter a valid number of days');
      return;
    }

    try {
      const response = await transactionsAPI.renewBook(transactionId, { extension_days: days });
      toast.success(`Book renewed successfully. New due date: ${response.data.data.newDueDate}`);
      fetchTransactions();
    } catch (error) {
      console.error('Error renewing book:', error);
      toast.error(error.response?.data?.message || 'Failed to renew book');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      ISSUED: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      RETURNED: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      OVERDUE: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      LOST: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
        {status}
      </span>
    );
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'RETURNED') return false;
    return new Date(dueDate) < new Date();
  };

  const statuses = ['ISSUED', 'RETURNED', 'OVERDUE', 'LOST'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage book transactions and returns
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/transactions/issue"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Issue Book
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <form onSubmit={handleSearch} className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fine
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => (
                  <tr key={transaction.transactionId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <FileText className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            #{transaction.transactionId}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.member.firstName} {transaction.member.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.member.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.book.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        by {transaction.book.author}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(transaction.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(transaction.dueDate).toLocaleDateString()}
                        </div>
                        {isOverdue(transaction.dueDate, transaction.status) && (
                          <AlertTriangle className="ml-2 h-4 w-4 text-red-500 dark:text-red-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.fineAmount > 0 ? `Rs${transaction.fineAmount.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {transaction.status === 'ISSUED' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTransactionForSQL(transaction);
                                setSqlOperation('RENEW_BOOK');
                                setShowSQLModal(true);
                              }}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                              title="Visualize SQL for Renew"
                            >
                              <Code className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRenewBook(transaction.transactionId)}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                              title="Renew Book"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTransactionForSQL(transaction);
                                setSqlOperation('RETURN_BOOK');
                                setShowSQLModal(true);
                              }}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                              title="Visualize SQL for Return"
                            >
                              <Code className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReturnBook(transaction.transactionId)}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                              title="Return Book"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {transaction.status === 'OVERDUE' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTransactionForSQL(transaction);
                                setSqlOperation('RENEW_BOOK');
                                setShowSQLModal(true);
                              }}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                              title="Visualize SQL for Renew"
                            >
                              <Code className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRenewBook(transaction.transactionId)}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                              title="Renew Book"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTransactionForSQL(transaction);
                                setSqlOperation('RETURN_BOOK');
                                setShowSQLModal(true);
                              }}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                              title="Visualize SQL for Return"
                            >
                              <Code className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReturnBook(transaction.transactionId)}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                              title="Return Book"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <Link
                          to={`/transactions/${transaction.transactionId}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by issuing a book.
            </p>
            <div className="mt-6">
              <Link
                to="/transactions/issue"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Issue Book
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                <span className="font-medium">
                  {((currentPage - 1) * 10) + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 10, totalItems)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{totalItems}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-200'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* SQL Visualization Modal */}
      <SQLVisualizationModal
        isOpen={showSQLModal}
        onClose={() => {
          setShowSQLModal(false);
          setSelectedTransactionForSQL(null);
          setSqlOperation(null);
        }}
        operation={sqlOperation}
        data={selectedTransactionForSQL ? {
          transaction_id: selectedTransactionForSQL.transactionId,
          fine_amount: selectedTransactionForSQL.fineAmount || 0,
          extension_days: 14
        } : null}
      />
    </div>
  );
};

export default Transactions;
