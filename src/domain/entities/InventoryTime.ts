export interface InventoryTime {
  id: string;
  userId: number;
  inventoryId: number;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  success: boolean;
}