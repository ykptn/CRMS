import { useEffect, useState } from 'react';
import type { ChangeEvent, CSSProperties, FormEvent } from 'react';
import { AuthUser } from '../types/auth';
import { BranchLocation } from '../types/car';

interface MemberProfileFormProps {
  profile: AuthUser;
  locations: BranchLocation[];
  onSubmit: (payload: Partial<AuthUser>) => Promise<void>;
}

const formStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1rem',
};

export default function MemberProfileForm({ profile, locations, onSubmit }: MemberProfileFormProps) {
  const [formData, setFormData] = useState(profile);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        licenseNumber: formData.licenseNumber,
        licenseExpiry: formData.licenseExpiry,
        preferredLocationId: formData.preferredLocationId,
      });
      setMessage('Profile saved successfully.');
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : 'Unable to save profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={formStyle}>
        <div>
          <label>Full Name</label>
          <input name="fullName" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div>
          <label>Phone</label>
          <input name="phone" value={formData.phone} onChange={handleChange} required />
        </div>
        <div>
          <label>Address</label>
          <input name="address" value={formData.address} onChange={handleChange} required />
        </div>
        <div>
          <label>Driving License</label>
          <input
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>License Expiry</label>
          <input
            type="date"
            name="licenseExpiry"
            value={formData.licenseExpiry ?? ''}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Preferred Branch</label>
          <select
            name="preferredLocationId"
            value={formData.preferredLocationId ?? ''}
            onChange={handleChange}
          >
            <option value="">No preference</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Profile'}
        </button>
        {message && <p style={{ marginTop: '0.5rem' }}>{message}</p>}
      </div>
    </form>
  );
}
