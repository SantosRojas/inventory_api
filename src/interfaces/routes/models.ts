import { Router } from "express";
import Joi from "joi";
import { ModelRepository } from "../../infrastructure/repositories/ModelRepository";
import { ModelService } from "../../application/ModelService";
import { handleRequestWithService } from "../../utils/handleRequestWithService";
import { isValidPositiveInteger } from "../../utils/validHandler";
import { HttpError } from "../../utils/ErrorHandler";
import { AuthenticatedRequest, authMiddleware } from "./middlewares/authMiddleware";

const router = Router();

const modelSchema = Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required()
});

const modelUpdateSchema = Joi.object({
    code: Joi.string().optional(),
    name: Joi.string().optional()
});


router.get("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
    handleRequestWithService(
        ModelRepository,
        ModelService,
        async (service) => {
            const models = await service.findAllModels();
            return models;
        }
        ,
        res
    );
});

router.get("/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    const { id: idParam } = req.params;
    // Validar que sea solo dígitos (número entero positivo)
    if (!isValidPositiveInteger(idParam)) {
        res.status(400).json({ error: "ID inválido", details: "El ID debe ser un número entero positivo" });
        return;
    }
    const id = Number(idParam);

    handleRequestWithService(
        ModelRepository,
        ModelService,
        async (service) => {
            const model = await service.getModelById(id);
            if (!model) throw new HttpError("Modelo no encontrado", 404, "No se encontró un modelo con el ID proporcionado");
            return model;
        },
        res
    );
});


router.get("/code/:code", authMiddleware, async (req: AuthenticatedRequest, res) => {
    if (!req.params.code || typeof req.params.code !== 'string') {
        // throw new HttpError("Código inválido", 400, "El código debe ser una cadena no vacía");
        res.status(400).json({ error: "Código inválido", details: "El código debe ser una cadena no vacía" });
        return;
    }
    handleRequestWithService(
        ModelRepository,
        ModelService,
        async (service) => {
            const model = await service.getModelByCode(req.params.code);
            if (!model) throw new HttpError("Modelo no encontrado", 404, "No se encontró un modelo con el código proporcionado");
            return model;
        },
        res
    );
});


router.post("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
    const { error } = modelSchema.validate(req.body);
    if (error) res.status(400).json({ error: "Datos inválidos", details: error.details[0].message });

    handleRequestWithService(
        ModelRepository,
        ModelService,
        async (service) => {
            const insertId = await service.createModel(req.body);
            if (!insertId) throw new HttpError("Modelo no encontrado", 404, "No se encontró un modelo con el ID proporcionado");
            return { insertId };
        },
        res,
        201
    );
});


router.patch("/:id", authMiddleware, async (req: AuthenticatedRequest, res): Promise<any> => {

    const { id: idParam } = req.params;
    const body = req.body;
    if (Object.keys(body).length === 0) {
        res.status(400).json({ error: "No se proporcionaron datos para actualizar" });
        return;
    }

    if (!isValidPositiveInteger(idParam)) {
        res.status(400).json({ error: "ID inválido", details: "El ID debe ser un número entero positivo" });
        return;
    }
    const id = Number(idParam);
    const { error } = modelUpdateSchema.validate(body);
    if (error) {
        res.status(400).json({ error: "Datos inválidos", details: error.details[0].message });
        return;
    }

    handleRequestWithService(
        ModelRepository,
        ModelService,
        async (service) => {
            const modelUpdated = await service.updateModel(id, body);
            return { modelUpdated };
        },
        res
    );
});


router.delete("/:id", authMiddleware, async (req: AuthenticatedRequest, res): Promise<any> => {
    const { id: idParam } = req.params;
    // Validar que sea solo dígitos (número entero positivo)
    if (!isValidPositiveInteger(idParam)) {
        // throw new HttpError('ID inválido', 400, 'El ID debe ser un número entero positivo');
        res.status(400).json({ error: "ID inválido", details: "El ID debe ser un número entero positivo" });
        return;
    }
    const id = Number(idParam);

    handleRequestWithService(
        ModelRepository,
        ModelService,
        async (service) => {
            await service.deleteModel(id);
        },
        res
    );
});

export default router;