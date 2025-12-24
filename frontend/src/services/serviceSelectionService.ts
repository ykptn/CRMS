import { AdditionalService } from '../types/service';
import { apiClient } from './apiClient';

type ApiServiceResponse = {
  id: number;
  name: string;
  dailyPrice: number;
};

export class ServiceSelectionService {
  private cachedServices: AdditionalService[] = [];

  async listAvailable(): Promise<AdditionalService[]> {
    const services = await apiClient.get<ApiServiceResponse[]>('/api/services');
    this.cachedServices = services.map((service) => ({
      id: String(service.id),
      name: service.name,
      price: Number(service.dailyPrice),
      category: 'Convenience',
    }));
    return this.cachedServices;
  }

  async upsert(service: Omit<AdditionalService, 'id'> & { id?: string }): Promise<AdditionalService> {
    const numericId = service.id ? Number(service.id) : null;
    if (numericId !== null && Number.isNaN(numericId)) {
      throw new Error('Invalid service id.');
    }
    const payload = {
      name: service.name,
      dailyPrice: service.price,
    };
    const response = service.id
      ? await apiClient.put<ApiServiceResponse>(`/api/admin/services/${numericId}`, payload, { auth: true })
      : await apiClient.post<ApiServiceResponse>('/api/admin/services', payload, { auth: true });
    const mapped = {
      id: String(response.id),
      name: response.name,
      price: Number(response.dailyPrice),
      category: service.category,
    };
    this.cachedServices = this.cachedServices.map((item) => (item.id === mapped.id ? mapped : item));
    return mapped;
  }

  async delete(serviceId: string): Promise<void> {
    const numericId = Number(serviceId);
    if (Number.isNaN(numericId)) {
      throw new Error('Invalid service id.');
    }
    await apiClient.delete<void>(`/api/admin/services/${numericId}`, { auth: true });
    this.cachedServices = this.cachedServices.filter((service) => service.id !== serviceId);
  }

  calculateTotal(serviceIds: string[]): number {
    const source = this.cachedServices;
    const services = source.filter((service) => serviceIds.includes(service.id));
    return services.reduce((sum, service) => sum + service.price, 0);
  }
}

export const serviceSelectionService = new ServiceSelectionService();
