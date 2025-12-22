import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReservationForm from '../components/ReservationForm';
import ServiceSelectionPanel from '../components/ServiceSelectionPanel';
import { useReservationFlow } from '../hooks/useReservationFlow';
import { useAuth } from '../hooks/useAuth';
import { carCatalogService } from '../services/carCatalogService';
import { serviceSelectionService } from '../services/serviceSelectionService';
import type { BranchLocation, CarModel } from '../types/car';
import type { AdditionalService } from '../types/service';

export default function ReservationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    carId?: string;
    pickUpDate?: string;
    dropOffDate?: string;
    pickUpLocationId?: string;
  };
  const carIdFromState = locationState?.carId;
  const statePickUpDate = locationState?.pickUpDate;
  const stateDropOffDate = locationState?.dropOffDate;
  const statePickUpLocationId = locationState?.pickUpLocationId;
  const { user } = useAuth();
  const { draft, updateDraft, toggleService, confirmReservation, submitting, error } =
    useReservationFlow(user?.id);
  const [locations, setLocations] = useState<BranchLocation[]>([]);
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [car, setCar] = useState<CarModel | null>(null);

  useEffect(() => {
    carCatalogService.listLocations().then(setLocations);
    serviceSelectionService.listAvailable().then(setServices);
  }, []);

  useEffect(() => {
    const carId = carIdFromState ?? draft.carId;
    if (!carId) {
      return;
    }
    carCatalogService.getCarDetails(carId).then((details) => {
      if (details) {
        setCar(details);
        updateDraft({ carId: details.id });
      }
    });
  }, [carIdFromState, draft.carId, updateDraft]);

  useEffect(() => {
    if (statePickUpDate && !draft.pickUpDate) {
      updateDraft({ pickUpDate: statePickUpDate });
    }
    if (stateDropOffDate && !draft.dropOffDate) {
      updateDraft({ dropOffDate: stateDropOffDate });
    }
    if (statePickUpLocationId && !draft.pickUpLocationId) {
      updateDraft({ pickUpLocationId: statePickUpLocationId });
    }
  }, [
    draft.dropOffDate,
    draft.pickUpDate,
    draft.pickUpLocationId,
    stateDropOffDate,
    statePickUpDate,
    statePickUpLocationId,
    updateDraft,
  ]);

  const handleConfirm = async () => {
    const reservation = await confirmReservation();
    if (reservation) {
      navigate('/reservations/summary', { state: { reservationId: reservation.id } });
    }
  };

  if (!car) {
    return (
      <div>
        <p>Please select a car from the catalog first.</p>
        <button type="button" onClick={() => navigate('/')}>
          Browse cars
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Complete reservation</h1>
      <section style={{ marginBottom: '1rem' }}>
        <p>
          <strong>{car.brand}</strong> {car.model} · {car.transmission} · ₺{car.dailyPrice}/day
        </p>
      </section>
      <ReservationForm
        draft={draft}
        locations={locations}
        onUpdate={updateDraft}
        onSubmit={handleConfirm}
        submitting={submitting}
      />
      <ServiceSelectionPanel
        services={services}
        selectedIds={draft.services ?? []}
        onToggle={toggleService}
      />
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
    </div>
  );
}
