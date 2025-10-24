export interface InstitutionSalesRep {
    id: number;
    institutionId: number;
    userId: number;
    assignedAt: Date;
    assignedBy: number;
}

// intefaz para devolver los datos completos del representante de ventas de una institucion
export interface InstitutionSalesRepDetails {
  id: number;
  institutionId: number;
  institutionName: string;
  userId: number;
  userName: string;
  assignedById: number;
  assignedByName: string;
  assignedAt: Date;
}

export interface GroupedIsrByUser {
  userId: number;
  userName: string;
  institutions: Omit<InstitutionSalesRepDetails, "userId" | "userName">[];
}
