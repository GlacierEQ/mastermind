import { describe, it, expect, beforeEach } from 'vitest';
import Phase6Coordinator from '../phase6-coordinator';

describe('Phase6Coordinator', () => {
  let coordinator: Phase6Coordinator;

  beforeEach(() => {
    coordinator = new Phase6Coordinator();
  });

  it('should perform full health check', async () => {
    const result = await coordinator.checkAndHeal('test-service');

    expect(result.serviceId).toBe('test-service');
    expect(result.healthy).toBeDefined();
    expect(result.issues).toBeDefined();
    expect(result.healingApplied).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  it('should check multiple services', async () => {
    const services = ['service-1', 'service-2', 'service-3'];
    const results = await coordinator.fullSystemCheck(services);

    expect(results).toHaveLength(3);
    expect(results.every((r) => r.serviceId && r.timestamp)).toBe(true);
  });

  it('should orchestrate all agents', async () => {
    const result = await coordinator.checkAndHeal('test-service');

    // If healthy, all checks passed
    if (result.healthy) {
      expect(result.issues).toHaveLength(0);
    }

    // Can have healing applied regardless
    expect(Array.isArray(result.healingApplied)).toBe(true);
  });
});
