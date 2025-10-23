import { Response, Router } from "express";
import { AuthenticatedRequest, authMiddleware } from "./middlewares/authMiddleware";
import { handleRequestWithService } from "../../utils/handleRequestWithService";
import { InventoryHistoryRepository } from "../../infrastructure/repositories/InventoryHistoryRepository";
import { InventoryHistoryService } from "../../application/InventoryHistoryService";

const router = Router();


router.get('/by-qr/:qrCode', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {

    const qr = req.params.qrCode;
    
    await handleRequestWithService(
        InventoryHistoryRepository,
        InventoryHistoryService,
        async (service) => {
            const historiesByQR = await service.getHistoryByQR(qr);
            return historiesByQR;
        },
        res,
    );
});

router.get('/by-serie/:serialNumber', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {

    const serie = req.params.serialNumber;
    await handleRequestWithService(
        InventoryHistoryRepository,
        InventoryHistoryService,
        async (service) => {
            const historiesBySerie = await service.getHistoryBySerialNumber(serie);
            return historiesBySerie;
        },
        res,
    );
});


export default router;