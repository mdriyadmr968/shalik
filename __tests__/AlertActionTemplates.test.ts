import { AlertActionTemplates } from '../src/features/alerts/template/AlertActionTemplates';
import { AlertType } from '../src/core/data/models/Alert';

describe('AlertActionTemplates', () => {
  it('should return flood templates for rice crop', () => {
    const templates = AlertActionTemplates.getTemplatesForAlert(AlertType.FLOOD, 'ধান');
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0].templateId).toBe('act_flood_rice_mature');
    expect(templates[0].titleBn).toContain('পাকা ধান দ্রুত কর্তন');
    expect(templates[0].actionStepsBn.length).toBe(4);
  });

  it('should return heatwave templates for rice flowering stage', () => {
    const templates = AlertActionTemplates.getTemplatesForAlert(AlertType.HEAT, 'ধান');
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0].templateId).toBe('act_heat_rice_flowering');
    expect(templates[0].titleBn).toContain('তীব্র তাপপ্রবাহে');
  });

  it('should find template by ID', () => {
    const template = AlertActionTemplates.getTemplateById('act_cyclone_harvest');
    expect(template).not.toBeNull();
    expect(template?.alertType).toBe(AlertType.CYCLONE);
  });
});
