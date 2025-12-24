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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDropOffId, setEditingDropOffId] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

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

  const startEdit = (reservation: ReservationModel) => {
    setEditingId(reservation.id);
    setEditingDropOffId(reservation.dropOffLocationId);
    setActionError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingDropOffId('');
  };

  const handleSave = async (reservation: ReservationModel) => {
    try {
      const updated = await reservationService.updateReservation(reservation, {
        dropOffLocationId: editingDropOffId,
      });
      setReservations((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      cancelEdit();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to update reservation.');
    }
  };

  const handleCancel = async (reservation: ReservationModel) => {
    try {
      const updated = await reservationService.cancelReservation(reservation.id);
      setReservations((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to cancel reservation.');
    }
  };

  return (
    <div>
      <h2>Your reservations</h2>
      {actionError && <p style={{ color: '#dc2626' }}>{actionError}</p>}
      <table width="100%" cellPadding={12}>
        <thead>
          <tr>
            <th align="left">Reservation</th>
            <th align="left">Vehicle</th>
            <th align="left">Pick-up</th>
            <th align="left">Drop-off</th>
            <th align="left">Status</th>
            <th align="left">Total</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => {
            const car = cars.find((c) => c.id === reservation.carId);
            const pick = locations.find((loc) => loc.id === reservation.pickUpLocationId);
            const drop = locations.find((loc) => loc.id === reservation.dropOffLocationId);
            const isEditing = editingId === reservation.id;
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
                  {isEditing ? (
                    <div style={{ display: 'grid', gap: '0.25rem' }}>
                      <select
                        value={editingDropOffId}
                        onChange={(event) => setEditingDropOffId(event.target.value)}
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                      <small>Current: {drop?.name}</small>
                    </div>
                  ) : (
                    <>
                      {formatDate(reservation.dropOffDate)}
                      <br />
                      <small>{drop?.name}</small>
                    </>
                  )}
                </td>
                <td>{reservation.status}</td>
                <td>₺{reservation.totalCost}</td>
                <td>
                  {reservation.status === 'Active' ? (
                    isEditing ? (
                      <>
                        <button type="button" onClick={() => handleSave(reservation)}>
                          Save
                        </button>
                        <button type="button" onClick={cancelEdit} style={{ marginLeft: '0.5rem' }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEdit(reservation)}>
                          Edit drop-off
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancel(reservation)}
                          style={{ marginLeft: '0.5rem' }}
                        >
                          Cancel reservation
                        </button>
                      </>
                    )
                  ) : (
                    <span>-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
