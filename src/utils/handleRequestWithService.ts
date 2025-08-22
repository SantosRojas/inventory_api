import { PoolConnection } from "mysql2/promise";
import { getConnectionAndService } from "./getConnAndServHelper";
import { errorResponse, success } from "./responseHelpers";
import { Response } from "express";
import { HttpError } from "./ErrorHandler";

export async function handleRequestWithService<R, S, T>(
  RepoClass: new (connection: PoolConnection) => R,
  ServiceClass: new (repo: R) => S,
  handler: (service: S) => Promise<T>,
  res: Response,
  successStatus: number = 200,
) {
  let connection: PoolConnection | undefined;
  try {
    const result = await getConnectionAndService(RepoClass, ServiceClass);
    connection = result.connection;
    const service = result.service;
    const data = await handler(service);
    if (!res.headersSent) res.status(successStatus).json(success(data));
  } catch (error) {
    const err = error as Error;
    let message = process.env.NODE_ENV === "development" ? err.message : undefined;
    
    // Manejar errores específicos de conexión
    if (err.message.includes('Connection lost') || err.message.includes('connect ECONNREFUSED')) {
      message = process.env.NODE_ENV === "development" ? 
        `Error de conexión a la base de datos: ${err.message}` : 
        "Error de conexión a la base de datos";
    }

    if (!res.headersSent) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json(
          errorResponse(
            error.message,
            error.details ?? message
          )
        );
      } else {
        res.status(500).json(errorResponse("Error interno del servidor", message));
      }
    }
  }
  finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError);
      }
    }
  }
}