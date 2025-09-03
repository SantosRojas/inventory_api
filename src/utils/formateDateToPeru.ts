export function toPeruDateString(date: Date): string {
  const peruOffsetMinutes = -5 * 60;
  const localDate = new Date(date.getTime() + peruOffsetMinutes * 60000);
  return localDate.toISOString().slice(0, 19).replace('T', ' ');
}
