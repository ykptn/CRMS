import { ReservationModel } from '../types/reservation';

export class NotificationService {
  async sendReservationNotification(reservation: ReservationModel, type: 'created' | 'updated' | 'cancelled'): Promise<void> {
    console.info(
      `[Notification] Reservation ${type}: ${reservation.reservationNumber} for ${reservation.pickUpDate}`
    );
  }
}

export const notificationService = new NotificationService();
