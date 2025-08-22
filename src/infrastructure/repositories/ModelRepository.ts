import mysql, { ResultSetHeader } from "mysql2/promise";
import { Model } from "../../domain/entities/Model";
import {
  fieldsPlaceHoldersValues,
  fieldsValues,
} from "../../utils/queriesHelper";

export class ModelRepository {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async findAll(): Promise<Model[]> {
    const [rows] = await this.connection.execute(
      "SELECT id, code, name FROM models",
    );
    return rows as Model[];
  }

  async getById(id: number): Promise<Model | null> {
    const [rows] = await this.connection.execute(
      "SELECT * FROM models WHERE id = ?",
      [id],
    );
    return (rows as Model[])[0] || null;
  }

  async create(model: Omit<Model, "id">): Promise<number> {
    const { fields, placeholders, values } = fieldsPlaceHoldersValues(model);
    const [result] = await this.connection.execute(
      `INSERT INTO models (${fields}) VALUES (${placeholders})`,
      values,
    );
    const insertResult = result as ResultSetHeader;
    return insertResult.insertId;
  }

  async update(
    id: number,
    model: Partial<Omit<Model, "id">>,
  ): Promise<Model | null> {
    const { fields, values } = fieldsValues(model);

    values.push(id);

    const [result] = await this.connection.execute(
      `UPDATE models SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    const updateResult = result as ResultSetHeader;

    if (updateResult.affectedRows === 0) {
      return null; // No se encontró registro con ese ID
    }

    // Se actualizó correctamente: retornar el modelo actualizado
    return this.getById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [res] = await this.connection.execute(
      "DELETE FROM models WHERE id = ?",
      [id],
    );
    const result = res as mysql.ResultSetHeader;
    return result.affectedRows > 0;
  }

  async findByCode(code: string): Promise<Model | null> {
    const [rows] = await this.connection.execute(
      "SELECT id, code, name FROM models WHERE code = ?",
      [code],
    );
    const models = rows as Model[];
    return models.length > 0 ? models[0] : null;
  }

  async findByName(name: string): Promise<Model | null> {
    const [rows] = await this.connection.execute(
      "SELECT id, code, name FROM models WHERE name = ?",
      [name],
    );

    const models = rows as Model[];
    return models.length > 0 ? models[0] : null;
  }

  async findById(id: number): Promise<Model | null> {
    const [rows] = await this.connection.execute(
      "SELECT id, code, name FROM models WHERE id = ?",
      [id],
    );
    const models = rows as Model[];
    return models.length > 0 ? models[0] : null;
  }
}
