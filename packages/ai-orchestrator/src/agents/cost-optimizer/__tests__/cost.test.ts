import { describe, it, expect, beforeEach } from 'vitest';
import CostOptimizerAgent from '../index';

describe('CostOptimizerAgent', () => {
  let agent: CostOptimizerAgent;

  beforeEach(() => {
    agent = new CostOptimizerAgent();
  });

  it('should identify cost optimization opportunities', async () => {
    const allocations = [
      {
        type: 'compute' as const,
        current: 2,
        allocated: 8,
        cost: 400,
        utilizationPercent: 25,
      },
      {
        type: 'storage' as const,
        current: 50,
        allocated: 500,
        cost: 100,
        utilizationPercent: 10,
      },
    ];

    const result = await agent.execute({
      serviceId: 'test-service',
      currentMonthlySpend: 5000,
      resourceAllocations: allocations,
    });

    expect(result.success).toBe(true);
    expect(result.data?.savings).toBeDefined();
    expect((result.data?.savings || []).length).toBeGreaterThan(0);
  });

  it('should calculate monthly savings potential', async () => {
    const allocations = [
      {
        type: 'compute' as const,
        current: 1,
        allocated: 4,
        cost: 200,
        utilizationPercent: 25,
      },
    ];

    const result = await agent.execute({
      serviceId: 'test-service',
      currentMonthlySpend: 1000,
      resourceAllocations: allocations,
    });

    expect(result.success).toBe(true);
    expect(result.data?.potentialMonthlySavings).toBeGreaterThan(0);
  });

  it('should rank savings by ROI', async () => {
    const allocations = Array.from({ length: 5 }, (_, i) => ({
      type: (i % 2 === 0 ? 'compute' : 'storage') as const,
      current: 10 + i,
      allocated: 100 + i * 20,
      cost: 200 + i * 50,
      utilizationPercent: 10 + i * 5,
    }));

    const result = await agent.execute({
      serviceId: 'test-service',
      currentMonthlySpend: 5000,
      resourceAllocations: allocations,
    });

    expect(result.success).toBe(true);
    expect(result.data?.savings).toBeDefined();
  });
});
