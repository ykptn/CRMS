import { useEffect, useState } from 'react';
import MemberProfileForm from '../components/MemberProfileForm';
import ReservationSummaryCard from '../components/ReservationSummaryCard';
import { useAuth } from '../hooks/useAuth';
import { userProfileService } from '../services/userProfileService';
import { reservationService } from '../services/reservationService';
import { carCatalogService } from '../services/carCatalogService';
import type { AuthUser } from '../types/auth';
import type { BranchLocation, CarModel } from '../types/car';
import type { ReservationModel } from '../types/reservation';

export default function MemberDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [locations, setLocations] = useState<BranchLocation[]>([]);
  const [reservations, setReservations] = useState<ReservationModel[]>([]);
  const [cars, setCars] = useState<Record<string, CarModel>>({});

  useEffect(() => {
    if (!user) {
      return;
    }
    (async () => {
      const [memberProfile, branches, reservationsList, fleet] = await Promise.all([
        userProfileService.getProfile(user.id),
        userProfileService.listLocations(),
        reservationService.listMemberReservations(user.id),
        carCatalogService.getCars(),
      ]);
      setProfile(memberProfile);
      setLocations(branches);
      setReservations(reservationsList);
      setCars(
        fleet.reduce<Record<string, CarModel>>((acc, car) => {
          acc[car.id] = car;
          return acc;
        }, {})
      );
    })();
  }, [user]);

  if (!user || !profile) {
    return <p>Please sign in to see your personalized dashboard.</p>;
  }

  const handleSave = async (updates: Partial<AuthUser>) => {
    const updated = await userProfileService.updateProfile(user.id, updates);
    setProfile(updated);
  };

  return (
    <div>
      <h1>Welcome back, {profile.fullName.split(' ')[0]}</h1>
      <section style={{ margin: '1rem 0' }}>
        <MemberProfileForm profile={profile} locations={locations} onSubmit={handleSave} />
      </section>
      <section>
        <h2>Recent reservations</h2>
        {reservations.length === 0 ? (
          <p>No reservations yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {reservations.slice(0, 3).map((reservation) => (
              <ReservationSummaryCard
                key={reservation.id}
                reservation={reservation}
                car={cars[reservation.carId]}
                locations={locations}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
