import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { errorResponse } from "../../../utils/responseHelpers";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch (error) {
    const message =
      process.env.NODE_ENV === "development"
        ? (error as Error).message
        : "Token inválido";
    res.status(401).json({ message });
  }
};
