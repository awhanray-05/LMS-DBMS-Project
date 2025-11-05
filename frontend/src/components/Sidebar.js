import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Users, 
  FileText, 
  Plus,
  X,
  Library,
  BarChart3,
  BookMarked
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggle }) => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Books', href: '/books', icon: BookOpen },
    { name: 'Add Book', href: '/books/new', icon: Plus },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Add Member', href: '/members/new', icon: Plus },
    { name: 'Transactions', href: '/transactions', icon: FileText },
    { name: 'Issue Book', href: '/transactions/issue', icon: Library },
    { name: 'Reservations', href: '/reservations', icon: BookMarked },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-600 dark:bg-gray-900 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Library className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">LMS</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4 pb-20">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 transform hover:scale-105 hover:translate-x-1 ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Library Management System v1.0
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
