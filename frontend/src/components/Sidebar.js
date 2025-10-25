import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Users, 
  FileText, 
  Plus,
  X,
  Library
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Books', href: '/books', icon: BookOpen },
    { name: 'Add Book', href: '/books/new', icon: Plus },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Add Member', href: '/members/new', icon: Plus },
    { name: 'Transactions', href: '/transactions', icon: FileText },
    { name: 'Issue Book', href: '/transactions/issue', icon: Library },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <Library className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">LMS</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Library Management System v1.0
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
