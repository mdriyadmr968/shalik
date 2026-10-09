import { ShalikDatabase } from '../src/core/data/database/ShalikDatabase';
import { ChatRepository } from '../src/core/data/repository/ChatRepository';
import { AlertRepository } from '../src/core/data/repository/AlertRepository';
import { FarmerProfileRepository } from '../src/core/data/repository/FarmerProfileRepository';
import { MessageSender } from '../src/core/data/models/ChatMessage';
import { AlertType, AlertSeverity } from '../src/core/data/models/Alert';

describe('Repositories and ShalikDatabase', () => {
  let db: ShalikDatabase;
  let chatRepo: ChatRepository;
  let alertRepo: AlertRepository;
  let profileRepo: FarmerProfileRepository;

  beforeEach(() => {
    db = ShalikDatabase.getInstance();
    chatRepo = new ChatRepository(db);
    alertRepo = new AlertRepository(db);
    profileRepo = new FarmerProfileRepository(db);
  });

  it('should create conversation and save chat messages', async () => {
    const convId = await chatRepo.createConversation('বোরো ধান সমস্যা');
    expect(convId).toBeGreaterThan(0);

    const msgId = await chatRepo.saveMessage({
      id: 0,
      conversationId: convId,
      sender: MessageSender.USER,
      text: 'আমার ধানে ব্লাস্ট হয়েছে',
      timestamp: Date.now(),
      citedSources: []
    });
    expect(msgId).toBeGreaterThan(0);

    const messages = await chatRepo.getMessages(convId);
    expect(messages.length).toBe(1);
    expect(messages[0].text).toBe('আমার ধানে ব্লাস্ট হয়েছে');
    expect(messages[0].sender).toBe(MessageSender.USER);
  });

  it('should retrieve seeded alerts and filter by district', async () => {
    const allAlerts = await alertRepo.getAllAlerts();
    expect(allAlerts.length).toBeGreaterThanOrEqual(2);

    const kurigramAlerts = await alertRepo.getAlertsForDistrict('কুড়িগ্রাম');
    expect(kurigramAlerts.length).toBeGreaterThan(0);
    expect(kurigramAlerts[0].districtCodes).toContain('কুড়িগ্রাম');
  });

  it('should mark alert as read', async () => {
    const allAlerts = await alertRepo.getAllAlerts();
    const alertId = allAlerts[0].id;

    await alertRepo.markAsRead(alertId);
    const updated = await alertRepo.getAlertById(alertId);
    expect(updated?.isRead).toBe(true);
  });

  it('should load default farmer profile and save changes', async () => {
    const profile = await profileRepo.getFarmerProfile();
    expect(profile.farmerName).toBe('কৃষক ভাই');
    expect(profile.district).toBe('কুড়িগ্রাম');

    await profileRepo.saveProfile({
      ...profile,
      farmerName: 'রহিম মিয়া',
      district: 'রংপুর',
      primaryCrops: ['ধান', 'ভুট্টা']
    });

    const updated = await profileRepo.getFarmerProfile();
    expect(updated.farmerName).toBe('রহিম মিয়া');
    expect(updated.district).toBe('রংপুর');
    expect(updated.primaryCrops).toContain('ভুট্টা');
  });
});
