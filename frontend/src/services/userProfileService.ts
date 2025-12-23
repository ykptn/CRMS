import { AuthUser } from '../types/auth';
import { getLocations, listUsers, toAuthUser, updateUser } from './mockDatabase';
import { BranchLocation } from '../types/car';
import { apiClient } from './apiClient';

export class UserProfileService {
  async getProfile(userId: string): Promise<AuthUser> {
    const numericId = Number(userId);
    if (!Number.isNaN(numericId)) {
      try {
        const member = await apiClient.get<any>(`/api/admin/members/${numericId}`, { auth: true });
        return {
          id: String(member.id),
          fullName: member.fullName,
          email: member.email,
          role: 'member',
          phone: member.phone ?? '',
          address: member.address ?? '',
          licenseNumber: member.drivingLicenseNumber ?? '',
          createdAt: new Date().toISOString(),
        };
      } catch (err) {
        // Fall back to mock data.
      }
    }

    const user = listUsers().find((candidate) => candidate.id === userId);
    if (!user) {
      throw new Error('Profile not found.');
    }

    return toAuthUser(user);
  }

  async updateProfile(
    userId: string,
    data: Partial<Omit<AuthUser, 'id' | 'email' | 'role' | 'createdAt'>>
  ): Promise<AuthUser> {
    try {
      await apiClient.patch<void>(
        '/api/auth/profile',
        {
          fullName: data.fullName ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          drivingLicenseNumber: data.licenseNumber ?? '',
        },
        { auth: true }
      );
    } catch (err) {
      // Continue with mock update for local usage.
    }

    let updated: AuthUser | null = null;
    updateUser(userId, (current) => {
      const merged = {
        ...current,
        ...data,
      };
      updated = toAuthUser(merged);
      return merged;
    });

    if (!updated) {
      throw new Error('Profile not found.');
    }

    return updated;
  }

  async listMembers(): Promise<AuthUser[]> {
    try {
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
    } catch (err) {
      return listUsers()
        .filter((user) => user.role === 'member')
        .map((user) => toAuthUser(user));
    }
  }

  async listLocations(): Promise<BranchLocation[]> {
    try {
      const locations = await apiClient.get<any[]>('/api/admin/locations', { auth: true });
      return locations.map((location) => ({
        id: String(location.id),
        name: location.name,
        address: location.address,
        city: location.code ?? location.name,
        phone: '',
      }));
    } catch (err) {
      return getLocations();
    }
  }
}

export const userProfileService = new UserProfileService();
