// app.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

const PORT = 3000;
const SECRET_KEY = 'your_secret_key';  // Replace with a strong secret key

// User Registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, 
    [username, hashedPassword], 
    (err) => {
      if (err) return res.status(500).json({ error: 'User already exists or database error' });
      res.status(201).json({ message: 'User registered successfully!' });
  });
});

// User Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Invalid username or password' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied, token missing!' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Add a new transaction (protected route)
app.post('/transactions', authenticateToken, (req, res) => {
  const { type, category_id, amount, date, description } = req.body;
  const user_id = req.user.id;  // User authenticated via JWT

  db.run(`INSERT INTO transactions (type, category_id, amount, date, description, user_id) 
          VALUES (?, ?, ?, ?, ?, ?)`, 
    [type, category_id, amount, date, description, user_id], 
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.status(201).json({ id: this.lastID, message: 'Transaction added successfully!' });
  });
});

// Get all transactions for the authenticated user
app.get('/transactions', authenticateToken, (req, res) => {
  const user_id = req.user.id;

  db.all('SELECT * FROM transactions WHERE user_id = ?', [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ transactions: rows });
  });
});


// Route to get a transaction by ID
app.get('/transactions/:id', authenticateToken, async (req, res) => {
    const transactionId = req.params.id;

    try {
        // Query the database for the transaction by ID
        db.get('SELECT * FROM transactions WHERE id = ?', [transactionId], (err, row) => {
            if (err) {
                throw new Error('Database error');
            }

            if (!row) {
                return res.status(404).json({ error: "Transaction not found!" });
            }

            // Return the transaction if found
            res.json(row);
        });
    } catch (error) {
        // Handle any errors and return a 500 status code for unexpected server issues
        res.status(500).json({ error: error.message || "An unexpected error occurred" });
    }
});



// Update a transaction by ID (protected route)
app.put('/transactions/:id', authenticateToken, (req, res) => {
  const { type, category_id, amount, date, description } = req.body;
  const transaction_id = req.params.id;

  db.run(`UPDATE transactions SET type = ?, category_id = ?, amount = ?, date = ?, description = ?
          WHERE id = ? AND user_id = ?`, 
    [type, category_id, amount, date, description, transaction_id, req.user.id], 
    function (err) {
      if (err || this.changes === 0) return res.status(400).json({ error: 'Transaction not found or no changes' });
      res.json({ message: 'Transaction updated successfully!' });
  });
});

// Delete a transaction by ID (protected route)
app.delete('/transactions/:id', authenticateToken, (req, res) => {
  const transaction_id = req.params.id;

  db.run(`DELETE FROM transactions WHERE id = ? AND user_id = ?`, 
    [transaction_id, req.user.id], 
    function (err) {
      if (err || this.changes === 0) return res.status(400).json({ error: 'Transaction not found' });
      res.json({ message: 'Transaction deleted successfully!' });
  });
});

// Get a summary of transactions (protected route)
app.get('/summary', authenticateToken, (req, res) => {
  const user_id = req.user.id;

  db.get(`SELECT 
            (SELECT SUM(amount) FROM transactions WHERE user_id = ? AND type = 'income') AS total_income,
            (SELECT SUM(amount) FROM transactions WHERE user_id = ? AND type = 'expense') AS total_expense`,
    [user_id, user_id], (err, summary) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      const balance = (summary.total_income || 0) - (summary.total_expense || 0);
      res.json({ total_income: summary.total_income, total_expense: summary.total_expense, balance });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
