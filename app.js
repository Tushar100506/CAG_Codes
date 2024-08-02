const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

// Set up file storage with multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');  // ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // add your MySQL root password
    database: 'review'  // ensure this database is created
});
connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');

// Enable static files
app.use(express.static('public'));

// Define routes to parse URL-encoded data
app.use(express.urlencoded({ extended: false }));

// Route to display the main page
app.get('/', (req, res) => {
    res.redirect('/books');  // Redirect to books listing as the homepage
});

// Books routes
app.get('/books', (req, res) => {
    const sql = 'SELECT * FROM books';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving books');
        }
        res.render('books', { books: results });
    });
});

app.get('/addBook', (req, res) => {
    res.render('addBook');
});

app.post('/addBook', upload.single('image'), (req, res) => {
    const { bookname, ISBN, authorname, genre } = req.body;
    const sql = 'INSERT INTO books (bookname, ISBN, authorname, genre) VALUES (?, ?, ?, ?)';
    connection.query(sql, [bookname, ISBN, authorname, genre], (error) => {
        if (error) {
            console.error("Error adding book:", error);
            return res.status(500).send('Error adding book');
        }
        res.redirect('/books');
    });
});

app.get('/editBook/:id', (req, res) => {
    const bookId = req.params.id;
    const sql = 'SELECT * FROM books WHERE book_id = ?';
    connection.query(sql, [bookId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving book by ID');
        }
        if (results.length > 0) {
            res.render('editBook', { book: results[0] });
        } else {
            res.status(404).send('Book not found');
        }
    });
});

app.post('/editBook/:id', upload.single('image'), (req, res) => {
    const bookId = req.params.id;
    const { bookname, ISBN, authorname, genre } = req.body;
    const sql = 'UPDATE books SET bookname = ?, ISBN = ?, authorname = ?, genre = ? WHERE book_id = ?';
    connection.query(sql, [bookname, ISBN, authorname, genre, bookId], (error) => {
        if (error) {
            console.error("Error updating book:", error);
            return res.status(500).send('Error updating book');
        }
        res.redirect('/books');
    });
});

app.get('/deleteBook/:id', (req, res) => {
    const bookId = req.params.id;
    const sql = 'DELETE FROM books WHERE book_id = ?';
    connection.query(sql, [bookId], (error) => {
        if (error) {
            console.error("Error deleting book:", error);
            return res.status(500).send('Error deleting book');
        }
        res.redirect('/books');
    });
});

// Reviews routes
app.get('/reviews', (req, res) => {
    const sql = 'SELECT reviews.*, books.bookname FROM reviews JOIN books ON reviews.book_id = books.book_id';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving reviews');
        }
        res.render('reviews', { reviews: results });
    });
});

app.get('/addReview', (req, res) => {
    const sql = 'SELECT * FROM books';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving books');
        }
        res.render('addReview', { books: results });
    });
});

app.post('/addReview', (req, res) => {
    const { book_id, rating, comment, username } = req.body;
    const sql = 'INSERT INTO reviews (book_id, rating, comment, username) VALUES (?, ?, ?, ?)';
    connection.query(sql, [book_id, rating, comment, username], (error) => {
        if (error) {
            console.error("Error adding review:", error);
            return res.status(500).send('Error adding review');
        }
        res.redirect('/reviews');
    });
});

// Route to render the edit review page
app.get('/editReview/:id', (req, res) => {
    const reviewId = req.params.id;
    const sql = 'SELECT * FROM reviews WHERE reviewId = ?';
    connection.query(sql, [reviewId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving review by ID');
        }
        if (results.length > 0) {
            res.render('editReview', { review: results[0] });
        } else {
            res.status(404).send('Review not found');
        }
    });
});

app.post('/editReview/:id', (req, res) => {
    const reviewId = req.params.id;
    const { rating, comment, username } = req.body;
    const sql = 'UPDATE reviews SET rating = ?, comment = ?, username = ? WHERE reviewId = ?';
    connection.query(sql, [rating, comment, username, reviewId], (error) => {
        if (error) {
            console.error("Error updating review:", error);
            return res.status(500).send('Error updating review');
        }
        res.redirect('/reviews');
    });
});
app.get('/deleteReview/:id', (req, res) => {
    const bookId = req.params.id;
    const sql = 'DELETE FROM reviews WHERE reviewId = ?';
    connection.query(sql, [bookId], (error) => {
        if (error) {
            console.error("Error deleting book:", error);
            return res.status(500).send('Error deleting book');
        }
        res.redirect('/reviews');
    });
});

// Start the server
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

