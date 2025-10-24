import { GroupedIsrByUser, InstitutionSalesRepDetails } from "../domain/entities/InstitutionSalesRep";

export function groupIsrByUser(data: InstitutionSalesRepDetails[]): GroupedIsrByUser[] {
  const grouped = new Map<number, GroupedIsrByUser>();

  for (const item of data) {
    if (!grouped.has(item.userId)) {
      grouped.set(item.userId, {
        userId: item.userId,
        userName: item.userName,
        institutions: [],
      });
    }

    grouped.get(item.userId)!.institutions.push({
      id: item.id,
      institutionId: item.institutionId,
      institutionName: item.institutionName,
      assignedById: item.assignedById,
      assignedByName: item.assignedByName,
      assignedAt: item.assignedAt,
    });
  }

  return Array.from(grouped.values());
}