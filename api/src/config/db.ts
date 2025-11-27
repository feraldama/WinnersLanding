import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Crear un pool de conexiones en lugar de una conexión única
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "winners",
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Verificar la conexión
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Conectado a MySQL");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Error conectando a MySQL:", err);
  });

// Función helper para ejecutar queries con parámetros posicionales (como en tu otro proyecto)
export const query = (
  queryText: string,
  params: any[],
  callback: (err: Error | null, results?: any[]) => void
): void => {
  pool
    .query(queryText, params)
    .then(([results]: any[]) => {
      callback(null, Array.isArray(results) ? results : [results]);
    })
    .catch((err) => {
      callback(err);
    });
};

// Versión con Promise para usar con async/await
export const queryAsync = async (
  queryText: string,
  params: any[] = []
): Promise<any[]> => {
  try {
    const [results] = await pool.query(queryText, params);
    return Array.isArray(results) ? results : [results];
  } catch (error) {
    console.error("❌ Error en query:", error);
    throw error;
  }
};

// Obtener conexión del pool
export const getConnection = async () => {
  return await pool.getConnection();
};

export default { query, queryAsync, getConnection, pool };
