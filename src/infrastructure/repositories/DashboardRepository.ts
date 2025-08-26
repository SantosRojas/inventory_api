import mysql, { RowDataPacket } from "mysql2/promise";
import { isAdminRole } from "../../utils/roleHandler";

export class DashboardRepository {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }


  async getOverdueMaintenanceSummary(id: number, role: string): Promise<any> {
    const isAdmin = isAdminRole(role);
    const institutionsQuery = `
    SELECT
      ins.name AS institutionName,
      COUNT(
        CASE
          WHEN i.last_maintenance_date < DATE_SUB(CURDATE(), INTERVAL 2 YEAR)
            OR i.last_maintenance_date IS NULL
          THEN 1
        END
      ) AS overdueMaintenanceCount
    FROM inventory i
    JOIN institutions ins ON i.institution_id = ins.id
    ${isAdmin ? '' : 'WHERE i.inventory_taker_id = ?'}
    GROUP BY ins.id, ins.name
    HAVING overdueMaintenanceCount > 0
    ORDER BY ins.name;
  `;

    const [institutionsRows] = await this.connection.execute<RowDataPacket[]>(
      institutionsQuery,
      isAdmin ? [] : [id]
    );


    // Mapear correctamente el resultado para asegurar el tipo
    const institutions = institutionsRows.map((row) => ({
      institutionName: row.institutionName,
      overdueMaintenanceCount: Number(row.overdueMaintenanceCount),
    }));

    return { institutions };
  }


  // Obtener instituciones permitidas para el usuario
  async getUserInstitutions(userId: number,role:string): Promise<number[]> {
    const isAdmin =  isAdminRole(role)

    if (isAdmin) {
      // Admin puede ver todas las instituciones
      const query = `SELECT id FROM institutions`;
      const [rows] = await this.connection.execute<RowDataPacket[]>(query);
      return rows.map((row: any) => row.id);
    } else {
      // Usuario regular solo ve instituciones donde ha inventariado
      const query = `
        SELECT DISTINCT institution_id
        FROM inventory
        WHERE inventory_taker_id = ?
      `;
      const [rows] = await this.connection.execute<RowDataPacket[]>(query, [
        userId,
      ]);
      return rows.map((row: any) => row.institution_id);
    }
  }

  // Summary - Resumen general
  async getSummary(userId: number,role:string): Promise<any> {
    const currentYear = new Date().getFullYear();
    const isAdmin = isAdminRole(role)
    const institutionIds = await this.getUserInstitutions(userId,role);

    if (institutionIds.length === 0) {
      const baseResult = {
        totalPumps: 0,
        inventoriedPumpsThisYear: 0,
        operativePumps: 0,
        overduePumpsMaintenance: 0,
      };

      if (isAdmin) {
        return {
          ...baseResult,
          adminData: {
            totalInventoryTakers: 0,
            totalInstitutions: 0,
          },
        };
      }

      return baseResult;
    }

    const placeholders = institutionIds.map(() => "?").join(",");

    const summaryQuery = `
      SELECT
        COUNT(*) as totalPumps,
        COUNT(CASE WHEN YEAR(i.inventory_date) = ? THEN 1 END) as inventoriedPumpsThisYear,
        COUNT(CASE WHEN i.status = 'Operativo' THEN 1 END) as operativePumps,
        COUNT(CASE WHEN i.last_maintenance_date < DATE_SUB(NOW(), INTERVAL 2 YEAR) OR i.last_maintenance_date IS NULL THEN 1 END) as overduePumpsMaintenance
      FROM inventory i
      WHERE i.institution_id IN (${placeholders})
    `;

    const [summaryRows] = await this.connection.execute<RowDataPacket[]>(
      summaryQuery,
      [currentYear, ...institutionIds],
    );

    let result = summaryRows[0];

    // Solo para admin: agregar datos administrativos
    if (isAdmin) {
      // Contar solo inventory takers que han inventariado al menos 1 bomba
      const [inventoryTakersRows] = await this.connection.execute<
        RowDataPacket[]
      >(
        "SELECT COUNT(DISTINCT inventory_taker_id) as totalInventoryTakers FROM inventory",
      );
      // Contar solo instituciones que tienen bombas registradas
      const [institutionsRows] = await this.connection.execute<RowDataPacket[]>(
        "SELECT COUNT(DISTINCT institution_id) as totalInstitutions FROM inventory",
      );

      result = {
        ...result,
        adminData: {
          totalInventoryTakers: inventoryTakersRows[0].totalInventoryTakers,
          totalInstitutions: institutionsRows[0].totalInstitutions,
        },
      };
    }

    return result;
  }

  // Model Distribution - Distribución por modelos
  async getModelDistribution(userId: number,role:string): Promise<any> {
    const institutionIds = await this.getUserInstitutions(userId,role);

    if (institutionIds.length === 0) {
      return { models: [] };
    }

    const placeholders = institutionIds.map(() => "?").join(",");
    const query = `
      SELECT
        m.name as modelName,
        COUNT(*) as count
      FROM inventory i
      JOIN models m ON i.model_id = m.id
      WHERE i.institution_id IN (${placeholders})
      GROUP BY m.id, m.name
      ORDER BY count DESC
    `;

    const [rows] = await this.connection.execute<RowDataPacket[]>(
      query,
      institutionIds,
    );
    return { models: rows };
  }

  async getModelDistributionByInstitution(userId: number,role:string): Promise<any> {
    const institutionIds = await this.getUserInstitutions(userId,role);

    if (institutionIds.length === 0) {
      return {
        totalPumps: 0,
        models: [],
        data: [],
      };
    }

    const placeholders = institutionIds.map(() => "?").join(",");

    // Consulta principal: distribución por institución y modelo
    const distributionQuery = `
      SELECT
        ins.name AS institutionName,
        m.name AS modelName,
        COUNT(*) AS count
      FROM inventory i
      JOIN institutions ins ON i.institution_id = ins.id
      JOIN models m ON i.model_id = m.id
      WHERE i.institution_id IN (${placeholders})
      GROUP BY ins.id, ins.name, m.id, m.name
      ORDER BY ins.name, count DESC
    `;

    // Consulta adicional: total global de bombas del usuario
    const totalQuery = `
      SELECT COUNT(*) AS total
      FROM inventory
      WHERE institution_id IN (${placeholders})
    `;

    const [[distributionRows], [[{ total }]]] = await Promise.all([
      this.connection.execute<RowDataPacket[]>(
        distributionQuery,
        institutionIds,
      ),
      this.connection.execute<RowDataPacket[]>(totalQuery, institutionIds),
    ]);

    // Mapear datos
    const institutionsMap = new Map<string, Record<string, any>>();
    const modelSet = new Set<string>();

    for (const row of distributionRows) {
      const { institutionName, modelName, count } = row;

      modelSet.add(modelName);

      if (!institutionsMap.has(institutionName)) {
        institutionsMap.set(institutionName, {
          institutionName,
          total: 0,
        });
      }

      const instData = institutionsMap.get(institutionName)!;
      instData[modelName] = count;
      instData.total += count;
    }

    return {
      totalPumps: Number(total) || 0,
      models: Array.from(modelSet),
      data: Array.from(institutionsMap.values()),
    };
  }

  // Inventory Progress by Institution - Progreso por institución
  async getInventoryProgressByInstitution(userId: number,role:string): Promise<any> {
    const currentYear = new Date().getFullYear();
    const institutionIds = await this.getUserInstitutions(userId,role);

    if (institutionIds.length === 0) {
      return { institutions: [] };
    }

    const placeholders = institutionIds.map(() => "?").join(",");
    const query = `
      SELECT
        ins.name as institutionName,
        COUNT(CASE WHEN YEAR(i.inventory_date) = ? THEN 1 END) as pumpsInventoriedThisYear,
        COUNT(*) as totalPumps
      FROM inventory i
      JOIN institutions ins ON i.institution_id = ins.id
      WHERE i.institution_id IN (${placeholders})
      GROUP BY ins.id, ins.name
      ORDER BY ins.name
    `;

    const [rows] = await this.connection.execute<RowDataPacket[]>(query, [
      currentYear,
      ...institutionIds,
    ]);
    return { institutions: rows };
  }

  // Inventory Progress by Service - Progreso por servicio
  async getInventoryProgressByService(userId: number,role:string): Promise<any> {
    const currentYear = new Date().getFullYear();
    const institutionIds = await this.getUserInstitutions(userId,role);

    if (institutionIds.length === 0) {
      return { institutions: [] };
    }

    const placeholders = institutionIds.map(() => "?").join(",");
    const query = `
      SELECT
        ins.id as institutionId,
        ins.name as institutionName,
        s.id as serviceId,
        s.name as serviceName,
        COUNT(CASE WHEN YEAR(i.inventory_date) = ? THEN 1 END) as pumpsInventoriedThisYear,
        COUNT(*) as totalPumps
      FROM inventory i
      JOIN institutions ins ON i.institution_id = ins.id
      JOIN services s ON i.service_id = s.id
      WHERE i.institution_id IN (${placeholders})
      GROUP BY ins.id, ins.name, s.id, s.name
      ORDER BY ins.name, s.name
    `;

    const [rows] = await this.connection.execute<RowDataPacket[]>(query, [
      currentYear,
      ...institutionIds,
    ]);

    // Estructurar por institución
    const institutionsMap = new Map();
    rows.forEach((row: any) => {
      const {
        institutionId,
        institutionName,
        serviceId,
        serviceName,
        pumpsInventoriedThisYear,
        totalPumps,
      } = row;

      if (!institutionsMap.has(institutionId)) {
        institutionsMap.set(institutionId, {
          institutionId,
          institutionName,
          services: [],
        });
      }

      institutionsMap.get(institutionId).services.push({
        serviceId,
        serviceName,
        pumpsInventoriedThisYear,
        totalPumps,
      });
    });

    return { institutions: Array.from(institutionsMap.values()) };
  }

  // Top Inventory Takers - Inventariadores top por cantidad este año
  async getTopInventoryTakers(userId: number,role:string): Promise<any> {
    const currentYear = new Date().getFullYear();
    const isAdmin = isAdminRole(role)

    let query = "";
    let queryParams: any[] = [];

    if (isAdmin) {
      // Admin puede ver todos los inventariadores
      query = `
        SELECT
          u.id as userId,
          CONCAT(u.first_name, ' ', u.last_name) as inventoryTakerName,
          COUNT(*) as pumpsInventoriedThisYear
        FROM inventory i
        INNER JOIN users u ON i.inventory_taker_id = u.id
        WHERE YEAR(i.inventory_date) = ?
        GROUP BY u.id, u.first_name, u.last_name
        ORDER BY pumpsInventoriedThisYear DESC, u.first_name, u.last_name
      `;
      queryParams = [currentYear];
    } else {
      // Usuario regular solo se ve a sí mismo
      query = `
        SELECT
          u.id as userId,
          CONCAT(u.first_name, ' ', u.last_name) as inventoryTakerName,
          COUNT(*) as pumpsInventoriedThisYear
        FROM inventory i
        INNER JOIN users u ON i.inventory_taker_id = u.id
        WHERE YEAR(i.inventory_date) = ? AND u.id = ?
        GROUP BY u.id, u.first_name, u.last_name
      `;
      queryParams = [currentYear, userId];
    }

    const [rows] = await this.connection.execute<RowDataPacket[]>(
      query,
      queryParams,
    );

    return {
      topInventoryTakers: rows,
      year: currentYear,
    };
  }

  // State by Service - Estado por servicio (bombas inoperativas)
  async getStateByService(userId: number,role:string): Promise<any> {
    const institutionIds = await this.getUserInstitutions(userId,role);

    if (institutionIds.length === 0) {
      return { institutions: [] };
    }

    const placeholders = institutionIds.map(() => "?").join(",");
    const query = `
      SELECT
        ins.id as institutionId,
        ins.name as institutionName,
        s.id as serviceId,
        s.name as serviceName,
        COUNT(CASE WHEN i.status IN ('Inoperativo', 'En reparación', 'Fuera de servicio', 'Dañado') THEN 1 END) as inoperativePumpsCount,
        COUNT(*) as totalPumps
      FROM inventory i
      JOIN institutions ins ON i.institution_id = ins.id
      JOIN services s ON i.service_id = s.id
      WHERE i.institution_id IN (${placeholders})
      GROUP BY ins.id, ins.name, s.id, s.name
      ORDER BY ins.name, s.name
    `;

    const [rows] = await this.connection.execute<RowDataPacket[]>(
      query,
      institutionIds,
    );

    // Estructurar por institución
    const institutionsMap = new Map();
    rows.forEach((row: any) => {
      const {
        institutionId,
        institutionName,
        serviceId,
        serviceName,
        inoperativePumpsCount,
        totalPumps,
      } = row;

      if (!institutionsMap.has(institutionId)) {
        institutionsMap.set(institutionId, {
          institutionId,
          institutionName,
          services: [],
        });
      }

      institutionsMap.get(institutionId).services.push({
        serviceId,
        serviceName,
        inoperativePumpsCount,
        totalPumps,
      });
    });

    return { institutions: Array.from(institutionsMap.values()) };
  }

  // State by Model - Estado por modelo (bombas inoperativas)
  async getStateByModel(userId: number,role:string): Promise<any> {
    const institutionIds = await this.getUserInstitutions(userId,role);

    if (institutionIds.length === 0) {
      return { models: [] };
    }

    const placeholders = institutionIds.map(() => "?").join(",");
    const query = `
      SELECT
        m.name as modelName,
        COUNT(CASE WHEN i.status IN ('Inoperativo', 'En reparación', 'Fuera de servicio', 'Dañado') THEN 1 END) as inoperativePumps,
        COUNT(*) as totalPumps
      FROM inventory i
      JOIN models m ON i.model_id = m.id
      WHERE i.institution_id IN (${placeholders})
      GROUP BY m.id, m.name
      ORDER BY inoperativePumps DESC, m.name
    `;

    const [rows] = await this.connection.execute<RowDataPacket[]>(
      query,
      institutionIds,
    );
    return { models: rows };
  }
}
