// inserttopostgre.js
// This script inserts a random transaction from getRandomTransaction.js into PostgreSQL

const { Client } = require('pg');
const getRandomTransaction = require('./function/getRandomTransaction');

// PostgreSQL connection config
const client = new Client({
  user: 'your_pg_user',
  host: 'localhost',
  database: 'your_database',
  password: 'your_pg_password',
  port: 5432,
});


async function setupAndInsertRandomTransaction() {
  try {
    await client.connect();
    // Drop the table if it exists
    await client.query('DROP TABLE IF EXISTS transactions');
    // Create the table
    await client.query(`CREATE TABLE transactions (
      id SERIAL PRIMARY KEY,
      bankAccountNumber VARCHAR(255),
      category VARCHAR(255),
      description TEXT,
      amount NUMERIC,
      date TIMESTAMP
    )`);
    // Create composite index on bankAccountNumber and date
    await client.query('CREATE INDEX idx_bankaccount_date ON transactions (bankAccountNumber, date)');
    const query = `INSERT INTO transactions (bankAccountNumber, category, description, amount, date) VALUES ($1, $2, $3, $4, $5)`;
    for (let i = 0; i < 100; i++) {
      const transaction = getRandomTransaction();
      const values = [
        transaction.bankAccountNumber,
        transaction.category,
        transaction.description,
        transaction.amount,
        transaction.date
      ];
      await client.query(query, values);
      console.log(`Transaction ${i + 1} inserted:`, transaction);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

setupAndInsertRandomTransaction();
