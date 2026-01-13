import { describe, it, expect, beforeEach } from 'vitest';
import Phase5Coordinator from '../phase5-coordinator';

describe('Phase5Coordinator', () => {
  let coordinator: Phase5Coordinator;

  beforeEach(() => {
    coordinator = new Phase5Coordinator();
  });

  it('should generate intelligence report', async () => {
    const input = {
      serviceId: 'test-service',
      metrics: Array.from({ length: 50 }, (_, i) => ({
        timestamp: new Date(Date.now() - (50 - i) * 60000),
        name: 'cpu',
        value: 50 + Math.random() * 20,
      })),
      monthlySpend: 5000,
      allocations: [
        {
          type: 'compute' as const,
          current: 2,
          allocated: 8,
          cost: 400,
          utilizationPercent: 25,
        },
      ],
    };

    const report = await coordinator.analyzeIntelligence(input);

    expect(report.serviceId).toBe('test-service');
    expect(report.healthScore).toBeGreaterThan(0);
    expect(report.healthScore).toBeLessThanOrEqual(100);
  });

  it('should analyze multiple services', async () => {
    const services = ['service-1', 'service-2', 'service-3'];
    const inputs = {
      'service-1': { metrics: [], monthlySpend: 5000, allocations: [] },
      'service-2': { metrics: [], monthlySpend: 3000, allocations: [] },
      'service-3': { metrics: [], monthlySpend: 8000, allocations: [] },
    };

    const reports = await coordinator.fullIntelligenceAnalysis(services, inputs);

    expect(reports).toHaveLength(3);
    expect(reports.every((r) => r.timestamp)).toBe(true);
  });
});
