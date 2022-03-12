const mysql = require('mysql2');

require('dotenv').config();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'employeetracker_db',
    port: 3306,
},
console.log('Connected to the employeetracker_db database.')
);

module.exports = connection;