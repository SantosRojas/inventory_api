import { Router, Request, Response } from "express";
import { DashboardRepository } from "../../infrastructure/repositories/DashboardRepository";
import { DashboardService } from "../../application/DashboardService";
import { handleRequestWithService } from "../../utils/handleRequestWithService";
import { isValidPositiveInteger } from "../../utils/validHandler";
import { errorResponse } from "../../utils/responseHelpers";
import { AuthenticatedRequest, authMiddleware, TokenPayload } from "./middlewares/authMiddleware";

const router = Router();

// Summary - Resumen general del dashboard
router.get("/summary/:userId", async (req: Request, res: Response) => {
  const { userId: userIdParam } = req.params;

  if (!isValidPositiveInteger(userIdParam)) {
    res
      .status(400)
      .json(
        errorResponse(
          "ID de usuario inválido",
          "El ID debe ser un número entero positivo",
        ),
      );
    return;
  }

  const userId = Number(userIdParam);

  await handleRequestWithService(
    DashboardRepository,
    DashboardService,
    async (service) => {
      const summary = await service.getSummary(userId);
      return summary;
    },
    res,
  );
});

// Model Distribution - Distribución por modelos (agregado)
router.get(
  "/model-distribution/:userId",
  async (req: Request, res: Response) => {
    const { userId: userIdParam } = req.params;

    if (!isValidPositiveInteger(userIdParam)) {
      res
        .status(400)
        .json(
          errorResponse(
            "ID de usuario inválido",
            "El ID debe ser un número entero positivo",
          ),
        );
      return;
    }

    const userId = Number(userIdParam);

    await handleRequestWithService(
      DashboardRepository,
      DashboardService,
      async (service) => {
        const modelDistribution = await service.getModelDistribution(userId);
        return modelDistribution;
      },
      res,
    );
  },
);

// Model Distribution by Institution - Distribución por modelos agrupada por institución
router.get(
  "/model-distribution/by-institution/:userId",
  async (req: Request, res: Response) => {
    const { userId: userIdParam } = req.params;

    if (!isValidPositiveInteger(userIdParam)) {
      res
        .status(400)
        .json(
          errorResponse(
            "ID de usuario inválido",
            "El ID debe ser un número entero positivo",
          ),
        );
      return;
    }

    const userId = Number(userIdParam);

    await handleRequestWithService(
      DashboardRepository,
      DashboardService,
      async (service) => {
        const modelDistributionByInstitution =
          await service.getModelDistributionByInstitution(userId);
        return modelDistributionByInstitution;
      },
      res,
    );
  },
);

// Inventory Progress by Institution - Progreso de inventario por institución
router.get(
  "/inventory-progress/by-institution/:userId",
  async (req: Request, res: Response) => {
    const { userId: userIdParam } = req.params;

    if (!isValidPositiveInteger(userIdParam)) {
      res
        .status(400)
        .json(
          errorResponse(
            "ID de usuario inválido",
            "El ID debe ser un número entero positivo",
          ),
        );
      return;
    }

    const userId = Number(userIdParam);

    await handleRequestWithService(
      DashboardRepository,
      DashboardService,
      async (service) => {
        const progressByInstitution =
          await service.getInventoryProgressByInstitution(userId);
        return progressByInstitution;
      },
      res,
    );
  },
);

// Inventory Progress by Service - Progreso de inventario por servicio
router.get(
  "/inventory-progress/by-service/:userId",
  async (req: Request, res: Response) => {
    const { userId: userIdParam } = req.params;

    if (!isValidPositiveInteger(userIdParam)) {
      res
        .status(400)
        .json(
          errorResponse(
            "ID de usuario inválido",
            "El ID debe ser un número entero positivo",
          ),
        );
      return;
    }

    const userId = Number(userIdParam);

    await handleRequestWithService(
      DashboardRepository,
      DashboardService,
      async (service) => {
        const progressByService =
          await service.getInventoryProgressByService(userId);
        return progressByService;
      },
      res,
    );
  },
);

// State by Service - Estado por servicio (nuevo)
router.get("/state/by-service/:userId", async (req: Request, res: Response) => {
  const { userId: userIdParam } = req.params;

  if (!isValidPositiveInteger(userIdParam)) {
    res
      .status(400)
      .json(
        errorResponse(
          "ID de usuario inválido",
          "El ID debe ser un número entero positivo",
        ),
      );
    return;
  }

  const userId = Number(userIdParam);

  await handleRequestWithService(
    DashboardRepository,
    DashboardService,
    async (service) => {
      const stateByService = await service.getStateByService(userId);
      return stateByService;
    },
    res,
  );
});

// State by Model - Estado por modelo (nuevo)
router.get("/state/by-model/:userId", async (req: Request, res: Response) => {
  const { userId: userIdParam } = req.params;

  if (!isValidPositiveInteger(userIdParam)) {
    res
      .status(400)
      .json(
        errorResponse(
          "ID de usuario inválido",
          "El ID debe ser un número entero positivo",
        ),
      );
    return;
  }

  const userId = Number(userIdParam);

  await handleRequestWithService(
    DashboardRepository,
    DashboardService,
    async (service) => {
      const stateByModel = await service.getStateByModel(userId);
      return stateByModel;
    },
    res,
  );
});

// Top Inventory Takers - Inventariadores top por cantidad de bombas inventariadas este año
router.get(
  "/top-inventory-takers/:userId",
  async (req: Request, res: Response) => {
    const { userId: userIdParam } = req.params;

    if (!isValidPositiveInteger(userIdParam)) {
      res
        .status(400)
        .json(
          errorResponse(
            "ID de usuario inválido",
            "El ID debe ser un número entero positivo",
          ),
        );
      return;
    }

    const userId = Number(userIdParam);

    await handleRequestWithService(
      DashboardRepository,
      DashboardService,
      async (service) => {
        const topInventoryTakers = await service.getTopInventoryTakers(userId);
        return topInventoryTakers;
      },
      res,
    );
  },
);

// Mantenimientos vencidos: resumen y detalle por institución (solo admin)
router.get(
  "/overdue-maintenance/by-institution",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id, role } = req.user as Omit<TokenPayload, 'email'>; 
    await handleRequestWithService(
      DashboardRepository,
      DashboardService,
      async (service) => {
        const result = await service.getOverdueMaintenanceSummary(id, role);
        return result;
      },
      res,
    );
  },
);

export default router;
