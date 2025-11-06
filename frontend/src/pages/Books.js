import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  BookOpen,
  Filter,
  MoreHorizontal,
  Code
} from 'lucide-react';
import { booksAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SQLVisualizationModal from '../components/SQLVisualizationModal';
import toast from 'react-hot-toast';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('book_id');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [isVisible, setIsVisible] = useState(false);
  const [showSQLModal, setShowSQLModal] = useState(false);
  const [selectedBookForSQL, setSelectedBookForSQL] = useState(null);

  useEffect(() => {
    fetchBooks();
    setTimeout(() => setIsVisible(true), 100);
  }, [currentPage, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
        sortBy,
        sortOrder
      };

      const response = await booksAPI.getBooks(params);
      console.log('Books API Response:', response.data);
      
      // Handle nested data structure
      const data = response.data.data || response.data;
      const booksData = data.books || [];
      const paginationData = data.pagination || { totalPages: 1, totalItems: 0 };
      
      setBooks(booksData);
      setTotalPages(paginationData.totalPages);
      setTotalItems(paginationData.totalItems);
    } catch (error) {
      console.error('Error fetching books:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await booksAPI.deleteBook(id);
        toast.success('Book deleted successfully');
        fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
        toast.error('Failed to delete book');
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBooks();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      AVAILABLE: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      UNAVAILABLE: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      LOST: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      DAMAGED: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
    };

    return (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-110 ${statusClasses[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        {status}
                      </span>
    );
  };

  const categories = [
    'Programming', 'Database', 'Computer Science', 'Mathematics', 
    'Physics', 'Chemistry', 'Biology', 'Literature', 'History', 'Other'
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className={`sm:flex sm:items-center sm:justify-between transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Books</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your library's book collection
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/books/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
            Add Book
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg transition-all duration-500 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
        <form onSubmit={handleSearch} className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
              <option value="LOST">Lost</option>
              <option value="DAMAGED">Damaged</option>
            </select>

            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Filter className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-180" />
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Books Table */}
      <div className={`bg-white dark:bg-gray-800 shadow-lg overflow-hidden sm:rounded-md transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : books && books.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Copies
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {books.map((book, index) => (
                  <tr 
                    key={book.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                    style={{ transitionDelay: `${400 + index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <BookOpen className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {book.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ISBN: {book.isbn || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {book.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {book.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {book.availableCopies} / {book.totalCopies}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(book.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {book.price ? `$${book.price}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/books/${book.id}/edit`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-all duration-300 hover:scale-110 transform"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedBookForSQL(book);
                            setShowSQLModal(true);
                          }}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 transition-all duration-300 hover:scale-110 transform"
                          title="Visualize SQL for Delete"
                        >
                          <Code className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-all duration-300 hover:scale-110 transform"
                          title="Delete Book"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No books found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding a new book.
            </p>
            <div className="mt-6">
              <Link
                to="/books/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Book
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
          setSelectedBookForSQL(null);
        }}
        operation="DELETE_BOOK"
        data={selectedBookForSQL ? { id: selectedBookForSQL.id } : null}
      />
    </div>
  );
};

export default Books;
