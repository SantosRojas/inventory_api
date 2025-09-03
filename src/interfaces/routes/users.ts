import { Router, Request, Response } from "express";
import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { UserService } from "../../application/UserService";
import {
  AuthenticatedRequest,
  authMiddleware,
  TokenPayload,
} from "./middlewares/authMiddleware";
import { errorResponse } from "../../utils/responseHelpers";
import { handleRequestWithService } from "../../utils/handleRequestWithService";
import { HttpError } from "../../utils/ErrorHandler";
import { isValidPositiveInteger } from "../../utils/validHandler";
import Joi from "joi";
import { isAdminRole } from "../../utils/roleHandler";

const router = Router();

const updateSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  cellPhone: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  roleId: Joi.number().integer().positive().optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

// Schema para reset administrativo (agregar a tus schemas existentes)
const resetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "La contraseña debe tener al menos 8 caracteres",
      "string.pattern.base":
        "La contraseña debe contener al menos una minúscula, una mayúscula y un número",
    }),
});

router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  handleRequestWithService(
    UserRepository,
    UserService,
    async (service) => {
      const users = await service.findAll();
      return users;
    },
    res,
  );
});

router.get("/filtered", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {

  const { id, role } = req.user as Omit<TokenPayload,'email'>
  handleRequestWithService(
    UserRepository,
    UserService,
    async (service) => {
      const users = await service.findFilteredUsers(id, role);
      return users;
    },
    res,
  );
});

router.get("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id: idParam } = req.params;
  if (!isValidPositiveInteger(idParam)) {
    res
      .status(400)
      .json(
        errorResponse(
          "ID inválido",
          "El ID debe ser un número entero positivo",
        ),
      );
    return;
  }

  const id = Number(idParam);

  await handleRequestWithService(
    UserRepository,
    UserService,
    async (service) => {
      const user = await service.findById(id);
      if (!user) throw new HttpError("Usuario no encontrado", 404);
      return user;
    },
    res,
  );
});

//actualice usuario
router.patch("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id: idParam } = req.params;
  if (!isValidPositiveInteger(idParam)) {
    res
      .status(400)
      .json(
        errorResponse(
          "ID inválido",
          "El ID debe ser un número entero positivo",
        ),
      );
    return;
  }

  const id = Number(idParam);

  // Evita que se actualice la contraseña desde aquí
  const { password, ...safeBody } = req.body;

  const { error } = updateSchema.validate(safeBody);
  if (error) {
    res.status(400).json(errorResponse("Datos inválidos", error.details));
    return;
  }

  await handleRequestWithService(
    UserRepository,
    UserService,
    async (service) => {
      const updatedUser = await service.patch(id, safeBody);
      return { updatedUser };
    },
    res,
  );
});


//ruta para cambiar la contraseña
router.patch(
  "/:id/password",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id: idParam } = req.params;

    const {id:requestingUserId,role:requestingUserRole} = req.user as Pick<TokenPayload,'id'|'role'>

    if (!isValidPositiveInteger(idParam))
      throw new HttpError(
        "ID inválido",
        400,
        "El ID debe ser un número entero positivo",
      );
    const id = Number(idParam);
    const {
      currentPassword,
      newPassword
    } = req.body;

    // Validar que se proporcione newPassword
    if (!newPassword) {
      res.status(400).json(errorResponse("Se requiere newPassword"));
      return;
    }

    // Verificar si es cambio de contraseña propia o reset administrativo
    const isOwnPasswordChange = requestingUserId === id;
    const isAdminReset = isAdminRole(requestingUserRole) && !isOwnPasswordChange;

    // Para cambio de contraseña propia, se requiere currentPassword
    if (isOwnPasswordChange && !currentPassword) {
      res
        .status(400)
        .json(
          errorResponse(
            "Se requiere currentPassword para cambiar tu propia contraseña",
          ),
        );
      return;
    }

    // Validar datos según el tipo de operación
    if (isOwnPasswordChange) {
      // Validación para cambio propio
      const { error } = changePasswordSchema.validate({
        currentPassword,
        newPassword,
      });
      if (error) {
        res.status(400).json(errorResponse("Datos inválidos", error.details));
        return;
      }
    } else {
      // Validación para reset administrativo (solo newPassword)
      const { error } = resetPasswordSchema.validate({ newPassword });
      if (error) {
        res.status(400).json(errorResponse("Datos inválidos", error.details));
        return;
      }
    }

    await handleRequestWithService(
      UserRepository,
      UserService,
      async (service) => {
        if (isAdminReset) {
          // Reset administrativo - no requiere contraseña actual
          await service.adminResetPassword(id, newPassword);
          return `Contraseña reseteada exitosamente por administrador`;
        } else {
          // Cambio de contraseña normal
          await service.changePassword(id, currentPassword, newPassword);
          return "Contraseña actualizada exitosamente";
        }
      },
      res,
    );
  },
);

router.delete("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id: idParam } = req.params;
  if (!isValidPositiveInteger(idParam)) {
    res
      .status(400)
      .json(
        errorResponse(
          "ID inválido",
          "El ID debe ser un número entero positivo",
        ),
      );
    return;
  }
  const id = Number(idParam);

  await handleRequestWithService(
    UserRepository,
    UserService,
    async (service) => {
      await service.delete(id);
    },
    res,
  );
});

// ruta para obtener recuperar usuario y contraseña
router.post("/recover", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json(errorResponse("Email es requerido"));
    return;
  }
  // You should get newPassword from the request body or generate it here
  const { newPassword } = req.body;
  if (!newPassword) {
    res.status(400).json(errorResponse("La nueva contraseña es requerida"));
    return;
  }

  await handleRequestWithService(
    UserRepository,
    UserService,
    async (service) => {
      const affectedRows = await service.recoverPassword(email, newPassword);
      if (!affectedRows) {
        throw new HttpError("Usuario no encontrado", 404);
      }
      return "Contraseña cambiada exitosamente";
    },
    res,
  );
});

export default router;
