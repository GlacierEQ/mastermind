import { describe, it, expect, beforeEach } from 'vitest';
import ParameterOptimizerAgent from '../index';

describe('ParameterOptimizerAgent', () => {
  let agent: ParameterOptimizerAgent;

  beforeEach(() => {
    agent = new ParameterOptimizerAgent();
  });

  it('should optimize parameters from experiments', async () => {
    const experiments = Array.from({ length: 15 }, (_, i) => ({
      parameter: 'cache_size',
      value: 100 + i * 50,
      metric: 'latency',
      result: 100 - i * 3, // decreasing latency
      timestamp: new Date(),
    }));

    const result = await agent.execute({
      serviceId: 'test-service',
      experiments,
      parameters: { cache_size: { min: 0, max: 1000, current: 100 } },
    });

    expect(result.success).toBe(true);
    expect(result.data?.optimizations).toBeDefined();
  });

  it('should suggest next experiments', async () => {
    const experiments: any[] = [];

    const result = await agent.execute({
      serviceId: 'test-service',
      experiments,
      parameters: {
        threshold: { min: 0.1, max: 0.9, current: 0.5 },
        timeout: { min: 100, max: 5000, current: 1000 },
      },
    });

    expect(result.success).toBe(true);
    expect((result.data?.nextExperimentsToRun || []).length).toBeGreaterThan(0);
  });
});
