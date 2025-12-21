import { AdditionalService } from './service';

export type ReservationStatus = 'Active' | 'Completed' | 'Cancelled';

export interface ReservationModel {
  id: string;
  reservationNumber: string;
  memberId: string;
  carId: string;
  pickUpLocationId: string;
  dropOffLocationId: string;
  pickUpDate: string;
  dropOffDate: string;
  totalCost: number;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  services: AdditionalService[];
  notes?: string;
}

export interface ReservationDraft {
  carId?: string;
  pickUpLocationId?: string;
  dropOffLocationId?: string;
  pickUpDate?: string;
  dropOffDate?: string;
  services: string[];
  notes?: string;
}
