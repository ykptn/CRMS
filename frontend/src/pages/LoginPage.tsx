import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const redirectState = location.state as {
    from?: string;
    carId?: string;
    pickUpDate?: string;
    dropOffDate?: string;
    pickUpLocationId?: string;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const authenticatedUser = await login(form);
      if (authenticatedUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        if (redirectState?.from === '/reservations/new') {
          navigate('/reservations/new', {
            replace: true,
            state: {
              carId: redirectState.carId,
              pickUpDate: redirectState.pickUpDate,
              dropOffDate: redirectState.dropOffDate,
              pickUpLocationId: redirectState.pickUpLocationId,
            },
          });
        } else {
          navigate(redirectState?.from ?? '/member/dashboard', { replace: true });
        }
      }
    } catch {
      // errors handled in hook
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '2rem auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
        </div>
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Need an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
