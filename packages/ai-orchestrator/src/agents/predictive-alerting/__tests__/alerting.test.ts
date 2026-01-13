import { describe, it, expect, beforeEach } from 'vitest';
import PredictiveAlertingAgent from '../index';

describe('PredictiveAlertingAgent', () => {
  let agent: PredictiveAlertingAgent;

  beforeEach(() => {
    agent = new PredictiveAlertingAgent();
  });

  it('should identify historical patterns', async () => {
    const historicalData = Array.from({ length: 100 }, (_, i) => ({
      timestamp: new Date(Date.now() - (100 - i) * 3600000),
      metrics: { cpu: 40 + Math.random() * 20, memory: 50 + Math.random() * 15 },
    }));

    const result = await agent.execute({
      serviceId: 'test-service',
      historicalData,
    });

    expect(result.success).toBe(true);
  });

  it('should generate predictive alerts', async () => {
    const historicalData = Array.from({ length: 50 }, (_, i) => ({
      timestamp: new Date(Date.now() - (50 - i) * 3600000),
      metrics: {
        cpu: 30 + i * 1.5, // trending up
        memory: 50 + Math.random() * 10,
      },
    }));

    const result = await agent.execute({
      serviceId: 'test-service',
      historicalData,
    });

    expect(result.success).toBe(true);
    expect(result.data?.alerts).toBeDefined();
  });

  it('should forecast reliability', async () => {
    const historicalData = Array.from({ length: 100 }, (_, i) => ({
      timestamp: new Date(Date.now() - (100 - i) * 3600000),
      metrics: { cpu: 50 + Math.random() * 20 },
    }));

    const result = await agent.execute({
      serviceId: 'test-service',
      historicalData,
    });

    expect(result.success).toBe(true);
    expect(result.data?.reliabilityForecast?.availability30days).toBeGreaterThan(95);
    expect(result.data?.reliabilityForecast?.availability30days).toBeLessThanOrEqual(99.99);
  });
});
