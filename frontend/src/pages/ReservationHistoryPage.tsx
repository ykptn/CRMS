import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { reservationService } from '../services/reservationService';
import { carCatalogService } from '../services/carCatalogService';
import { formatDate } from '../utils/date';
import type { ReservationModel } from '../types/reservation';
import type { BranchLocation, CarModel } from '../types/car';

export default function ReservationHistoryPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationModel[]>([]);
  const [cars, setCars] = useState<CarModel[]>([]);
  const [locations, setLocations] = useState<BranchLocation[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }
    (async () => {
      const [reservationList, carList, branchList] = await Promise.all([
        reservationService.listMemberReservations(user.id),
        carCatalogService.getCars(),
        carCatalogService.listLocations(),
      ]);
      setReservations(reservationList);
      setCars(carList);
      setLocations(branchList);
    })();
  }, [user]);

  if (!user) {
    return <p>Please sign in to view your reservations.</p>;
  }

  if (reservations.length === 0) {
    return <p>You have not created any reservations yet.</p>;
  }

  return (
    <div>
      <h2>Your reservations</h2>
      <table width="100%" cellPadding={12}>
        <thead>
          <tr>
            <th align="left">Reservation</th>
            <th align="left">Vehicle</th>
            <th align="left">Pick-up</th>
            <th align="left">Drop-off</th>
            <th align="left">Status</th>
            <th align="left">Total</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => {
            const car = cars.find((c) => c.id === reservation.carId);
            const pick = locations.find((loc) => loc.id === reservation.pickUpLocationId);
            const drop = locations.find((loc) => loc.id === reservation.dropOffLocationId);
            return (
              <tr key={reservation.id}>
                <td>{reservation.reservationNumber}</td>
                <td>
                  {car ? `${car.brand} ${car.model}` : reservation.carId}
                </td>
                <td>
                  {formatDate(reservation.pickUpDate)}
                  <br />
                  <small>{pick?.name}</small>
                </td>
                <td>
                  {formatDate(reservation.dropOffDate)}
                  <br />
                  <small>{drop?.name}</small>
                </td>
                <td>{reservation.status}</td>
                <td>₺{reservation.totalCost}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
