import { PoolConnection } from "mysql2/promise";
import { pool } from "../infrastructure/database/mysql";

export async function getConnectionAndService<R, S>(
  RepoClass: new (connection: PoolConnection) => R,
  ServiceClass: new (repo: R) => S
): Promise<{ connection: PoolConnection; service: S }> {
  let connection: PoolConnection;
  
  try {
    connection = await pool.getConnection();
    
    // Verificar que la conexión esté activa
    await connection.ping();
    
    const repo = new RepoClass(connection);
    const service = new ServiceClass(repo);
    return { connection, service };
  } catch (error) {
    console.error('Error getting database connection:', error);
    throw new Error(`Error de conexión a la base de datos: ${(error as Error).message}`);
  }
}

