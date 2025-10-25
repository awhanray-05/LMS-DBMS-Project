# Library Management System - Setup Guide

This guide will help you set up the Library Management System on your local machine.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Oracle Database** (11g or higher) - [Download here](https://www.oracle.com/database/technologies/oracle-database-software-downloads.html)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd LMS-DBMS
```

### Step 2: Database Setup

#### 2.1 Install Oracle Database

1. Download Oracle Database from the official website
2. Install Oracle Database following the installation wizard
3. Create a database instance (e.g., XE for Express Edition)
4. Note down your database credentials

#### 2.2 Create Database Schema

1. Open SQL*Plus or Oracle SQL Developer
2. Connect to your database with admin privileges
3. Run the schema file:

```sql
-- Navigate to the backend/config directory
-- Run the schema.sql file
@backend/config/schema.sql
```

This will create all necessary tables and insert sample data.

### Step 3: Backend Setup

#### 3.1 Navigate to Backend Directory

```bash
cd backend
```

#### 3.2 Install Dependencies

```bash
npm install
```

#### 3.3 Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file with your database credentials:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=1521
   DB_SERVICE_NAME=XE
   DB_USER=your_username
   DB_PASSWORD=your_password

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

#### 3.4 Start the Backend Server

```bash
npm run dev
```

The backend server will start on http://localhost:5000

### Step 4: Frontend Setup

#### 4.1 Navigate to Frontend Directory

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

#### 4.2 Install Dependencies

```bash
npm install
```

#### 4.3 Start the Frontend Server

```bash
npm start
```

The frontend will start on http://localhost:3000

## 🔐 Default Credentials

### Admin Login
- **URL**: http://localhost:3000/login
- **Username**: `admin`
- **Password**: `admin123`

### Member Login
- **URL**: http://localhost:3000/member-login
- **Email**: Use any email from the sample data
- **Password**: `password123`

## 🧪 Testing the Setup

### 1. Backend Health Check

Visit http://localhost:5000/health in your browser. You should see:

```json
{
  "success": true,
  "message": "Library Management System API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Frontend Access

1. Open http://localhost:3000
2. You should see the login page
3. Try logging in with the admin credentials

### 3. Database Verification

Check if the database tables were created:

```sql
SELECT table_name FROM user_tables;
```

You should see tables like: MEMBERS, BOOKS, TRANSACTIONS, ADMINS, FINE_HISTORY

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Error

**Error**: `ORA-12541: TNS:no listener`

**Solution**:
- Ensure Oracle database service is running
- Check if the listener is started
- Verify connection string in .env file

#### 2. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change port in .env file
PORT=5001
```

#### 3. Frontend Build Errors

**Error**: `Module not found` or build failures

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Oracle Client Issues

**Error**: `NJS-045: Oracle client library is not loaded`

**Solution**:
- Install Oracle Instant Client
- Set ORACLE_HOME environment variable
- Add Oracle client to PATH

#### 5. CORS Issues

**Error**: CORS policy blocking requests

**Solution**:
- Check FRONTEND_URL in backend .env file
- Ensure frontend is running on the correct port
- Verify CORS configuration in server.js

### Database Connection Troubleshooting

#### Check Oracle Service Status

```bash
# Windows
sc query OracleServiceXE

# Linux
systemctl status oracle-xe
```

#### Test Database Connection

```sql
-- In SQL*Plus
CONNECT username/password@localhost:1521/XE
SELECT * FROM dual;
```

#### Verify Database Credentials

```bash
# Test connection from command line
sqlplus username/password@localhost:1521/XE
```

## 📊 Sample Data

The system comes with sample data for testing:

### Books
- Effective Java by Joshua Bloch
- Clean Code by Robert C. Martin
- Design Patterns by Gang of Four
- Database System Concepts by Abraham Silberschatz
- Introduction to Algorithms by Thomas H. Cormen

### Members
- John Doe (Student)
- Jane Smith (Faculty)
- Bob Johnson (Staff)

### Admin User
- Username: admin
- Password: admin123
- Role: SUPER_ADMIN

## 🔧 Development Tips

### Backend Development

1. **Use nodemon for auto-restart**:
   ```bash
   npm run dev
   ```

2. **Check logs for errors**:
   ```bash
   # Backend logs will show in terminal
   ```

3. **Test API endpoints**:
   Use Postman or curl to test API endpoints

### Frontend Development

1. **Hot reload**: Changes will automatically reload
2. **Browser DevTools**: Use for debugging
3. **Network tab**: Monitor API calls

### Database Development

1. **Use Oracle SQL Developer** for database management
2. **Check logs** in Oracle alert log
3. **Monitor performance** with Oracle Enterprise Manager

## 🚀 Production Deployment

### Backend Production Setup

1. **Set production environment**:
   ```env
   NODE_ENV=production
   ```

2. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "lms-backend"
   ```

3. **Configure reverse proxy** (Nginx recommended)

### Frontend Production Setup

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy build folder** to your hosting service

3. **Configure environment variables** for production API URL

## 📚 Additional Resources

### Documentation
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://reactjs.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Oracle Database Documentation](https://docs.oracle.com/en/database/)

### Useful Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Oracle database status
sqlplus / as sysdba
SELECT status FROM v$instance;

# Check if ports are in use
netstat -an | grep :5000
netstat -an | grep :3000
```

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs** for error messages
2. **Verify all prerequisites** are installed
3. **Check environment variables** are set correctly
4. **Test database connection** independently
5. **Check firewall settings** for port access
6. **Create an issue** in the repository

## ✅ Verification Checklist

- [ ] Node.js installed (v14+)
- [ ] Oracle Database installed and running
- [ ] Database schema created successfully
- [ ] Backend dependencies installed
- [ ] Backend environment variables configured
- [ ] Backend server running on port 5000
- [ ] Frontend dependencies installed
- [ ] Frontend server running on port 3000
- [ ] Admin login working
- [ ] Member login working
- [ ] Database connection successful
- [ ] API endpoints responding

---

**Congratulations!** 🎉 Your Library Management System is now set up and ready to use!
