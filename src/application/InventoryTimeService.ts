import { InventoryTime } from "../domain/entities/InventoryTime";
import { InventoryTimeRepository } from "../infrastructure/repositories/InventoryTimeRepository";
import { HttpError } from "../utils/ErrorHandler";
import { formateDate } from "../utils/formateDate";


export class InventoryTimeService {
    private repository: InventoryTimeRepository;

    constructor(repository: InventoryTimeRepository) {
        this.repository = repository;
    }

    async createInventoryTime(data: InventoryTime): Promise<number> {
        try {
            const newInventoryTime = await this.repository.createInventoryTime(data);
            return newInventoryTime;
        } catch (error) {
            throw new HttpError(
                "Error interno del servidor",
                500,
                (error as Error).message,
            );
        }
    }

    async getAllInventoryTimes(): Promise<InventoryTime[]> {
        const results = await this.repository.getAllInventoryTimes();
        if (results.length === 0) {
            throw new HttpError(
                "Tiempos de Inventario esta vacio",
                404,
                `No se encontró ningun ningun tiempo de inventario`,
            );
        }
        const inventoryTimes = results.map((inventoryTime) => ({
            ...inventoryTime,
            startTime: formateDate(inventoryTime.startTime),
            endTime: formateDate(inventoryTime.endTime)
        }))
        return inventoryTimes;
    }

    async getInventoryTimeById(id: number): Promise<InventoryTime | null> {
        const inventoryTime = await this.repository.getInventoryTimeById(id);
        if (!inventoryTime) {
            throw new HttpError(
                'Tiempo de inventario no encontrado',
                404,
                `No se encontró un tiempo de inventario con el ID ${id}`,
            );
        }
        return {
            ...inventoryTime,
            startTime: formateDate(inventoryTime.startTime),
            endTime: formateDate(inventoryTime.endTime)
        };
    }

    async updateInventoryTime(id: number, data: Partial<Omit<InventoryTime, "id">>): Promise<InventoryTime | null> {
        try {
            const updatedInventoryTime = await this.repository.updateInventoryTime(id, data);
            if (!updatedInventoryTime) {
                throw new HttpError(
                    "No se encontró el tiempo de inventario",
                    404,
                    `No se encontró un tiempo de inventario con el ID ${id}`,
                );
            }
            return {
                ...updatedInventoryTime,
                startTime: formateDate(updatedInventoryTime.startTime),
                endTime: formateDate(updatedInventoryTime.endTime)
            };;
        } catch (error) {
            throw new HttpError(
                "Error interno del servidor",
                500,
                (error as Error).message,
            );
        }
    }

    async deleteInventoryTime(id: number): Promise<void> {
        try {
            const deleted = await this.repository.deleteInventoryTime(id);
            if (!deleted) {
                throw new HttpError(
                    "No se encontró el tiempo de inventario",
                    404,
                    `No se encontró un tiempo de inventario con el ID ${id}`,
                );
            }
        } catch (error) {
            throw new HttpError(
                "Error interno del servidor",
                500,
                (error as Error).message,
            );
        }
    }
}
