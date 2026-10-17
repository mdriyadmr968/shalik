import { DistrictMatcher } from '../src/core/data/util/DistrictMatcher';
import { alertEntityToDomain } from '../src/core/data/database/Entities';
import { AlertType } from '../src/core/data/models/Alert';

describe('DistrictMatcher & Alert Normalization', () => {
  it('matches bilingual districts correctly', () => {
    const csvEnglish = 'Rangpur,Dinajpur,Kurigram,Gaibandha';
    expect(DistrictMatcher.matches(csvEnglish, 'কুড়িগ্রাম')).toBe(true);
    expect(DistrictMatcher.matches(csvEnglish, 'Kurigram')).toBe(true);
    expect(DistrictMatcher.matches(csvEnglish, 'সিরাজগঞ্জ')).toBe(false);

    const csvBangla = 'কুড়িগ্রাম,সিরাজগঞ্জ,গাইবান্ধা';
    expect(DistrictMatcher.matches(csvBangla, 'Sirajganj')).toBe(true);
    expect(DistrictMatcher.matches(csvBangla, 'সিরাজগঞ্জ')).toBe(true);
    expect(DistrictMatcher.matches(csvBangla, 'Rajshahi')).toBe(false);
  });

  it('normalizes alert types and aliases accurately', () => {
    const flashFloodAlert = alertEntityToDomain({
      id: 'a1',
      type: 'FLASH_FLOOD',
      severityLevel: 4,
      districtCodesCsv: 'Sylhet',
      upazilaCodesCsv: '',
      validFromIso: '',
      validToIso: '',
      messageBn: 'বন্যা',
      source: 'BWDB',
      actionTemplatesCsv: '',
      signature: 'sig',
      receivedAt: Date.now(),
      isRead: false
    });
    expect(flashFloodAlert.type).toBe(AlertType.FLASH_FLOOD);

    const pestAlert = alertEntityToDomain({
      id: 'a2',
      type: 'PEST',
      severityLevel: 2,
      districtCodesCsv: 'Rajshahi',
      upazilaCodesCsv: '',
      validFromIso: '',
      validToIso: '',
      messageBn: 'পোকা',
      source: 'DAE',
      actionTemplatesCsv: '',
      signature: 'sig',
      receivedAt: Date.now(),
      isRead: false
    });
    expect(pestAlert.type).toBe(AlertType.PEST);

    const droughtAlert = alertEntityToDomain({
      id: 'a3',
      type: 'DROUGHT',
      severityLevel: 2,
      districtCodesCsv: 'Rajshahi',
      upazilaCodesCsv: '',
      validFromIso: '',
      validToIso: '',
      messageBn: 'খরা',
      source: 'BMDA',
      actionTemplatesCsv: '',
      signature: 'sig',
      receivedAt: Date.now(),
      isRead: false
    });
    expect(droughtAlert.type).toBe(AlertType.DROUGHT);
  });
});
