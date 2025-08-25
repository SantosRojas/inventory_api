import { Router, Request, Response } from "express";
import { InventoryRepository } from "../../infrastructure/repositories/InventoryRepository";
import { InventoryService } from "../../application/InventoryService";
//import { authMiddleware } from "./middlewares/authMiddleware";
import { pool } from "../../infrastructure/database/mysql";
import Joi from "joi";
import { errorResponse, success } from "../../utils/responseHelpers";
import { handleRequestWithService } from "../../utils/handleRequestWithService";
import { isValidPositiveInteger } from "../../utils/validHandler";
import { HttpError } from "../../utils/ErrorHandler";

const router = Router();

// Esquema de validación para inventario
const inventorySchema = Joi.object({
  serialNumber: Joi.string().required(),
  qrCode: Joi.string().required(),
  modelId: Joi.number().required(),
  institutionId: Joi.number().required(),
  serviceId: Joi.number().required(),
  inventoryTakerId: Joi.number().required(),
  inventoryDate: Joi.string().required(),
  manufactureDate: Joi.string().optional(),
  status: Joi.string().optional(),
  lastMaintenanceDate: Joi.string().optional(),
  createdAt: Joi.string().required(),
});

const inventoryBulkPatchSchema = inventorySchema
  .fork(Object.keys(inventorySchema.describe().keys), (schema) =>
    schema.optional(),
  )
  .append({
    id: Joi.number().required(), // o .optional() si lo deseas así
  });

const inventoryPatchSchema = inventorySchema.fork(
  Object.keys(inventorySchema.describe().keys),
  (schema) => schema.optional(),
);

router.get("/", async (req: Request, res: Response): Promise<any> => {
  await handleRequestWithService(
    InventoryRepository,
    InventoryService,
    async (service) => {
      const items = await service.findAllInventories();
      return items;
    },
    res,
  );
});

router.get("/latest", async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const userId = req.query.userId ? Number(req.query.userId) : undefined;

  if (!userId) {
    res.status(400).json(
      errorResponse("ID de usuario faltante", "Se requiere el ID de usuario")
    );
    return;
  }

  await handleRequestWithService(
    InventoryRepository,
    InventoryService,
    async (service) => {
      return service.getLatestInventoriesByUser(userId, limit);
    },
    res,
  );
});

router.get("/:id", async (req: Request, res: Response) => {
  // Validación del ID
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
  // Convertir el ID a número
  const id = Number(idParam);

  await handleRequestWithService(
    InventoryRepository,
    InventoryService,
    async (service) => {
      const item = await service.getInventoryById(id);
      return item;
    },
    res,
  );
});

router.get("/serial/:serialNumber", async (req: Request, res: Response) => {
  await handleRequestWithService(
    InventoryRepository,
    InventoryService,
    async (service) => {
      const item = await service.getInventoryBySerialNumber(
        req.params.serialNumber,
      );
      return item;
    },
    res,
  );
});

router.get("/qr/:qrCode", async (req: Request, res: Response) => {
  await handleRequestWithService(
    InventoryRepository,
    InventoryService,
    async (service) => {
      const item = await service.getInventoryByQrCode(req.params.qrCode);
      return item;
    },
    res,
  );
});

//ruta para obtener inventario por model id

router.get("/model/:modelId", async (req: Request, res: Response) => {
  await handleRequestWithService(
    InventoryRepository,
    InventoryService,
    async (service) => {
      const items = await service.getInventoriesByModelId(
        Number(req.params.modelId),
      );
      return items;
    },
    res,
  );
});

//ruta para obtener inventario por institution id

router.get(
  "/institution/:institutionId",
  async (req: Request, res: Response) => {
    await handleRequestWithService(
      InventoryRepository,
      InventoryService,
      async (service) => {
        const items = await service.getInventoriesByInstitutionId(
          Number(req.params.institutionId),
        );
        return items;
      },
      res,
    );
  },
);

//ruta para obtener inventario por status
router.get("/status/:status", async (req: Request, res: Response) => {
  await handleRequestWithService(
    InventoryRepository,
    InventoryService,
    async (service) => {
      const items = await service.getInventoriesByStatus(req.params.status);
      return items;
    },
    res,
  );
});

//ruta para obtener inventario por service id
router.get("/service/:serviceId", async (req: Request, res: Response) => {
  await handleRequestWithService(
    InventoryRepository,
    InventoryService,
    async (service) => {
      const items = await service.getInventoriesByServiceId(
        Number(req.params.serviceId),
      );
      return items;
    },
    res,
  );
});

// ruta para obtener por servicio e institución
// Ruta para obtener inventario por serviceId e institutionId
router.get(
  "/institution/:institutionId/service/:serviceId",
  async (req: Request, res: Response) => {
    await handleRequestWithService(
      InventoryRepository,
      InventoryService,
      async (service) => {
        const items = await service.getInventoriesByServiceIdAndInstitutionId(
          Number(req.params.serviceId),
          Number(req.params.institutionId),
        );
        return items;
      },
      res,
    );
  },
);

//ruta para obtener inventario por inventory taker id

router.get(
  "/inventory-taker/:inventoryTakerId",
  async (req: Request, res: Response) => {
    await handleRequestWithService(
      InventoryRepository,
      InventoryService,
      async (service) => {
        const items = await service.getInventoriesByInventoryTakerId(
          Number(req.params.inventoryTakerId),
        );
        return items;
      },
      res,
    );
  },
);

// Obtener inventarios del presente año por institución
router.get(
  "/current-year/:institutionId",
  async (req: Request, res: Response) => {
    const { institutionId: institutionIdParam } = req.params;

    if (!isValidPositiveInteger(institutionIdParam)) {
      res
        .status(400)
        .json(
          errorResponse(
            "ID de institución inválido",
            "El ID debe ser un número entero positivo",
          ),
        );
      return;
    }

    const institutionId = Number(institutionIdParam);

    await handleRequestWithService(
      InventoryRepository,
      InventoryService,
      async (service) => {
        const currentYearInventories =
          await service.getCurrentYearInventoriesByInstitution(institutionId);
        return currentYearInventories;
      },
      res,
    );
  },
);

// Obtener bombas NO inventariadas este año por institución
router.get(
  "/not-inventoried/:institutionId",
  async (req: Request, res: Response) => {
    const { institutionId: institutionIdParam } = req.params;

    if (!isValidPositiveInteger(institutionIdParam)) {
      res
        .status(400)
        .json(
          errorResponse(
            "ID de institución inválido",
            "El ID debe ser un número entero positivo",
          ),
        );
      return;
    }

    const institutionId = Number(institutionIdParam);

    await handleRequestWithService(
      InventoryRepository,
      InventoryService,
      async (service) => {
        const notInventoriedThisYear =
          await service.getNotInventoriedThisYearByInstitution(institutionId);
        return notInventoriedThisYear;
      },
      res,
    );
  },
);

//ruta para insertar un inventario
router.post("/", async (req: Request, res: Response) => {
  const { error } = inventorySchema.validate(req.body);
  if (error) {
    res
      .status(400)
      .json(
        errorResponse(
          "Datos inválidos",
          error.details.map((detail) => detail.message).join(", "),
        ),
      );
    return;
  }

  await handleRequestWithService(
    InventoryRepository,
    InventoryService,
    async (service) => {
      const newId = await service.createInventory(req.body);
      return { id: newId };
    },
    res,
    201, // Status code for created
  );
});

router.post("/bulk-create", async (req: Request, res: Response) => {
  if (!Array.isArray(req.body) || req.body.length === 0) {
    res
      .status(400)
      .json(
        errorResponse(
          "Datos inválidos",
          "Se requiere un arreglo de inventarios",
        ),
      );
    return;
  }
  // Validar cada inventario en el arreglo
  const { error } = Joi.array()
    .items(inventorySchema)
    .validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map((detail) => {
      // Extraer índice si existe, ej: '0.serialNumber'
      const path = detail.path;
      const index = typeof path[0] === "number" ? path[0] : "desconocido";
      const field = path.slice(1).join(".") || "(estructura)";

      return `Item #${index}: Campo "${field}" - ${detail.message}`;
    });
    // Responder con un error 400 y los mensajes de validación
    res
      .status(400)
      .json(
        errorResponse(
          "Errores de validación en uno o más registros",
          messages.join(", "),
        ),
      );
    return;
  }

  await handleRequestWithService(
    InventoryRepository,
    InventoryService,
    async (service) => {
      const createdCount = await service.bulkInventoryCreation(req.body);
      return { createdCount };
    },
    res,
    201, // Status code for created
  );
});

//ruta para eliminar un inventario por ID
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
    InventoryRepository,
    InventoryService,
    async (service) => {
      await service.deleteInventory(id);
    },
    res,
  );
});

router.patch("/bulk-update", async (req: Request, res: Response) => {
  const body = req.body;

  if (!Array.isArray(body) || body.length === 0) {
    throw new HttpError(
      "Datos inválidos",
      400,
      "Se requiere un arreglo de inventarios",
    );
  }
  for (const item of body) {
    const { error } = inventoryBulkPatchSchema.validate(item);
    if (error) {
      // throw new HttpError("Datos inválidos en uno de los registros", 400, error.details.map(detail => detail.message).join(", "));
      res
        .status(400)
        .json(
          errorResponse(
            "Datos inválidos en uno de los registros",
            error.details.map((detail) => detail.message).join(", "),
          ),
        );
      return;
    }
  }

  await handleRequestWithService(
    InventoryRepository,
    InventoryService,
    async (service) => {
      const updatedCount = await service.bulkInventoryUpdate(body);
      return { updatedCount };
    },
    res,
  );
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const dataBody = req.body;
    // Validación: Asegurar que al menos haya algún dato para actualizar
    if (Object.keys(dataBody).length === 0) {
      throw new HttpError(
        "Nada que actualizar",
        400,
        "No se proporcionaron datos para actualizar",
      );
    }

    const { id: idParam } = req.params;
    // Validación del ID: Asegurar que sea un número entero positivo
    if (!isValidPositiveInteger(idParam)) {
      throw new HttpError(
        "ID inválido",
        400,
        "El ID debe ser un número entero positivo",
      );
    }
    const id = Number(idParam);
    console.log("Data body:", dataBody);

    const { error } = inventoryPatchSchema.validate(dataBody);
    if (error) {
      throw new HttpError(
        "Datos inválidos",
        400,
        error.details.map((detail) => detail.message).join(", "),
      );
    }

    await handleRequestWithService(
      InventoryRepository,
      InventoryService,
      async (service) => {
        const updated = await service.updateInventory(id, dataBody);
        return { updated };
      },
      res,
    );
  } catch (error) {
    if (error instanceof HttpError) {
      res
        .status(error.statusCode)
        .json({ error: error.message, details: error.details });
    } else {
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
});

// Mantenimientos vencidos por institución (solo admin, requiere institutionId)
router.get(
  "/overdue-maintenance-by-institution/:institutionId",
  async (req: Request, res: Response) => {
    const { institutionId: institutionIdParam } = req.params;
    if (!isValidPositiveInteger(institutionIdParam)) {
      res
        .status(400)
        .json(
          errorResponse(
            "ID de institución inválido",
            "El ID debe ser un número entero positivo",
          ),
        );
      return;
    }
    const institutionId = Number(institutionIdParam);
    await handleRequestWithService(
      InventoryRepository,
      InventoryService,
      async (service) => {
        const result =
          await service.getOverdueMaintenanceByInstitution(institutionId);
        return result;
      },
      res,
    );
  },
);

export default router;
