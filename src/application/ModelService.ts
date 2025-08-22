// usecase ModelService
import { Model } from "../domain/entities/Model";
import { ModelRepository } from "../infrastructure/repositories/ModelRepository";
import { HttpError } from "../utils/ErrorHandler";
import { parseDuplicateError } from "../utils/parseDuplicateError";
import { parseForeignKeyError } from "../utils/parseForeignKeyError";
export class ModelService {
  private repository: ModelRepository;

  constructor(repository: ModelRepository) {
    this.repository = repository;
  }

  async findAllModels(): Promise<Model[]> {
    return this.repository.findAll();
  }

  async getModelById(id: number): Promise<Model | null> {
    const model = this.repository.getById(id);

    if (!model)
      throw new HttpError(
        "Modelo no encontrado",
        404,
        "No se encontró un modelo con el ID " + id,
      );
    return model;
  }

  async getModelByCode(code: string): Promise<Model | null> {
    const model = await this.repository.findByCode(code);
    if (!model) {
      throw new HttpError(
        `No se encontró un modelo con el código ${code}`,
        404,
      );
    }
    return model;
  }

  async createModel(model: Omit<Model, "id">): Promise<number> {
    // return this.repository.create(model);
    try {
      return await this.repository.create(model);
    } catch (error) {
      throw parseDuplicateError(error, {
        unique_code: "Este código ya está en uso",
        unique_name: "Ya existe un modelo con ese nombre",
      });
    }
  }

  async updateModel(
    id: number,
    model: Partial<Omit<Model, "id">>,
  ): Promise<Model | null> {
    // return this.repository.update(id, model);
    try {
      const updatedModel = await this.repository.update(id, model);
      if (!updatedModel) {
        throw new HttpError(
          "Modelo no encontrado",
          404,
          `No se encontró un modelo con el ID ${id}`,
        );
      }
      return updatedModel;
    } catch (error) {
      throw parseDuplicateError(error, {
        unique_code: "Este código ya está en uso",
        unique_name: "Ya existe un modelo con ese nombre",
      });
    }
  }

  async deleteModel(id: number): Promise<void> {
    try {
      const deleted = await this.repository.delete(id);
      if (!deleted) {
        throw new HttpError(
          "Modelo no encontrado",
          404,
          `No se encontró un modelo con el ID ${id}`,
        );
      }
    } catch (error: any) {
      parseForeignKeyError(error, {
        inventory:
          "No se puede eliminar el modelo porque tiene inventarios asociados",
        // otras tablas...
      });
    }
  }
}
