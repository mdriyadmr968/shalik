import { ShalikDatabase } from '../database/ShalikDatabase';
import { ChatDao } from '../database/dao/ChatDao';
import { ChatMessage, Conversation } from '../models/ChatMessage';
import {
  conversationEntityToDomain,
  chatMessageEntityToDomain,
  chatMessageToEntity
} from '../database/Entities';

export class ChatRepository {
  private chatDao: ChatDao;
  private db: ShalikDatabase;

  constructor(db: ShalikDatabase = ShalikDatabase.getInstance()) {
    this.db = db;
    this.chatDao = db.chatDao();
  }

  async getConversations(): Promise<Conversation[]> {
    const list = await this.chatDao.getAllConversations();
    return list.map(conversationEntityToDomain);
  }

  async getMessages(conversationId: number): Promise<ChatMessage[]> {
    const list = await this.chatDao.getMessagesForConversation(conversationId);
    return list.map(chatMessageEntityToDomain);
  }

  async createConversation(title: string): Promise<number> {
    return this.chatDao.insertConversation({
      title,
      createdAt: Date.now(),
      lastMessagePreview: ''
    });
  }

  async updateConversationPreview(conversationId: number, preview: string): Promise<void> {
    const existing = await this.chatDao.getConversationById(conversationId);
    const title = existing?.title && existing.title !== 'নতুন পরামর্শ' && existing.title !== 'New Consultation'
      ? existing.title
      : (preview.length > 32 ? preview.slice(0, 32) + '...' : preview);
    const createdAt = existing?.createdAt || Date.now();
    await this.chatDao.updateConversation({
      id: conversationId,
      title,
      createdAt,
      lastMessagePreview: preview
    });
  }

  async saveMessage(message: ChatMessage): Promise<number> {
    const entity = chatMessageToEntity(message);
    return this.chatDao.insertMessage(entity);
  }

  async deleteConversation(id: number): Promise<void> {
    await this.chatDao.deleteConversation(id);
  }

  subscribe(listener: () => void): () => void {
    return this.db.subscribe(listener);
  }
}
