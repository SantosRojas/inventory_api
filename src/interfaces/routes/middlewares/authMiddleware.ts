import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { errorResponse } from "../../../utils/responseHelpers";

// Interfaz para el payload del token
export interface TokenPayload extends JwtPayload {
  id: number;
  email: string;
  role: string;
}

// Request extendido con el usuario autenticado
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const auth = req.headers.authorization;

  if (!auth) {
    res.status(401).json(errorResponse("Token requerido"));
    return;
  }

  const [type, token] = auth.split(" ");
  if (type !== "Bearer" || !token) {
    res.status(401).json(errorResponse("Formato de token inválido"));
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as TokenPayload;

    // Validar que el token tenga los campos esperados
    if (!decoded.id || !decoded.email || !decoded.role) {
      res.status(403).json(errorResponse("Token incompleto o inválido"));
      return;
    }

    req.user = decoded;
    next(); // ✅ No se devuelve nada, solo se llama a next()
  } catch (error) {
    const message =
      process.env.NODE_ENV === "development"
        ? (error as Error).message
        : "Token inválido";
    res.status(401).json(errorResponse(message));
  }
};
