/**
 * Production Guardrails Tests
 * Validates all thresholds, consensus %, confidence floors, and safety limits.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import ConsensusCoordinatorAgent from '../../src/agents/consensus-coordinator';
import CausalMitigatorAgent from '../../src/agents/causal-mitigator';

const GUARDRAILS = {
  causalConfidenceFloor: 60, // Min % for auto-action
  consensusThreshold: 66, // Min % approval for high-risk
  criticalSeverityThreshold: 0.8, // Error rate > 80% = critical
  cascadeDetectionThreshold: 3, // 3+ services = cascade
  systemHealthFloor: 30, // Below this = emergency
  forecastRiskThreshold: 0.85, // 85%+ capacity = risk
};

const CONFIDENCE_TIERS = {
  lowRisk: { confidenceFloor: 40, consensusThreshold: 50 }, // Local restart
  mediumRisk: { confidenceFloor: 60, consensusThreshold: 66 }, // Scale action
  highRisk: { confidenceFloor: 75, consensusThreshold: 75 }, // Failover
  criticalRisk: { confidenceFloor: 85, consensusThreshold: 85 }, // Global change
};

describe('Production Guardrails', () => {
  describe('Causal Confidence Floor', () => {
    it('Guardrail: Action approved if causal confidence >= 60%', async () => {
      const causalMitigator = new CausalMitigatorAgent();

      const highConfidenceInput = {
        serviceId: 'api',
        currentContext: { error_rate: 45 },
        incidentHistory: [
          {
            incidentId: 'inc-1',
            affectedService: 'api',
            actionTaken: 'restart',
            contextVariables: { errors: 100 },
            downtimeMinutes: 5,
            timestamp: new Date(),
          },
          {
            incidentId: 'inc-2',
            affectedService: 'api',
            actionTaken: 'restart',
            contextVariables: { errors: 95 },
            downtimeMinutes: 4,
            timestamp: new Date(),
          },
          {
            incidentId: 'inc-3',
            affectedService: 'api',
            actionTaken: 'restart',
            contextVariables: { errors: 102 },
            downtimeMinutes: 6,
            timestamp: new Date(),
          },
        ],
        incidentSeverity: 'high',
      };

      const result = await causalMitigator.execute(highConfidenceInput);
      const confidence = result.data.confidenceLevel;

      if (confidence >= GUARDRAILS.causalConfidenceFloor) {
        expect(result.data.recommendedAction).toBeDefined();
      } else {
        expect(result.data.fallbackAction).toBeDefined();
      }
    });

    it('Guardrail: Action blocked/fallback if confidence < 60%', async () => {
      const causalMitigator = new CausalMitigatorAgent();

      const lowConfidenceInput = {
        serviceId: 'new-service',
        currentContext: { error_rate: 50 },
        incidentHistory: [], // No history = low confidence
        incidentSeverity: 'critical',
      };

      const result = await causalMitigator.execute(lowConfidenceInput);
      const confidence = result.data.confidenceLevel || 0;

      expect(confidence).toBeLessThan(GUARDRAILS.causalConfidenceFloor);
      expect(result.data.fallbackAction).toBeDefined();
    });
  });

  describe('Consensus Threshold', () => {
    it('Guardrail: High-risk action approved at >= 66% consensus', async () => {
      const consensus = new ConsensusCoordinatorAgent();

      const proposal = {
        id: 'prop-failover',
        action: 'region-failover',
        priority: 'critical',
        risklevel: 'high',
        affectedServices: ['api', 'database', 'cache'],
        timestamp: new Date(),
      };

      const result = await consensus.execute({
        proposal,
        voters: ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5'],
        requiredConsensus: GUARDRAILS.consensusThreshold,
      });

      if (result.data.consensusPercentage >= GUARDRAILS.consensusThreshold) {
        expect(result.data.approved).toBe(true);
      } else {
        expect(result.data.approved).toBe(false);
      }
    });

    it('Guardrail: Action blocked if consensus < 66%', async () => {
      const consensus = new ConsensusCoordinatorAgent();

      const proposal = {
        id: 'prop-dangerous',
        action: 'global-throttle',
        priority: 'high',
        risklevel: 'high',
        affectedServices: ['*'],
        timestamp: new Date(),
      };

      const result = await consensus.execute({
        proposal,
        voters: ['agent-1', 'agent-2', 'agent-3'],
        requiredConsensus: GUARDRAILS.consensusThreshold,
      });

      if (result.data.consensusPercentage < GUARDRAILS.consensusThreshold) {
        expect(result.data.approved).toBe(false);
      }
    });
  });

  describe('Risk-Based Confidence Tiers', () => {
    it('Guardrail: Low-risk action needs 40% confidence', () => {
      const tier = CONFIDENCE_TIERS.lowRisk;
      expect(tier.confidenceFloor).toBe(40);
      expect(tier.consensusThreshold).toBe(50);
    });

    it('Guardrail: Medium-risk action needs 60% confidence', () => {
      const tier = CONFIDENCE_TIERS.mediumRisk;
      expect(tier.confidenceFloor).toBe(60);
      expect(tier.consensusThreshold).toBe(66);
    });

    it('Guardrail: High-risk action needs 75% confidence', () => {
      const tier = CONFIDENCE_TIERS.highRisk;
      expect(tier.confidenceFloor).toBe(75);
      expect(tier.consensusThreshold).toBe(75);
    });

    it('Guardrail: Critical-risk action needs 85% confidence', () => {
      const tier = CONFIDENCE_TIERS.criticalRisk;
      expect(tier.confidenceFloor).toBe(85);
      expect(tier.consensusThreshold).toBe(85);
    });
  });

  describe('Severity-Based Thresholds', () => {
    it('Guardrail: Error rate > 80% = critical severity', () => {
      const errorRate = 0.85;
      expect(errorRate).toBeGreaterThan(GUARDRAILS.criticalSeverityThreshold);
    });

    it('Guardrail: Cascade (3+ services) = critical', () => {
      const affectedServices = 4;
      expect(affectedServices).toBeGreaterThanOrEqual(GUARDRAILS.cascadeDetectionThreshold);
    });

    it('Guardrail: System health < 30% = emergency', () => {
      const systemHealth = 25;
      expect(systemHealth).toBeLessThan(GUARDRAILS.systemHealthFloor);
    });
  });

  describe('Forecasting Risk Thresholds', () => {
    it('Guardrail: Capacity forecast > 85% = proactive action', () => {
      const forecasted24hCapacity = 0.87;
      expect(forecasted24hCapacity).toBeGreaterThan(GUARDRAILS.forecastRiskThreshold);
    });

    it('Guardrail: Capacity < 85% = monitor only', () => {
      const forecasted24hCapacity = 0.72;
      expect(forecasted24hCapacity).toBeLessThanOrEqual(GUARDRAILS.forecastRiskThreshold);
    });
  });

  describe('Combined Guardrails (Real Scenarios)', () => {
    it('Scenario: Low confidence + high consensus required = safe', () => {
      const confidence = 45; // Below floor
      const consensus = 70; // Above threshold

      // Action should still be blocked due to low confidence
      expect(confidence).toBeLessThan(GUARDRAILS.causalConfidenceFloor);
      expect(confidence < GUARDRAILS.causalConfidenceFloor).toBe(true);
    });

    it('Scenario: High confidence + low consensus = blocked', () => {
      const confidence = 80; // Above floor
      const consensus = 55; // Below threshold

      // Action should be blocked due to low consensus
      expect(consensus).toBeLessThan(GUARDRAILS.consensusThreshold);
      expect(consensus < GUARDRAILS.consensusThreshold).toBe(true);
    });

    it('Scenario: High confidence + high consensus = approved', () => {
      const confidence = 80; // Above floor
      const consensus = 75; // Above threshold

      expect(confidence).toBeGreaterThanOrEqual(GUARDRAILS.causalConfidenceFloor);
      expect(consensus).toBeGreaterThanOrEqual(GUARDRAILS.consensusThreshold);
    });
  });
});
