import { Response, Router } from "express";
import Joi from "joi";
import { errorResponse } from "../../utils/responseHelpers";
import { InventoryTimeRepository } from "../../infrastructure/repositories/InventoryTimeRepository";
import { handleRequestWithService } from "../../utils/handleRequestWithService";
import { InventoryTimeService } from "../../application/InventoryTimeService";
import { isValidPositiveInteger } from "../../utils/validHandler";
import { HttpError } from "../../utils/ErrorHandler";
import { AuthenticatedRequest, authMiddleware } from "./middlewares/authMiddleware";

const router = Router();

const inventoryTimeSchema = Joi.object(
    {
        userId: Joi.number().required(),
        inventoryId: Joi.number().optional().allow(null),
        startTime: Joi.date().required(),
        endTime: Joi.date().required(),
        durationSeconds: Joi.number().required(),
        success: Joi.boolean().required()
    });

const inventoryTimePatchSchema = inventoryTimeSchema.fork(
    Object.keys(inventoryTimeSchema.describe().keys),
    (schema) => schema.optional(),
);


router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const { error } = inventoryTimeSchema.validate(req.body);
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
        InventoryTimeRepository,
        InventoryTimeService,
        async (service) => {
            const newId = await service.createInventoryTime(req.body);
            return { id: newId };
        },
        res,
        201, // Status code for created
    );

});


router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    await handleRequestWithService(
        InventoryTimeRepository,
        InventoryTimeService,
        async (service) => {
            const inventoryTimes = await service.getAllInventoryTimes();
            return { inventoryTimes };
        },
        res,
    );
});


router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
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
        InventoryTimeRepository,
        InventoryTimeService,
        async (service) => {
            const inventoryTime = await service.getInventoryTimeById(Number(id));
            return { inventoryTime };
        },
        res,
    );
});


router.patch('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
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

    const { error } = inventoryTimePatchSchema.validate(dataBody);
    if (error) {
        throw new HttpError(
            "Datos inválidos",
            400,
            error.details.map((detail) => detail.message).join(", "),
        );
    }

    await handleRequestWithService(
        InventoryTimeRepository,
        InventoryTimeService,
        async (service) => {
            const updatedInventoryTime = await service.updateInventoryTime(id, dataBody);
            return { updatedInventoryTime };
        },
        res,
    );
});

router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
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
        InventoryTimeRepository,
        InventoryTimeService,
        async (service) => {
            await service.deleteInventoryTime(id);
        },
        res,
    );
});

export default router;