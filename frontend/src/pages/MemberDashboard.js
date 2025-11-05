import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  LogOut,
  DollarSign,
  CreditCard
} from 'lucide-react';
import { memberAuthAPI } from '../services/api';
import { openRazorpayCheckout } from '../services/paymentService';
import toast from 'react-hot-toast';

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [memberSession, setMemberSession] = useState(null);
  const [memberInfo, setMemberInfo] = useState(null);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [fineHistory, setFineHistory] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [processingPayment, setProcessingPayment] = useState({});

  useEffect(() => {
    checkMemberSession();
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const checkMemberSession = async () => {
    const memberToken = localStorage.getItem('memberToken');
    const memberData = localStorage.getItem('member');
    
    if (!memberToken || !memberData) {
      navigate('/member-login');
      return;
    }

    try {
      const memberInfo = JSON.parse(memberData);
      setMemberSession(memberInfo);
      
      // If password hasn't been changed, redirect to password change
      if (!memberInfo.passwordChanged) {
        navigate('/member/change-password');
        return;
      }
      
      // Fetch member profile using authenticated API
      try {
        const profileResponse = await memberAuthAPI.getProfile();
        const profileData = profileResponse.data.data;
        setMemberInfo(profileData);
        
        // Fetch member data (will use authenticated member ID automatically)
        fetchMemberData();
      } catch (error) {
        console.error('Error fetching member profile:', error);
        // If profile fetch fails, try using stored member ID
        if (memberInfo.id) {
          setMemberInfo(memberInfo);
          fetchMemberData();
        } else {
          toast.error('Failed to load member profile. Please login again.');
          localStorage.removeItem('memberToken');
          localStorage.removeItem('member');
          navigate('/member-login');
        }
      }
    } catch (error) {
      console.error('Error parsing member session:', error);
      localStorage.removeItem('memberToken');
      localStorage.removeItem('member');
      navigate('/member-login');
    }
  };

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      
      // Fetch borrowed books using member auth API
      try {
        const borrowedResponse = await memberAuthAPI.getBorrowedBooks();
        const borrowedData = borrowedResponse.data?.data?.borrowedBooks || [];
        setBorrowedBooks(borrowedData.map(book => ({
          ...book,
          id: book.transactionId,
          title: book.book?.title || book.title,
          author: book.book?.author || book.author,
          issueDate: book.issueDate,
          dueDate: book.dueDate,
          status: book.dueDate && new Date(book.dueDate) < new Date() ? 'OVERDUE' : 'ISSUED'
        })));
      } catch (error) {
        console.error('Error fetching borrowed books:', error);
        setBorrowedBooks([]);
      }

      // Fetch fine history using member auth API
      try {
        const fineResponse = await memberAuthAPI.getFineHistory();
        setFineHistory(fineResponse.data?.data?.fineHistory || []);
      } catch (error) {
        console.error('Error fetching fine history:', error);
        setFineHistory([]);
      }

      // Fetch reservations using member auth API
      try {
        const reservationsResponse = await memberAuthAPI.getReservations();
        setReservations(reservationsResponse.data?.data?.reservations || []);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setReservations([]);
      }

    } catch (error) {
      console.error('Error fetching member data:', error);
      toast.error('Failed to load member data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (fineId, fineAmount) => {
    if (!fineId) {
      toast.error('Cannot pay fine yet. Please return the book first to generate the fine.');
      return;
    }
    if (!window.confirm(`Are you sure you want to pay Rs${fineAmount.toFixed(2)}?`)) {
      return;
    }

    try {
      setProcessingPayment(prev => ({ ...prev, [fineId]: true }));

      // Step 1: Create Razorpay order
      const orderResponse = await memberAuthAPI.createPaymentOrder(fineId);
      const { orderId, amount, amountInPaise, currency, keyId } = orderResponse.data.data;

      // Step 2: Open Razorpay checkout
      const paymentResponse = await openRazorpayCheckout({
        keyId: keyId,
        amount: amountInPaise, // Use amount in paise from backend
        currency: currency || 'INR',
        orderId: orderId,
        name: 'Library Management System',
        description: `Fine Payment - Rs${amount}`,
        customerName: memberInfo ? `${memberInfo.firstName} ${memberInfo.lastName}` : memberSession?.email,
        customerEmail: memberInfo?.email || memberSession?.email
      });

      // Step 3: Verify payment with backend
      const verifyResponse = await memberAuthAPI.verifyPayment({
        fine_id: fineId,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature
      });

      toast.success('Fine paid successfully!');
      
      // Refresh fine history
      const fineResponse = await memberAuthAPI.getFineHistory();
      setFineHistory(fineResponse.data?.data?.fineHistory || []);
    } catch (error) {
      console.error('Error processing payment:', error);
      if (error.message === 'Payment cancelled by user') {
        toast.error('Payment was cancelled');
      } else {
        toast.error(error.response?.data?.message || 'Failed to process payment. Please try again.');
      }
    } finally {
      setProcessingPayment(prev => ({ ...prev, [fineId]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('memberToken');
    localStorage.removeItem('member');
    navigate('/member-login');
    toast.success('Logged out successfully');
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      ISSUED: 'bg-blue-100 text-blue-800',
      OVERDUE: 'bg-red-100 text-red-800',
      RETURNED: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getFineStatusBadge = (status) => {
    const statusClasses = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      WAIVED: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 animate-fade-in">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center py-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600 animate-bounce-slow" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">
                Member Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {memberInfo ? `${memberInfo.firstName} ${memberInfo.lastName}` : memberSession?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Member</p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <LogOut className="h-4 w-4 mr-1 transition-transform duration-300 group-hover:translate-x-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {[
                { name: 'Books Borrowed', value: borrowedBooks.length, icon: BookOpen, color: 'blue' },
                { name: 'Overdue Books', value: borrowedBooks.filter(book => book.status === 'OVERDUE').length, icon: AlertTriangle, color: 'red' },
                { name: 'Pending Fines', value: `Rs${fineHistory.filter(fine => fine.status === 'PENDING').reduce((sum, fine) => sum + (fine.fineAmount || 0), 0).toFixed(2)}`, icon: DollarSign, color: 'yellow' },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={stat.name}
                    className={`bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg transition-all duration-500 hover:shadow-xl hover:scale-105 hover:-translate-y-1 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`p-3 rounded-md transform transition-transform duration-300 hover:scale-110 hover:rotate-6 ${
                            stat.color === 'blue' ? 'bg-blue-500' :
                            stat.color === 'red' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              {stat.name}
                            </dt>
                            <dd className="text-lg font-medium text-gray-900 dark:text-white">
                              {stat.value}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Borrowed Books */}
            <div className={`bg-white dark:bg-gray-800 shadow-lg overflow-hidden sm:rounded-md transition-all duration-500 hover:shadow-xl ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '400ms' }}>
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                  Currently Borrowed Books
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  Books you currently have borrowed
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700">
                {borrowedBooks.length > 0 ? (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {borrowedBooks.map((book, index) => (
                      <li 
                        key={book.id || book.transactionId} 
                        className={`px-4 py-4 sm:px-6 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md hover:scale-[1.01] ${
                          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                        }`}
                        style={{ transitionDelay: `${500 + index * 100}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <BookOpen className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {book.book?.title || book.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                by {book.book?.author || book.author}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                Issued: {new Date(book.issueDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Due: {new Date(book.dueDate).toLocaleDateString()}
                              </div>
                              {getStatusBadge(book.status)}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No borrowed books</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      You don't have any books borrowed at the moment.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Fine History */}
            <div className={`bg-white dark:bg-gray-800 shadow-lg overflow-hidden sm:rounded-md transition-all duration-500 hover:shadow-xl ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`} style={{ transitionDelay: '400ms' }}>
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-yellow-500" />
                  Fine History
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  Your fine history and payments
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700">
                {fineHistory.length > 0 ? (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {fineHistory.map((fine, index) => (
                      <li 
                        key={fine.fineId} 
                        className={`px-4 py-4 sm:px-6 transition-all duration-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:shadow-md hover:scale-[1.01] border-l-4 border-yellow-500 ${
                          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                        }`}
                        style={{ transitionDelay: `${500 + index * 100}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <DollarSign className="h-8 w-8 text-yellow-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Rs{fine.fineAmount?.toFixed(2) || '0.00'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {fine.fineReason || 'Fine'}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                {fine.isCalculated ? 'Due date: ' : 'Created: '}{new Date(fine.createdAt || fine.transaction?.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {getFineStatusBadge(fine.status)}
                            {fine.status === 'PENDING' && (
                              <button
                                onClick={() => handlePayFine(fine.fineId, fine.fineAmount)}
                                disabled={processingPayment[fine.fineId] || !fine.fineId || fine.isCalculated}
                                className={`inline-flex items-center px-3 py-1 text-sm font-medium text-white rounded-md transition-all duration-300 hover:scale-105 ${
                                  processingPayment[fine.fineId] || !fine.fineId || fine.isCalculated
                                    ? 'opacity-50 cursor-not-allowed bg-gray-500'
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                                title={!fine.fineId || fine.isCalculated ? 'Return the book first to pay this fine' : ''}
                              >
                                {processingPayment[fine.fineId] ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                    Processing...
                                  </>
                                ) : !fine.fineId || fine.isCalculated ? (
                                  <>
                                    <Clock className="h-4 w-4 mr-1" />
                                    Return book first
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="h-4 w-4 mr-1" />
                                    Pay Rs{fine.fineAmount?.toFixed(2) || '0.00'}
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No fines</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      You don't have any fines at the moment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MemberDashboard;
