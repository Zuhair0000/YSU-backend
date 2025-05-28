const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, // 👈 ADD THIS LINE
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MYSQL CONNECTED");
    connection.release();
  } catch (err) {
    console.error("❌ MYSQL CONNECTION ERROR:", err.message);
  }
})();

module.exports = pool;
