import { AuthUser } from '../types/auth';
import { getLocations, listUsers, toAuthUser, updateUser } from './mockDatabase';
import { BranchLocation } from '../types/car';

export class UserProfileService {
  async getProfile(userId: string): Promise<AuthUser> {
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
    return listUsers()
      .filter((user) => user.role === 'member')
      .map((user) => toAuthUser(user));
  }

  async listLocations(): Promise<BranchLocation[]> {
    return getLocations();
  }
}

export const userProfileService = new UserProfileService();
