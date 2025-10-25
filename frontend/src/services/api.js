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
    const token = localStorage.getItem('token');
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
      const isLoginEndpoint = error.config?.url?.includes('/auth/login');
      if (!isLoginEndpoint) {
        console.error('Unauthorized access, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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
  getFineHistory: (memberId) => api.get(`/transactions/fines/${memberId}`),
  payFine: (fineId) => api.put(`/transactions/fines/${fineId}/pay`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentTransactions: () => api.get('/dashboard/recent-transactions'),
  getOverdueBooks: () => api.get('/dashboard/overdue-books'),
};

export default api;
