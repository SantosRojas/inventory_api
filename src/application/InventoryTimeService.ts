import { InventoryTime, InventoryTimeForDB } from "../domain/entities/InventoryTime";
import { InventoryTimeRepository } from "../infrastructure/repositories/InventoryTimeRepository";
import { HttpError } from "../utils/ErrorHandler";
import { toPeruDateString } from "../utils/formateDateToPeru";


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
        try {
            const results = await this.repository.getAllInventoryTimes();
            const inventoryTimes = results.map((inventoryTime) => ({
                ...inventoryTime,
                startTime: toPeruDateString(inventoryTime.startTime),
                endTime: toPeruDateString(inventoryTime.endTime)
            }))
            return inventoryTimes;

        } catch (error) {
            throw new HttpError(
                "Error interno del servidor",
                500,
                (error as Error).message,
            );
        }
    }

    async getInventoryTimeById(id: number): Promise<InventoryTime | null> {
        try {
            const inventoryTime = await this.repository.getInventoryTimeById(id);
            if (!inventoryTime) {
                throw new HttpError(
                    `No se encontró un tiempo de inventario con el ID ${id}`,
                    404,
                );
            }
            return {
                ...inventoryTime,
                startTime: toPeruDateString(inventoryTime.startTime),
                endTime: toPeruDateString(inventoryTime.endTime)
            };
        } catch (error) {
            throw new HttpError(
                "Error interno del servidor",
                500,
                (error as Error).message,
            );
        }
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
                startTime: toPeruDateString(updatedInventoryTime.startTime),
                endTime: toPeruDateString(updatedInventoryTime.endTime)
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
