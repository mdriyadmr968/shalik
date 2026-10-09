import { ConversationEntity, ChatMessageEntity } from '../Entities';

export interface ChatDao {
  getAllConversations(): Promise<ConversationEntity[]>;
  insertConversation(conversation: Omit<ConversationEntity, 'id'> | ConversationEntity): Promise<number>;
  updateConversation(conversation: ConversationEntity): Promise<void>;
  deleteConversation(id: number): Promise<void>;
  getMessagesForConversation(conversationId: number): Promise<ChatMessageEntity[]>;
  insertMessage(message: Omit<ChatMessageEntity, 'id'> | ChatMessageEntity): Promise<number>;
  deleteMessagesForConversation(conversationId: number): Promise<void>;
}
