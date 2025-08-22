import { Router } from "express";
import { ServiceRepository } from "../../infrastructure/repositories/ServiceRepository";
import { ServiceService } from "../../application/ServiceService";
import { authMiddleware } from "./middlewares/authMiddleware";
import Joi from "joi";
import { Request, Response } from "express";
import { handleRequestWithService } from "../../utils/handleRequestWithService";
import { errorResponse } from "../../utils/responseHelpers";
import { isValidPositiveInteger } from "../../utils/validHandler";

const router = Router();

// Esquema de validación para servicios
const serviceSchema = Joi.object({
  name: Joi.string().required(),
});

// POST /services
router.post("/", async (req: Request, res: Response) => {
  const { error } = serviceSchema.validate(req.body);
  if (error) {
    res.status(400).json(errorResponse("Datos inválidos", error.details));
    return;
  }

  await handleRequestWithService(
    ServiceRepository,
    ServiceService,
    async (service) => {
      const createdId = await service.createService(req.body);
      return { createdId };
    },
    res,
    201,
  );
});

// GET /services
router.get("/", async (_req: Request, res: Response) => {
  await handleRequestWithService(
    ServiceRepository,
    ServiceService,
    async (service) => {
      const services = await service.findAllServices();
      return services;
    },
    res,
  );
});

// GET /services/:id
router.get("/:id", async (req: Request, res: Response) => {
  const { id: idParam } = req.params;
  // Validar que sea solo dígitos (número entero positivo)
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
    ServiceRepository,
    ServiceService,
    async (service) => {
      const found = await service.findServiceById(id);
      return found;
    },
    res,
  );
});

// PUT /services/:id
router.patch("/:id", async (req: Request, res: Response) => {
  const { id: idParam } = req.params;
  // Validar que sea solo dígitos (número entero positivo)
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
  const { error } = serviceSchema.validate(req.body);
  if (error) {
    res.status(400).json(errorResponse("Datos inválidos", error.details));
    return;
  }

  await handleRequestWithService(
    ServiceRepository,
    ServiceService,
    async (service) => {
      const updatedService = await service.updateService(id, req.body);
      return { updatedService };
    },
    res,
  );
});

// DELETE /services/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const { id: idParam } = req.params;
  // Validar que sea solo dígitos (número entero positivo)
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
    ServiceRepository,
    ServiceService,
    async (service) => {
      await service.deleteService(id);
    },
    res,
  );
});

export default router;
