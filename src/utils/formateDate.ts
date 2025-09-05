export function formateDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 19).replace("T", " ");
}
