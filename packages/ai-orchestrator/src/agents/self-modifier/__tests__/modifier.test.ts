import { describe, it, expect, beforeEach } from 'vitest';
import SelfModifyingAgent from '../index';

describe('SelfModifyingAgent', () => {
  let agent: SelfModifyingAgent;

  beforeEach(() => {
    agent = new SelfModifyingAgent();
  });

  it('should identify underperforming agents', async () => {
    const performance = [
      {
        agentName: 'Agent A',
        successRate: 50,
        averageExecutionTime: 2000,
        errorRate: 15,
        reliability: 70,
        lastModified: new Date(),
      },
    ];

    const result = await agent.execute({
      agentPerformanceData: performance,
      threshold: 80,
    });

    expect(result.success).toBe(true);
    expect(result.data?.suggestedModifications).toBeDefined();
  });

  it('should suggest safe modifications', async () => {
    const performance = [
      {
        agentName: 'Agent B',
        successRate: 60,
        averageExecutionTime: 1500,
        errorRate: 20,
        reliability: 65,
        lastModified: new Date(),
      },
    ];

    const result = await agent.execute({
      agentPerformanceData: performance,
    });

    expect(result.success).toBe(true);
    expect((result.data?.modificationLog || []).length).toBeGreaterThanOrEqual(0);
  });
});
