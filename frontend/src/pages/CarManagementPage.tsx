import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import type { CarModel, BranchLocation } from '../types/car';

const emptyForm: Partial<CarModel> = {
  brand: '',
  model: '',
  category: 'Sedan',
  seats: 5,
  transmission: 'Automatic',
  fuelType: 'Gasoline',
  dailyPrice: 0,
  locationId: '',
  mileage: 0,
  year: new Date().getFullYear(),
  rating: 4.5,
  available: true,
  features: [],
  licensePlate: '',
};

export default function CarManagementPage() {
  const [cars, setCars] = useState<CarModel[]>([]);
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    refreshCars();
    adminService.listBranches().then(setBranches);
  }, []);

  const refreshCars = () => {
    adminService.listCars().then(setCars);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await adminService.saveCar({
      ...(form as CarModel),
      id: editingId ?? undefined,
      features: form.features ?? [],
      imageUrl: form.imageUrl,
    });
    setForm({ ...emptyForm });
    setEditingId(null);
    refreshCars();
  };

  const startEdit = (car: CarModel) => {
    setEditingId(car.id);
    setForm({
      ...car,
      brand: car.brand,
      model: car.model,
      category: car.category,
      seats: car.seats,
      transmission: car.transmission,
      fuelType: car.fuelType,
      dailyPrice: car.dailyPrice,
      locationId: car.locationId,
      mileage: car.mileage,
      year: car.year,
      rating: car.rating,
      available: car.available,
      features: car.features ?? [],
      licensePlate: car.licensePlate,
    });
  };

  const toggleAvailability = async (car: CarModel) => {
    const currentStatus = car.status ?? (car.available ? 'AVAILABLE' : 'UNAVAILABLE');
    if (currentStatus !== 'AVAILABLE' && currentStatus !== 'UNAVAILABLE') {
      return;
    }
    const nextStatus = currentStatus === 'UNAVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE';
    await adminService.updateCarStatus(car.id, nextStatus);
    refreshCars();
  };

  return (
    <div>
      <h2>Cars</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <input
          placeholder="Brand"
          value={form.brand ?? ''}
          onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))}
          required
        />
        <input
          placeholder="Model"
          value={form.model ?? ''}
          onChange={(event) => setForm((prev) => ({ ...prev, model: event.target.value }))}
          required
        />
        <input
          placeholder="License Plate"
          value={form.licensePlate ?? ''}
          onChange={(event) => setForm((prev) => ({ ...prev, licensePlate: event.target.value }))}
          required
        />
        <select
          value={form.category ?? 'Sedan'}
          onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as CarModel['category'] }))}
        >
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Hatchback">Hatchback</option>
          <option value="Truck">Truck</option>
          <option value="Van">Van</option>
        </select>
        <select
          value={form.locationId ?? ''}
          onChange={(event) => setForm((prev) => ({ ...prev, locationId: event.target.value }))}
          required
        >
          <option value="">Branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Daily price"
          value={form.dailyPrice ?? 0}
          onChange={(event) => setForm((prev) => ({ ...prev, dailyPrice: Number(event.target.value) }))}
          required
        />
        <input
          type="number"
          placeholder="Seats"
          value={form.seats ?? 5}
          onChange={(event) => setForm((prev) => ({ ...prev, seats: Number(event.target.value) }))}
          min={2}
          max={9}
        />
        <select
          value={form.transmission ?? 'Automatic'}
          onChange={(event) => setForm((prev) => ({ ...prev, transmission: event.target.value as CarModel['transmission'] }))}
        >
          <option value="Automatic">Automatic</option>
          <option value="Manual">Manual</option>
        </select>
        <select
          value={form.fuelType ?? 'Gasoline'}
          onChange={(event) => setForm((prev) => ({ ...prev, fuelType: event.target.value as CarModel['fuelType'] }))}
        >
          <option value="Gasoline">Gasoline</option>
          <option value="Diesel">Diesel</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Electric">Electric</option>
        </select>
        <button type="submit">{editingId ? 'Update car' : 'Save car'}</button>
      </form>

      <table width="100%" cellPadding={12} style={{ marginTop: '1.5rem' }}>
        <thead>
          <tr>
            <th align="left">Vehicle</th>
            <th align="left">Category</th>
            <th align="left">Daily price</th>
            <th align="left">Branch</th>
            <th align="left">Status</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car) => {
            const branch = branches.find((b) => b.id === car.locationId);
            return (
              <tr key={car.id}>
                <td>
                  {car.brand} {car.model}
                </td>
                <td>{car.category}</td>
                <td>₺{car.dailyPrice}</td>
                <td>{branch?.city ?? car.locationId}</td>
                <td>{car.status ?? (car.available ? 'AVAILABLE' : 'UNAVAILABLE')}</td>
                <td>
                  <button type="button" onClick={() => startEdit(car)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAvailability(car)}
                    style={{ marginLeft: '0.5rem' }}
                    disabled={!['AVAILABLE', 'UNAVAILABLE', undefined].includes(car.status)}
                  >
                    {car.status === 'UNAVAILABLE' ? 'Mark available' : 'Mark unavailable'}
                  </button>
                  <button type="button" onClick={() => adminService.deleteCar(car.id).then(refreshCars)}>
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
