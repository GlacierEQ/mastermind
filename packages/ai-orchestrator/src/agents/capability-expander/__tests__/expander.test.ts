import { describe, it, expect, beforeEach } from 'vitest';
import CapabilityExpanderAgent from '../index';

describe('CapabilityExpanderAgent', () => {
  let agent: CapabilityExpanderAgent;

  beforeEach(() => {
    agent = new CapabilityExpanderAgent();
  });

  it('should identify capability gaps', async () => {
    const result = await agent.execute({
      currentCapabilities: ['monitoring', 'alerting'],
    });

    expect(result.success).toBe(true);
    expect(result.data?.capabilityGaps).toBeDefined();
    expect((result.data?.capabilityGaps || []).length).toBeGreaterThan(0);
  });

  it('should propose new capabilities', async () => {
    const result = await agent.execute({
      currentCapabilities: ['basic'],
      systemGaps: ['ML Training', 'Real-time Processing'],
    });

    expect(result.success).toBe(true);
    expect((result.data?.proposedCapabilities || []).length).toBeGreaterThan(0);
  });

  it('should build development roadmap', async () => {
    const result = await agent.execute({
      currentCapabilities: ['core'],
    });

    expect(result.success).toBe(true);
    expect((result.data?.roadmap || []).length).toBeGreaterThan(0);
  });
});
