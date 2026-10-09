export enum MessageSender {
  USER = 'USER',
  SHALIK = 'SHALIK'
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  sender: MessageSender;
  text: string;
  timestamp: number;
  isStreaming?: boolean;
  imageUri?: string | null;
  citedSources: string[];
}

export interface Conversation {
  id: number;
  title: string;
  createdAt: number;
  lastMessagePreview: string;
}
