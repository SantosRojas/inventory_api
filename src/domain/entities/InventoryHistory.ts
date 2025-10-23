export interface InventoryHistory {
  historyId: number;
  inventoryId: number;
  operation: "INSERT" | "UPDATE" | "DELETE";
  changeTimestamp: Date;

  // Usuario responsable del cambio
  responsable: string | null;

  // OLD (valores anteriores)
  oldSerialNumber: string | null;
  oldQrCode: string | null;
  oldModelName: string | null;
  oldInstitutionName: string | null;
  oldServiceName: string | null;
  oldStatus: "Operativo" | "Inoperativo" | null;
  oldManufactureDate: Date | null;
  oldLastMaintenanceDate: Date | null;
  oldInventoryDate: Date | null;
  oldInventoryTaker: string | null;

  // NEW (valores nuevos)
  newSerialNumber: string | null;
  newQrCode: string | null;
  newModelName: string | null;
  newInstitutionName: string | null;
  newServiceName: string | null;
  newStatus: "Operativo" | "Inoperativo" | null;
  newManufactureDate: Date | null;
  newLastMaintenanceDate: Date | null;
  newInventoryDate: Date | null;
  newInventoryTaker: string | null;
}
