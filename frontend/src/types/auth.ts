export type UserRole = 'member' | 'admin';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  fullName: string;
  phone: string;
  address: string;
  licenseNumber: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
  licenseNumber: string;
  createdAt: string;
  preferredLocationId?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
}
