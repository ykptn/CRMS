import { BranchLocation, CarFilter, CarModel } from '../types/car';
import { listCars, listReservations, getLocations } from './mockDatabase';

function isBetween(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

function hasOverlap(
  requestedStart: Date,
  requestedEnd: Date,
  reservationStart: Date,
  reservationEnd: Date
): boolean {
  return (
    isBetween(reservationStart, requestedStart, requestedEnd) ||
    isBetween(reservationEnd, requestedStart, requestedEnd) ||
    (reservationStart <= requestedStart && reservationEnd >= requestedEnd)
  );
}

export class CarCatalogService {
  async listLocations(): Promise<BranchLocation[]> {
    return getLocations();
  }

  async getCars(filter: CarFilter = {}): Promise<CarModel[]> {
    const cars = listCars();
    const reservations = listReservations().filter((res) => res.status === 'Active');
    const pick = filter.pickUpDate ? new Date(filter.pickUpDate) : null;
    const drop = filter.dropOffDate ? new Date(filter.dropOffDate) : null;

    return cars.filter((car) => {
      if (!this.matchesFilter(car, filter)) {
        return false;
      }

      if (pick && drop) {
        const conflicting = reservations.some(
          (reservation) =>
            reservation.carId === car.id &&
            hasOverlap(pick, drop, new Date(reservation.pickUpDate), new Date(reservation.dropOffDate))
        );
        return !conflicting;
      }

      return true;
    });
  }

  async getCarDetails(carId: string): Promise<CarModel | undefined> {
    return listCars().find((car) => car.id === carId);
  }

  private matchesFilter(car: CarModel, filter: CarFilter): boolean {
    if (filter.locationId && car.locationId !== filter.locationId) {
      return false;
    }
    if (filter.brand && car.brand.toLowerCase() !== filter.brand.toLowerCase()) {
      return false;
    }
    if (filter.category && car.category !== filter.category) {
      return false;
    }
    if (typeof filter.minPrice === 'number' && car.dailyPrice < filter.minPrice) {
      return false;
    }
    if (typeof filter.maxPrice === 'number' && car.dailyPrice > filter.maxPrice) {
      return false;
    }
    if (filter.seats && car.seats < filter.seats) {
      return false;
    }
    if (filter.transmission && car.transmission !== filter.transmission) {
      return false;
    }
    if (filter.searchText) {
      const text = filter.searchText.toLowerCase();
      const matchesText =
        car.brand.toLowerCase().includes(text) ||
        car.model.toLowerCase().includes(text) ||
        car.features.some((feature) => feature.toLowerCase().includes(text));
      if (!matchesText) {
        return false;
      }
    }
    return true;
  }
}

export const carCatalogService = new CarCatalogService();
