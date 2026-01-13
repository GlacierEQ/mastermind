import { describe, it, expect, beforeEach } from 'vitest';
import MetaLearnerAgent from '../index';

describe('MetaLearnerAgent', () => {
  let agent: MetaLearnerAgent;

  beforeEach(() => {
    agent = new MetaLearnerAgent();
  });

  it('should analyze learning trends', async () => {
    const history = Array.from({ length: 10 }, (_, i) => ({
      agentName: 'TestAgent',
      cycleNumber: i + 1,
      trainingTime: 1000 - i * 50,
      dataSize: 1000 + i * 100,
      accuracy: 70 + i * 2,
      convergenceTime: 100 - i * 5,
      memoryUsed: 500 + i * 20,
    }));

    const result = await agent.execute({
      agentName: 'TestAgent',
      learningHistory: history,
    });

    expect(result.success).toBe(true);
    expect(result.data?.insights).toBeDefined();
  });

  it('should calculate training improvements', async () => {
    const history = [
      {
        agentName: 'Agent',
        cycleNumber: 1,
        trainingTime: 1000,
        dataSize: 1000,
        accuracy: 70,
        convergenceTime: 100,
        memoryUsed: 500,
      },
      {
        agentName: 'Agent',
        cycleNumber: 2,
        trainingTime: 800,
        dataSize: 1500,
        accuracy: 82,
        convergenceTime: 80,
        memoryUsed: 600,
      },
    ];

    const result = await agent.execute({
      agentName: 'Agent',
      learningHistory: history,
    });

    expect(result.success).toBe(true);
    expect(result.data?.trainingTimeReduction).toBeGreaterThan(0);
    expect(result.data?.accuracyImprovement).toBeGreaterThan(0);
  });
});
