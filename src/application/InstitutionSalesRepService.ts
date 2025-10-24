import { GroupedIsrByUser, InstitutionSalesRep} from "../domain/entities/InstitutionSalesRep";
import { InstitutionSalesRepRepository } from "../infrastructure/repositories/InstitutionSalesRepRepository";
import { groupIsrByUser } from "../utils/AgrupedResponse";
import { HttpError } from "../utils/ErrorHandler";
import { parseDuplicateError } from "../utils/parseDuplicateError";

export class InstitutionSalesRepService {
    private repository: InstitutionSalesRepRepository;

    constructor(repository: InstitutionSalesRepRepository) {
        this.repository = repository;
    }

    async findAllInstitutionSalesReps(): Promise<GroupedIsrByUser[] | []> {
        const assignedReps = await this.repository.findAll();
        //tratamiento para devolver los representantes con sus instituciones asignadas
        const repsAgruped = groupIsrByUser(assignedReps);
        return repsAgruped || [];
    }

    async createInstitutionSalesRep(institutionSalesRep: InstitutionSalesRep): Promise<number> {
        try {
            return this.repository.create(institutionSalesRep)
        } catch (error: any) {
            parseDuplicateError(error, {
                isr_uq_institution_user: "Anteriormente ya se asignó esta institución a este representante de ventas",
            });
        }
    }

    async deleteInstitutionSalesRep(id: number): Promise<void> {
        const affectedRows =  await this.repository.delete(id);
        if (affectedRows === 0) {
            throw new HttpError(
                "Representante de ventas de institución no encontrado",
                404,
                `No se encontró un representante de ventas de institución con el ID ${id}`,
            );
        }
    }
}