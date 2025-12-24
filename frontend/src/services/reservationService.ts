import { ReservationDraft, ReservationModel, ReservationStatus } from '../types/reservation';
import { AdditionalService } from '../types/service';
import { Equipment } from '../types/equipment';
import { apiClient } from './apiClient';
import { serviceSelectionService } from './serviceSelectionService';
import { equipmentSelectionService } from './equipmentSelectionService';

type ApiReservationSummary = {
  id: number;
  reservationNumber: string;
  memberId: number;
  carId: number;
  pickupLocationId: number;
  dropoffLocationId: number;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: 'ACTIVE' | 'CANCELED' | 'COMPLETED';
  additionalServiceIds?: number[];
  equipmentIds?: number[];
};

export class ReservationService {
  async createReservation(memberId: string, draft: ReservationDraft): Promise<ReservationModel> {
    const numericMemberId = Number(memberId);
    const numericCarId = Number(draft.carId);
    const numericPickupId = Number(draft.pickUpLocationId);
    const numericDropoffId = Number(draft.dropOffLocationId);
    const canUseApi =
      !Number.isNaN(numericMemberId) &&
      !Number.isNaN(numericCarId) &&
      !Number.isNaN(numericPickupId) &&
      !Number.isNaN(numericDropoffId);

    if (!canUseApi || !draft.pickUpDate || !draft.dropOffDate) {
      throw new Error('Reservation data is incomplete.');
    }

    const serviceIds = draft.services ?? [];
    const additionalServiceIds = serviceIds
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));
    const equipmentIds = (draft.equipments ?? [])
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));
    const response = await apiClient.post<ApiReservationSummary>(
      '/api/reservations',
      {
        memberId: numericMemberId,
        carId: numericCarId,
        pickupLocationId: numericPickupId,
        dropoffLocationId: numericDropoffId,
        startDate: draft.pickUpDate,
        endDate: draft.dropOffDate,
        additionalServiceIds,
        equipmentIds,
      },
      { auth: true }
    );
    const [services, equipment] = await Promise.all([
      serviceSelectionService.listAvailable(),
      equipmentSelectionService.listAvailable(),
    ]);
    return this.mapReservation(response, services, equipment, draft.notes);
  }

  async listMemberReservations(memberId: string): Promise<ReservationModel[]> {
    const numericMemberId = Number(memberId);
    if (!Number.isNaN(numericMemberId)) {
      const reservations = await apiClient.get<ApiReservationSummary[]>(
        `/api/members/${numericMemberId}/reservations`,
        { auth: true }
      );
      const [services, equipment] = await Promise.all([
        serviceSelectionService.listAvailable(),
        equipmentSelectionService.listAvailable(),
      ]);
      return reservations.map((reservation) => this.mapReservation(reservation, services, equipment));
    }
    throw new Error('Invalid member id.');
  }

  async listAllReservations(): Promise<ReservationModel[]> {
    const reservations = await apiClient.get<ApiReservationSummary[]>('/api/admin/reservations', { auth: true });
    const [services, equipment] = await Promise.all([
      serviceSelectionService.listAvailable(),
      equipmentSelectionService.listAvailable(),
    ]);
    return reservations.map((reservation) => this.mapReservation(reservation, services, equipment));
  }

  async getReservationById(reservationId: string): Promise<ReservationModel | undefined> {
    const numericId = Number(reservationId);
    if (Number.isNaN(numericId)) {
      throw new Error('Invalid reservation id.');
    }
    const reservations = await apiClient.get<ApiReservationSummary[]>('/api/admin/reservations', { auth: true });
    const [services, equipment] = await Promise.all([
      serviceSelectionService.listAvailable(),
      equipmentSelectionService.listAvailable(),
    ]);
    return reservations
      .map((reservation) => this.mapReservation(reservation, services, equipment))
      .find((reservation) => reservation.id === reservationId);
  }

  async updateReservationStatus(
    reservationId: string,
    status: ReservationStatus
  ): Promise<ReservationModel> {
    const numericId = Number(reservationId);
    if (Number.isNaN(numericId)) {
      throw new Error('Invalid reservation id.');
    }
    const [services, equipment] = await Promise.all([
      serviceSelectionService.listAvailable(),
      equipmentSelectionService.listAvailable(),
    ]);
    if (status === 'Cancelled') {
      const response = await apiClient.post<ApiReservationSummary>(
        `/api/reservations/${numericId}/cancel`,
        undefined,
        { auth: true }
      );
      return this.mapReservation(response, services, equipment);
    }
    if (status === 'Completed') {
      const response = await apiClient.post<ApiReservationSummary>(
        `/api/reservations/${numericId}/complete`,
        undefined,
        { auth: true }
      );
      return this.mapReservation(response, services, equipment);
    }
    throw new Error('Unsupported reservation status.');
  }

  async updateReservation(
    reservation: ReservationModel,
    updates: Partial<Pick<ReservationModel, 'pickUpLocationId' | 'dropOffLocationId' | 'pickUpDate' | 'dropOffDate'>>
  ): Promise<ReservationModel> {
    const numericId = Number(reservation.id);
    const memberId = Number(reservation.memberId);
    const carId = Number(reservation.carId);
    const pickupLocationId = Number(updates.pickUpLocationId ?? reservation.pickUpLocationId);
    const dropoffLocationId = Number(updates.dropOffLocationId ?? reservation.dropOffLocationId);
    if ([numericId, memberId, carId, pickupLocationId, dropoffLocationId].some(Number.isNaN)) {
      throw new Error('Invalid reservation data.');
    }
    const additionalServiceIds = reservation.services
      .map((service) => Number(service.id))
      .filter((id) => !Number.isNaN(id));
    const equipmentIds = reservation.equipments
      .map((item) => Number(item.id))
      .filter((id) => !Number.isNaN(id));
    const response = await apiClient.put<ApiReservationSummary>(
      `/api/reservations/${numericId}`,
      {
        memberId,
        carId,
        pickupLocationId,
        dropoffLocationId,
        startDate: updates.pickUpDate ?? reservation.pickUpDate,
        endDate: updates.dropOffDate ?? reservation.dropOffDate,
        additionalServiceIds,
        equipmentIds,
      },
      { auth: true }
    );
    const [services, equipment] = await Promise.all([
      serviceSelectionService.listAvailable(),
      equipmentSelectionService.listAvailable(),
    ]);
    return this.mapReservation(response, services, equipment);
  }

  async cancelReservation(reservationId: string): Promise<ReservationModel> {
    return this.updateReservationStatus(reservationId, 'Cancelled');
  }

  private mapReservation(
    reservation: ApiReservationSummary,
    services: AdditionalService[] = [],
    equipments: Equipment[] = [],
    notes?: string
  ): ReservationModel {
    const additionalServiceIds = reservation.additionalServiceIds;
    const resolvedServices = Array.isArray(additionalServiceIds)
      ? (() => {
          const selected = new Set(additionalServiceIds.map(String));
          return services.filter((service) => selected.has(service.id));
        })()
      : [];
    const equipmentIds = reservation.equipmentIds;
    const resolvedEquipment = Array.isArray(equipmentIds)
      ? (() => {
          const selected = new Set(equipmentIds.map(String));
          return equipments.filter((item) => selected.has(item.id));
        })()
      : [];
    return {
      id: String(reservation.id),
      reservationNumber: reservation.reservationNumber,
      memberId: String(reservation.memberId),
      carId: String(reservation.carId),
      pickUpLocationId: String(reservation.pickupLocationId),
      dropOffLocationId: String(reservation.dropoffLocationId),
      pickUpDate: reservation.startDate,
      dropOffDate: reservation.endDate,
      totalCost: Number(reservation.totalCost),
      status: this.mapStatus(reservation.status),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      services: resolvedServices,
      equipments: resolvedEquipment,
      notes,
    };
  }

  private mapStatus(status: ApiReservationSummary['status']): ReservationStatus {
    if (status === 'COMPLETED') {
      return 'Completed';
    }
    if (status === 'CANCELED') {
      return 'Cancelled';
    }
    return 'Active';
  }

}

export const reservationService = new ReservationService();
