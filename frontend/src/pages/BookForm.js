import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Loader, Code } from 'lucide-react';
import { booksAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SQLVisualizationModal from '../components/SQLVisualizationModal';
import toast from 'react-hot-toast';

const BookForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [showSQLModal, setShowSQLModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch
  } = useForm();

  useEffect(() => {
    if (isEdit) {
      fetchBook();
    }
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getBookById(id);
      const book = response.data;
      
      // Set form values
      setValue('title', book.title);
      setValue('author', book.author);
      setValue('isbn', book.isbn);
      setValue('publisher', book.publisher);
      setValue('publication_year', book.publicationYear);
      setValue('category', book.category);
      setValue('total_copies', book.totalCopies);
      setValue('available_copies', book.availableCopies);
      setValue('price', book.price);
      setValue('description', book.description);
      setValue('status', book.status);
    } catch (error) {
      console.error('Error fetching book:', error);
      toast.error('Failed to load book details');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      
      if (isEdit) {
        await booksAPI.updateBook(id, data);
        toast.success('Book updated successfully');
      } else {
        await booksAPI.createBook(data);
        toast.success('Book created successfully');
      }
      
      navigate('/books');
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} book`);
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    'Programming', 'Database', 'Computer Science', 'Mathematics', 
    'Physics', 'Chemistry', 'Biology', 'Literature', 'History', 'Other'
  ];

  const statuses = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'UNAVAILABLE', label: 'Unavailable' },
    { value: 'LOST', label: 'Lost' },
    { value: 'DAMAGED', label: 'Damaged' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/books')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Books
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Book' : 'Add New Book'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEdit ? 'Update book information' : 'Add a new book to the library'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Title */}
              <div className="sm:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  {...register('title', { 
                    required: 'Title is required',
                    maxLength: { value: 200, message: 'Title must be less than 200 characters' }
                  })}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter book title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Author */}
              <div className="sm:col-span-2">
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                  Author *
                </label>
                <input
                  {...register('author', { 
                    required: 'Author is required',
                    maxLength: { value: 100, message: 'Author must be less than 100 characters' }
                  })}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter author name"
                />
                {errors.author && (
                  <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
                )}
              </div>

              {/* ISBN */}
              <div>
                <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
                  ISBN
                </label>
                <input
                  {...register('isbn', {
                    maxLength: { value: 20, message: 'ISBN must be less than 20 characters' }
                  })}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter ISBN"
                />
                {errors.isbn && (
                  <p className="mt-1 text-sm text-red-600">{errors.isbn.message}</p>
                )}
              </div>

              {/* Publisher */}
              <div>
                <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">
                  Publisher
                </label>
                <input
                  {...register('publisher', {
                    maxLength: { value: 100, message: 'Publisher must be less than 100 characters' }
                  })}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter publisher"
                />
                {errors.publisher && (
                  <p className="mt-1 text-sm text-red-600">{errors.publisher.message}</p>
                )}
              </div>

              {/* Publication Year */}
              <div>
                <label htmlFor="publication_year" className="block text-sm font-medium text-gray-700">
                  Publication Year
                </label>
                <input
                  {...register('publication_year', {
                    min: { value: 1000, message: 'Invalid year' },
                    max: { value: new Date().getFullYear() + 1, message: 'Invalid year' }
                  })}
                  type="number"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter publication year"
                />
                {errors.publication_year && (
                  <p className="mt-1 text-sm text-red-600">{errors.publication_year.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Total Copies */}
              <div>
                <label htmlFor="total_copies" className="block text-sm font-medium text-gray-700">
                  Total Copies *
                </label>
                <input
                  {...register('total_copies', { 
                    required: 'Total copies is required',
                    min: { value: 1, message: 'Must be at least 1' },
                    max: { value: 999, message: 'Must be less than 999' }
                  })}
                  type="number"
                  min="1"
                  max="999"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter total copies"
                />
                {errors.total_copies && (
                  <p className="mt-1 text-sm text-red-600">{errors.total_copies.message}</p>
                )}
              </div>

              {/* Available Copies */}
              {isEdit && (
                <div>
                  <label htmlFor="available_copies" className="block text-sm font-medium text-gray-700">
                    Available Copies
                  </label>
                  <input
                    {...register('available_copies', {
                      min: { value: 0, message: 'Must be at least 0' }
                    })}
                    type="number"
                    min="0"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter available copies"
                  />
                  {errors.available_copies && (
                    <p className="mt-1 text-sm text-red-600">{errors.available_copies.message}</p>
                  )}
                </div>
              )}

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price ($)
                </label>
                <input
                  {...register('price', {
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter price"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              {/* Status */}
              {isEdit && (
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter book description"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowSQLModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Code className="h-4 w-4 mr-2" />
            Visualize SQL
          </button>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate('/books')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Saving...' : (isEdit ? 'Update Book' : 'Create Book')}
            </button>
          </div>
        </div>
      </form>

      {/* SQL Visualization Modal */}
      <SQLVisualizationModal
        isOpen={showSQLModal}
        onClose={() => setShowSQLModal(false)}
        operation={isEdit ? 'UPDATE_BOOK' : 'CREATE_BOOK'}
        data={{ ...watch(), id: isEdit ? id : undefined }}
      />
    </div>
  );
};

export default BookForm;
