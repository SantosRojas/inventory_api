import mysql from 'mysql2/promise';

// Asegúrate de que estas variables estén definidas
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME || !process.env.DB_PASSWORD) {
  console.error('ERROR: Las variables de entorno de la base de datos (DB_HOST, DB_USER, DB_NAME, DB_PASSWORD) deben estar definidas.');
  process.exit(1); // Sale de la aplicación
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
});