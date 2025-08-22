// Definición de la entidad Inventory
export interface Inventory {
  id: number;
  serialNumber: string;
  qrCode: string;
  modelId: number;
  institutionId: number;
  serviceId: number;
  inventoryTakerId: number;
  inventoryDate: string | Date;
  status: string; // o enum
  lastMaintenanceDate: string | Date;
  createdAt: Date;
}
