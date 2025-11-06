import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Library, 
  BookOpen, 
  Users, 
  FileText, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  Shield, 
  User, 
  Search, 
  BarChart3, 
  BookMarked, 
  DollarSign, 
  Clock, 
  Smartphone, 
  Lock, 
  Zap, 
  CheckCircle,
  Star,
  Award,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  const features = [
    {
      icon: BookOpen,
      title: 'Comprehensive Book Management',
      description: 'Efficiently manage your entire library collection with advanced search, filtering, and categorization. Add, edit, delete, and organize books with detailed metadata including ISBN, author, publisher, and availability status.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Member Management System',
      description: 'Complete member lifecycle management - register new members, update information, track borrowing history, and monitor member status. View detailed member profiles with transaction history and account status.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: FileText,
      title: 'Transaction Tracking',
      description: 'Seamlessly monitor book issues, returns, and renewals. Track overdue items, manage fine calculations, and maintain complete transaction records with timestamps and member details.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Reports',
      description: 'Get valuable insights into library operations with comprehensive reports. View statistics on popular books, member activity, transaction trends, and generate detailed analytics dashboards.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Search,
      title: 'Advanced Search & Filter',
      description: 'Powerful search functionality across books, members, and transactions. Filter by multiple criteria including title, author, category, date range, and status. Quick access to any information you need.',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: BookMarked,
      title: 'Book Reservations',
      description: 'Allow members to reserve currently unavailable books. Automated notification system alerts members when their reserved books become available. Maintain waitlists and manage reservation queues efficiently.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: DollarSign,
      title: 'Fine Management',
      description: 'Automated fine calculation based on overdue duration. Members can view and pay fines online through integrated payment gateway. Complete fine history tracking and payment records.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Robust security with JWT-based authentication, password hashing, and role-based access control. Separate login portals for administrators and members with secure session management.',
      color: 'from-teal-500 to-green-500',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Sign Up & Login',
      description: 'Choose your role - Admin or Member. Secure login with encrypted credentials and session management.',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      step: '2',
      title: 'Explore Dashboard',
      description: 'Access your personalized dashboard with real-time statistics, recent activities, and quick actions.',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
    {
      step: '3',
      title: 'Manage Resources',
      description: 'Admins can manage books and members. Members can browse catalog, reserve books, and track borrowings.',
      icon: Library,
      color: 'from-green-500 to-emerald-500',
    },
    {
      step: '4',
      title: 'Track Everything',
      description: 'Monitor all transactions, view reports, and stay updated with notifications and alerts.',
      icon: CheckCircle,
      color: 'from-orange-500 to-red-500',
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance with real-time updates and instant search results',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      icon: Smartphone,
      title: 'Fully Responsive',
      description: 'Access your library management system from any device - desktop, tablet, or mobile',
      color: 'from-blue-400 to-purple-500',
    },
    {
      icon: Lock,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with encrypted data and secure authentication',
      color: 'from-green-400 to-teal-500',
    },
    {
      icon: Target,
      title: 'User-Friendly',
      description: 'Intuitive interface designed for ease of use with comprehensive help and guidance',
      color: 'from-pink-400 to-rose-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          }}
        />
        <div 
          className="absolute top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"
          style={{
            transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)`,
          }}
        />
        <div 
          className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"
          style={{
            transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)`,
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Header with Sign In buttons */}
      <header className="relative z-50 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 animate-fade-in-down">
            <div className="relative">
              <Library className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400 animate-bounce-slow" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Library Management System
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">Your Digital Library Solution</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto animate-fade-in-down animation-delay-200">
            <button
              onClick={() => navigate('/member-login')}
              className="home-button group relative px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <User className="h-4 w-4" />
                <span>Member Sign In</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-xl" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="home-button group relative px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Admin Sign In</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient px-4">
                Welcome to Digital Library
                <br />
                <span className="relative inline-block">
                  Digital Library
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-400 opacity-50" viewBox="0 0 400 10" preserveAspectRatio="none">
                    <path d="M0,5 Q100,0 200,5 T400,5" stroke="currentColor" fill="none" strokeWidth="2" />
                  </svg>
                </span>
              </h2>
            </div>

            <p className={`text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto px-4 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Streamline your library operations with our modern, intuitive management system.
              Manage books, members, and transactions all in one place.
            </p>
            <div className={`max-w-4xl mx-auto px-4 mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">Enterprise-Grade Solution</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Trusted by Libraries</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium">24/7 Availability</span>
                </div>
              </div>
            </div>

            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <button
                onClick={() => navigate('/login')}
                className="home-button group relative px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 overflow-hidden"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Get Started as Admin</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              </button>

              <button
                onClick={() => navigate('/member-login')}
                className="home-button group relative px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-gray-200 dark:border-gray-700"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Member Portal</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-20">
            <div className={`text-center mb-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Powerful Features
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Everything you need to manage your library efficiently, all in one comprehensive platform
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className={`group relative p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    
                    {/* Icon */}
                    <div className={`relative mb-6 inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                      {feature.description}
                    </p>

                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* How It Works Section */}
          <div className={`mt-24 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Get started in minutes with our simple and intuitive process
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className="relative group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-200 dark:border-gray-700"
                  >
                    <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                      {step.step}
                    </div>
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${step.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                    {index < howItWorks.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ArrowRight className="h-6 w-6 text-gray-400 dark:text-gray-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Benefits Section */}
          <div className={`mt-24 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Why Choose Our LMS?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Experience the difference with our advanced library management solution
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 border border-gray-200 dark:border-gray-700 text-center"
                  >
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${benefit.color} mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Section */}
          <div className={`mt-24 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Trusted by Libraries Worldwide
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { number: '2K+', label: 'Books Available', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
                { number: '1K+', label: 'Active Members', icon: Users, color: 'from-purple-500 to-pink-500' },
                { number: '3K+', label: 'Transactions', icon: FileText, color: 'from-green-500 to-emerald-500' },
                { number: '99%', label: 'Uptime', icon: CheckCircle, color: 'from-orange-500 to-red-500' },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="relative group text-center p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4 shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Library className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Library Management System
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your comprehensive solution for modern library management. Streamline operations, enhance member experience, and take your library to the next level.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => navigate('/login')} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Admin Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/member-login')} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Member Portal
                  </button>
                </li>
                <li className="text-gray-600 dark:text-gray-400">Features</li>
                <li className="text-gray-600 dark:text-gray-400">About</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Key Features</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>✓ Book Management</li>
                <li>✓ Member Management</li>
                <li>✓ Transaction Tracking</li>
                <li>✓ Reports & Analytics</li>
                <li>✓ Fine Management</li>
                <li>✓ Reservation System</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              © 2025 Library Management System. Made with ❤️ for better library management.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Built with React, Node.js, and Oracle SQL
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

