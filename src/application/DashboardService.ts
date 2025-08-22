import { DashboardRepository } from '../infrastructure/repositories/DashboardRepository';
import { HttpError } from '../utils/ErrorHandler';

export class DashboardService {
  
  private repository: DashboardRepository;
  
  constructor(repository: DashboardRepository) {
    this.repository = repository;
  }
  
  async getOverdueMaintenanceSummary(): Promise<any> {
    try {
      return await this.repository.getOverdueMaintenanceSummary();
    } catch (error: any) {
      throw new HttpError('Error al obtener el resumen de mantenimientos vencidos', 500, error.message);
    }
  }
  
  async getSummary(userId: number): Promise<any> {
    try {
      return await this.repository.getSummary(userId);
    } catch (error: any) {
      throw new HttpError('Error al obtener resumen del dashboard', 500, error.message);
    }
  }

  async getModelDistribution(userId: number): Promise<any> {
    try {
      return await this.repository.getModelDistribution(userId);
    } catch (error: any) {
      throw new HttpError('Error al obtener distribución por modelos', 500, error.message);
    }
  }

  async getModelDistributionByInstitution(userId: number): Promise<any> {
    try {
      return await this.repository.getModelDistributionByInstitution(userId);
    } catch (error: any) {
      throw new HttpError('Error al obtener distribución de modelos por institución', 500, error.message);
    }
  }

  async getInventoryProgressByInstitution(userId: number): Promise<any> {
    try {
      return await this.repository.getInventoryProgressByInstitution(userId);
    } catch (error: any) {
      throw new HttpError('Error al obtener progreso por institución', 500, error.message);
    }
  }

  async getInventoryProgressByService(userId: number): Promise<any> {
    try {
      return await this.repository.getInventoryProgressByService(userId);
    } catch (error: any) {
      throw new HttpError('Error al obtener progreso por servicio', 500, error.message);
    }
  }


  // async getOverdueMaintenance(): Promise<any> {
  //   try {
  //     return await this.repository.getOverdueMaintenance();
  //   } catch (error: any) {
  //     throw new HttpError('Error al obtener mantenimientos vencidos', 500, error.message);
  //   }
  // }


  async getTopInventoryTakers(userId: number): Promise<any> {
    try {
      return await this.repository.getTopInventoryTakers(userId);
    } catch (error: any) {
      throw new HttpError('Error al obtener inventariadores top', 500, error.message);
    }
  }

  async getStateByService(userId: number): Promise<any> {
    try {
      return await this.repository.getStateByService(userId);
    } catch (error: any) {
      throw new HttpError('Error al obtener estado por servicio', 500, error.message);
    }
  }

  async getStateByModel(userId: number): Promise<any> {
    try {
      return await this.repository.getStateByModel(userId);
    } catch (error: any) {
      throw new HttpError('Error al obtener estado por modelo', 500, error.message);
    }
  }
}
