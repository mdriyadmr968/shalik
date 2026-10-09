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
});
