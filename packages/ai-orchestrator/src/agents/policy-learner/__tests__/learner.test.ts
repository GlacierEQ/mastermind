import { describe, it, expect, beforeEach } from 'vitest';
import PolicyLearnerAgent from '../index';

describe('PolicyLearnerAgent', () => {
  let agent: PolicyLearnerAgent;

  beforeEach(() => {
    agent = new PolicyLearnerAgent();
  });

  it('should learn policies from decisions', async () => {
    const decisions = Array.from({ length: 20 }, (_, i) => ({
      decision: i % 2 === 0 ? 'scale-up' : 'scale-down',
      context: { cpu: 70 + Math.random() * 20, memory: 60 + Math.random() * 30 },
      outcome: (i % 3 === 0 ? 'positive' : 'neutral') as any,
      impact: i % 3 === 0 ? 50 : 0,
      timestamp: new Date(),
    }));

    const result = await agent.execute({
      serviceId: 'test-service',
      decisions,
    });

    expect(result.success).toBe(true);
    expect(result.data?.learnedPolicies).toBeDefined();
    expect((result.data?.learnedPolicies || []).length).toBeGreaterThan(0);
  });

  it('should calculate policy success rates', async () => {
    const decisions = Array.from({ length: 10 }, (_, i) => ({
      decision: 'optimize',
      context: { load: 50 + i * 5 },
      outcome: i < 7 ? ('positive' as any) : ('negative' as any),
      impact: i < 7 ? 30 : -10,
      timestamp: new Date(),
    }));

    const result = await agent.execute({
      serviceId: 'test-service',
      decisions,
    });

    expect(result.success).toBe(true);
    expect((result.data?.learnedPolicies || []).some((p) => p.successRate > 60)).toBe(true);
  });

  it('should generate recommendations', async () => {
    const decisions = Array.from({ length: 15 }, (_, i) => ({
      decision: i % 2 === 0 ? 'cache' : 'no-cache',
      context: { hits: Math.random() * 100 },
      outcome: 'positive' as any,
      impact: 40,
      timestamp: new Date(),
    }));

    const result = await agent.execute({
      serviceId: 'test-service',
      decisions,
    });

    expect(result.success).toBe(true);
    expect((result.data?.recommendedActions || []).length).toBeGreaterThan(0);
  });
});
