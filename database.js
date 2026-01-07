// This code was created with the help of AI (ChatGPT, Gemini, Claude)
// It sets up the database connection

const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });


// Create postgreSQL pool for heroku environment
const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
    options: '-c client_encoding=UTF8',
    ssl: {
        rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 20000,
});

// Query function
async function query(text, params) {
    return await pool.query(text, params);
}

async function end() {
    await pool.end();
    console.log(`Database connection closed safely`);
}

// Log connection
pool.on('connect', () => {
    console.log(`PostgreSQL Connected Successfully.`);
});

pool.on('error', (error) => {
    console.error(`An unexpected error occurred on postgres client`, error);
    process.exit(-1);
})

// Export for other code
module.exports = {
    query,
    pool,
    end
};