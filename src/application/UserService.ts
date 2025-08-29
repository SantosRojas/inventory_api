import { User } from "../domain/entities/User";
import { UserToSend } from "../domain/entities/UserToSend";
import { UserRepository } from "../infrastructure/repositories/UserRepository";
import bcrypt from "bcryptjs";
import { HttpError } from "../utils/ErrorHandler";
import { parseForeignKeyError } from "../utils/parseForeignKeyError";
import { parseDuplicateError } from "../utils/parseDuplicateError";

export class UserService {
  private repository: UserRepository;
  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  async register(
    user: Omit<User, "id" | "createdAt" | "updatedAt">,
  ): Promise<number> {
    try {
      return await this.repository.create(user);
    } catch (error: any) {
      parseDuplicateError(error, {
        unique_email: "Este email ya está en uso",
        unique_cell_phone:
          "Ya existe un usuario con ese número de telefono",
      });
    }
  }

  async findByEmail(email: string): Promise<UserToSend | null> {
    return this.repository.findByEmail(email);
  }

  async findById(id: number): Promise<Omit<UserToSend, "password"> | null> {
    const user = await this.repository.findById(id);
    if (!user) return null;

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async findAll(): Promise<Omit<UserToSend, "password">[]> {
    const users = await this.repository.findAll();
    return users.map((user) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
  }

  async findFilteredUsers(userId: number, userRole: string): Promise<Omit<UserToSend, "password">[]> {
    let users;
    if (userRole === 'root') {
      users = await this.repository.findAll();
    }
    else if (userRole === 'admin') {
      const commonUsers = await this.repository.findCommonUsers()
      const myUser = await this.repository.findById(userId)
      if (myUser) {
        users = [myUser, ...commonUsers]
      }
      else {
        users = commonUsers
      }
    }
    else {
      const user = await this.repository.findById(userId)
      users = user ? [user] : [];
    }
    return users.map((user) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
  }

  async patch(
    id: number,
    user: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>,
  ): Promise<Omit<UserToSend, "password"> | null> {
    const updated = await this.repository.patch(id, user);
    if (!updated) throw new HttpError("Usuario no encontrado", 404);
    const { password, ...safeUser } = updated;
    return safeUser;
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.repository.findById(userId);
    if (!user) throw new HttpError("Usuario no encontrado", 404);

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new HttpError("Contraseña actual incorrecta", 401);

    const hashed = await this.hashPassword(newPassword);
    await this.repository.patch(userId, { password: hashed });
  }

  async adminResetPassword(userId: number, newPassword: string): Promise<void> {
    // Verificar que el usuario existe
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new HttpError("Usuario no encontrado", 404);
    }

    try {
      // Hash de la nueva contraseña (reutilizando tu método existente)
      const hashedPassword = await this.hashPassword(newPassword);

      // Actualizar contraseña sin verificar la anterior (reutilizando tu repositorio)
      const updatedUser = await this.repository.patch(userId, {
        password: hashedPassword,
      });

      if (!updatedUser) {
        throw new HttpError("Error al actualizar la contraseña", 500);
      }

      // Log de auditoría opcional
      console.log(`Admin password reset performed for user ID: ${userId}`);
    } catch (error) {
      // Si el error ya es HttpError, re-lanzarlo
      if (error instanceof HttpError) {
        throw error;
      }

      // Para otros errores, envolver en HttpError
      throw new HttpError(
        "Error al resetear la contraseña",
        500,
        (error as Error).message,
      );
    }
  }

  async recoverPassword(email: string, newPassword: string): Promise<number> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new HttpError("Usuario no encontrado", 404);
    }

    try {
      const hashedPassword = await this.hashPassword(newPassword);
      const updatedUser = await this.repository.patch(user.id, {
        password: hashedPassword,
      });
      return updatedUser ? updatedUser.id : 0;
    } catch (error) {
      // Loguear si se quiere registrar errores internos
      // throw new HttpError('Error al actualizar la contraseña', 500);
      throw new HttpError(
        "Error al actualizar la contraseña",
        500,
        (error as Error).message,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const deleted = await this.repository.delete(id);
      if (!deleted) {
        throw new HttpError("Servicio no encontrado", 404);
      }
    } catch (error: any) {
      parseForeignKeyError(error, {
        inventory:
          "No se puede eliminar el usuario porque tiene inventarios asociados",
        // otras tablas...
      });
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const SALT_ROUNDS = 10;
    return bcrypt.hash(password, SALT_ROUNDS);
  }
}
