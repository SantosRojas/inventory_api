import { snackToCamelArray } from "../../adapters/apiAdapter";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { InstitutionSalesRep, InstitutionSalesRepDetails } from "../../domain/entities/InstitutionSalesRep";

export class InstitutionSalesRepRepository {
    private connection: mysql.Connection;
    constructor(connection: mysql.Connection) {
        this.connection = connection;
    }

    async create(institutionSalesRep: InstitutionSalesRep): Promise<number> {
        const keys = Object.keys(institutionSalesRep); 
        const values = Object.values(institutionSalesRep); 

        // Construir placeholders ?, ?, ? dinámicamente
        const placeholders = keys.map(() => "?").join(", ");
        const columns = keys.join(", ");

        const sql = `INSERT INTO institution_sales_reps (${columns}) VALUES (${placeholders})`;

        const [result] = await this.connection.execute(sql, values);

        const insertResult = result as ResultSetHeader;

        if (insertResult.affectedRows === 0) {
            throw new Error("No se insertó ninguna asignación.");
        }

        return insertResult.insertId;
    }



    async findByUserId(userId: number): Promise<InstitutionSalesRepDetails[]> {
        const [rows] = await this.connection.execute<RowDataPacket[]>(
            'SELECT * FROM institution_sales_reps_view WHERE user_id = ?',
            [userId]
        );
        return snackToCamelArray(rows) as InstitutionSalesRepDetails[];
    }

    async findAll(): Promise<InstitutionSalesRepDetails[]> {
        const [rows] = await this.connection.execute<RowDataPacket[]>(
            'SELECT * FROM institution_sales_reps_view'
        );
        return snackToCamelArray(rows) as InstitutionSalesRepDetails[];
    }


    async delete(id: number): Promise<number> {
        const [result] = await this.connection.execute(
            'DELETE FROM institution_sales_reps WHERE id = ?',
            [id]
        );
        const deleteResult = result as ResultSetHeader;
        return deleteResult.affectedRows;
    }
}