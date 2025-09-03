import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { InventoryTime } from "../../domain/entities/InventoryTime";
import { snackToCamel, snackToCamelArray } from "../../adapters/apiAdapter";
import { fieldsPlaceHoldersValues, fieldsValues } from "../../utils/queriesHelper";
import { InventoryTimePayload, InventoryTimePayloadUpdate } from "../../application/InventoryTimeService";

export class InventoryTimeRepository {
    private connection: mysql.Connection;

    constructor(connection: mysql.Connection) {
        this.connection = connection;
    }

    async createInventoryTime(inventoryTime: Omit<InventoryTimePayload, 'id'>): Promise<number> {
        const { fields, placeholders, values } = fieldsPlaceHoldersValues(inventoryTime);
        const [result] = await this.connection.execute(
            `INSERT INTO inventory_times (${fields}) VALUES (${placeholders})`,
            values,
        );
        const insertResult = result as ResultSetHeader;
        return insertResult.insertId;
    }

    async getAllInventoryTimes(): Promise<InventoryTime[]> {
        const query = 'SELECT * FROM inventory_times';
        const [rows] = await this.connection.execute<RowDataPacket[]>(query);
        return snackToCamelArray(rows) as InventoryTime[];
    }

    async getInventoryTimeById(id: number): Promise<InventoryTime | null> {
        const query = 'SELECT * FROM inventory_times WHERE id = ?';
        const [rows] = await this.connection.execute<RowDataPacket[]>(query, [id]);
        return snackToCamel(rows[0]) as InventoryTime || null;
    }

    async updateInventoryTime(id: number, inventoryTime: Partial<Omit<InventoryTimePayloadUpdate, 'id'>>): Promise<InventoryTime | null> {
        const { fields, values } = fieldsValues(inventoryTime);

        values.push(id);

        const [result] = await this.connection.execute(
            `UPDATE inventory_times SET ${fields.join(", ")} WHERE id = ?`,
            values,
        );

        const updateResult = result as ResultSetHeader;

        if (updateResult.affectedRows === 0) {
            return null; // No se encontró registro con ese ID
        }

        // Se actualizó correctamente: retornar el inventario actualizado
        return this.getInventoryTimeById(id);
    }

    async deleteInventoryTime(id: number): Promise<boolean> {
        const query = 'DELETE FROM inventory_times WHERE id = ?';
        const [res] = await this.connection.execute(query, [id]);
        const result = res as mysql.ResultSetHeader;
        return result.affectedRows > 0;
    }
}