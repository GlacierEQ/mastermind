import { describe, it, expect, beforeEach } from 'vitest';
import ResourceExhaustionAgent from '../index';

describe('ResourceExhaustionAgent', () => {
  let agent: ResourceExhaustionAgent;

  beforeEach(() => {
    agent = new ResourceExhaustionAgent();
  });

  it('should detect resource leaks', async () => {
    const input = {
      serviceId: 'test-service',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(result.data?.leaks).toBeDefined();
  });

  it('should estimate runtime until critical', async () => {
    const input = {
      serviceId: 'test-service',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(result.data?.estimatedRuntime).toBeGreaterThan(0);
  });

  it('should trigger cleanup when critical', async () => {
    const input = {
      serviceId: 'test-service',
      thresholdCritical: 24, // high threshold to potentially trigger cleanup
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(result.data?.cleanupApplied).toBeDefined();
  });

  it('should track current resource usage', async () => {
    const input = {
      serviceId: 'test-service',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(result.data?.currentUsage).toBeDefined();
    expect(result.data?.currentUsage?.memory).toBeGreaterThan(0);
    expect(result.data?.currentUsage?.connections).toBeGreaterThan(0);
  });
});
