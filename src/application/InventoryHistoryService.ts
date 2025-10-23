import { InventoryHistory } from "../domain/entities/InventoryHistory";
import { InventoryHistoryRepository } from "../infrastructure/repositories/InventoryHistoryRepository";
import { HttpError } from "../utils/ErrorHandler";

export class InventoryHistoryService {
    private repository: InventoryHistoryRepository;
    constructor(repository: InventoryHistoryRepository) {
        this.repository = repository;
    }

    async getHistoryByQR(qrCode: string): Promise<InventoryHistory[]> {
        const history = await this.repository.getByQR(qrCode);
        if (!history){
            throw new HttpError(
                `No se encontró historial para el código QR ${qrCode}`,
                404,
                `No se encontró historial para el código QR ${qrCode}`
            )
        }
        return history;
    }

    async getHistoryBySerialNumber(serialNumber: string): Promise<InventoryHistory[]> {
        const history = await this.repository.getBySerie(serialNumber);
        if (!history){
            throw new HttpError(
                `No se encontró historial para el número de serie ${serialNumber}`,
                404,
                `No se encontró historial para el número de serie ${serialNumber}`
            )
        }
        return history;
    }  
}