import { addUser, findUserByEmail, generateId, updateUser } from './mockDatabase';
import { apiClient } from './apiClient';
import { AuthState, AuthUser, LoginPayload, RegisterPayload } from '../types/auth';

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

export class AuthService {
  async login(payload: LoginPayload): Promise<AuthState> {
    try {
      await apiClient.post<void>('/api/auth/login', payload);
      const existing = findUserByEmail(payload.email);
      const user: AuthUser = existing
        ? sanitizeUser(existing)
        : {
            id: payload.email,
            fullName: payload.email.split('@')[0] ?? 'Member',
            email: payload.email,
            role: 'member',
            phone: '',
            address: '',
            licenseNumber: '',
            createdAt: new Date().toISOString(),
          };
      const authState: AuthState = {
        user,
        token: btoa(`${payload.email}:${payload.password}`),
      };
      persistSession(authState);
      return authState;
    } catch (err) {
      const existing = findUserByEmail(payload.email);
      if (!existing || existing.password !== payload.password) {
        throw new Error('Invalid email or password.');
      }

      const authState: AuthState = {
        user: sanitizeUser(existing),
        token: btoa(`${existing.id}:${Date.now()}`),
      };
      persistSession(authState);
      return authState;
    }
  }

  async register(payload: RegisterPayload): Promise<AuthState> {
    const existing = findUserByEmail(payload.email);
    if (existing) {
      throw new Error('Email is already registered.');
    }

    try {
      await apiClient.post<void>('/api/auth/register', {
        fullName: payload.fullName,
        email: payload.email.toLowerCase(),
        phone: payload.phone,
        address: payload.address,
        drivingLicenseNumber: payload.licenseNumber,
        password: payload.password,
      });
    } catch (err) {
      // Keep mock registration as fallback for local usage.
    }

    const newUser: AuthUser = {
      id: generateId('u'),
      fullName: payload.fullName,
      email: payload.email.toLowerCase(),
      role: 'member',
      phone: payload.phone,
      address: payload.address,
      licenseNumber: payload.licenseNumber,
      createdAt: new Date().toISOString(),
    };

    addUser({ ...newUser, password: payload.password });
    const authState: AuthState = {
      user: newUser,
      token: btoa(`${payload.email}:${payload.password}`),
    };
    persistSession(authState);
    return authState;
  }

  async logout(): Promise<void> {
    persistSession(null);
  }

  async getCurrentSession(): Promise<AuthState | null> {
    const session = readSession();
    if (!session?.user) {
      return null;
    }

    const latest = findUserByEmail(session.user.email);
    if (!latest) {
      persistSession(null);
      return null;
    }

    const refreshed: AuthState = {
      user: sanitizeUser(latest),
      token: session.token,
    };
    persistSession(refreshed);
    return refreshed;
  }

  async updateProfile(
    userId: string,
    data: Partial<Omit<AuthUser, 'id' | 'email' | 'role' | 'createdAt'>>
  ): Promise<AuthUser> {
    let updatedUser: AuthUser | null = null;
    updateUser(userId, (current) => {
      const merged = {
        ...current,
        ...data,
      };
      updatedUser = sanitizeUser(merged);
      return merged;
    });

    if (!updatedUser) {
      throw new Error('User not found.');
    }

    const session = readSession();
    if (session?.user?.id === userId) {
      persistSession({
        ...session,
        user: updatedUser,
      });
    }

    return updatedUser;
  }
}

export const authService = new AuthService();
