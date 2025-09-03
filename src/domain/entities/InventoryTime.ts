export interface InventoryTimeForDB {
  id: string;
  userId: number;
  inventoryId: number;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  success: boolean;
}

export interface InventoryTime {
  id: string;
  userId: number;
  inventoryId: number;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  success: boolean;
}