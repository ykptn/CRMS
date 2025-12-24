import { Equipment } from '../types/equipment';
import { apiClient } from './apiClient';

type ApiEquipmentResponse = {
  id: number;
  name: string;
  dailyPrice: number;
};

export class EquipmentSelectionService {
  private cachedEquipment: Equipment[] = [];

  async listAvailable(): Promise<Equipment[]> {
    const equipment = await apiClient.get<ApiEquipmentResponse[]>('/api/equipment');
    this.cachedEquipment = equipment.map((item) => ({
      id: String(item.id),
      name: item.name,
      price: Number(item.dailyPrice),
    }));
    return this.cachedEquipment;
  }

  async upsert(equipment: Omit<Equipment, 'id'> & { id?: string }): Promise<Equipment> {
    const numericId = equipment.id ? Number(equipment.id) : null;
    if (numericId !== null && Number.isNaN(numericId)) {
      throw new Error('Invalid equipment id.');
    }
    const payload = {
      name: equipment.name,
      dailyPrice: equipment.price,
    };
    const response = equipment.id
      ? await apiClient.put<ApiEquipmentResponse>(`/api/admin/equipment/${numericId}`, payload, { auth: true })
      : await apiClient.post<ApiEquipmentResponse>('/api/admin/equipment', payload, { auth: true });
    const mapped = {
      id: String(response.id),
      name: response.name,
      price: Number(response.dailyPrice),
    };
    this.cachedEquipment = this.cachedEquipment.map((item) => (item.id === mapped.id ? mapped : item));
    return mapped;
  }

  async delete(equipmentId: string): Promise<void> {
    const numericId = Number(equipmentId);
    if (Number.isNaN(numericId)) {
      throw new Error('Invalid equipment id.');
    }
    await apiClient.delete<void>(`/api/admin/equipment/${numericId}`, { auth: true });
    this.cachedEquipment = this.cachedEquipment.filter((item) => item.id !== equipmentId);
  }

  calculateTotal(equipmentIds: string[]): number {
    const items = this.cachedEquipment.filter((item) => equipmentIds.includes(item.id));
    return items.reduce((sum, item) => sum + item.price, 0);
  }
}

export const equipmentSelectionService = new EquipmentSelectionService();
