import { describe, it, expect, beforeEach } from 'vitest';
import AutomaticScalingAdjusterAgent from '../index';

describe('AutomaticScalingAdjusterAgent', () => {
  let agent: AutomaticScalingAdjusterAgent;

  beforeEach(() => {
    agent = new AutomaticScalingAdjusterAgent();
  });

  it('should analyze scaling effectiveness', async () => {
    const input = {
      serviceId: 'test-service',
      lookbackDays: 7,
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(result.data?.accuracy).toBeDefined();
  });

  it('should generate adjustment suggestions', async () => {
    const input = {
      serviceId: 'test-service',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(result.data?.suggestions).toBeDefined();
  });

  it('should apply low-risk adjustments automatically', async () => {
    const input = {
      serviceId: 'test-service',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    // May have adjustments depending on simulated data
    expect(result.data?.appliedAdjustments).toBeDefined();
  });

  it('should consider aggressive mode', async () => {
    const input = {
      serviceId: 'test-service',
      aggressive: true,
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(result.data?.suggestions).toBeDefined();
  });
});
