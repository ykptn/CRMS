import { AdditionalService } from '../types/service';
import { generateId, listServices, saveServices } from './mockDatabase';

export class ServiceSelectionService {
  async listAvailable(): Promise<AdditionalService[]> {
    return listServices();
  }

  async upsert(service: Omit<AdditionalService, 'id'> & { id?: string }): Promise<AdditionalService> {
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
    const remaining = listServices().filter((service) => service.id !== serviceId);
    saveServices(remaining);
  }

  calculateTotal(serviceIds: string[]): number {
    const services = listServices().filter((service) => serviceIds.includes(service.id));
    return services.reduce((sum, service) => sum + service.price, 0);
  }
}

export const serviceSelectionService = new ServiceSelectionService();
