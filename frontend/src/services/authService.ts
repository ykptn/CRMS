import { apiClient } from './apiClient';
import { AuthState, AuthUser, LoginPayload, RegisterPayload, UserRole } from '../types/auth';

type ApiProfileResponse = {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  address?: string | null;
  role?: string | null;
  drivingLicenseNumber?: string | null;
  drivingLicenseExpiry?: string | null;
};

const SESSION_KEY = 'crms-auth-session';

function persistSession(state: AuthState | null) {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return;
  }

  if (!state) {
    window.sessionStorage.removeItem(SESSION_KEY);
    return;
  }

  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

function readSession(): AuthState | null {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return null;
  }

  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

function sanitizeUser(user: AuthUser & { password?: string }): AuthUser {
  const { password, ...safe } = user;
  return safe;
}

function mapRole(role?: string | null): UserRole {
  if (!role) {
    return 'member';
  }
  return role.toLowerCase() === 'admin' ? 'admin' : 'member';
}

export class AuthService {
  async login(payload: LoginPayload): Promise<AuthState> {
    await apiClient.post<void>('/api/auth/login', payload);
    const token = btoa(`${payload.email}:${payload.password}`);
    persistSession({
      user: {
        id: payload.email,
        fullName: payload.email.split('@')[0] ?? 'Member',
        email: payload.email,
        role: 'member',
        phone: '',
        address: '',
        licenseNumber: '',
        licenseExpiry: '',
        createdAt: new Date().toISOString(),
      },
      token,
    });
    const profile = await apiClient.get<ApiProfileResponse>('/api/auth/profile', { auth: true });
    const authState: AuthState = {
      user: sanitizeUser({
        id: String(profile.id),
        fullName: profile.fullName,
        email: profile.email,
        role: mapRole(profile.role),
        phone: profile.phone ?? '',
        address: profile.address ?? '',
        licenseNumber: profile.drivingLicenseNumber ?? '',
        licenseExpiry: profile.drivingLicenseExpiry ?? '',
        createdAt: new Date().toISOString(),
      }),
      token,
    };
    persistSession(authState);
    return authState;
  }

  async register(payload: RegisterPayload): Promise<AuthState> {
    await apiClient.post<void>('/api/auth/register', {
      fullName: payload.fullName,
      email: payload.email.toLowerCase(),
      phone: payload.phone,
      address: payload.address,
      drivingLicenseNumber: payload.licenseNumber,
      drivingLicenseExpiry: payload.licenseExpiry,
      password: payload.password,
    });
    return this.login({ email: payload.email, password: payload.password });
  }

  async logout(): Promise<void> {
    persistSession(null);
  }

  async getCurrentSession(): Promise<AuthState | null> {
    const session = readSession();
    if (!session?.user) {
      return null;
    }
    const profile = await apiClient.get<ApiProfileResponse>('/api/auth/profile', { auth: true });
    const refreshed: AuthState = {
      user: sanitizeUser({
        id: String(profile.id),
        fullName: profile.fullName,
        email: profile.email,
        role: mapRole(profile.role),
        phone: profile.phone ?? '',
        address: profile.address ?? '',
        licenseNumber: profile.drivingLicenseNumber ?? '',
        licenseExpiry: profile.drivingLicenseExpiry ?? '',
        createdAt: session.user.createdAt ?? new Date().toISOString(),
      }),
      token: session.token,
    };
    persistSession(refreshed);
    return refreshed;
  }

  async updateProfile(
    userId: string,
    data: Partial<Omit<AuthUser, 'id' | 'email' | 'role' | 'createdAt'>>
  ): Promise<AuthUser> {
    await apiClient.patch<void>(
      '/api/auth/profile',
      {
        fullName: data.fullName ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        drivingLicenseNumber: data.licenseNumber ?? '',
        drivingLicenseExpiry: data.licenseExpiry ?? '',
      },
      { auth: true }
    );
    const profile = await apiClient.get<ApiProfileResponse>('/api/auth/profile', { auth: true });
    const updatedUser = sanitizeUser({
      id: String(profile.id),
      fullName: profile.fullName,
      email: profile.email,
      role: mapRole(profile.role),
      phone: profile.phone ?? '',
      address: profile.address ?? '',
      licenseNumber: profile.drivingLicenseNumber ?? '',
      licenseExpiry: profile.drivingLicenseExpiry ?? '',
      createdAt: new Date().toISOString(),
    });
    const session = readSession();
    if (session?.user?.id === userId) {
      persistSession({ ...session, user: updatedUser });
    }
    return updatedUser;
  }
}

export const authService = new AuthService();
