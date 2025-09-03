
export function isAdminRole(role: string): boolean {
  return ["admin", "root"].includes(role?.toLowerCase());
}

export function canViewAllReports(role: string): boolean {
  return ["admin", "root","supervisor"].includes(role?.toLowerCase());
}