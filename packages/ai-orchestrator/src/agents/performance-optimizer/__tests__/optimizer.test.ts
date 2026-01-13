import { describe, it, expect, beforeEach } from 'vitest';
import PerformanceOptimizerAgent from '../index';

describe('PerformanceOptimizerAgent', () => {
  let agent: PerformanceOptimizerAgent;

  beforeEach(() => {
    agent = new PerformanceOptimizerAgent();
  });

  it('should identify performance bottlenecks', async () => {
    const traces = [
      ...Array.from({ length: 50 }, () => ({
        name: 'database-query',
        duration: 150 + Math.random() * 100,
        timestamp: new Date(),
      })),
      ...Array.from({ length: 50 }, () => ({
        name: 'api-call',
        duration: 50 + Math.random() * 30,
        timestamp: new Date(),
      })),
    ];

    const result = await agent.execute({
      serviceId: 'test-service',
      traces,
    });

    expect(result.success).toBe(true);
    expect(result.data?.bottlenecks).toBeDefined();
    expect((result.data?.bottlenecks || []).length).toBeGreaterThan(0);
  });

  it('should generate optimization recommendations', async () => {
    const traces = Array.from({ length: 100 }, (_, i) => ({
      name: i % 2 === 0 ? 'cache-miss' : 'cache-hit',
      duration: i % 2 === 0 ? 200 : 50,
      timestamp: new Date(),
    }));

    const result = await agent.execute({
      serviceId: 'test-service',
      traces,
    });

    expect(result.success).toBe(true);
    expect(result.data?.optimizations).toBeDefined();
  });

  it('should calculate performance score', async () => {
    const traces = Array.from({ length: 100 }, () => ({
      name: 'request',
      duration: 50 + Math.random() * 50,
      timestamp: new Date(),
    }));

    const result = await agent.execute({
      serviceId: 'test-service',
      traces,
    });

    expect(result.success).toBe(true);
    expect(result.data?.performanceScore).toBeGreaterThan(50);
    expect(result.data?.performanceScore).toBeLessThanOrEqual(100);
  });
});
