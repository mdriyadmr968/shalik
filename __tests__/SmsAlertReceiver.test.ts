import { SmsAlertReceiver } from '../src/features/alerts/receiver/SmsAlertReceiver';
import { AlertType, AlertSeverity } from '../src/core/data/models/Alert';

describe('SmsAlertReceiver', () => {
  it('should parse valid FLOOD alert SMS correctly', () => {
    const sms = 'SHALIK|FLOOD|3|KURIGRAM|ব্রহ্মপুত্রের পানি বৃদ্ধি পাচ্ছে, নিম্নাঞ্চলের পাকা ধান দ্রুত কেটে ফেলুন।|e4f8a1';
    const alert = SmsAlertReceiver.parseSmsAlert(sms);

    expect(alert).not.toBeNull();
    expect(alert?.type).toBe(AlertType.FLOOD);
    expect(alert?.severity.level).toBe(3);
    expect(alert?.severity.labelBn).toBe('বিপদ সংকেত');
    expect(alert?.districtCodes).toContain('KURIGRAM');
    expect(alert?.messageBn).toContain('ব্রহ্মপুত্রের পানি বৃদ্ধি');
    expect(alert?.signature).toBe('hmac_e4f8a1');
    expect(alert?.actionTemplateIds).toContain('act_flood_rice_mature');
  });

  it('should parse valid HEAT alert SMS correctly', () => {
    const sms = 'SHALIK|HEAT|2|RAJSHAHI|তীব্র তাপপ্রবাহ: বোরো ধানের জমিতে ৫-৭ সেমি পানি ধরে রাখুন।|9b2c11';
    const alert = SmsAlertReceiver.parseSmsAlert(sms);

    expect(alert).not.toBeNull();
    expect(alert?.type).toBe(AlertType.HEAT);
    expect(alert?.severity.level).toBe(2);
    expect(alert?.severity.labelBn).toBe('নজরদারি');
    expect(alert?.actionTemplateIds).toContain('act_heat_rice_flowering');
  });

  it('should reject SMS without SHALIK prefix', () => {
    const sms = 'INVALID|FLOOD|3|KURIGRAM|টেস্ট বার্তা|1234';
    const alert = SmsAlertReceiver.parseSmsAlert(sms);
    expect(alert).toBeNull();
  });

  it('should reject SMS with invalid parts or short HMAC', () => {
    const sms = 'SHALIK|FLOOD|3|KURIGRAM|টেস্ট বার্তা|12'; // HMAC < 4 chars
    const alert = SmsAlertReceiver.parseSmsAlert(sms);
    expect(alert).toBeNull();
  });
});
