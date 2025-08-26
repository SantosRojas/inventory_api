
export function isAdminRole(role: string): boolean {
  return ["admin", "root"].includes(role?.toLowerCase());
}
