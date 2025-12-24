import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReservationSummaryCard from '../components/ReservationSummaryCard';
import { reservationService } from '../services/reservationService';
import { carCatalogService } from '../services/carCatalogService';
import { useAuth } from '../hooks/useAuth';
import type { ReservationModel } from '../types/reservation';
import type { BranchLocation, CarModel } from '../types/car';

export default function ReservationSummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as { reservationId?: string; reservation?: ReservationModel };
  const reservationId = locationState?.reservationId;
  const reservationFromState = locationState?.reservation;
  const { user } = useAuth();
  const [reservation, setReservation] = useState<ReservationModel | null>(null);
  const [car, setCar] = useState<CarModel | undefined>();
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (reservationFromState) {
          const locations = await carCatalogService.listLocations();
          setReservation(reservationFromState);
          setBranches(locations);
          const carDetails = await carCatalogService.getCarDetails(reservationFromState.carId);
          setCar(carDetails);
          return;
        }

        if (!reservationId) {
          setError('Reservation identifier missing.');
          return;
        }

        const [res, locations] = await Promise.all([
          user?.role === 'member'
            ? reservationService.listMemberReservations(user.id).then((items) =>
                items.find((item) => item.id === reservationId)
              )
            : reservationService.getReservationById(reservationId),
          carCatalogService.listLocations(),
        ]);
        if (!res) {
          setError('Reservation could not be found.');
          return;
        }
        setReservation(res);
        setBranches(locations);
        const carDetails = await carCatalogService.getCarDetails(res.carId);
        setCar(carDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load reservation details.');
      }
    })();
  }, [reservationFromState, reservationId, user]);

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button type="button" onClick={() => navigate('/')}>
          Back to catalog
        </button>
      </div>
    );
  }

  if (!reservation || branches.length === 0) {
    return <p>Loading reservation details...</p>;
  }

  return (
    <div>
      <h1>Reservation confirmed</h1>
      <p>We have also sent a confirmation email.</p>
      <ReservationSummaryCard reservation={reservation} car={car} locations={branches} />
      <button type="button" style={{ marginTop: '1rem' }} onClick={() => navigate('/member/dashboard')}>
        Go to dashboard
      </button>
    </div>
  );
}
