import { AuthUser, UserRole } from '../types/auth';
import { BranchLocation } from '../types/car';
import { apiClient } from './apiClient';

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

function mapRole(role?: string | null): UserRole {
  if (!role) {
    return 'member';
  }
  return role.toLowerCase() === 'admin' ? 'admin' : 'member';
}

export class UserProfileService {
  async getProfile(userId: string): Promise<AuthUser> {
    const member = await apiClient.get<ApiProfileResponse>('/api/auth/profile', { auth: true });
    return {
      id: String(member.id),
      fullName: member.fullName,
      email: member.email,
      role: mapRole(member.role),
      phone: member.phone ?? '',
      address: member.address ?? '',
      licenseNumber: member.drivingLicenseNumber ?? '',
      licenseExpiry: member.drivingLicenseExpiry ?? '',
      createdAt: new Date().toISOString(),
    };
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
    return this.getProfile(userId);
  }

  async listMembers(): Promise<AuthUser[]> {
    const members = await apiClient.get<any[]>('/api/admin/members', { auth: true });
    return members.map((member) => ({
      id: String(member.id),
      fullName: member.fullName,
      email: member.email,
      role: 'member',
      phone: member.phone ?? '',
      address: member.address ?? '',
      licenseNumber: member.drivingLicenseNumber ?? '',
      createdAt: new Date().toISOString(),
    }));
  }

  async listLocations(): Promise<BranchLocation[]> {
    const locations = await apiClient.get<any[]>('/api/locations');
    return locations.map((location) => ({
      id: String(location.id),
      code: location.code,
      name: location.name,
      address: location.address,
      city: location.code ?? location.name,
      phone: location.phone ?? '',
    }));
  }
}

export const userProfileService = new UserProfileService();
