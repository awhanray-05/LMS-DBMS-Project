SELECT * FROM members;
SELECT * FROM books;
SELECT * FROM transactions;
SELECT * FROM admins;
SELECT * FROM fine_history;

SET DEFINE OFF;

-- =========================================
-- 50 Book Records (Academic + Fiction + Misc)
-- =========================================

-- 1–10: Programming & Computer Science
INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0134685991', 'Effective Java', 'Joshua Bloch', 'Addison-Wesley', 2018, 'Programming', 3, 3, 45.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0132350884', 'Clean Code', 'Robert C. Martin', 'Prentice Hall', 2008, 'Programming', 2, 2, 39.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0201633610', 'Design Patterns', 'Gang of Four', 'Addison-Wesley', 1994, 'Programming', 2, 2, 49.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-1260143634', 'Database System Concepts', 'Abraham Silberschatz', 'McGraw-Hill', 2019, 'Database', 4, 4, 89.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0262033848', 'Introduction to Algorithms', 'Thomas H. Cormen', 'MIT Press', 2009, 'Computer Science', 3, 3, 79.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0131103627', 'The C Programming Language', 'Brian W. Kernighan & Dennis M. Ritchie', 'Prentice Hall', 1988, 'Programming', 3, 3, 34.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0596007126', 'Head First Design Patterns', 'Eric Freeman', 'O''Reilly Media', 2004, 'Programming', 3, 3, 44.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-1617292231', 'Spring in Action', 'Craig Walls', 'Manning Publications', 2015, 'Programming', 2, 2, 49.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-1492056355', 'Fluent Python', 'Luciano Ramalho', 'O''Reilly Media', 2022, 'Programming', 2, 2, 54.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-9355423473', 'Data Structures Using C', 'Reema Thareja', 'Oxford University Press', 2021, 'Computer Science', 4, 4, 39.99);

-- 11–20: Indian Authors & Academic Texts
INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-9353432477', 'Let Us C', 'Yashavant Kanetkar', 'BPB Publications', 2020, 'Programming', 5, 5, 29.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-9389845698', 'Operating System Concepts', 'Galvin, Silberschatz, Gagne', 'Wiley', 2018, 'Operating Systems', 3, 3, 79.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-9385936614', 'Digital Logic and Computer Design', 'M. Morris Mano', 'Pearson India', 2017, 'Electronics', 4, 4, 69.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-8120340077', 'Computer Networks', 'Andrew S. Tanenbaum', 'Pearson Education', 2011, 'Networking', 3, 3, 74.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-9352837303', 'Computer Organization and Architecture', 'William Stallings', 'Pearson', 2016, 'Computer Science', 3, 3, 64.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-9332586143', 'Software Engineering', 'Ian Sommerville', 'Pearson', 2015, 'Software Engineering', 3, 3, 59.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-9387472899', 'Machine Learning', 'Tom M. Mitchell', 'McGraw-Hill', 2017, 'AI & ML', 3, 3, 84.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-9354241139', 'Artificial Intelligence: A Modern Approach', 'Stuart Russell & Peter Norvig', 'Pearson', 2020, 'AI & ML', 3, 3, 94.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-8177588830', 'Data Communications and Networking', 'Behrouz A. Forouzan', 'McGraw-Hill', 2012, 'Networking', 4, 4, 69.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-9354352712', 'Python Programming', 'E. Balagurusamy', 'McGraw-Hill India', 2021, 'Programming', 5, 5, 29.99);

-- 21–30: Fiction (Indian & Foreign)
INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0143422152', 'The White Tiger', 'Aravind Adiga', 'HarperCollins India', 2008, 'Fiction', 4, 4, 14.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0670085190', 'The Immortals of Meluha', 'Amish Tripathi', 'Westland', 2010, 'Mythological Fiction', 5, 5, 19.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-8184001650', '2 States', 'Chetan Bhagat', 'Rupa Publications', 2009, 'Romance', 5, 5, 9.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0141185064', '1984', 'George Orwell', 'Penguin Books', 1949, 'Dystopian Fiction', 3, 3, 12.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0743273565', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 1925, 'Classic', 3, 3, 10.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0553296983', 'Dune', 'Frank Herbert', 'Ace Books', 1965, 'Science Fiction', 3, 3, 18.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0061120084', 'To Kill a Mockingbird', 'Harper Lee', 'Harper Perennial', 1960, 'Classic', 3, 3, 15.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-1408855652', 'Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', 'Bloomsbury', 1997, 'Fantasy', 4, 4, 24.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0143105985', 'The God of Small Things', 'Arundhati Roy', 'IndiaInk', 1997, 'Fiction', 4, 4, 16.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0679722762', 'The Alchemist', 'Paulo Coelho', 'HarperOne', 1988, 'Philosophical Fiction', 5, 5, 17.99);

-- 31–40: Non-Fiction / Biography / Self-Help
INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-1471133432', 'Wings of Fire', 'A.P.J. Abdul Kalam', 'Universities Press', 1999, 'Autobiography', 4, 4, 13.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-8172234985', 'The Monk Who Sold His Ferrari', 'Robin Sharma', 'Jaico Publishing House', 1996, 'Self-Help', 4, 4, 15.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0062316110', 'The Power of Habit', 'Charles Duhigg', 'Random House', 2012, 'Self-Help', 4, 4, 18.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0307476463', 'Thinking, Fast and Slow', 'Daniel Kahneman', 'Farrar, Straus and Giroux', 2011, 'Psychology', 3, 3, 19.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0671027032', 'Rich Dad Poor Dad', 'Robert Kiyosaki', 'Warner Books', 1997, 'Finance', 5, 5, 16.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-1501110368', 'Start With Why', 'Simon Sinek', 'Portfolio', 2009, 'Leadership', 3, 3, 17.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0143420361', 'India 2020', 'A.P.J. Abdul Kalam', 'Penguin India', 1998, 'Vision / Development', 3, 3, 12.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-9389640500', 'Elon Musk: How the Billionaire CEO of SpaceX and Tesla is Shaping Our Future', 'Ashlee Vance', 'Ecco', 2015, 'Biography', 3, 3, 21.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-8129124913', 'The Secret of the Nagas', 'Amish Tripathi', 'Westland', 2011, 'Mythological Fiction', 4, 4, 19.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0062315007', 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'Harper', 2014, 'History', 4, 4, 22.99);

-- 41–50: Miscellaneous & Literature
INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0143333623', 'Malgudi Days', 'R.K. Narayan', 'Indian Thought Publications', 1943, 'Short Stories', 4, 4, 11.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0143422341', 'The Guide', 'R.K. Narayan', 'Indian Thought Publications', 1958, 'Fiction', 4, 4, 13.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0140449136', 'The Odyssey', 'Homer', 'Penguin Classics', 1999, 'Epic', 2, 2, 18.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-8179921628', 'Five Point Someone', 'Chetan Bhagat', 'Rupa Publications', 2004, 'Fiction', 5, 5, 9.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0142437230', 'Moby Dick', 'Herman Melville', 'Penguin Classics', 1851, 'Classic', 2, 2, 14.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0747532743', 'Harry Potter and the Chamber of Secrets', 'J.K. Rowling', 'Bloomsbury', 1998, 'Fantasy', 4, 4, 24.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-8173711461', 'Ignited Minds', 'A.P.J. Abdul Kalam', 'Penguin India', 2002, 'Inspirational', 4, 4, 13.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-0141199078', 'Pride and Prejudice', 'Jane Austen', 'Penguin Classics', 1813, 'Romance', 3, 3, 12.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-8172235142', 'The 7 Habits of Highly Effective People', 'Stephen R. Covey', 'Free Press', 1989, 'Self-Help', 4, 4, 17.99);

INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, price)
VALUES ('978-9386228831', 'Half Girlfriend', 'Chetan Bhagat', 'Rupa Publications', 2014, 'Romance', 5, 5, 11.99);

COMMIT;


SET DEFINE ON;

