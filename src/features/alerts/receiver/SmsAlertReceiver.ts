import { ShalikAlert, AlertType, AlertSeverity } from '../../../core/data/models/Alert';
import { AlertRepository } from '../../../core/data/repository/AlertRepository';

export class SmsAlertReceiver {
  private alertRepository: AlertRepository;

  constructor(alertRepository: AlertRepository = new AlertRepository()) {
    this.alertRepository = alertRepository;
  }

  public async receiveSms(body: string, sender: string = 'SMS_GATEWAY'): Promise<ShalikAlert | null> {
    if (!body.toUpperCase().startsWith('SHALIK|')) {
      return null;
    }

    const alert = SmsAlertReceiver.parseSmsAlert(body, sender);
    if (alert) {
      await this.alertRepository.saveAlert(alert);
    }
    return alert;
  }

  public static parseSmsAlert(body: string, sender: string = 'SMS_GATEWAY'): ShalikAlert | null {
    const parts = body.split('|');
    if (parts.length < 6) return null;

    const header = parts[0].trim().toUpperCase();
    if (header !== 'SHALIK') return null;

    const typeStr = parts[1].trim().toUpperCase();
    const sevStr = parts[2].trim();
    const district = parts[3].trim();
    const messageBn = parts[4].trim();
    const hmac = parts[5].trim();

    // HMAC or signature sanity check
    if (hmac.length < 4) return null;

    let type: AlertType;
    switch (typeStr) {
      case 'HEAT':
        type = AlertType.HEAT;
        break;
      case 'FLOOD':
        type = AlertType.FLOOD;
        break;
      case 'CYCLONE':
        type = AlertType.CYCLONE;
        break;
      case 'RAIN':
      case 'HEAVY_RAIN':
        type = AlertType.HEAVY_RAIN;
        break;
      case 'COLD':
        type = AlertType.COLD;
        break;
      default:
        type = AlertType.HEAVY_RAIN;
    }

    const sevLevel = parseInt(sevStr, 10) || 2;
    const severity =
      Object.values(AlertSeverity).find(s => s.level === sevLevel) || AlertSeverity.WATCH;

    const now = Date.now();
    const expiry = now + 48 * 3600 * 1000; // 48h valid
    const validFromIso = new Date(now).toISOString();
    const validToIso = new Date(expiry).toISOString();

    let actionTemplateId = 'act_heavy_rain_drainage';
    if (type === AlertType.FLOOD) actionTemplateId = 'act_flood_rice_mature';
    else if (type === AlertType.HEAT) actionTemplateId = 'act_heat_rice_flowering';
    else if (type === AlertType.CYCLONE) actionTemplateId = 'act_cyclone_harvest';
    else if (type === AlertType.COLD) actionTemplateId = 'act_cold_potato_blight';

    return {
      id: `sms_${Date.now()}`,
      type,
      severity,
      districtCodes: [district],
      upazilaCodes: [],
      validFromIso,
      validToIso,
      messageBn,
      messageEn: null,
      source: `কৃষি আবহাওয়া ও জরুরি এসএমএস বার্তা (${sender})`,
      actionTemplateIds: [actionTemplateId],
      signature: `hmac_${hmac}`,
      isRead: false,
      receivedAt: now
    };
  }
}
