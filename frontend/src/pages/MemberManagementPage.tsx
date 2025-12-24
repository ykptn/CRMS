import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import type { AuthUser } from '../types/auth';
import type { ReservationModel } from '../types/reservation';

export default function MemberManagementPage() {
  const [members, setMembers] = useState<AuthUser[]>([]);
  const [reservations, setReservations] = useState<ReservationModel[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  useEffect(() => {
    adminService.listMembers().then(setMembers);
    adminService.listReservations().then(setReservations);
  }, []);

  const reservationCount = reservations.reduce<Record<string, number>>((acc, reservation) => {
    acc[reservation.memberId] = (acc[reservation.memberId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h2>Members</h2>
      <table width="100%" cellPadding={12}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Email</th>
            <th align="left">Phone</th>
            <th align="left">License</th>
            <th align="left">Reservations</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.fullName}</td>
              <td>{member.email}</td>
              <td>{member.phone}</td>
              <td>{member.licenseNumber}</td>
              <td>{reservationCount[member.id] ?? 0}</td>
              <td>
                <button type="button" onClick={() => setSelectedMemberId(member.id)}>
                  View history
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedMemberId && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3>Reservation history</h3>
          <table width="100%" cellPadding={12}>
            <thead>
              <tr>
                <th align="left">Reservation</th>
                <th align="left">Car</th>
                <th align="left">Pick-up</th>
                <th align="left">Drop-off</th>
                <th align="left">Status</th>
                <th align="left">Total</th>
              </tr>
            </thead>
            <tbody>
              {reservations
                .filter((reservation) => reservation.memberId === selectedMemberId)
                .map((reservation) => (
                  <tr key={reservation.id}>
                    <td>{reservation.reservationNumber}</td>
                    <td>{reservation.carId}</td>
                    <td>{reservation.pickUpDate}</td>
                    <td>{reservation.dropOffDate}</td>
                    <td>{reservation.status}</td>
                    <td>₺{reservation.totalCost}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
