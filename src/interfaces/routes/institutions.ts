import { Router } from "express";
import { InstitutionRepository } from "../../infrastructure/repositories/InstitutionRepository";
import { InstitutionService } from "../../application/InstitutionService";
import { AuthenticatedRequest, authMiddleware } from "./middlewares/authMiddleware";
import Joi from "joi";
import { Response } from "express";
import { errorResponse } from "../../utils/responseHelpers";
import { handleRequestWithService } from "../../utils/handleRequestWithService";
import { isValidPositiveInteger } from "../../utils/validHandler";

const router = Router();

// Esquema de validación para instituciones
const institutionSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
});

// Ruta para crear una nueva institución
router.post("/", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { error } = institutionSchema.validate(req.body);
  if (error) {
    res.status(400).json(errorResponse("Datos inválidos", error.details));
    return;
  }

  handleRequestWithService(
    InstitutionRepository,
    InstitutionService,
    async (service) => {
      const createdId = await service.createInstitution(req.body);
      return { createdId };
    },
    res,
    201,
  );
});

// Ruta para obtener todas las instituciones
router.get("/", authMiddleware, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  handleRequestWithService(
    InstitutionRepository,
    InstitutionService,
    async (service) => {
      const institutions = await service.findAllInstitutions();
      return institutions;
    },
    res,
  );
});

// Ruta para obtener una institución por ID
router.get("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id: idParam } = req.params;

  if (isValidPositiveInteger(idParam) === false) {
    res
      .status(400)
      .json(errorResponse("ID inválido", "El ID debe ser un número positivo"));
    return;
  }

  const id = Number(idParam);

  handleRequestWithService(
    InstitutionRepository,
    InstitutionService,
    async (service) => {
      return await service.getInstitutionById(id);
    },
    res,
  );
});

// Ruta para actualizar una institución
router.patch("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id: idParam } = req.params;

  if (isValidPositiveInteger(idParam) === false) {
    res
      .status(400)
      .json(errorResponse("ID inválido", "El ID debe ser un número positivo"));
    return;
  }

  const id = Number(idParam);
  const { error } = institutionSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json(errorResponse("Datos inválidos", error.details));

  handleRequestWithService(
    InstitutionRepository,
    InstitutionService,
    async (service) => {
      const updatedInstitution = await service.updateInstitution(id, req.body);
      return { updatedInstitution };
    },
    res,
  );
});


// Ruta para eliminar una institución
router.delete("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id: idParam } = req.params;

  if (isValidPositiveInteger(idParam) === false) {
    res
      .status(400)
      .json(errorResponse("ID inválido", "El ID debe ser un número positivo"));
    return;
  }

  const id = Number(idParam);

  handleRequestWithService(
    InstitutionRepository,
    InstitutionService,
    async (service) => {
      await service.deleteInstitution(id);
    },
    res,
  );
});

export default router;
