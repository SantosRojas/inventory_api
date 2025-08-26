import {
  camelToSnake,
  snackToCamel,
  snackToCamelArray,
} from "../../adapters/apiAdapter";
import { User } from "../../domain/entities/User";
import { UserToSend } from "../../domain/entities/UserToSend";
import mysql, { RowDataPacket } from "mysql2/promise";
import {
  fieldsPlaceHoldersValues,
  fieldsValues,
} from "../../utils/queriesHelper";
import { HttpError } from "../../utils/ErrorHandler";

export class UserRepository {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  private async fetchWithJoin(
    condition?: string,
    params: any[] = [],
  ): Promise<UserToSend[]> {
    const query = `
      SELECT u.id, u.first_name, u.last_name, u.cell_phone, u.email, u.password, u.created_at, u.updated_at,
             r.name AS role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ${condition ? `WHERE ${condition}` : ""}
    `;
    const [rows] = await this.connection.execute<RowDataPacket[]>(
      query,
      params,
    );
    return snackToCamelArray(rows) as UserToSend[];
  }

  async create(
    user: Omit<User, "id" | "createdAt" | "updatedAt">,
  ): Promise<number> {
    const { fields, placeholders, values } = fieldsPlaceHoldersValues(user);
    const [result] = await this.connection.execute(
      `INSERT INTO users (${fields}) VALUES (${placeholders})`,
      values,
    );

    const resultSet = result as mysql.ResultSetHeader;
    return resultSet.insertId;
  }

  async findByEmail(email: string): Promise<UserToSend | null> {
    const result = await this.fetchWithJoin("u.email = ?", [email]);
    return result[0] || null;
  }

  async findById(id: number): Promise<UserToSend | null> {
    const result = await this.fetchWithJoin("u.id = ?", [id]);
    return result[0] || null;
  }

  async findAll(): Promise<UserToSend[]> {
    return this.fetchWithJoin();
  }

  async findCommonUsers():Promise<UserToSend[]>{
    return this.fetchWithJoin('u.role_id > 2')
  }
  async patch(
    id: number,
    user: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>,
  ): Promise<UserToSend | null> {
    const { fields, values } = fieldsValues(user);
    values.push(id);
    const [result] = await this.connection.execute(
      `UPDATE users SET ${fields} WHERE id = ?`,
      values,
    );

    const resultSet = result as mysql.ResultSetHeader;
    if (resultSet.affectedRows === 0) {
      return null;
    }
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await this.connection.execute(
      "DELETE FROM users WHERE id = ?",
      [id],
    );
    const resultDeleted = result as mysql.ResultSetHeader;
    return resultDeleted.affectedRows > 0;
  }
}
