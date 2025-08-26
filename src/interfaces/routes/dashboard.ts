import { Router, Response } from "express";
import { DashboardRepository } from "../../infrastructure/repositories/DashboardRepository";
import { DashboardService } from "../../application/DashboardService";
import { handleRequestWithService } from "../../utils/handleRequestWithService";
import { AuthenticatedRequest, authMiddleware, TokenPayload } from "./middlewares/authMiddleware";

const router = Router();

// Summary - Resumen general del dashboard
router.get("/summary", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id,role} = req.user as Omit<TokenPayload,'email'>

  await handleRequestWithService(
    DashboardRepository,
    DashboardService,
    async (service) => {
      const summary = await service.getSummary(id,role);
      return summary;
    },
    res,
  );
});

// Model Distribution - Distribución por modelos (agregado)
router.get(
  "/model-distribution",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const {id,role} = req.user as Omit<TokenPayload,'email'>


    await handleRequestWithService(
      DashboardRepository,
      DashboardService,
      async (service) => {
        const modelDistribution = await service.getModelDistribution(id,role);
        return modelDistribution;
      },
      res,
    );
  },
);

// Model Distribution by Institution - Distribución por modelos agrupada por institución
router.get(
  "/model-distribution/by-institution",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id, role} = req.user as Omit<TokenPayload,'email'>

    await handleRequestWithService(
      DashboardRepository,
      DashboardService,
      async (service) => {
        const modelDistributionByInstitution =
          await service.getModelDistributionByInstitution(id,role);
        return modelDistributionByInstitution;
      },
      res,
    );
  },
);

// Inventory Progress by Institution - Progreso de inventario por institución
router.get(
  "/inventory-progress/by-institution",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id, role} = req.user as Omit<TokenPayload,'email'>

    await handleRequestWithService(
      DashboardRepository,
      DashboardService,
      async (service) => {
        const progressByInstitution =
          await service.getInventoryProgressByInstitution(id,role);
        return progressByInstitution;
      },
      res,
    );
  },
);

// Inventory Progress by Service - Progreso de inventario por servicio
router.get(
  "/inventory-progress/by-service",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id, role} = req.user as Omit<TokenPayload,'email'>

    await handleRequestWithService(
      DashboardRepository,
      DashboardService,
      async (service) => {
        const progressByService =
          await service.getInventoryProgressByService(id,role);
        return progressByService;
      },
      res,
    );
  },
);

// State by Service - Estado por servicio (nuevo)
router.get("/state/by-service",authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id, role} = req.user as Omit<TokenPayload,'email'>

  await handleRequestWithService(
    DashboardRepository,
    DashboardService,
    async (service) => {
      const stateByService = await service.getStateByService(id,role);
      return stateByService;
    },
    res,
  );
});

// State by Model - Estado por modelo (nuevo)
router.get("/state/by-model",authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const {id,role} = req.user as Omit<TokenPayload,'email'>

  await handleRequestWithService(
    DashboardRepository,
    DashboardService,
    async (service) => {
      const stateByModel = await service.getStateByModel(id,role);
      return stateByModel;
    },
    res,
  );
});

// Top Inventory Takers - Inventariadores top por cantidad de bombas inventariadas este año
router.get(
  "/top-inventory-takers",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id, role} = req.user as Omit<TokenPayload,'email'>

    await handleRequestWithService(
      DashboardRepository,
      DashboardService,
      async (service) => {
        const topInventoryTakers = await service.getTopInventoryTakers(id,role);
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
