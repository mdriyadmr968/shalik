import { ChatMessage, Conversation, MessageSender } from '../models/ChatMessage';
import { ShalikAlert, AlertType, AlertSeverity } from '../models/Alert';
import { FarmerProfile } from '../models/FarmerProfile';

export interface ConversationEntity {
  id: number;
  title: string;
  createdAt: number;
  lastMessagePreview: string;
}

export function conversationEntityToDomain(entity: ConversationEntity): Conversation {
  return {
    id: entity.id,
    title: entity.title,
    createdAt: entity.createdAt,
    lastMessagePreview: entity.lastMessagePreview
  };
}

export interface ChatMessageEntity {
  id: number;
  conversationId: number;
  sender: 'USER' | 'SHALIK';
  text: string;
  timestamp: number;
  imageUri?: string | null;
  citedSourcesCsv: string;
}

export function chatMessageEntityToDomain(entity: ChatMessageEntity): ChatMessage {
  return {
    id: entity.id,
    conversationId: entity.conversationId,
    sender: entity.sender === 'USER' ? MessageSender.USER : MessageSender.SHALIK,
    text: entity.text,
    timestamp: entity.timestamp,
    isStreaming: false,
    imageUri: entity.imageUri || null,
    citedSources: entity.citedSourcesCsv ? entity.citedSourcesCsv.split('|||').filter(Boolean) : []
  };
}

export function chatMessageToEntity(domain: ChatMessage): ChatMessageEntity {
  return {
    id: domain.id,
    conversationId: domain.conversationId,
    sender: domain.sender === MessageSender.USER ? 'USER' : 'SHALIK',
    text: domain.text,
    timestamp: domain.timestamp,
    imageUri: domain.imageUri || null,
    citedSourcesCsv: (domain.citedSources || []).join('|||')
  };
}

export interface FarmerProfileEntity {
  id: number;
  farmerName: string;
  district: string;
  upazila: string;
  primaryCropsCsv: string;
  isOnboarded: boolean;
  preferredLanguage: string;
}

export function farmerProfileEntityToDomain(entity: FarmerProfileEntity): FarmerProfile {
  return {
    id: entity.id,
    farmerName: entity.farmerName,
    district: entity.district,
    upazila: entity.upazila,
    primaryCrops: entity.primaryCropsCsv ? entity.primaryCropsCsv.split(',').filter(Boolean) : [],
    isOnboarded: entity.isOnboarded,
    preferredLanguage: entity.preferredLanguage
  };
}

export function farmerProfileToEntity(domain: FarmerProfile): FarmerProfileEntity {
  return {
    id: domain.id,
    farmerName: domain.farmerName,
    district: domain.district,
    upazila: domain.upazila,
    primaryCropsCsv: (domain.primaryCrops || []).join(','),
    isOnboarded: domain.isOnboarded,
    preferredLanguage: domain.preferredLanguage
  };
}

export interface AlertEntity {
  id: string;
  type: string;
  severityLevel: number;
  districtCodesCsv: string;
  upazilaCodesCsv: string;
  validFromIso: string;
  validToIso: string;
  messageBn: string;
  messageEn?: string | null;
  source: string;
  actionTemplatesCsv: string;
  signature: string;
  receivedAt: number;
  isRead: boolean;
}

export function alertEntityToDomain(entity: AlertEntity): ShalikAlert {
  let mappedType = AlertType.HEAVY_RAIN;
  if (Object.values(AlertType).includes(entity.type as AlertType)) {
    mappedType = entity.type as AlertType;
  }

  const severityEntry = Object.values(AlertSeverity).find(s => s.level === entity.severityLevel) || AlertSeverity.ADVISORY;

  return {
    id: entity.id,
    type: mappedType,
    severity: severityEntry,
    districtCodes: entity.districtCodesCsv ? entity.districtCodesCsv.split(',').filter(Boolean) : [],
    upazilaCodes: entity.upazilaCodesCsv ? entity.upazilaCodesCsv.split(',').filter(Boolean) : [],
    validFromIso: entity.validFromIso,
    validToIso: entity.validToIso,
    messageBn: entity.messageBn,
    messageEn: entity.messageEn || null,
    source: entity.source,
    actionTemplateIds: entity.actionTemplatesCsv ? entity.actionTemplatesCsv.split(',').filter(Boolean) : [],
    signature: entity.signature,
    receivedAt: entity.receivedAt,
    isRead: entity.isRead
  };
}

export function alertToEntity(domain: ShalikAlert): AlertEntity {
  return {
    id: domain.id,
    type: domain.type,
    severityLevel: domain.severity.level,
    districtCodesCsv: (domain.districtCodes || []).join(','),
    upazilaCodesCsv: (domain.upazilaCodes || []).join(','),
    validFromIso: domain.validFromIso,
    validToIso: domain.validToIso,
    messageBn: domain.messageBn,
    messageEn: domain.messageEn || null,
    source: domain.source,
    actionTemplatesCsv: (domain.actionTemplateIds || []).join(','),
    signature: domain.signature,
    receivedAt: domain.receivedAt,
    isRead: domain.isRead
  };
}
