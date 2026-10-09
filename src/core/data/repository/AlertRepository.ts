import { ShalikDatabase } from '../database/ShalikDatabase';
import { AlertDao } from '../database/dao/AlertDao';
import { ShalikAlert } from '../models/Alert';
import { alertEntityToDomain, alertToEntity } from '../database/Entities';

export class AlertRepository {
  private alertDao: AlertDao;
  private db: ShalikDatabase;

  constructor(db: ShalikDatabase = ShalikDatabase.getInstance()) {
    this.db = db;
    this.alertDao = db.alertDao();
  }

  async getAllAlerts(): Promise<ShalikAlert[]> {
    const list = await this.alertDao.getAllAlerts();
    return list.map(alertEntityToDomain);
  }

  async getAlertsForDistrict(districtCode: string): Promise<ShalikAlert[]> {
    const list = await this.alertDao.getAlertsForDistrict(districtCode);
    return list.map(alertEntityToDomain);
  }

  async getAlertById(alertId: string): Promise<ShalikAlert | null> {
    const entity = await this.alertDao.getAlertById(alertId);
    return entity ? alertEntityToDomain(entity) : null;
  }

  async saveAlert(alert: ShalikAlert): Promise<void> {
    await this.alertDao.insertAlert(alertToEntity(alert));
  }

  async saveAlerts(alerts: ShalikAlert[]): Promise<void> {
    await this.alertDao.insertAlerts(alerts.map(alertToEntity));
  }

  async markAsRead(alertId: string): Promise<void> {
    await this.alertDao.markAsRead(alertId);
  }

  async deleteExpiredAlerts(currentIsoTimestamp: string): Promise<void> {
    await this.alertDao.deleteExpiredAlerts(currentIsoTimestamp);
  }

  subscribe(listener: () => void): () => void {
    return this.db.subscribe(listener);
  }
}
