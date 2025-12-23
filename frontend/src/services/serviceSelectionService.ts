import { AdditionalService } from '../types/service';
import { generateId, listServices, saveServices } from './mockDatabase';
import { apiClient } from './apiClient';

type ApiServiceResponse = {
  id: number;
  name: string;
  dailyPrice: number;
};

export class ServiceSelectionService {
  private cachedServices: AdditionalService[] = [];

  async listAvailable(): Promise<AdditionalService[]> {
    try {
      const services = await apiClient.get<ApiServiceResponse[]>('/api/services');
      this.cachedServices = services.map((service) => ({
        id: String(service.id),
        name: service.name,
        description: '',
        price: Number(service.dailyPrice),
        category: 'Convenience',
      }));
      return this.cachedServices;
    } catch (err) {
      this.cachedServices = listServices();
      return this.cachedServices;
    }
  }

  async upsert(service: Omit<AdditionalService, 'id'> & { id?: string }): Promise<AdditionalService> {
    const numericId = service.id ? Number(service.id) : null;
    if (numericId === null || !Number.isNaN(numericId)) {
      try {
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
          description: service.description,
          price: Number(response.dailyPrice),
          category: service.category,
        };
        this.cachedServices = this.cachedServices.map((item) => (item.id === mapped.id ? mapped : item));
        return mapped;
      } catch (err) {
        // Fall back to mock updates.
      }
    }

    const existing = listServices();
    const next: AdditionalService =
      service.id && existing.some((item) => item.id === service.id)
        ? (service as AdditionalService)
        : { ...service, id: generateId('srv') };

    const updated = service.id
      ? existing.map((item) => (item.id === service.id ? next : item))
      : [...existing, next];

    saveServices(updated);
    return next;
  }

  async delete(serviceId: string): Promise<void> {
    const numericId = Number(serviceId);
    if (!Number.isNaN(numericId)) {
      try {
        await apiClient.delete<void>(`/api/admin/services/${numericId}`, { auth: true });
        this.cachedServices = this.cachedServices.filter((service) => service.id !== serviceId);
        return;
      } catch (err) {
        // Fall back to mock delete.
      }
    }

    const remaining = listServices().filter((service) => service.id !== serviceId);
    saveServices(remaining);
  }

  calculateTotal(serviceIds: string[]): number {
    const source = this.cachedServices.length ? this.cachedServices : listServices();
    const services = source.filter((service) => serviceIds.includes(service.id));
    return services.reduce((sum, service) => sum + service.price, 0);
  }
}

export const serviceSelectionService = new ServiceSelectionService();
