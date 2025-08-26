import { DashboardRepository } from '../infrastructure/repositories/DashboardRepository';
import { HttpError } from '../utils/ErrorHandler';

export class DashboardService {
  
  private repository: DashboardRepository;
  
  constructor(repository: DashboardRepository) {
    this.repository = repository;
  }
  
  async getOverdueMaintenanceSummary(id:number,role:string): Promise<any> {
    try {
      return await this.repository.getOverdueMaintenanceSummary(id,role);
    } catch (error: any) {
      throw new HttpError('Error al obtener el resumen de mantenimientos vencidos', 500, error.message);
    }
  }
  
  async getSummary(userId: number,role:string): Promise<any> {
    try {
      return await this.repository.getSummary(userId,role);
    } catch (error: any) {
      throw new HttpError('Error al obtener resumen del dashboard', 500, error.message);
    }
  }

  async getModelDistribution(userId: number,role:string): Promise<any> {
    try {
      return await this.repository.getModelDistribution(userId,role);
    } catch (error: any) {
      throw new HttpError('Error al obtener distribución por modelos', 500, error.message);
    }
  }

  async getModelDistributionByInstitution(userId: number,role:string): Promise<any> {
    try {
      return await this.repository.getModelDistributionByInstitution(userId,role);
    } catch (error: any) {
      throw new HttpError('Error al obtener distribución de modelos por institución', 500, error.message);
    }
  }

  async getInventoryProgressByInstitution(userId: number,role:string): Promise<any> {
    try {
      return await this.repository.getInventoryProgressByInstitution(userId,role);
    } catch (error: any) {
      throw new HttpError('Error al obtener progreso por institución', 500, error.message);
    }
  }

  async getInventoryProgressByService(userId: number,role:string): Promise<any> {
    try {
      return await this.repository.getInventoryProgressByService(userId,role);
    } catch (error: any) {
      throw new HttpError('Error al obtener progreso por servicio', 500, error.message);
    }
  }




  async getTopInventoryTakers(userId: number,role:string): Promise<any> {
    try {
      return await this.repository.getTopInventoryTakers(userId,role);
    } catch (error: any) {
      throw new HttpError('Error al obtener inventariadores top', 500, error.message);
    }
  }

  async getStateByService(userId: number, role:string): Promise<any> {
    try {
      return await this.repository.getStateByService(userId,role);
    } catch (error: any) {
      throw new HttpError('Error al obtener estado por servicio', 500, error.message);
    }
  }

  async getStateByModel(userId: number,role:string): Promise<any> {
    try {
      return await this.repository.getStateByModel(userId,role);
    } catch (error: any) {
      throw new HttpError('Error al obtener estado por modelo', 500, error.message);
    }
  }
}
