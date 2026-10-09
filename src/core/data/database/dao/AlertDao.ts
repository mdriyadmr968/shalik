import { AlertEntity } from '../Entities';

export interface AlertDao {
  getAllAlerts(): Promise<AlertEntity[]>;
  getAlertsForDistrict(districtCode: string): Promise<AlertEntity[]>;
  getAlertById(alertId: string): Promise<AlertEntity | null>;
  insertAlert(alert: AlertEntity): Promise<void>;
  insertAlerts(alerts: AlertEntity[]): Promise<void>;
  markAsRead(alertId: string): Promise<void>;
  deleteExpiredAlerts(currentIsoTimestamp: string): Promise<void>;
}
