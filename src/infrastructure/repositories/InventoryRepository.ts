import { Inventory } from "../../domain/entities/Inventory";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import {
  camelToSnakeArray,
  snackToCamelArray,
} from "../../adapters/apiAdapter";
import {
  fieldsPlaceHoldersValues,
  fieldsValues,
} from "../../utils/queriesHelper";
import { InventoryToSend } from "../../domain/entities/InventoryToSend";

export class InventoryRepository {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }


  private async fetchWithJoins(
    condition?: string,
    params: any[] = [],
    orderBy?: string,
    limit?: number, 
  ): Promise<InventoryToSend[]> {
    // Validar que limit sea entero positivo
    let safeLimit: number | undefined;

    if (limit !== undefined && Number.isInteger(limit) && limit > 0) {
      safeLimit = limit;
    }

    // Validar que orderBy no permita inyección
    const allowedOrderFields = [
      "i.inventory_date",
      "i.created_at",
      "i.last_maintenance_date",
    ];
    let safeOrderBy = "";
    if (
      orderBy &&
      allowedOrderFields.includes(orderBy.replace(/\s+(ASC|DESC)$/i, ""))
    ) {
      safeOrderBy = orderBy;
    }

    const query = `
    SELECT i.id, i.serial_number, i.qr_code, i.inventory_date, i.status, 
           i.last_maintenance_date, i.created_at, i.manufacture_date,
           m.name AS model, ins.name AS institution,
           s.name AS service, u.first_name AS inventory_manager
    FROM inventory i
    LEFT JOIN models m ON i.model_id = m.id
    LEFT JOIN institutions ins ON i.institution_id = ins.id
    LEFT JOIN services s ON i.service_id = s.id
    LEFT JOIN users u ON i.inventory_taker_id = u.id
    ${condition ? `WHERE ${condition}` : ""}
    ${safeOrderBy ? `ORDER BY ${safeOrderBy}` : ""}
    ${safeLimit !== undefined ? `LIMIT ${safeLimit}` : ""}
  `;

    const [rows] = await this.connection.execute<RowDataPacket[]>(query, params);
    return snackToCamelArray(rows) as InventoryToSend[];
  }


  async findLatestByUser(userId: number, limit: number): Promise<InventoryToSend[]> {
    return this.fetchWithJoins(
      "i.inventory_taker_id = ?",           // WHERE
      [userId],                  // parámetros
      "i.inventory_date DESC",   // ORDER BY
      limit                      // LIMIT
    );
  }


  async findAll(): Promise<InventoryToSend[]> {
    return this.fetchWithJoins();
  }

  async getById(id: number): Promise<InventoryToSend | null> {
    const result = await this.fetchWithJoins("i.id = ?", [id]);
    return result[0] || null;
  }

  async getBySerialNumber(serialNumber: string): Promise<InventoryToSend[]> {
    return this.fetchWithJoins("i.serial_number = ?", [serialNumber]);
  }

  async getByQrCode(qrCode: string): Promise<InventoryToSend[] | null> {
    const result = await this.fetchWithJoins("i.qr_code = ?", [qrCode]);
    return result || null;
  }

  async findByModelId(modelId: number): Promise<InventoryToSend[]> {
    return this.fetchWithJoins("i.model_id = ?", [modelId]);
  }

  async findByInstitutionId(institutionId: number): Promise<InventoryToSend[]> {
    return this.fetchWithJoins("i.institution_id = ?", [institutionId]);
  }

  async findByStatus(status: string): Promise<InventoryToSend[]> {
    return this.fetchWithJoins("i.status = ?", [status]);
  }

  async findByServiceId(serviceId: number): Promise<InventoryToSend[]> {
    return this.fetchWithJoins("i.service_id = ?", [serviceId]);
  }

  async findByServiceIdAndInstitutionId(
    serviceId: number,
    institutionId: number,
  ): Promise<InventoryToSend[]> {
    return this.fetchWithJoins("i.service_id = ? AND i.institution_id = ?", [
      serviceId,
      institutionId,
    ]);
  }

  async findByInventoryTakerId(userId: number): Promise<InventoryToSend[]> {
    return this.fetchWithJoins("i.inventory_taker_id = ?", [userId]);
  }

  async create(item: Partial<Omit<Inventory, "id">>): Promise<number> {
    const { fields, placeholders, values } = fieldsPlaceHoldersValues(item);
    const [result] = await this.connection.execute(
      `INSERT INTO inventory (${fields}) VALUES (${placeholders})`,
      values,
    );
    const insertResult = result as ResultSetHeader;
    return insertResult.insertId;
  }

  async update(
    id: number,
    item: Partial<Omit<Inventory, "id" | "serialNumber" | "modelId">>,
  ): Promise<InventoryToSend | null> {
    const { fields, values } = fieldsValues(item);

    values.push(id);

    const [result] = await this.connection.execute(
      `UPDATE inventory SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    const updateResult = result as ResultSetHeader;

    if (updateResult.affectedRows === 0) {
      return null; // No se encontró registro con ese ID
    }

    // Se actualizó correctamente: retornar el inventario actualizado
    return this.getById(id);
  }

  async delete(id: number): Promise<number> {
    const [result] = await this.connection.execute(
      "DELETE FROM inventory WHERE id = ?",
      [id],
    );
    const deleteResult = result as ResultSetHeader;
    return deleteResult.affectedRows;
  }

  async bulkCreate(
    items: Array<Partial<Omit<Inventory, "id">>>,
  ): Promise<number> {
    const snakeItems = camelToSnakeArray(items);
    const fields = Object.keys(snakeItems[0]).join(", ");
    const placeholders =
      "(" +
      Object.keys(snakeItems[0])
        .map(() => "?")
        .join(", ") +
      ")";
    const allPlaceholders = Array(snakeItems.length)
      .fill(placeholders)
      .join(", ");
    const values = snakeItems.flatMap(Object.values);

    const [result] = await this.connection.execute(
      `INSERT INTO inventory (${fields}) VALUES ${allPlaceholders}`,
      values,
    );
    const resultSetHeader = result as ResultSetHeader;
    return resultSetHeader.affectedRows || 0;
  }

  async bulkUpdate(
    items: Array<Partial<Omit<Inventory, "serialNumber" | "modelId">>>,
  ): Promise<number> {
    const snakeItems = camelToSnakeArray(items);
    const ids = snakeItems.map((item) => item.id);
    const fieldsToUpdate = Object.keys(snakeItems[0]).filter((f) => f !== "id");

    const cases = fieldsToUpdate.map((field) => {
      const fieldCases = snakeItems
        .map((item) => `WHEN ${item.id} THEN ?`)
        .join(" ");
      return `${field} = CASE id ${fieldCases} END`;
    });

    const values: any[] = [];
    for (const field of fieldsToUpdate) {
      for (const item of snakeItems) {
        values.push(item[field]);
      }
    }

    const sql = `
      UPDATE inventory
      SET ${cases.join(", ")}
      WHERE id IN (${ids.map(() => "?").join(", ")})
    `;

    const [result] = await this.connection.execute(sql, [...values, ...ids]);
    const resultSetHeader = result as ResultSetHeader;
    return resultSetHeader.affectedRows;
  }

  // Obtener inventarios del presente año por institución
  async getCurrentYearInventoriesByInstitution(
    institutionId: number,
  ): Promise<InventoryToSend[]> {
    const currentYear = new Date().getFullYear();

    const condition = `i.institution_id = ? AND YEAR(i.inventory_date) = ?`;
    return this.fetchWithJoins(condition, [institutionId, currentYear]);
  }

  // Obtener bombas NO inventariadas este año por institución
  async getNotInventoriedThisYearByInstitution(
    institutionId: number,
  ): Promise<InventoryToSend[]> {
    const currentYear = new Date().getFullYear();

    const condition = `i.institution_id = ? AND (i.inventory_date IS NULL OR YEAR(i.inventory_date) != ?)`;
    return this.fetchWithJoins(condition, [institutionId, currentYear]);
  }

  // Mantenimientos vencidos (solo admin, sin userId)
  async getOverdueMaintenanceByInstitution(
    institutionId: number,
  ): Promise<any> {
    const condition = `i.institution_id = ? AND (i.last_maintenance_date < DATE_SUB(CURDATE(), INTERVAL 2 YEAR) OR i.last_maintenance_date IS NULL)`;
    return this.fetchWithJoins(condition, [institutionId]);
  }
}
