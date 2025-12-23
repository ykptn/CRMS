import {
  generateId,
  listReservations,
  listServices,
  mutateDb,
  saveReservation,
} from './mockDatabase';
import { ReservationDraft, ReservationModel, ReservationStatus } from '../types/reservation';
import { AdditionalService } from '../types/service';
import { CarModel } from '../types/car';
import { carCatalogService } from './carCatalogService';
import { apiClient } from './apiClient';

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
};

function diffInDays(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.ceil((end.getTime() - start.getTime()) / msPerDay);
  return Math.max(1, diff);
}

function hasOverlap(
  requestedStart: Date,
  requestedEnd: Date,
  reservationStart: Date,
  reservationEnd: Date
): boolean {
  return (
    requestedStart <= reservationEnd &&
    requestedEnd >= reservationStart
  );
}

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

    if (canUseApi && draft.pickUpDate && draft.dropOffDate) {
      try {
        const serviceIds = draft.services ?? [];
        const additionalServiceIds = serviceIds
          .map((id) => Number(id))
          .filter((id) => !Number.isNaN(id));
        const response = await apiClient.post<ApiReservationSummary>('/api/reservations', {
          memberId: numericMemberId,
          carId: numericCarId,
          pickupLocationId: numericPickupId,
          dropoffLocationId: numericDropoffId,
          startDate: draft.pickUpDate,
          endDate: draft.dropOffDate,
          additionalServiceIds,
        });
        const services = listServices().filter((service) =>
          serviceIds.includes(service.id)
        );
        return this.mapReservation(response, services, draft.notes);
      } catch (err) {
        // Fall back to mock flow.
      }
    }

    return this.createReservationMock(memberId, draft);
  }

  private async createReservationMock(memberId: string, draft: ReservationDraft): Promise<ReservationModel> {
    if (!draft.carId || !draft.pickUpDate || !draft.dropOffDate || !draft.pickUpLocationId || !draft.dropOffLocationId) {
      throw new Error('Reservation data is incomplete.');
    }

    const car = await carCatalogService.getCarDetails(draft.carId);
    if (!car) {
      throw new Error('Selected car could not be found.');
    }

    const pick = new Date(draft.pickUpDate);
    const drop = new Date(draft.dropOffDate);
    if (pick >= drop) {
      throw new Error('Drop-off date must be later than pick-up date.');
    }

    const activeReservations = listReservations().filter(
      (res) => res.carId === car.id && res.status === 'Active'
    );
    const overlaps = activeReservations.some((res) =>
      hasOverlap(pick, drop, new Date(res.pickUpDate), new Date(res.dropOffDate))
    );
    if (overlaps) {
      throw new Error('Selected car is not available for the chosen dates.');
    }

    const serviceIds = draft.services ?? [];
    const selectedServices = listServices().filter((service) =>
      serviceIds.includes(service.id)
    );
    const totalCost = this.calculateTotalCost(car, pick, drop, selectedServices);

    const reservation: ReservationModel = {
      id: generateId('res'),
      reservationNumber: `RSV-${Date.now().toString().slice(-6)}`,
      memberId,
      carId: car.id,
      pickUpLocationId: draft.pickUpLocationId,
      dropOffLocationId: draft.dropOffLocationId,
      pickUpDate: pick.toISOString(),
      dropOffDate: drop.toISOString(),
      totalCost,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      services: selectedServices,
      notes: draft.notes,
    };

    saveReservation(reservation);
    return reservation;
  }

  async listMemberReservations(memberId: string): Promise<ReservationModel[]> {
    const numericMemberId = Number(memberId);
    if (!Number.isNaN(numericMemberId)) {
      try {
        const reservations = await apiClient.get<ApiReservationSummary[]>(
          `/api/admin/members/${numericMemberId}/reservations`,
          { auth: true }
        );
        return reservations.map((reservation) => this.mapReservation(reservation));
      } catch (err) {
        // Fall back to mock data.
      }
    }
    return listReservations().filter((reservation) => reservation.memberId === memberId);
  }

  async listAllReservations(): Promise<ReservationModel[]> {
    try {
      const reservations = await apiClient.get<ApiReservationSummary[]>('/api/admin/reservations', { auth: true });
      return reservations.map((reservation) => this.mapReservation(reservation));
    } catch (err) {
      return listReservations();
    }
  }

  async getReservationById(reservationId: string): Promise<ReservationModel | undefined> {
    const numericId = Number(reservationId);
    if (!Number.isNaN(numericId)) {
      try {
        const reservations = await apiClient.get<ApiReservationSummary[]>('/api/admin/reservations', { auth: true });
        return reservations.map((reservation) => this.mapReservation(reservation)).find((reservation) => reservation.id === reservationId);
      } catch (err) {
        // Fall back to mock data.
      }
    }
    return listReservations().find((reservation) => reservation.id === reservationId);
  }

  async updateReservationStatus(
    reservationId: string,
    status: ReservationStatus
  ): Promise<ReservationModel> {
    const numericId = Number(reservationId);
    if (!Number.isNaN(numericId)) {
      try {
        if (status === 'Cancelled') {
          const response = await apiClient.post<ApiReservationSummary>(`/api/reservations/${numericId}/cancel`);
          return this.mapReservation(response);
        }
        if (status === 'Completed') {
          const response = await apiClient.post<ApiReservationSummary>(`/api/reservations/${numericId}/complete`);
          return this.mapReservation(response);
        }
      } catch (err) {
        // Fall back to mock update.
      }
    }

    let updated: ReservationModel | undefined;
    mutateDb((db) => {
      db.reservations = db.reservations.map((reservation) => {
        if (reservation.id !== reservationId) {
          return reservation;
        }

        updated = {
          ...reservation,
          status,
          updatedAt: new Date().toISOString(),
        };
        return updated!;
      });

      if (updated) {
        db.cars = db.cars.map((car) =>
          car.id === updated!.carId ? { ...car, available: updated!.status !== 'Active' } : car
        );
      }
    });

    if (!updated) {
      throw new Error('Reservation not found.');
    }

    return updated;
  }

  async cancelReservation(reservationId: string): Promise<ReservationModel> {
    return this.updateReservationStatus(reservationId, 'Cancelled');
  }

  private mapReservation(
    reservation: ApiReservationSummary,
    services: AdditionalService[] = [],
    notes?: string
  ): ReservationModel {
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
      services,
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

  private calculateTotalCost(
    car: CarModel,
    pick: Date,
    drop: Date,
    services: AdditionalService[]
  ): number {
    const rentalDays = diffInDays(pick, drop);
    const serviceTotal = services.reduce((sum, service) => sum + service.price, 0);
    return rentalDays * car.dailyPrice + serviceTotal;
  }
}

export const reservationService = new ReservationService();
