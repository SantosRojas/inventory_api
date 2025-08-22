import { Institution } from "../domain/entities/Institution";
import { InstitutionRepository } from "../infrastructure/repositories/InstitutionRepository";
import { HttpError } from "../utils/ErrorHandler";
import { parseDuplicateError } from "../utils/parseDuplicateError";
import { parseForeignKeyError } from "../utils/parseForeignKeyError";

export class InstitutionService {
  private repository: InstitutionRepository;

  constructor(repository: InstitutionRepository) {
    this.repository = repository;
  }

  async createInstitution(
    institution: Omit<Institution, "id">,
  ): Promise<number> {
    try {
      const id = await this.repository.create(institution);
      return id;
    } catch (error: any) {
      parseDuplicateError(error, {
        unique_name: "Ya existe una institución con ese nombre",
        unique_code: "Ya existe una institución con ese código",
      });
    }
  }

  async getInstitutionById(id: number): Promise<Institution> {
    const institution = await this.repository.getById(id);
    if (!institution) {
      throw new HttpError("Institución no encontrada", 404);
    }
    return institution;
  }

  async findAllInstitutions(): Promise<Institution[]> {
    return this.repository.findAll();
  }

  async updateInstitution(
    id: number,
    institution: Omit<Institution, "id">,
  ): Promise<Institution> {
    try {
      const updatedInstitution = await this.repository.update(id, institution);
      if (!updatedInstitution) {
        throw new HttpError("Institución no encontrada", 404);
      }
      return updatedInstitution;
    } catch (error: any) {
      throw parseDuplicateError(error, {
        unique_name: "Ya existe una institución con ese nombre",
        unique_code: "Ya existe una institución con ese código",
      });
    }
  }

  async deleteInstitution(id: number): Promise<void> {
    try {
      const deleted = await this.repository.delete(id);
      if (!deleted) {
        throw new HttpError("Institución no encontrada", 404);
      }
    } catch (error: any) {
      parseForeignKeyError(error, {
        inventory:
          "No se puede eliminar la institución porque está vinculada a inventarios",
        // otras tablas...
      });
    }
  }
}
