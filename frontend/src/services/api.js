import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check if it's a member auth endpoint
    const isMemberAuth = config.url?.includes('/member-auth');
    const token = localStorage.getItem(isMemberAuth ? 'memberToken' : 'token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if it's not the login endpoint
      const isLoginEndpoint = error.config?.url?.includes('/auth/login') || 
                               error.config?.url?.includes('/member-auth/login');
      if (!isLoginEndpoint) {
        console.error('Unauthorized access, redirecting to login');
        const isMemberAuth = error.config?.url?.includes('/member-auth');
        if (isMemberAuth) {
          localStorage.removeItem('memberToken');
          localStorage.removeItem('member');
          window.location.href = '/member-login';
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Member Auth API
export const memberAuthAPI = {
  login: (credentials) => api.post('/member-auth/login', credentials),
  getProfile: () => api.get('/member-auth/profile'),
  changePassword: (data) => api.put('/member-auth/change-password', data),
  getBorrowedBooks: () => api.get('/member-auth/borrowed-books'),
  getFineHistory: () => api.get('/member-auth/fines'),
  getReservations: () => api.get('/member-auth/reservations'),
  createReservation: (bookId) => api.post('/member-auth/reservations', { book_id: bookId }),
  cancelReservation: (reservationId) => api.put(`/member-auth/reservations/cancel/${reservationId}`),
  getBooks: (params) => api.get('/member-auth/books', { params }),
  getBookById: (id) => api.get(`/member-auth/books/${id}`),
  createPaymentOrder: (fineId) => api.post('/member-auth/payments/create-order', { fine_id: fineId }),
  verifyPayment: (paymentData) => api.post('/member-auth/payments/verify', paymentData),
};

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Books API
export const booksAPI = {
  getBooks: (params) => api.get('/books', { params }),
  getBookById: (id) => api.get(`/books/${id}`),
  createBook: (data) => api.post('/books', data),
  updateBook: (id, data) => api.put(`/books/${id}`, data),
  deleteBook: (id) => api.delete(`/books/${id}`),
  searchBooks: (data) => api.post('/books/search', data),
};

// Members API
export const membersAPI = {
  getMembers: (params) => api.get('/members', { params }),
  getMemberById: (id) => api.get(`/members/${id}`),
  createMember: (data) => api.post('/members', data),
  updateMember: (id, data) => api.put(`/members/${id}`, data),
  deleteMember: (id) => api.delete(`/members/${id}`),
  getMemberTransactions: (id, params) => api.get(`/members/${id}/transactions`, { params }),
  getMemberBorrowedBooks: (id) => api.get(`/members/${id}/borrowed-books`),
};

// Transactions API
export const transactionsAPI = {
  getTransactions: (params) => api.get('/transactions', { params }),
  getOverdueBooks: () => api.get('/transactions/overdue'),
  issueBook: (data) => api.post('/transactions/issue', data),
  returnBook: (transactionId) => api.put(`/transactions/return/${transactionId}`),
  renewBook: (transactionId, data) => api.put(`/transactions/renew/${transactionId}`, data),
  getFineHistory: (memberId) => api.get(`/transactions/fines/${memberId}`),
  payFine: (fineId) => api.put(`/transactions/fines/${fineId}/pay`),
  getAnalytics: () => api.get('/transactions/analytics'),
};

// Reservations API
export const reservationsAPI = {
  createReservation: (data) => api.post('/reservations', data),
  getReservations: (params) => api.get('/reservations', { params }),
  getMemberReservations: (memberId) => api.get(`/reservations/member/${memberId}`),
  cancelReservation: (reservationId) => api.put(`/reservations/cancel/${reservationId}`),
  fulfillReservation: (reservationId) => api.put(`/reservations/fulfill/${reservationId}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentTransactions: () => api.get('/dashboard/recent-transactions'),
  getOverdueBooks: () => api.get('/dashboard/overdue-books'),
};

export default api;
