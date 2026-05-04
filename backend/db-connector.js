// instantiate mysql
require('dotenv').config();
const mysql = require("mysql2");

// create connection pool
const pool = mysql.createPool({
	waitForConnections: true,
	connectionLimit: 10,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
}).promise();

// export
module.exports = pool;
