import { snackToCamelArray } from "../../adapters/apiAdapter";
import mysql, { RowDataPacket } from "mysql2/promise";

export class InventoryHistoryRepository {
    private connection: mysql.Connection;
    constructor(connection: mysql.Connection) {
        this.connection = connection;
    }

    async getByQR(qrCode: string): Promise<any[]> {
         const [rows] = await this.connection.execute<RowDataPacket[]>(
      `SELECT * FROM inventory_history_view WHERE new_qr_code = ? ORDER BY change_timestamp ASC`,
      [qrCode]
    );
        return snackToCamelArray(rows) as any[];
    }
    async getBySerie(serialNumber: string): Promise<any[]> {
        const [rows] = await this.connection.execute<RowDataPacket[]>(
            `SELECT * FROM inventory_history_view WHERE new_serial_number = ? ORDER BY change_timestamp ASC`,
            [serialNumber]
        );
        return snackToCamelArray(rows) as any[];
    }
}