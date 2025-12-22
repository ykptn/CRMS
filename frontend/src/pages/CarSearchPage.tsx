import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CarFilterPanel from '../components/CarFilterPanel';
import CarList from '../components/CarList';
import { useCarSearch } from '../hooks/useCarSearch';
import { useAuth } from '../hooks/useAuth';
import type { CarModel } from '../types/car';

export default function CarSearchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, updateFilters, resetFilters, search } = useCarSearch();
  const [selectedCar, setSelectedCar] = useState<CarModel | null>(null);

  useEffect(() => {
    if (selectedCar && !state.cars.some((car) => car.id === selectedCar.id)) {
      setSelectedCar(null);
    }
  }, [state.cars, selectedCar]);

  const handleReserve = () => {
    if (!selectedCar) {
      return;
    }

    const reservationState = {
      carId: selectedCar.id,
      pickUpDate: state.filters.pickUpDate,
      dropOffDate: state.filters.dropOffDate,
      pickUpLocationId: state.filters.locationId,
    };

    if (!user) {
      navigate('/login', { state: { from: '/reservations/new', ...reservationState } });
      return;
    }

    navigate('/reservations/new', { state: reservationState });
  };

  return (
    <div>
      <h1>Find your next ride</h1>
      <CarFilterPanel
        filters={state.filters}
        locations={state.locations}
        onChange={updateFilters}
        onReset={resetFilters}
        onSearch={search}
      />
      {state.error && <p style={{ color: '#dc2626' }}>{state.error}</p>}
      {state.loading ? (
        <p>Loading cars...</p>
      ) : (
        <>
          <CarList cars={state.cars} onSelect={setSelectedCar} selectedCarId={selectedCar?.id} />
          <div style={{ marginTop: '1rem' }}>
            <button type="button" onClick={handleReserve} disabled={!selectedCar}>
              Continue with selected car
            </button>
          </div>
        </>
      )}
    </div>
  );
}
