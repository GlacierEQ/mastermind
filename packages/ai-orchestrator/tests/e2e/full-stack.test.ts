/**
 * End-to-End Tests: Phases 1-8 Full Integration
 * Tests complete incident lifecycle through all 8 phases.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import Phase5Coordinator from '../../src/kernel/phase5-coordinator';
import Phase6Coordinator from '../../src/kernel/phase6-coordinator';
import Phase7Coordinator from '../../src/kernel/phase7-coordinator';
import Phase8Coordinator from '../../src/kernel/phase8-coordinator';

describe('E2E: Full Phases 1-8 Stack', () => {
  let p5: any;
  let p6: any;
  let p7: any;
  let p8: any;
  let testContext: any;

  beforeEach(() => {
    p5 = new Phase5Coordinator();
    p6 = new Phase6Coordinator();
    p7 = new Phase7Coordinator();
    p8 = new Phase8Coordinator();

    testContext = {
      serviceId: 'api-gateway',
      currentMetrics: {
        error_rate: 8.5,
        latency_ms: 450,
        cpu_percent: 92,
        memory_percent: 88,
      },
      events: [],
      incidents: [],
      agentBehaviors: [],
      systemMetrics: {},
      historicalMetrics: {},
      incidentHistory: [],
      severity: 'critical',
    };
  });

  it('Phase 5: detects anomaly', async () => {
    const result = await p5.analyzeIntelligence(testContext);
    expect(result.success).toBe(true);
    expect(result.data.anomaliesDetected).toBeGreaterThan(0);
    expect(result.data.forecasts).toBeDefined();
  });

  it('Phase 5 + 6: detects + heals', async () => {
    const intel = await p5.analyzeIntelligence(testContext);
    expect(intel.success).toBe(true);

    const healInput = {
      ...testContext,
      anomalies: intel.data.anomaliesDetected,
      severity: 'critical',
    };

    const healed = await p6.orchestrateHealing(healInput);
    expect(healed.success).toBe(true);
    expect(healed.data.actionsExecuted).toBeGreaterThan(0);
  });

  it('Phase 5 + 6 + 7: detects + heals + learns', async () => {
    const intel = await p5.analyzeIntelligence(testContext);
    const healed = await p6.orchestrateHealing({
      ...testContext,
      anomalies: intel.data.anomaliesDetected,
    });

    const learnInput = {
      serviceId: testContext.serviceId,
      anomaly: intel.data.anomaliesDetected[0],
      actionsTaken: healed.data.actionsExecuted,
      outcome: { downtimeReduced: 15, metricsImproved: 3 },
      policyId: 'policy-api-gateway-v1',
    };

    const learned = await p7.optimizePolicies(learnInput);
    expect(learned.success).toBe(true);
    expect(learned.data.policiesUpdated).toBeGreaterThan(0);
  });

  it('Full Stack 5-8: anomaly → heal → learn → omniscient', async () => {
    // Phase 5: Detect
    const intel = await p5.analyzeIntelligence(testContext);
    expect(intel.success).toBe(true);

    // Phase 6: Heal
    const healed = await p6.orchestrateHealing({
      ...testContext,
      anomalies: intel.data.anomaliesDetected,
    });
    expect(healed.success).toBe(true);

    // Phase 7: Learn
    const learned = await p7.optimizePolicies({
      serviceId: testContext.serviceId,
      anomaly: intel.data.anomaliesDetected[0],
      actionsTaken: healed.data.actionsExecuted,
      outcome: { downtimeReduced: 20, success: true },
      policyId: 'policy-v1',
    });
    expect(learned.success).toBe(true);

    // Phase 8: Omniscient analysis
    const omniscient = await p8.analyzeOmniscient({
      ...testContext,
      events: [{ type: 'cpu_spike', service: 'api-gateway', metric: 'cpu', value: 92, timestamp: new Date() }],
      incidents: ['incident-12345'],
      voters: ['agent-1', 'agent-2', 'agent-3'],
      affectedServices: ['api-gateway'],
    });

    expect(omniscient.serviceId).toBe('api-gateway');
    expect(omniscient.causalInsights).toBeDefined();
    expect(omniscient.consensusDecision).toBeDefined();
    expect(omniscient.systemHealth).toBeGreaterThan(0);
    expect(omniscient.forecastedCapacity24h).toBeGreaterThan(0);
  });

  it('E2E: Metric thresholds trigger correct phase responses', async () => {
    const highCpu = { ...testContext, currentMetrics: { ...testContext.currentMetrics, cpu_percent: 95 } };

    const intel = await p5.analyzeIntelligence(highCpu);
    expect(intel.data.anomaliesDetected).toBeGreaterThan(0);

    const healed = await p6.orchestrateHealing({ ...highCpu, anomalies: intel.data.anomaliesDetected });
    expect(healed.data.actionsExecuted[0]).toMatch(/scale|throttle|restart/);
  });

  it('E2E: All phases maintain state consistency', async () => {
    const phase5Result = await p5.analyzeIntelligence(testContext);
    const phase6Result = await p6.orchestrateHealing({
      ...testContext,
      anomalies: phase5Result.data.anomaliesDetected,
    });
    const phase7Result = await p7.optimizePolicies({
      serviceId: testContext.serviceId,
      anomaly: phase5Result.data.anomaliesDetected[0],
      actionsTaken: phase6Result.data.actionsExecuted,
      outcome: { success: true },
      policyId: 'test-policy',
    });
    const phase8Result = await p8.analyzeOmniscient(testContext);

    expect(phase5Result.success).toBe(true);
    expect(phase6Result.success).toBe(true);
    expect(phase7Result.success).toBe(true);
    expect(phase8Result).toBeDefined();

    // All results should reference same serviceId
    expect(phase5Result.data.serviceId).toBe(testContext.serviceId);
    expect(phase6Result.data.serviceId).toBe(testContext.serviceId);
    expect(phase8Result.serviceId).toBe(testContext.serviceId);
  });
});
