import { Router } from "express";
import { authMiddleware } from "./middlewares/authMiddleware";
import Joi from "joi";
import { Request, Response } from "express";
import { errorResponse } from "../../utils/responseHelpers";
import { handleRequestWithService } from "../../utils/handleRequestWithService";
import { isValidPositiveInteger } from "../../utils/validHandler";
import { RoleRepository } from "../../infrastructure/repositories/RoleRepository";
import { RoleService } from "../../application/RoleService";
import { describe } from "node:test";

const router = Router();

// Esquema de validación para instituciones
const roleSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { error } = roleSchema.validate(req.body);
  if (error) {
    res.status(400).json(errorResponse("Datos inválidos", error.details));
    return;
  }

  handleRequestWithService(
    RoleRepository,
    RoleService,
    async (service) => {
      const createdId = await service.createRole(req.body);
      return { createdId };
    },
    res,
    201,
  );
});

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  handleRequestWithService(
    RoleRepository,
    RoleService,
    async (service) => {
      const roles = await service.findAllRoles();
      return roles;
    },
    res,
  );
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id: idParam } = req.params;

  if (isValidPositiveInteger(idParam) === false) {
    res
      .status(400)
      .json(errorResponse("ID inválido", "El ID debe ser un número positivo"));
    return;
  }

  const id = Number(idParam);

  handleRequestWithService(
    RoleRepository,
    RoleService,
    async (service) => {
      return await service.getRoleById(id);
    },
    res,
  );
});

router.patch("/:id", async (req: Request, res: Response): Promise<any> => {
  const { id: idParam } = req.params;

  if (isValidPositiveInteger(idParam) === false) {
    res
      .status(400)
      .json(errorResponse("ID inválido", "El ID debe ser un número positivo"));
    return;
  }

  const id = Number(idParam);
  const { error } = roleSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json(errorResponse("Datos inválidos", error.details));

  handleRequestWithService(
    RoleRepository,
    RoleService,
    async (service) => {
      const updatedRole = await service.updateRole(id, req.body);
      return { updatedRole };
    },
    res,
  );
});

router.delete("/:id", async (req: Request, res: Response): Promise<any> => {
  const { id: idParam } = req.params;

  if (isValidPositiveInteger(idParam) === false) {
    res
      .status(400)
      .json(errorResponse("ID inválido", "El ID debe ser un número positivo"));
    return;
  }

  const id = Number(idParam);

  handleRequestWithService(
    RoleRepository,
    RoleService,
    async (service) => {
      await service.deleteRole(id);
    },
    res,
  );
});

export default router;
