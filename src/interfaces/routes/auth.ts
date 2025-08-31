import { Router } from 'express';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { UserService } from '../../application/UserService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import Joi from 'joi';
import { errorResponse} from '../../utils/responseHelpers';
import { AuthenticatedRequest, authMiddleware, TokenPayload } from './middlewares/authMiddleware';
import { handleRequestWithService } from '../../utils/handleRequestWithService';

const router = Router();

const registerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  cellPhone: Joi.string().min(9).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roleId: Joi.number().integer().positive().optional(),
});


const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/register', async (req: Request, res: Response): Promise<any> => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json(errorResponse('Datos inválidos', error.details));
  }
  
  const { firstName, lastName, cellPhone, email, password, roleId } = req.body;

  handleRequestWithService(
    UserRepository,
    UserService,
    async (service) => {
      const hashed = await bcrypt.hash(password, 10);
      const createdId = await service.register({
        firstName,
        lastName,
        cellPhone,
        email,
        password: hashed,
        role_id: roleId || 5, // Por defecto, rol guest
      });

      // Obtener el usuario recién creado
      const newUser = await service.findById(createdId);
      if (!newUser) {
        return res.status(500).json(errorResponse('Error al crear usuario'));
      }

      // Crear token para el usuario recién registrado
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },

        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }

      );
      return {
        token,
        user: newUser
      }
    },
    res,
    201
  )

});

router.post('/login', async (req: Request, res: Response): Promise<any> => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json(errorResponse('Datos inválidos', error.details));
  }
  const { email, password } = req.body;

  handleRequestWithService(
    UserRepository,
    UserService,
    async (service) => {
      const user = await service.findByEmail(email);
      if (!user) return res.status(401).json(errorResponse('Credenciales inválidas'));
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json(errorResponse('Credenciales inválidas'));

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
      );

      // Remover la contraseña antes de enviar los datos del usuario
      const { password: _, ...userWithoutPassword } = user;

      // Devolver usando tu estructura success
      return {
        token,
        user: userWithoutPassword
      };
    },
    res,
    200
  );
});


router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.user as Pick<TokenPayload, 'id'>;

  handleRequestWithService(
    UserRepository,
    UserService,
    async (service) => {
      const user = await service.findById(id);
      return user;
    },
    res
  );
});



export default router;