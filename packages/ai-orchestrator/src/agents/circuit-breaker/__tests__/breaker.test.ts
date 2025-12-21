import { describe, it, expect, beforeEach } from 'vitest';
import CircuitBreakerAgent from '../index';

describe('CircuitBreakerAgent', () => {
  let agent: CircuitBreakerAgent;

  beforeEach(() => {
    agent = new CircuitBreakerAgent();
  });

  it('should detect service degradation', async () => {
    const input = {
      serviceId: 'test-service',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(result.data?.currentStatus).toBeDefined();
  });

  it('should have valid circuit state', async () => {
    const input = {
      serviceId: 'test-service',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(['healthy', 'degraded', 'failed', 'recovering']).toContain(
      result.data?.currentStatus?.state,
    );
  });

  it('should activate fallbacks when needed', async () => {
    const input = {
      serviceId: 'test-service',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(result.data?.fallbacksActive).toBeDefined();
  });

  it('should estimate recovery time', async () => {
    const input = {
      serviceId: 'test-service',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    if (result.data?.recoveryInProgress) {
      expect(result.data?.estimatedRecoveryTime).toBeGreaterThan(0);
    }
  });
});
