import { snackToCamel, snackToCamelArray } from "../../adapters/apiAdapter";
import { Institution } from "../../domain/entities/Institution";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { fieldsValues } from "../../utils/queriesHelper";

export class InstitutionRepository {
  private connection: mysql.Connection;
  // Define the connection type as mysql.Connection for better type safety
  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async create(institution: Omit<Institution, "id">): Promise<number> {
    const keys = Object.keys(institution); // ['name', 'code', 'address', ...]
    const values = Object.values(institution); // ['Hospital Central', 'HC01', ...]

    // Construir placeholders ?, ?, ? dinámicamente
    const placeholders = keys.map(() => "?").join(", ");
    const columns = keys.join(", ");

    const sql = `INSERT INTO institutions (${columns}) VALUES (${placeholders})`;

    const [result] = await this.connection.execute(sql, values);

    const insertResult = result as ResultSetHeader;

    if (insertResult.affectedRows === 0) {
      throw new Error("No se insertó ninguna institución.");
    }

    return insertResult.insertId;
  }

  async getById(id: number): Promise<Institution | null> {
    const [rows] = await this.connection.execute<RowDataPacket[]>(
      "SELECT * FROM institutions WHERE id = ?",
      [id],
    );
    return rows.length ? (snackToCamel(rows[0]) as Institution) : null;
  }

  async findAll(): Promise<Institution[]> {
    const [rows] = await this.connection.execute<RowDataPacket[]>(
      "SELECT * FROM institutions",
    );
    return snackToCamelArray(rows) as Institution[];
  }

  async update(
    id: number,
    item: Partial<Omit<Institution, "id">>,
  ): Promise<Institution | null> {
    const { fields, values } = fieldsValues(item);
    if (fields.length === 0) return null; // Nada que actualizar

    values.push(id);

    const [result] = await this.connection.execute(
      `UPDATE institutions SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    const updateResult = result as ResultSetHeader;

    if (updateResult.affectedRows === 0) return null;

    // Retornar el objeto actualizado
    return this.getById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await this.connection.execute(
      "DELETE FROM institutions WHERE id = ?",
      [id],
    );
    const deleteResult = result as ResultSetHeader;
    return deleteResult.affectedRows > 0;
  }
}
