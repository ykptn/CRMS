import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: '',
    licenseExpiry: '',
    password: '',
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await register(form);
      navigate('/member/dashboard');
    } catch {
      // handled in hook
    }
  };

  return (
    <div style={{ maxWidth: '560px', margin: '2rem auto' }}>
      <h2>Create Member Account</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label>Full Name</label>
          <input
            value={form.fullName}
            onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            pattern="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
            required
          />
          <small>Use a valid email with a domain (example: name@domain.com).</small>
        </div>
        <div>
          <label>Phone</label>
          <input
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            placeholder="+90 555 123 4567"
            pattern="^\\+?[0-9()\\-\\s]{7,20}$"
            required
          />
          <small>Use 7-20 digits, spaces, parentheses, or dashes.</small>
        </div>
        <div>
          <label>Address</label>
          <input
            value={form.address}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
            required
          />
        </div>
        <div>
          <label>Driving License Number</label>
          <input
            value={form.licenseNumber}
            onChange={(event) => setForm((prev) => ({ ...prev, licenseNumber: event.target.value }))}
            placeholder="ABC12345"
            pattern="^[A-Za-z0-9]{5,20}$"
            required
          />
          <small>5-20 letters or digits only.</small>
        </div>
        <div>
          <label>Driving License Expiry</label>
          <input
            type="date"
            value={form.licenseExpiry}
            onChange={(event) => setForm((prev) => ({ ...prev, licenseExpiry: event.target.value }))}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            minLength={8}
            required
          />
          <small>Minimum 8 characters.</small>
        </div>
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
