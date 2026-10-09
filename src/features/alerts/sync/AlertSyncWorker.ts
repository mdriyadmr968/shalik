import { AlertRepository } from '../../../core/data/repository/AlertRepository';
import { FarmerProfileRepository } from '../../../core/data/repository/FarmerProfileRepository';
import { ShalikAlert, AlertType, AlertSeverity } from '../../../core/data/models/Alert';

export class AlertSyncWorker {
  private alertRepository: AlertRepository;
  private profileRepository: FarmerProfileRepository;

  constructor(
    alertRepository: AlertRepository = new AlertRepository(),
    profileRepository: FarmerProfileRepository = new FarmerProfileRepository()
  ) {
    this.alertRepository = alertRepository;
    this.profileRepository = profileRepository;
  }

  public async doWork(): Promise<boolean> {
    try {
      const profile = await this.profileRepository.getFarmerProfile();
      const userDistrict = profile.district || 'কুড়িগ্রাম';

      const nowIso = new Date().toISOString();
      await this.alertRepository.deleteExpiredAlerts(nowIso);

      const incomingAlerts = this.fetchMockIdea3Alerts(userDistrict);
      const verified = incomingAlerts.filter(a => this.verifyAlertSignature(a));

      await this.alertRepository.saveAlerts(verified);
      return true;
    } catch (e) {
      return false;
    }
  }

  private verifyAlertSignature(alert: ShalikAlert): boolean {
    return alert.signature.length > 0 && alert.messageBn.length > 0;
  }

  private fetchMockIdea3Alerts(district: string): ShalikAlert[] {
    const now = Date.now();
    const expiry = now + 3 * 24 * 3600 * 1000;
    const validFromIso = new Date(now).toISOString();
    const validToIso = new Date(expiry).toISOString();

    return [
      {
        id: `alert_flood_${district}_${Math.floor(Date.now() / 100000)}`,
        type: AlertType.FLOOD,
        severity: AlertSeverity.WARNING,
        districtCodes: ['কুড়িগ্রাম', 'সিরাজগঞ্জ', 'গাইবান্ধা', district],
        upazilaCodes: ['চিলমারী', 'উলিপুর'],
        validFromIso,
        validToIso,
        messageBn:
          'বন্যা পূর্বাভাস: ব্রহ্মপুত্র ও তিস্তা নদীর পানি বিপদসীমার উপর দিয়ে প্রবাহিত হতে পারে। নিম্নাঞ্চলের পাকা ফসল দ্রুত কেটে নিরাপদ স্থানে রাখুন।',
        messageEn: 'Flood alert: Brahmaputra and Teesta river water levels rising above danger mark.',
        source: 'FFWC/BWDB বন্যা পূর্বাভাস ও সতর্কীকরণ কেন্দ্র',
        actionTemplateIds: ['act_flood_rice_mature'],
        signature: 'sig_ffwc_ed25519_verified',
        isRead: false,
        receivedAt: now
      },
      {
        id: `alert_heat_${district}_${Math.floor(Date.now() / 100000)}`,
        type: AlertType.HEAT,
        severity: AlertSeverity.WATCH,
        districtCodes: ['রাজশাহী', 'পাবনা', 'চুয়াডাঙ্গা', district],
        upazilaCodes: [],
        validFromIso,
        validToIso,
        messageBn:
          'তীব্র তাপপ্রবাহ সতর্কতা: আগামী ৪৮ ঘণ্টায় দিনের তাপমাত্রা ৩৮° সেলসিয়াস ছাড়িয়ে যেতে পারে। বোরো ধান ও শাকসবজির জমিতে পর্যাপ্ত পানি ধরে রাখুন।',
        messageEn: 'Heatwave alert: Max temperature expected to exceed 38C.',
        source: 'BMD বাংলাদেশ আবহাওয়া অধিদপ্তর',
        actionTemplateIds: ['act_heat_rice_flowering'],
        signature: 'sig_bmd_ed25519_verified',
        isRead: false,
        receivedAt: now
      }
    ];
  }
}
