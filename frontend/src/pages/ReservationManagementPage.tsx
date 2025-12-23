import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { carCatalogService } from '../services/carCatalogService';
import { formatDate } from '../utils/date';
import type { ReservationModel } from '../types/reservation';
import type { BranchLocation, CarModel } from '../types/car';
import type { AuthUser } from '../types/auth';

export default function ReservationManagementPage() {
  const [reservations, setReservations] = useState<ReservationModel[]>([]);
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [cars, setCars] = useState<CarModel[]>([]);
  const [members, setMembers] = useState<AuthUser[]>([]);

  const refresh = () => {
    Promise.all([
      adminService.listReservations(),
      adminService.listBranches(),
      carCatalogService.getCars(),
      adminService.listMembers(),
    ]).then(([reservationList, branchList, carList, memberList]) => {
      setReservations(reservationList);
      setBranches(branchList);
      setCars(carList);
      setMembers(memberList);
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleStatusChange = async (reservationId: string, status: ReservationModel['status']) => {
    await adminService.updateReservationStatus(reservationId, status);
    refresh();
  };

  return (
    <div>
      <h2>Reservation management</h2>
      <table width="100%" cellPadding={10}>
        <thead>
          <tr>
            <th align="left">Reservation</th>
            <th align="left">Member</th>
            <th align="left">Vehicle</th>
            <th align="left">Dates</th>
            <th align="left">Status</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => {
            const member = members.find((item) => item.id === reservation.memberId);
            const car = cars.find((item) => item.id === reservation.carId);
            const pick = branches.find((item) => item.id === reservation.pickUpLocationId);
            const drop = branches.find((item) => item.id === reservation.dropOffLocationId);
            return (
              <tr key={reservation.id}>
                <td>{reservation.reservationNumber}</td>
                <td>{member?.fullName}</td>
                <td>
                  {car ? `${car.brand} ${car.model}` : reservation.carId}
                  <br />
                  <small>{pick?.city}</small>
                </td>
                <td>
                  {formatDate(reservation.pickUpDate)} – {formatDate(reservation.dropOffDate)}
                  <br />
                  <small>{drop?.city}</small>
                </td>
                <td>{reservation.status}</td>
                <td>
                  <select
                    value={reservation.status}
                    onChange={(event) =>
                      handleStatusChange(reservation.id, event.target.value as ReservationModel['status'])
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
