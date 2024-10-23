// database.js
const sqlite3 = require('sqlite3').Database;

// Initialize database connection
const db = new sqlite3('expense_tracker.db');

// Create users, categories, and transactions tables
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    category_id INTEGER,
    amount REAL,
    date TEXT,
    description TEXT,
    user_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

module.exports = db;
