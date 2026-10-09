export enum AlertType {
  HEAT = 'HEAT',
  FLOOD = 'FLOOD',
  CYCLONE = 'CYCLONE',
  HEAVY_RAIN = 'HEAVY_RAIN',
  COLD = 'COLD'
}

export interface SeverityDetail {
  level: number;
  labelBn: string;
}

export const AlertSeverity: Record<'ADVISORY' | 'WATCH' | 'WARNING' | 'EMERGENCY', SeverityDetail> = {
  ADVISORY: { level: 1, labelBn: 'সতর্কবার্তা' },
  WATCH: { level: 2, labelBn: 'নজরদারি' },
  WARNING: { level: 3, labelBn: 'বিপদ সংকেত' },
  EMERGENCY: { level: 4, labelBn: 'জরুরি সতর্কবার্তা' }
};

export type AlertSeverityKey = keyof typeof AlertSeverity;

export interface ShalikAlert {
  id: string;
  type: AlertType;
  severity: SeverityDetail;
  districtCodes: string[];
  upazilaCodes: string[];
  validFromIso: string;
  validToIso: string;
  messageBn: string;
  messageEn?: string | null;
  source: string;
  actionTemplateIds: string[];
  signature: string;
  isRead: boolean;
  receivedAt: number;
}
