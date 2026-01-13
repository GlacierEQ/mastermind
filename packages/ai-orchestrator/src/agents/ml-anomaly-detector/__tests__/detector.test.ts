import { describe, it, expect, beforeEach } from 'vitest';
import MLAnomalyDetectorAgent from '../index';

describe('MLAnomalyDetectorAgent', () => {
  let agent: MLAnomalyDetectorAgent;

  beforeEach(() => {
    agent = new MLAnomalyDetectorAgent();
  });

  it('should detect metric anomalies', async () => {
    const metrics = Array.from({ length: 100 }, (_, i) => ({
      timestamp: new Date(Date.now() - (100 - i) * 60000),
      name: 'cpu',
      value: 50 + Math.random() * 10,
    }));

    const result = await agent.execute({
      serviceId: 'test-service',
      metrics,
    });

    expect(result.success).toBe(true);
    expect(result.data?.anomalies).toBeDefined();
  });

  it('should calculate anomaly score', async () => {
    const metrics = Array.from({ length: 100 }, (_, i) => ({
      timestamp: new Date(Date.now() - (100 - i) * 60000),
      name: 'memory',
      value: i > 80 ? 95 : 50 + Math.random() * 10, // spike at end
    }));

    const result = await agent.execute({
      serviceId: 'test-service',
      metrics,
    });

    expect(result.success).toBe(true);
    expect(result.data?.anomalyScore).toBeGreaterThan(0);
  });

  it('should generate predictions', async () => {
    const metrics = Array.from({ length: 50 }, (_, i) => ({
      timestamp: new Date(Date.now() - (50 - i) * 60000),
      name: 'latency',
      value: 50 + i * 2,
    }));

    const result = await agent.execute({
      serviceId: 'test-service',
      metrics,
    });

    expect(result.success).toBe(true);
    expect(result.data?.predictions).toBeDefined();
    expect((result.data?.predictions || []).length).toBeGreaterThan(0);
  });

  it('should identify trends', async () => {
    const metrics = Array.from({ length: 100 }, (_, i) => ({
      timestamp: new Date(Date.now() - (100 - i) * 60000),
      name: 'disk-io',
      value: i * 0.5, // steady increase
    }));

    const result = await agent.execute({
      serviceId: 'test-service',
      metrics,
    });

    expect(result.success).toBe(true);
    expect(result.data?.trends).toBeDefined();
  });
});
