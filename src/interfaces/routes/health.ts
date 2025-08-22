import { Router, Request, Response } from 'express';
import { pool } from '../../infrastructure/database/mysql';
import { success, errorResponse } from '../../utils/responseHelpers';

const router = Router();

// Endpoint para verificar el estado de la aplicación y la base de datos
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Verificar conexión a la base de datos
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    res.json(success({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    res.status(500).json(errorResponse(
      'Database connection failed',
      process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    ));
  }
});

// Endpoint simple para verificar que la API esté funcionando
router.get('/ping', (req: Request, res: Response) => {
  res.json(success({ message: 'pong', timestamp: new Date().toISOString() }));
});

export default router;
