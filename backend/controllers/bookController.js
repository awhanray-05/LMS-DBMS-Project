const { getConnection } = require('../config/database');
const oracledb = require('oracledb');

// Get all books with pagination and search
const getBooks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category = '', 
      status = '',
      sortBy = 'book_id',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const connection = await getConnection();

    // Build search conditions
    let whereConditions = [];
    let bindVars = {};

    if (search) {
      whereConditions.push(`(LOWER(title) LIKE LOWER(:search) OR LOWER(author) LIKE LOWER(:search) OR LOWER(isbn) LIKE LOWER(:search))`);
      bindVars.search = `%${search}%`;
    }

    if (category) {
      whereConditions.push(`category = :category`);
      bindVars.category = category;
    }

    if (status) {
      whereConditions.push(`status = :status`);
      bindVars.status = status;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM books ${whereClause}`;
    const countResult = await connection.execute(countQuery, bindVars);
    const total = countResult.rows[0].TOTAL;

    // Get books with pagination
    const booksQuery = `
      SELECT book_id, isbn, title, author, publisher, publication_year, 
             category, total_copies, available_copies, price, description, 
             status, created_at, updated_at
      FROM books 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    bindVars.offset = offset;
    bindVars.limit = parseInt(limit);

    const booksResult = await connection.execute(booksQuery, bindVars);
    await connection.close();

    const books = booksResult.rows.map(row => ({
      id: row.BOOK_ID,
      isbn: row.ISBN,
      title: row.TITLE,
      author: row.AUTHOR,
      publisher: row.PUBLISHER,
      publicationYear: row.PUBLICATION_YEAR,
      category: row.CATEGORY,
      totalCopies: row.TOTAL_COPIES,
      availableCopies: row.AVAILABLE_COPIES,
      price: row.PRICE,
      description: row.DESCRIPTION,
      status: row.STATUS,
      createdAt: row.CREATED_AT,
      updatedAt: row.UPDATED_AT
    }));

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books',
      error: error.message
    });
  }
};

// Get book by ID
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT book_id, isbn, title, author, publisher, publication_year, 
              category, total_copies, available_copies, price, description, 
              status, created_at, updated_at
       FROM books WHERE book_id = :id`,
      { id }
    );
    await connection.close();

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const book = result.rows[0];
    res.json({
      success: true,
      data: {
        id: book.BOOK_ID,
        isbn: book.ISBN,
        title: book.TITLE,
        author: book.AUTHOR,
        publisher: book.PUBLISHER,
        publicationYear: book.PUBLICATION_YEAR,
        category: book.CATEGORY,
        totalCopies: book.TOTAL_COPIES,
        availableCopies: book.AVAILABLE_COPIES,
        price: book.PRICE,
        description: book.DESCRIPTION,
        status: book.STATUS,
        createdAt: book.CREATED_AT,
        updatedAt: book.UPDATED_AT
      }
    });
  } catch (error) {
    console.error('Get book by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book',
      error: error.message
    });
  }
};

// Create new book
const createBook = async (req, res) => {
  try {
    const {
      isbn,
      title,
      author,
      publisher,
      publication_year,
      category,
      total_copies,
      price,
      description
    } = req.body;

    const connection = await getConnection();

    // Check if ISBN already exists
    if (isbn) {
      const existingBook = await connection.execute(
        `SELECT book_id FROM books WHERE isbn = :isbn`,
        { isbn }
      );

      if (existingBook.rows.length > 0) {
        await connection.close();
        return res.status(400).json({
          success: false,
          message: 'Book with this ISBN already exists'
        });
      }
    }

    const result = await connection.execute(
      `INSERT INTO books (isbn, title, author, publisher, publication_year, 
                         category, total_copies, available_copies, price, description)
       VALUES (:isbn, :title, :author, :publisher, :publication_year, 
               :category, :total_copies, :total_copies, :price, :description)
       RETURNING book_id INTO :book_id`,
      {
        isbn: isbn || null,
        title,
        author,
        publisher: publisher || null,
        publication_year: publication_year || null,
        category: category || null,
        total_copies: total_copies || 1,
        price: price || null,
        description: description || null,
        book_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    const bookId = result.outBinds.book_id[0];
    await connection.close();

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: { bookId }
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create book',
      error: error.message
    });
  }
};

// Update book
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      isbn,
      title,
      author,
      publisher,
      publication_year,
      category,
      total_copies,
      available_copies,
      price,
      description,
      status
    } = req.body;

    const connection = await getConnection();

    // Check if book exists
    const existingBook = await connection.execute(
      `SELECT book_id FROM books WHERE book_id = :id`,
      { id }
    );

    if (existingBook.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if ISBN already exists (excluding current book)
    if (isbn) {
      const duplicateIsbn = await connection.execute(
        `SELECT book_id FROM books WHERE isbn = :isbn AND book_id != :id`,
        { isbn, id }
      );

      if (duplicateIsbn.rows.length > 0) {
        await connection.close();
        return res.status(400).json({
          success: false,
          message: 'Book with this ISBN already exists'
        });
      }
    }

    // Update book
    await connection.execute(
      `UPDATE books SET 
         isbn = :isbn,
         title = :title,
         author = :author,
         publisher = :publisher,
         publication_year = :publication_year,
         category = :category,
         total_copies = :total_copies,
         available_copies = :available_copies,
         price = :price,
         description = :description,
         status = :status
       WHERE book_id = :id`,
      {
        isbn: isbn || null,
        title,
        author,
        publisher: publisher || null,
        publication_year: publication_year || null,
        category: category || null,
        total_copies: total_copies || 1,
        available_copies: available_copies || total_copies || 1,
        price: price || null,
        description: description || null,
        status: status || 'AVAILABLE',
        id
      }
    );

    await connection.close();

    res.json({
      success: true,
      message: 'Book updated successfully'
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update book',
      error: error.message
    });
  }
};

// Delete book
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getConnection();

    // Check if book exists
    const existingBook = await connection.execute(
      `SELECT book_id FROM books WHERE book_id = :id`,
      { id }
    );

    if (existingBook.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if book has active transactions
    const activeTransactions = await connection.execute(
      `SELECT COUNT(*) as count FROM transactions 
       WHERE book_id = :id AND status IN ('ISSUED', 'OVERDUE')`,
      { id }
    );

    if (activeTransactions.rows[0].COUNT > 0) {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with active transactions'
      });
    }

    // Delete book
    await connection.execute(
      `DELETE FROM books WHERE book_id = :id`,
      { id }
    );

    await connection.close();

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: error.message
    });
  }
};

// Search books
const searchBooks = async (req, res) => {
  try {
    const { query, type = 'all' } = req.body;
    const connection = await getConnection();

    let searchQuery;
    let bindVars = { query: `%${query}%` };

    switch (type) {
      case 'title':
        searchQuery = `SELECT * FROM books WHERE LOWER(title) LIKE LOWER(:query)`;
        break;
      case 'author':
        searchQuery = `SELECT * FROM books WHERE LOWER(author) LIKE LOWER(:query)`;
        break;
      case 'isbn':
        searchQuery = `SELECT * FROM books WHERE isbn LIKE :query`;
        break;
      case 'category':
        searchQuery = `SELECT * FROM books WHERE LOWER(category) LIKE LOWER(:query)`;
        break;
      default:
        searchQuery = `SELECT * FROM books WHERE 
          LOWER(title) LIKE LOWER(:query) OR 
          LOWER(author) LIKE LOWER(:query) OR 
          LOWER(category) LIKE LOWER(:query) OR 
          isbn LIKE :query`;
    }

    const result = await connection.execute(searchQuery, bindVars);
    await connection.close();

    const books = result.rows.map(row => ({
      id: row.BOOK_ID,
      isbn: row.ISBN,
      title: row.TITLE,
      author: row.AUTHOR,
      publisher: row.PUBLISHER,
      publicationYear: row.PUBLICATION_YEAR,
      category: row.CATEGORY,
      totalCopies: row.TOTAL_COPIES,
      availableCopies: row.AVAILABLE_COPIES,
      price: row.PRICE,
      description: row.DESCRIPTION,
      status: row.STATUS
    }));

    res.json({
      success: true,
      data: { books }
    });
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search books',
      error: error.message
    });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks
};
