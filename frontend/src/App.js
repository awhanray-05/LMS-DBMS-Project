import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookForm from './pages/BookForm';
import Members from './pages/Members';
import MemberForm from './pages/MemberForm';
import Transactions from './pages/Transactions';
import IssueBook from './pages/IssueBook';
import MemberLogin from './pages/MemberLogin';
import MemberDashboard from './pages/MemberDashboard';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/member-login" element={<MemberLogin />} />
              
              {/* Member routes */}
              <Route path="/member" element={<MemberDashboard />} />
              
              {/* Protected admin routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="books" element={<Books />} />
                <Route path="books/new" element={<BookForm />} />
                <Route path="books/:id/edit" element={<BookForm />} />
                <Route path="members" element={<Members />} />
                <Route path="members/new" element={<MemberForm />} />
                <Route path="members/:id/edit" element={<MemberForm />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="transactions/issue" element={<IssueBook />} />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
