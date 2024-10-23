# Personal Expense Tracker API

## Overview

This is a RESTful API built with **Node.js** and **Express.js** that allows users to manage their personal financial transactions. It supports income and expense tracking with functionality to add, update, delete, and retrieve transactions, as well as view summaries.

## Features

- Add new transactions (income or expenses)
- Retrieve all transactions or a specific transaction by ID
- Update and delete transactions
- Generate summaries of transactions, including total income, total expenses, and balance
- JWT authentication for secure access to routes

## Technologies

- **Node.js** with **Express.js** for the backend
- **SQLite** for the database
- **JWT** (JSON Web Tokens) for authentication

### Setup Instructions

1. Clone the repository:
    ```bash
    git clone https://github.com/Hemendra-21/expense-tracker-api.git
    cd expense-tracker-api
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file with the following variables:
    ```bash
    JWT_SECRET='Hemendra721'
    ```

4. Initialize the database (for SQLite):
    ```bash
    node setupDatabase.js
    ```

5. Start the server:
    ```bash
    npm start
    ```


### 1. Clone the repository:

```bash
git clone https://github.com/Hemendra-21/expense-tracker-api.git
cd expense-tracker-api
