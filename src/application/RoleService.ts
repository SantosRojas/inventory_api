import { Role } from "../domain/entities/Role";
import { RoleRepository } from "../infrastructure/repositories/RoleRepository";
import { HttpError } from "../utils/ErrorHandler";
import { parseDuplicateError } from "../utils/parseDuplicateError";
import { parseForeignKeyError } from "../utils/parseForeignKeyError";

export class RoleService {
  private repository: RoleRepository;

  constructor(repository: RoleRepository) {
    this.repository = repository;
  }

  async createRole(role: Omit<Role, "id">): Promise<number> {
    try {
      const id = await this.repository.create(role);
      return id;
    } catch (error: any) {
      parseDuplicateError(error, {
        unique_name: "Ya existe un rol con ese nombre",
        unique_description: "Ya existe un rol con esa descripción",
      });
    }
  }

  async getRoleById(id: number): Promise<Role> {
    const role = await this.repository.getById(id);
    if (!role) {
      throw new HttpError("Rol no encontrado", 404);
    }
    return role;
  }

  async findAllRoles(): Promise<Role[]> {
    return this.repository.findAll();
  }

  async updateRole(id: number, role: Omit<Role, "id">): Promise<Role> {
    try {
      const updatedRole = await this.repository.update(id, role);
      if (!updatedRole) {
        throw new HttpError("Rol no encontrado", 404);
      }
      return updatedRole;
    } catch (error: any) {
      throw parseDuplicateError(error, {
        unique_name: "Ya existe un rol con ese nombre",
        unique_description: "Ya existe un rol con esa descripción",
      });
    }
  }

  async deleteRole(id: number): Promise<void> {
    try {
      const deleted = await this.repository.delete(id);
      if (!deleted) {
        throw new HttpError("Institución no encontrada", 404);
      }
    } catch (error: any) {
      parseForeignKeyError(error, {
        users: "No se puede eliminar el rol porque esta vinculado a usuarios",
        // otras tablas...
      });
    }
  }
}
