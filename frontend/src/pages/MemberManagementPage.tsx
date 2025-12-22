import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import type { AuthUser } from '../types/auth';
import type { ReservationModel } from '../types/reservation';

export default function MemberManagementPage() {
  const [members, setMembers] = useState<AuthUser[]>([]);
  const [reservations, setReservations] = useState<ReservationModel[]>([]);

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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
