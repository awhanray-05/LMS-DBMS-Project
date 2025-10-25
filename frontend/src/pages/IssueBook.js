import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Loader, Search } from 'lucide-react';
import { membersAPI, booksAPI, transactionsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const IssueBook = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [bookSearchTerm, setBookSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  const memberId = watch('member_id');
  const bookId = watch('book_id');

  useEffect(() => {
    if (memberId) {
      fetchMemberDetails(memberId);
    }
  }, [memberId]);

  useEffect(() => {
    if (bookId) {
      fetchBookDetails(bookId);
    }
  }, [bookId]);

  const fetchMemberDetails = async (id) => {
    try {
      const response = await membersAPI.getMemberById(id);
      setSelectedMember(response.data);
    } catch (error) {
      console.error('Error fetching member:', error);
      setSelectedMember(null);
    }
  };

  const fetchBookDetails = async (id) => {
    try {
      const response = await booksAPI.getBookById(id);
      setSelectedBook(response.data);
    } catch (error) {
      console.error('Error fetching book:', error);
      setSelectedBook(null);
    }
  };

  const searchMembers = async (query) => {
    if (query.length < 2) {
      setMembers([]);
      return;
    }

    try {
      setLoading(true);
      const response = await membersAPI.getMembers({ 
        search: query, 
        limit: 10 
      });
      setMembers(response.data.members);
    } catch (error) {
      console.error('Error searching members:', error);
      toast.error('Failed to search members');
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = async (query) => {
    if (query.length < 2) {
      setBooks([]);
      return;
    }

    try {
      setLoading(true);
      const response = await booksAPI.getBooks({ 
        search: query, 
        limit: 10 
      });
      setBooks(response.data.books);
    } catch (error) {
      console.error('Error searching books:', error);
      toast.error('Failed to search books');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSearch = (e) => {
    const query = e.target.value;
    setMemberSearchTerm(query);
    searchMembers(query);
  };

  const handleBookSearch = (e) => {
    const query = e.target.value;
    setBookSearchTerm(query);
    searchBooks(query);
  };

  const selectMember = (member) => {
    setSelectedMember(member);
    setValue('member_id', member.id);
    setMemberSearchTerm(`${member.firstName} ${member.lastName} (${member.email})`);
    setMembers([]);
  };

  const selectBook = (book) => {
    setSelectedBook(book);
    setValue('book_id', book.id);
    setBookSearchTerm(`${book.title} by ${book.author}`);
    setBooks([]);
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      
      // Calculate due date (default 14 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      data.due_date = dueDate.toISOString().split('T')[0];

      await transactionsAPI.issueBook(data);
      toast.success('Book issued successfully');
      navigate('/transactions');
    } catch (error) {
      console.error('Error issuing book:', error);
      toast.error('Failed to issue book');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/transactions')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Transactions
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Issue Book</h1>
        <p className="mt-1 text-sm text-gray-500">
          Issue a book to a library member
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Member Selection */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Select Member
              </h3>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members by name or email..."
                  value={memberSearchTerm}
                  onChange={handleMemberSearch}
                  className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <input
                  {...register('member_id', { required: 'Member is required' })}
                  type="hidden"
                />
              </div>

              {/* Member Search Results */}
              {members.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => selectMember(member)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.email} • {member.membershipType}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Member */}
              {selectedMember && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <div className="text-sm font-medium text-blue-900">
                    Selected Member
                  </div>
                  <div className="mt-1 text-sm text-blue-700">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </div>
                  <div className="text-xs text-blue-600">
                    {selectedMember.email} • {selectedMember.membershipType}
                  </div>
                </div>
              )}

              {errors.member_id && (
                <p className="mt-1 text-sm text-red-600">{errors.member_id.message}</p>
              )}
            </div>
          </div>

          {/* Book Selection */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Select Book
              </h3>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search books by title or author..."
                  value={bookSearchTerm}
                  onChange={handleBookSearch}
                  className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <input
                  {...register('book_id', { required: 'Book is required' })}
                  type="hidden"
                />
              </div>

              {/* Book Search Results */}
              {books.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                  {books.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => selectBook(book)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {book.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        by {book.author} • {book.availableCopies} available
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Book */}
              {selectedBook && (
                <div className="mt-4 p-4 bg-green-50 rounded-md">
                  <div className="text-sm font-medium text-green-900">
                    Selected Book
                  </div>
                  <div className="mt-1 text-sm text-green-700">
                    {selectedBook.title}
                  </div>
                  <div className="text-xs text-green-600">
                    by {selectedBook.author} • {selectedBook.availableCopies} available
                  </div>
                </div>
              )}

              {errors.book_id && (
                <p className="mt-1 text-sm text-red-600">{errors.book_id.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Issue Details */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Issue Details
            </h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  {...register('due_date', { required: 'Due date is required' })}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.due_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.due_date.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/transactions')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !selectedMember || !selectedBook}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Issuing...' : 'Issue Book'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssueBook;
