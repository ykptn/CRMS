import { useCallback, useState } from 'react';
import { ReservationDraft, ReservationModel } from '../types/reservation';
import { reservationService } from '../services/reservationService';

const defaultDraft: ReservationDraft = { services: [] };

export function useReservationFlow(memberId?: string) {
  const [draft, setDraft] = useState<ReservationDraft>({ ...defaultDraft, services: [] });
  const [reservation, setReservation] = useState<ReservationModel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDraft = useCallback((patch: Partial<ReservationDraft>) => {
    setDraft((prev) => ({
      ...prev,
      ...patch,
    }));
  }, []);

  const toggleService = useCallback((serviceId: string) => {
    setDraft((prev) => {
      const hasService = prev.services.includes(serviceId);
      return {
        ...prev,
        services: hasService
          ? prev.services.filter((id) => id !== serviceId)
          : [...prev.services, serviceId],
      };
    });
  }, []);

  const reset = () => {
    setDraft({ ...defaultDraft, services: [] });
    setReservation(null);
    setError(null);
  };

  const confirmReservation = useCallback(async () => {
    if (!memberId) {
      setError('Only signed in members can create reservations.');
      return null;
    }

    setSubmitting(true);
    try {
      const created = await reservationService.createReservation(memberId, draft);
      setReservation(created);
      setError(null);
      return created;
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to confirm reservation.');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [draft, memberId]);

  return {
    draft,
    reservation,
    submitting,
    error,
    updateDraft,
    toggleService,
    confirmReservation,
    reset,
  };
}
