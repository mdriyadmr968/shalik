import { ShalikDatabase } from '../database/ShalikDatabase';
import { FarmerProfileDao } from '../database/dao/FarmerProfileDao';
import { FarmerProfile, defaultFarmerProfile } from '../models/FarmerProfile';
import { farmerProfileEntityToDomain, farmerProfileToEntity } from '../database/Entities';

export class FarmerProfileRepository {
  private profileDao: FarmerProfileDao;
  private db: ShalikDatabase;

  constructor(db: ShalikDatabase = ShalikDatabase.getInstance()) {
    this.db = db;
    this.profileDao = db.farmerProfileDao();
  }

  async getFarmerProfile(): Promise<FarmerProfile> {
    const entity = await this.profileDao.getProfile();
    return entity ? farmerProfileEntityToDomain(entity) : defaultFarmerProfile;
  }

  async saveProfile(profile: FarmerProfile): Promise<void> {
    await this.profileDao.saveProfile(farmerProfileToEntity(profile));
  }

  subscribe(listener: () => void): () => void {
    return this.db.subscribe(listener);
  }
}
