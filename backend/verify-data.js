const { getConnection } = require('./config/database');

async function verifyData() {
    try {
        console.log('\n🔍 Verifying Database Data...\n');
        
        const connection = await getConnection();
        console.log('✅ Database connected successfully\n');
        
        // Check books
        const booksResult = await connection.execute(
            `SELECT COUNT(*) as count FROM books`
        );
        const booksCount = booksResult.rows[0].COUNT;
        console.log(`📚 Books in database: ${booksCount}`);
        
        if (booksCount === 0) {
            console.log('⚠️  No books found! Run the sample data insertion.');
        }
        
        // Check members
        const membersResult = await connection.execute(
            `SELECT COUNT(*) as count FROM members`
        );
        const membersCount = membersResult.rows[0].COUNT;
        console.log(`👥 Members in database: ${membersCount}`);
        
        if (membersCount === 0) {
            console.log('⚠️  No members found! Run the sample data insertion.');
        }
        
        // Check admins
        const adminsResult = await connection.execute(
            `SELECT COUNT(*) as count FROM admins`
        );
        const adminsCount = adminsResult.rows[0].COUNT;
        console.log(`👮 Admins in database: ${adminsCount}`);
        
        // Check transactions
        const transactionsResult = await connection.execute(
            `SELECT COUNT(*) as count FROM transactions`
        );
        const transactionsCount = transactionsResult.rows[0].COUNT;
        console.log(`📋 Transactions in database: ${transactionsCount}\n`);
        
        if (booksCount > 0 && membersCount > 0) {
            console.log('✅ Database has sample data - dashboard should load properly!');
        } else {
            console.log('⚠️  Database is missing sample data. Run this SQL:');
            console.log('');
            console.log('-- Insert sample books');
            console.log(`INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price) VALUES`);
            console.log(`('978-0134685991', 'Effective Java', 'Joshua Bloch', 'Addison-Wesley', 2018, 'Programming', 3, 3, 45.99),`);
            console.log(`('978-0132350884', 'Clean Code', 'Robert C. Martin', 'Prentice Hall', 2008, 'Programming', 2, 2, 39.99),`);
            console.log(`('978-0201633610', 'Design Patterns', 'Gang of Four', 'Addison-Wesley', 1994, 'Programming', 2, 2, 49.99);`);
            console.log('');
            console.log('-- Insert sample members');
            console.log(`INSERT INTO members (first_name, last_name, email, phone, address, membership_type) VALUES`);
            console.log(`('John', 'Doe', 'john.doe@email.com', '1234567890', '123 Main St, City', 'STUDENT'),`);
            console.log(`('Jane', 'Smith', 'jane.smith@email.com', '0987654321', '456 Oak Ave, City', 'FACULTY');`);
            console.log('');
            console.log('COMMIT;');
        }
        
        await connection.close();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyData();

