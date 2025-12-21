import { describe, it, expect, beforeEach } from 'vitest';
import AutonomousBugFixerAgent from '../index';

describe('AutonomousBugFixerAgent', () => {
  let agent: AutonomousBugFixerAgent;

  beforeEach(() => {
    agent = new AutonomousBugFixerAgent();
  });

  it('should detect null pointer errors', async () => {
    const input = {
      serviceId: 'test-service',
      errorLog: 'TypeError: Cannot read property of null pointer exception at line 42',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(result.data?.rootCause?.type).toBe('null-pointer');
  });

  it('should detect timeout errors', async () => {
    const input = {
      serviceId: 'test-service',
      errorLog: 'TimeoutError: Operation timed out after 2000ms',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(result.data?.rootCause?.type).toBe('timeout');
  });

  it('should generate multiple candidate fixes', async () => {
    const input = {
      serviceId: 'test-service',
      errorLog: 'NullPointerException at index 42',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect((result.data?.candidateFixes || []).length).toBeGreaterThan(0);
  });

  it('should select the lowest-risk fix', async () => {
    const input = {
      serviceId: 'test-service',
      errorLog: 'NullPointerException',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(result.data?.selectedFix?.riskLevel).toBe('low');
  });

  it('should provide a rollback plan', async () => {
    const input = {
      serviceId: 'test-service',
      errorLog: 'Error',
    };

    const result = await agent.execute(input);
    expect(result.success).toBe(true);
    expect(result.data?.rollbackPlan).toBeTruthy();
  });
});
