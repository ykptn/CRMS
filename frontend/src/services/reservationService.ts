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
    return listReservations().filter((reservation) => reservation.memberId === memberId);
  }

  async listAllReservations(): Promise<ReservationModel[]> {
    return listReservations();
  }

  async getReservationById(reservationId: string): Promise<ReservationModel | undefined> {
    return listReservations().find((reservation) => reservation.id === reservationId);
  }

  async updateReservationStatus(
    reservationId: string,
    status: ReservationStatus
  ): Promise<ReservationModel> {
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
