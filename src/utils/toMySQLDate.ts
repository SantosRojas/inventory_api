export function toMySQLDate(date: string | Date): string {
  return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
}