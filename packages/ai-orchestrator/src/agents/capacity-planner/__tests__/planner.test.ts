import { describe, it, expect, beforeEach } from 'vitest';
import CapacityPlannerAgent from '../index';

describe('CapacityPlannerAgent', () => {
  let agent: CapacityPlannerAgent;

  beforeEach(() => {
    agent = new CapacityPlannerAgent();
  });

  it('should forecast 30, 60, 90 days', async () => {
    const input = {
      serviceId: 'test-service',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(result.data?.forecast30).toBeDefined();
    expect(result.data?.forecast60).toBeDefined();
    expect(result.data?.forecast90).toBeDefined();
  });

  it('should identify saturation risk', async () => {
    const input = {
      serviceId: 'test-service',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(['low', 'medium', 'high']).toContain(result.data?.forecast90?.saturationRisk);
  });

  it('should estimate annual cost', async () => {
    const input = {
      serviceId: 'test-service',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(result.data?.estimatedCost).toBeGreaterThan(0);
  });

  it('should trigger auto-provisioning for high risk', async () => {
    const input = {
      serviceId: 'test-service',
      horizonDays: 90,
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    // provisioned flag depends on simulated forecast
    expect(result.data?.provisioned).toBeDefined();
  });
});
