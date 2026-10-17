import { AlertsViewModel } from '../src/features/alerts/viewmodel/AlertsViewModel';
import { ShalikDatabase } from '../src/core/data/database/ShalikDatabase';
import { AlertRepository } from '../src/core/data/repository/AlertRepository';
import { FarmerProfileRepository } from '../src/core/data/repository/FarmerProfileRepository';
import { AlertType, AlertSeverity } from '../src/core/data/models/Alert';

describe('AlertsViewModel', () => {
  let viewModel: AlertsViewModel;
  let db: ShalikDatabase;
  let alertRepo: AlertRepository;

  beforeEach(() => {
    db = ShalikDatabase.getInstance();
    alertRepo = new AlertRepository(db);
    const profileRepo = new FarmerProfileRepository(db);

    viewModel = new AlertsViewModel(alertRepo, profileRepo);
  });

  it('should load initial active disaster alerts', async () => {
    await viewModel.refreshAlerts();
    const state = viewModel.getState();
    expect(state.alerts.length).toBeGreaterThan(0);
  });

  it('should select alert and attach relevant action templates', async () => {
    await viewModel.refreshAlerts();
    const state = viewModel.getState();
    const targetAlert = state.alerts[0];

    await viewModel.selectAlert(targetAlert);
    const updatedState = viewModel.getState();

    expect(updatedState.selectedAlert).toBe(targetAlert);
    expect(updatedState.selectedTemplates.length).toBeGreaterThan(0);

    viewModel.dismissDetail();
    expect(viewModel.getState().selectedAlert).toBeNull();
  });

  it('should honor specific alert.actionTemplateIds when available', async () => {
    const customAlert = {
      id: 'alert_custom_cold',
      type: AlertType.COLD,
      severity: AlertSeverity.WARNING,
      districtCodes: ['রংপুর'],
      upazilaCodes: [],
      validFromIso: new Date().toISOString(),
      validToIso: new Date(Date.now() + 86400000).toISOString(),
      messageBn: 'শৈত্যপ্রবাহ সতর্কতা',
      messageEn: 'Cold wave alert',
      source: 'DAE',
      actionTemplateIds: ['act_cold_potato_blight'],
      signature: 'sig_mock',
      receivedAt: Date.now(),
      isRead: false
    };

    await viewModel.selectAlert(customAlert);
    const state = viewModel.getState();

    expect(state.selectedAlert).toBe(customAlert);
    expect(state.selectedTemplates.length).toBe(1);
    expect(state.selectedTemplates[0].templateId).toBe('act_cold_potato_blight');
    expect(state.selectedTemplates[0].titleBn).toContain('আলুর নাবি ধসা');
  });
});
