import { Service } from "../../domain/entities/Service";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export class ServiceRepository {
  private connection: mysql.Connection;
  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async create(service: Omit<Service, "id">): Promise<number> {
    const [result] = await this.connection.execute(
      "INSERT INTO services (name) VALUES (?)",
      [service.name],
    );

    const resultCreated = result as ResultSetHeader;
    return resultCreated.insertId;
  }

  async findAll(): Promise<Service[]> {
    const [rows] = await this.connection.execute<RowDataPacket[]>(
      "SELECT * FROM services",
    );
    return rows.length ? (rows as Service[]) : [];
  }

  async findById(id: number): Promise<Service | null> {
    const [rows] = await this.connection.execute<RowDataPacket[]>(
      "SELECT * FROM services WHERE id = ?",
      [id],
    );
    return rows.length ? (rows[0] as Service) : null;
  }

  async update(id: number, item: Omit<Service, "id">): Promise<Service | null> {
    const keys = Object.keys(item);
    const values = Object.values(item);

    // Crear la parte de SET dinámicamente: "campo1 = ?, campo2 = ?, ..."
    const setClause = keys.map((key) => `${key} = ?`).join(", ");

    // Ejecutar el update
    const [result] = await this.connection.execute(
      `UPDATE services SET ${setClause} WHERE id = ?`,
      [...values, id], // primero los valores, luego el id
    );

    const resultUpdated = result as ResultSetHeader;

    if (resultUpdated.affectedRows === 0) {
      return null; // No se encontró el servicio con el ID proporcionado
    }

    // Devolver el servicio actualizado
    return { id, ...item } as Service;
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await this.connection.execute(
      "DELETE FROM services WHERE id = ?",
      [id],
    );
    const resultDeleted = result as ResultSetHeader;
    return resultDeleted.affectedRows > 0;
  }
}
