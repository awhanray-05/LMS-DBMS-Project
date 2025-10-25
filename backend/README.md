# Library Management System - Backend

This is the backend API for the Library Management System, built with Node.js, Express, and Oracle SQL.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Oracle Database (11g or higher)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Initialize database**:
   ```sql
   -- Run the schema.sql file in your Oracle database
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js          # Database connection configuration
│   └── schema.sql           # Database schema and sample data
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── bookController.js    # Book management
│   ├── memberController.js  # Member management
│   └── transactionController.js # Transaction handling
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── validation.js        # Input validation
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── books.js             # Book routes
│   ├── members.js           # Member routes
│   └── transactions.js      # Transaction routes
├── server.js                # Main server file
├── package.json
└── env.example              # Environment variables template
```

## 🔧 API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Admin login endpoint.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "admin": {
      "id": 1,
      "username": "admin",
      "email": "admin@library.com",
      "firstName": "System",
      "lastName": "Administrator",
      "role": "SUPER_ADMIN"
    }
  }
}
```

#### GET /api/auth/profile
Get current admin profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@library.com",
    "firstName": "System",
    "lastName": "Administrator",
    "role": "SUPER_ADMIN"
  }
}
```

### Book Endpoints

#### GET /api/books
Get all books with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `category` (string): Filter by category
- `status` (string): Filter by status
- `sortBy` (string): Sort field (default: 'book_id')
- `sortOrder` (string): Sort order 'ASC' or 'DESC' (default: 'ASC')

**Response:**
```json
{
  "success": true,
  "data": {
    "books": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

#### POST /api/books
Create a new book (requires authentication).

**Request Body:**
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "978-1234567890",
  "publisher": "Publisher Name",
  "publication_year": 2023,
  "category": "Programming",
  "total_copies": 5,
  "price": 29.99,
  "description": "Book description"
}
```

#### PUT /api/books/:id
Update a book (requires authentication).

#### DELETE /api/books/:id
Delete a book (requires authentication).

### Member Endpoints

#### GET /api/members
Get all members with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search term
- `membership_type` (string): Filter by membership type
- `status` (string): Filter by status

#### POST /api/members
Create a new member (requires authentication).

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@email.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "membership_type": "STUDENT"
}
```

### Transaction Endpoints

#### POST /api/transactions/issue
Issue a book to a member (requires authentication).

**Request Body:**
```json
{
  "member_id": 1,
  "book_id": 1,
  "due_date": "2024-02-15"
}
```

#### PUT /api/transactions/return/:transactionId
Return a book (requires authentication).

#### GET /api/transactions/overdue
Get all overdue books (requires authentication).

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Comprehensive input validation
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: API rate limiting
- **CORS Protection**: Cross-origin request security

## 🗄️ Database Schema

### Tables

1. **members**: Library member information
2. **books**: Book catalog
3. **transactions**: Book issue/return records
4. **admins**: System administrators
5. **fine_history**: Fine tracking

### Sample Data

The schema includes sample data for testing:
- Default admin user (username: admin, password: admin123)
- Sample books and members
- Transaction history

## 🚀 Deployment

### Production Setup

1. **Set environment variables**:
   ```bash
   NODE_ENV=production
   DB_HOST=your_production_db_host
   DB_USER=your_production_db_user
   DB_PASSWORD=your_production_db_password
   JWT_SECRET=your_secure_jwt_secret
   ```

2. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

3. **Start with PM2**:
   ```bash
   pm2 start server.js --name "lms-backend"
   pm2 save
   pm2 startup
   ```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Oracle database host | localhost |
| `DB_PORT` | Oracle database port | 1521 |
| `DB_SERVICE_NAME` | Oracle service name | XE |
| `DB_USER` | Database username | - |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify Oracle database is running
   - Check connection credentials
   - Ensure Oracle client is installed

2. **Authentication Issues**:
   - Verify JWT_SECRET is set
   - Check token expiration settings

3. **Port Already in Use**:
   - Change PORT in .env file
   - Kill existing process on port 5000

## 📊 Performance

- **Connection Pooling**: Oracle connection pooling for better performance
- **Query Optimization**: Optimized database queries
- **Caching**: Response caching where appropriate
- **Rate Limiting**: API rate limiting to prevent abuse

## 🔄 Updates

- **v1.0.0**: Initial release with core functionality
- **Future**: Enhanced features, performance improvements

---

For more information, see the main README.md file.
