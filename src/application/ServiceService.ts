import { Service } from "../domain/entities/Service";
import { ServiceRepository } from "../infrastructure/repositories/ServiceRepository";
import { HttpError } from "../utils/ErrorHandler";
import { parseDuplicateError } from "../utils/parseDuplicateError";
import { parseForeignKeyError } from "../utils/parseForeignKeyError";

export class ServiceService {
  private repository: ServiceRepository;
  constructor(repository: ServiceRepository) {
    this.repository = repository;
  }

  async createService(service: Omit<Service, "id">): Promise<Number> {
    try {
      const insertId = await this.repository.create(service);
      return insertId;
    } catch (error: any) {
      parseDuplicateError(error, {
        unique_name: "Ya existe un servicio con ese nombre",
      });
    }
  }

  async findAllServices(): Promise<Service[]> {
    return this.repository.findAll();
  }

  async updateService(
    id: number,
    service: Omit<Service, "id">,
  ): Promise<Service | null> {
    try {
      const updatedService = await this.repository.update(id, service);
      if (!updatedService) {
        throw new Error(
          `No se encontró ningún servicio con ID ${id} para actualizar.`,
        );
      }
      return updatedService;
    } catch (error: any) {
      parseDuplicateError(error, {
        unique_name: "Ya existe un servicio con ese nombre",
      });
    }
  }

  async deleteService(id: number): Promise<void> {
    try {
      const deleted = await this.repository.delete(id);
      if (!deleted) {
        throw new HttpError("Servicio no encontrado", 404);
      }
    } catch (error: any) {
      parseForeignKeyError(error, {
        inventory:
          "No se puede eliminar el servicio porque está vinculado a inventarios",
        // otras tablas...
      });
    }
  }

  async findServiceById(id: number): Promise<Service | null> {
    const found = await this.repository.findById(id);
    if (!found) {
      throw new Error(`No se encontró ningún servicio con ID ${id}.`);
    }
    return found;
  }
}
