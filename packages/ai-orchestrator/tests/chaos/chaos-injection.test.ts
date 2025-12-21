/**
 * Chaos Injection Tests
 * Tests system resilience under injected failures, cascades, and emergent patterns.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import EmergenceDetectorAgent from '../../src/agents/emergence-detector';
import Phase8Coordinator from '../../src/kernel/phase8-coordinator';

describe('Chaos Injection: Failure Scenarios', () => {
  let p8: any;
  let emergenceDetector: any;

  beforeEach(() => {
    p8 = new Phase8Coordinator();
    emergenceDetector = new EmergenceDetectorAgent();
  });

  describe('Failure Injection', () => {
    it('Chaos: Single service failure - Phase 6 should heal', async () => {
      const context = {
        serviceId: 'database',
        currentContext: { response_time: 5000, error_rate: 45 },
        incidentHistory: [
          {
            incidentId: 'inc-1',
            affectedService: 'database',
            actionTaken: 'restart',
            contextVariables: { connections: 500, memory: 92 },
            downtimeMinutes: 8,
            timestamp: new Date(),
          },
        ],
        incidentSeverity: 'critical',
      };

      const result = await p8.analyzeOmniscient(context);
      expect(result.causalInsights.recommendedMitigation).toBeDefined();
      expect(result.causalInsights.confidence).toBeGreaterThan(0);
    });

    it('Chaos: Cascade failure - Phase 8 should detect via consensus', async () => {
      const cascadeContext = {
        serviceId: 'api-gateway',
        agentBehaviors: [
          {
            agentId: 'cache',
            state: { hit_rate: 0, error_rate: 100 },
            actions: ['fail-fast', 'timeout'],
            timestamp: new Date(),
          },
          {
            agentId: 'database',
            state: { connection_queue: 500, timeout_rate: 85 },
            actions: ['queue-timeout', 'reject-new'],
            timestamp: new Date(),
          },
          {
            agentId: 'api-gateway',
            state: { pending_requests: 1000, circuit_open: 1 },
            actions: ['circuit-break', 'return-500'],
            timestamp: new Date(),
          },
        ],
        systemMetrics: { error_rate: 78, latency_ms: 8000 },
      };

      const result = await emergenceDetector.execute(cascadeContext);
      expect(result.success).toBe(true);
      expect(result.data.emergentPatterns).toBeDefined();
      expect(result.data.emergentPatterns.length).toBeGreaterThan(0);
    });
  });

  describe('Emergent Pattern Injection', () => {
    it('Chaos: Autoscaler-Throttler oscillation loop', async () => {
      const oscillationMetrics = {
        timestamp_1: { cpu: 85, instances: 10 },
        timestamp_2: { cpu: 45, instances: 8 }, // autoscaler scaled down
        timestamp_3: { cpu: 92, instances: 8 }, // load returned
        timestamp_4: { cpu: 50, instances: 12 }, // throttler kicked in
        timestamp_5: { cpu: 88, instances: 12 }, // cycling back
      };

      const oscillationContext = {
        serviceId: 'api',
        agentBehaviors: Object.values(oscillationMetrics).map((m: any, i: number) => ({
          agentId: i % 2 === 0 ? 'autoscaler' : 'throttler',
          state: m,
          actions: [i % 2 === 0 ? 'scale' : 'throttle'],
          timestamp: new Date(Date.now() - i * 5000),
        })),
        systemMetrics: oscillationMetrics,
      };

      const result = await emergenceDetector.execute(oscillationContext);
      expect(result.data.emergentPatterns).toBeDefined();
      const hasOscillation = result.data.emergentPatterns.some((p: any) => p.name === 'Oscillation Loop');
      expect(hasOscillation).toBe(true);
    });

    it('Chaos: Retry storm amplification', async () => {
      const retryStormContext = {
        serviceId: 'payment-service',
        agentBehaviors: Array(50)
          .fill(null)
          .map((_, i) => ({
            agentId: `worker-${i}`,
            state: { retry_count: 5 + Math.random() * 10 },
            actions: ['retry', 'retry', 'retry'],
            timestamp: new Date(),
          })),
        systemMetrics: { retry_rate: 450, downstreamLoad: 8500 },
      };

      const result = await emergenceDetector.execute(retryStormContext);
      expect(result.data.emergentPatterns).toBeDefined();
      const hasRetryStorm = result.data.emergentPatterns.some((p: any) => p.name === 'Retry Storm');
      expect(hasRetryStorm).toBe(true);
    });

    it('Chaos: Resource exhaustion pattern', async () => {
      const exhaustionContext = {
        serviceId: 'worker-pool',
        agentBehaviors: [],
        systemMetrics: {
          memory_used: 94,
          disk_full: 96,
          cpu_percent: 98,
          threads: 5000,
        },
      };

      const result = await emergenceDetector.execute(exhaustionContext);
      expect(result.data.emergentPatterns).toBeDefined();
      const hasExhaustion = result.data.emergentPatterns.some((p: any) => p.name === 'Resource Exhaustion');
      expect(hasExhaustion).toBe(true);
    });
  });

  describe('Cascading Failure Scenarios', () => {
    it('Chaos: Multi-level cascade (3+ services failing)', async () => {
      const cascadeContext = {
        serviceId: 'system',
        agentBehaviors: [
          {
            agentId: 'cache',
            state: { available: 0, error_rate: 100 },
            actions: ['fail'],
            timestamp: new Date(),
          },
          {
            agentId: 'database',
            state: { connection_pool: 0, error_rate: 95 },
            actions: ['queue-full', 'reject'],
            timestamp: new Date(),
          },
          {
            agentId: 'api',
            state: { circuit_open: 1, error_rate: 85 },
            actions: ['circuit-break'],
            timestamp: new Date(),
          },
          {
            agentId: 'frontend',
            state: { response_time: 30000, error_rate: 70 },
            actions: ['timeout', 'retry'],
            timestamp: new Date(),
          },
        ],
        systemMetrics: { system_error_rate: 88 },
      };

      const result = await emergenceDetector.execute(cascadeContext);
      const hasCascade = result.data.emergentPatterns.some((p: any) => p.name === 'Cascade Failure');
      expect(hasCascade).toBe(true);
    });
  });

  describe('System Health Under Chaos', () => {
    it('System health should degrade with each emergent pattern', async () => {
      const noProblemsContext = {
        serviceId: 'healthy',
        agentBehaviors: [],
        systemMetrics: { error_rate: 0.1, cpu: 30 },
      };

      const result1 = await emergenceDetector.execute(noProblemsContext);
      const healthNoProblems = result1.data.systemHealth;

      const withProblemsContext = {
        serviceId: 'troubled',
        agentBehaviors: Array(50)
          .fill(null)
          .map((_, i) => ({
            agentId: `agent-${i}`,
            state: { retry_count: 10 },
            actions: ['retry', 'fail', 'retry'],
            timestamp: new Date(),
          })),
        systemMetrics: { memory_used: 95, disk_full: 92, error_rate: 45 },
      };

      const result2 = await emergenceDetector.execute(withProblemsContext);
      const healthWithProblems = result2.data.systemHealth;

      expect(healthWithProblems).toBeLessThan(healthNoProblems);
    });
  });
});
