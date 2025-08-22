import { Request, NextFunction, Response } from 'express';
import { HttpError } from '../../../utils/ErrorHandler';

interface AuthPayload {
  id: number;
  role?: string;
}

interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export const authorizeUserOrAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const targetId = Number(req.params.id);

  if (!user) {
    throw new HttpError('No autenticado', 401);
  }

  if (isNaN(targetId)) {
    throw new HttpError('ID inválido', 400);
  }

  const isOwner = user.id === targetId;
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new HttpError('No tienes permiso para realizar esta acción', 403);
  }

  next();
};
