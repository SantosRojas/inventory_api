import { InventoryTime } from "../domain/entities/InventoryTime";
import { InventoryTimeRepository } from "../infrastructure/repositories/InventoryTimeRepository";
import { HttpError } from "../utils/ErrorHandler";
import { toMySQLDate } from "../utils/toMySQLDate";

export interface InventoryTimePayload {
    userId: number;
    inventoryId: number;
    startTime: string;
    endTime: string;
    durationSeconds: number;
    success: boolean;
}

export interface InventoryTimePayloadUpdate {
    userId: number | null;
    inventoryId: number | null;
    startTime: string | null;
    endTime: string | null;
    durationSeconds: number | null;
    success: boolean | null;
}

export class InventoryTimeService {
    private repository: InventoryTimeRepository;

    constructor(repository: InventoryTimeRepository) {
        this.repository = repository;
    }

    async createInventoryTime(data: InventoryTime): Promise<number> {
        try {
            const payload: InventoryTimePayload = {
                userId: data.userId,
                inventoryId: data.inventoryId,
                startTime: toMySQLDate(data.startTime),
                endTime: toMySQLDate(data.endTime),
                durationSeconds: data.durationSeconds,
                success: data.success,
            };
            const newInventoryTime = await this.repository.createInventoryTime(payload);
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
            const inventoryTimes = await this.repository.getAllInventoryTimes();
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
            return inventoryTime;
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
            const payload: InventoryTimePayloadUpdate = {
                userId: data.userId || null,
                inventoryId: data.inventoryId || null,
                startTime: toMySQLDate(data.startTime || new Date()) || null,
                endTime: toMySQLDate(data.endTime || new Date()) || null,
                durationSeconds: data.durationSeconds || null,
                success: data.success || null,
            };
            const updatedInventoryTime = await this.repository.updateInventoryTime(id, payload);
            if (!updatedInventoryTime) {
                throw new HttpError(
                    "No se encontró el tiempo de inventario",
                    404,
                    `No se encontró un tiempo de inventario con el ID ${id}`,
                );
            }
            return updatedInventoryTime;
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
