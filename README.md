# Library Management System (LMS)

A comprehensive Library Management System built with Node.js, Oracle SQL, and React with TailwindCSS. This system provides complete functionality for managing books, members, transactions, and administrative tasks.

## 🚀 Features

### Admin Features
- **Dashboard**: Overview of library statistics and recent activities
- **Book Management**: Add, edit, delete, and search books
- **Member Management**: Add, edit, delete, and manage library members
- **Transaction Management**: Issue and return books, track overdue books
- **Search & Filter**: Advanced search and filtering capabilities
- **Reports**: View transaction history and overdue books

### Member Features
- **Member Portal**: Dedicated login for library members
- **Borrowed Books**: View currently borrowed books
- **Fine History**: Check pending fines and payment history
- **Account Information**: View member details and status

### System Features
- **Authentication**: Secure admin and member login
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live data updates
- **Professional UI**: Modern, intuitive interface
- **Data Validation**: Comprehensive form validation
- **Error Handling**: User-friendly error messages

## 🛠️ Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Oracle SQL**: Database
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **express-validator**: Input validation

### Frontend
- **React**: UI library
- **TailwindCSS**: Styling framework
- **React Router**: Navigation
- **Axios**: HTTP client
- **React Hook Form**: Form management
- **Lucide React**: Icons

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **Oracle Database** (11g or higher)
- **npm** or **yarn**
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd LMS-DBMS
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your database credentials
# DB_HOST=localhost
# DB_PORT=1521
# DB_SERVICE_NAME=XE
# DB_USER=your_username
# DB_PASSWORD=your_password
# JWT_SECRET=your_jwt_secret_key_here
# JWT_EXPIRE=7d
# PORT=5000
# NODE_ENV=development
# FRONTEND_URL=http://localhost:3000

# Start the backend server
npm run dev
```

### 3. Database Setup

1. **Connect to Oracle Database**:
   ```sql
   -- Run the schema.sql file in your Oracle database
   -- This will create all necessary tables and sample data
   ```

2. **Default Admin Credentials**:
   - Username: `admin`
   - Password: `admin123`

### 4. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## 🌐 Accessing the Application

- **Admin Portal**: http://localhost:3000/login
- **Member Portal**: http://localhost:3000/member-login
- **API Endpoints**: http://localhost:5000/api

## 📊 Database Schema

The system uses the following main tables:

- **members**: Library member information
- **books**: Book catalog
- **transactions**: Book issue/return records
- **admins**: System administrators
- **fine_history**: Fine tracking

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get admin profile
- `PUT /api/auth/change-password` - Change password

### Books
- `GET /api/books` - Get all books (with pagination)
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book
- `POST /api/books/search` - Search books

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member
- `GET /api/members/:id/transactions` - Get member transactions
- `GET /api/members/:id/borrowed-books` - Get member's borrowed books

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions/issue` - Issue a book
- `PUT /api/transactions/return/:id` - Return a book
- `GET /api/transactions/overdue` - Get overdue books
- `GET /api/transactions/fines/:memberId` - Get member fines
- `PUT /api/transactions/fines/:fineId/pay` - Pay fine

## 🎨 UI Components

The application includes:

- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Modern Design**: Clean, professional interface
- **Interactive Elements**: Smooth animations and transitions
- **Form Validation**: Real-time validation feedback
- **Loading States**: User-friendly loading indicators
- **Error Handling**: Clear error messages

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Server-side validation
- **CORS Protection**: Cross-origin request security
- **Rate Limiting**: API rate limiting
- **SQL Injection Protection**: Parameterized queries

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 🚀 Deployment

### Backend Deployment

1. **Set up production environment variables**
2. **Configure Oracle database connection**
3. **Install PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "lms-backend"
   ```

### Frontend Deployment

1. **Build the React application**:
   ```bash
   npm run build
   ```

2. **Deploy to your preferred hosting service** (Netlify, Vercel, etc.)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Usage Guide

### For Administrators

1. **Login** with admin credentials
2. **Add Books**: Navigate to Books → Add Book
3. **Manage Members**: Navigate to Members → Add Member
4. **Issue Books**: Navigate to Transactions → Issue Book
5. **Track Returns**: View and process book returns
6. **Monitor Overdue**: Check overdue books and fines

### For Members

1. **Login** with member credentials
2. **View Borrowed Books**: See currently borrowed books
3. **Check Fines**: View pending fines and payment history
4. **Account Information**: View member details

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify Oracle database is running
   - Check connection credentials in .env file
   - Ensure Oracle client is installed

2. **Frontend Build Errors**:
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

3. **Authentication Issues**:
   - Verify JWT_SECRET is set
   - Check token expiration settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

- **v1.0.0**: Initial release with core functionality
- **Future updates**: Enhanced features, performance improvements, and bug fixes

---

**Built with ❤️ for efficient library management**
