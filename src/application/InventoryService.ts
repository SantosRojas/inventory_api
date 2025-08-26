import { Inventory } from "../domain/entities/Inventory";
import { InventoryToSend } from "../domain/entities/InventoryToSend";
import { InventoryRepository } from "../infrastructure/repositories/InventoryRepository";
import { HttpError } from "../utils/ErrorHandler";
import { parseDuplicateError } from "../utils/parseDuplicateError";

export class InventoryService {
  private repository: InventoryRepository;

  constructor(repository: InventoryRepository) {
    this.repository = repository;
  }

  async findAllInventories(): Promise<InventoryToSend[]> {
    return this.repository.findAll();
  }

  async getInventoryById(id: number): Promise<InventoryToSend> {
    const inventory = await this.repository.getById(id);
    if (!inventory) {
      throw new HttpError(
        "Inventario no encontrado",
        404,
        `No se encontró un inventario con el ID ${id}`,
      );
    }
    return inventory;
  }

  async getInventoryBySerialNumber(
    serialNumber: string,
  ): Promise<InventoryToSend[]> {
    const inventories = await this.repository.getBySerialNumber(serialNumber);
    if (inventories.length === 0) {
      throw new HttpError(
        `No se encontró inventario con número de serie ${serialNumber}`,
        404,
        `No se encontró inventario con número de serie ${serialNumber}`,
      );
    }
    return inventories;
  }

  async getInventoryByQrCode(qrCode: string): Promise<InventoryToSend[]> {
    const inventory = await this.repository.getByQrCode(qrCode);
    if (!inventory) {
      throw new HttpError(
        `No se encontró inventario con código QR ${qrCode}`,
        404,
        `No se encontró inventario con código QR ${qrCode}`,
      );
    }
    return inventory;
  }

  async getInventoriesByModelId(modelId: number): Promise<InventoryToSend[]> {
    const inventories = await this.repository.findByModelId(modelId);
    if (inventories.length === 0) {
      throw new HttpError(
        `No se encontró inventario para el modelo con ID ${modelId}`,
        404,
        `No se encontró inventario para el modelo con ID ${modelId}`,
      );
    }
    return inventories;
  }

  async getInventoriesByInstitutionId(
    institutionId: number,
  ): Promise<InventoryToSend[]> {
    const inventories =
      await this.repository.findByInstitutionId(institutionId);
    if (inventories.length === 0) {
      throw new HttpError(
        `No se encontró inventario para la institución con ID ${institutionId}`,
        404,
        `No se encontró inventario para la institución con ID ${institutionId}`,
      );
    }
    return inventories;
  }

  async getInventoriesByStatus(status: string): Promise<InventoryToSend[]> {
    const inventories = await this.repository.findByStatus(status);
    if (inventories.length === 0) {
      throw new HttpError(
        `No se encontró inventario con estado ${status}`,
        404,
        `No se encontró inventario con estado ${status}`,
      );
    }
    return inventories;
  }

  async getInventoriesByServiceId(
    serviceId: number,
  ): Promise<InventoryToSend[]> {
    const inventories = await this.repository.findByServiceId(serviceId);
    if (inventories.length === 0) {
      throw new HttpError(
        `No se encontró inventario para el servicio con ID ${serviceId}`,
        404,
        `No se encontró inventario para el servicio con ID ${serviceId}`,
      );
    }
    return inventories;
  }

  async getInventoriesByServiceIdAndInstitutionId(
    serviceId: number,
    institutionId: number,
  ): Promise<InventoryToSend[]> {
    const inventories = await this.repository.findByServiceIdAndInstitutionId(
      serviceId,
      institutionId,
    );

    if (inventories.length === 0) {
      throw new HttpError(
        `No se encontró inventario para el servicio con ID ${serviceId} en la institución ${institutionId}`,
        404,
        `No se encontró inventario para el servicio con ID ${serviceId} en la institución ${institutionId}`,
      );
    }

    return inventories;
  }

  async getInventoriesByInventoryTakerId(
    userId: number,
  ): Promise<InventoryToSend[]> {
    const inventories = await this.repository.findByInventoryTakerId(userId);
    if (inventories.length === 0) {
      throw new HttpError(
        `No se encontró inventario para el usuario responsable con ID ${userId}`,
        404,
        `No se encontró inventario para el usuario responsable con ID ${userId}`,
      );
    }
    return inventories;
  }

  async createInventory(item: Partial<Omit<Inventory, "id">>): Promise<number> {
    try {
      const createdId = await this.repository.create(item);
      return createdId;
    } catch (error: any) {
      parseDuplicateError(error, {
        unique_qr: "Este código QR ya está en uso",
        unique_serial_model:
          "Ya existe un inventario con ese número de serie y modelo",
      });
    }
  }

  async updateInventory(
    id: number,
    item: Partial<Omit<Inventory, "id" | "serialNumber" | "modelId">>,
  ): Promise<InventoryToSend> {
    try {
      const updated = await this.repository.update(id, item);

      if (!updated) {
        throw new HttpError(
          `No se pudo actualizar el inventario con ID ${id}`,
          404,
        );
      }

      return updated;
    } catch (error: any) {
      parseDuplicateError(error, {
        unique_qr: "Este código QR ya está en uso",
        unique_serial_model:
          "Ya existe un inventario con ese número de serie y modelo",
      });
    }
  }

  async deleteInventory(id: number): Promise<void> {
    const deletedCount = await this.repository.delete(id);
    if (deletedCount === 0) {
      throw new HttpError(
        "Modelo no encontrado",
        404,
        `No se encontró ningún inventario con ID ${id} para eliminar.`,
      );
    }
  }

  async bulkInventoryCreation(
    items: Partial<Omit<Inventory, "id">>[],
  ): Promise<number> {
    try {
      const createdCount = await this.repository.bulkCreate(items);

      if (createdCount !== items.length) {
        throw new Error(
          `Se esperaban crear ${items.length} items, pero solo se crearon ${createdCount}.`,
        );
      }

      return createdCount;
    } catch (error: any) {
      parseDuplicateError(error, {
        unique_qr: "Este código QR ya está en uso",
        unique_serial_model:
          "Ya existe un inventario con ese número de serie y modelo",
      });
    }
  }

  async bulkInventoryUpdate(
    items: Array<Partial<Omit<Inventory, "serialNumber" | "modelId">>>,
  ): Promise<number> {
    try {
      const updatedCount = await this.repository.bulkUpdate(items);

      if (updatedCount !== items.length) {
        throw new Error(
          `Se esperaban actualizar ${items.length} items, pero solo se actualizaron ${updatedCount}.`,
        );
      }

      return updatedCount;
    } catch (error: any) {
      parseDuplicateError(error, {
        unique_qr: "Este código QR ya está en uso",
        unique_serial_model:
          "Ya existe un inventario con ese número de serie y modelo",
      });
    }
  }

  async getCurrentYearInventoriesByInstitution(
    institutionId: number,
  ): Promise<InventoryToSend[]> {
    try {
      return await this.repository.getCurrentYearInventoriesByInstitution(
        institutionId,
      );
    } catch (error: any) {
      throw new HttpError(
        "Error al obtener inventarios del presente año por institución",
        500,
        error.message,
      );
    }
  }

  async getNotInventoriedThisYearByInstitution(
    institutionId: number,
  ): Promise<InventoryToSend[]> {
    try {
      return await this.repository.getNotInventoriedThisYearByInstitution(
        institutionId,
      );
    } catch (error: any) {
      throw new HttpError(
        "Error al obtener bombas no inventariadas este año por institución",
        500,
        error.message,
      );
    }
  }

  async getOverdueMaintenanceByInstitution(
    institutionId: number,
  ): Promise<any> {
    try {
      return await this.repository.getOverdueMaintenanceByInstitution(
        institutionId,
      );
    } catch (error: any) {
      throw new HttpError(
        "Error al obtener mantenimientos vencidos por institución",
        500,
        error.message,
      );
    }
  }
  async getLatestInventoriesByUser(userId: number, limit: number): Promise<InventoryToSend[]> {
    const inventories = await this.repository.findLatestByUser(userId, limit);

    if (inventories.length === 0) {
      throw new HttpError("No se encontraron inventarios para este usuario", 404);
    }

    return inventories;
  }

}
