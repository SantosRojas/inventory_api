import { Router } from "express";
import { handleRequestWithService } from "../../utils/handleRequestWithService";
import { InstitutionSalesRepRepository } from "../../infrastructure/repositories/InstitutionSalesRepRepository";
import { InstitutionSalesRepService } from "../../application/InstitutionSalesRepService";

const router = Router();

// ruta para traer los representantes de ventas y las instituciones asignadas a ellos
router.get("/", async (_req, res) => {
    handleRequestWithService(
        InstitutionSalesRepRepository,
        InstitutionSalesRepService,
        async (service) => {
            const data = await service.findAllInstitutionSalesReps();
            return data;
        },
        res
    );
});

router.post("/", async (req, res) => {
    handleRequestWithService(
        InstitutionSalesRepRepository,
        InstitutionSalesRepService,
        async (service) => {
            const createdId = await service.createInstitutionSalesRep(req.body);
            return { createdId };
        },
        res,
        201
    );
});


router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    handleRequestWithService(
        InstitutionSalesRepRepository,
        InstitutionSalesRepService,
        async (service) => {
            await service.deleteInstitutionSalesRep(Number(id));
            return;
        },
        res,
        204
    );
});

export default router;