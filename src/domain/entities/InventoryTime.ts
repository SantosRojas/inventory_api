
export interface InventoryTime {
  id: string;
  userId: number;
  inventoryId: number;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  success: boolean;
}