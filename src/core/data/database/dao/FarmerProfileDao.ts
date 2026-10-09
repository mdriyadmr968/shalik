import { FarmerProfileEntity } from '../Entities';

export interface FarmerProfileDao {
  getProfile(): Promise<FarmerProfileEntity | null>;
  saveProfile(profile: FarmerProfileEntity): Promise<void>;
}
