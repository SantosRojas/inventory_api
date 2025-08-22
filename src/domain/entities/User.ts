// Definición de la entidad User
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  cellPhone: string;
  email: string;
  password: string;
  role_id: number;
  createdAt: Date;
  updatedAt: Date;
}
