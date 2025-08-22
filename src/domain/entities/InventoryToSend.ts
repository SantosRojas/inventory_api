export interface InventoryToSend {
    id: number;
    serialNumber: string;
    qrCode: string;
    inventoryDate: Date;
    status: string;
    lastMaintenanceDate?: Date | null;
    createdAt: Date;
    model: string;
    institution: string;
    service: string;
    inventoryManager: string;
}