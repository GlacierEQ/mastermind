import { describe, it, expect, beforeEach } from 'vitest';
import SystemArchitectAgent from '../index';

describe('SystemArchitectAgent', () => {
  let agent: SystemArchitectAgent;

  beforeEach(() => {
    agent = new SystemArchitectAgent();
  });

  it('should generate architecture recommendations', async () => {
    const metrics = {
      scalability: 50,
      maintainability: 60,
      reliability: 75,
      performance: 65,
      cost: 5000,
    };

    const result = await agent.execute({
      currentMetrics: metrics,
      usagePatterns: { reads: 1000, writes: 100 },
    });

    expect(result.success).toBe(true);
    expect(result.data?.recommendations).toBeDefined();
  });

  it('should design next-gen architecture', async () => {
    const metrics = {
      scalability: 40,
      maintainability: 50,
      reliability: 60,
      performance: 50,
      cost: 8000,
    };

    const result = await agent.execute({
      currentMetrics: metrics,
      usagePatterns: {},
      bottlenecks: ['database', 'cache'],
    });

    expect(result.success).toBe(true);
    expect(result.data?.nextGenArchitecture).toBeDefined();
  });

  it('should calculate ROI', async () => {
    const metrics = {
      scalability: 60,
      maintainability: 70,
      reliability: 80,
      performance: 70,
      cost: 4000,
    };

    const result = await agent.execute({
      currentMetrics: metrics,
      usagePatterns: {},
    });

    expect(result.success).toBe(true);
    expect(result.data?.estimatedRoi).toBeGreaterThanOrEqual(0);
  });
});
