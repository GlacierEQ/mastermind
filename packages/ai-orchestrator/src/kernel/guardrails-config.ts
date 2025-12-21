/**
 * Production Guardrails Configuration
 * All safety thresholds, confidence floors, consensus requirements.
 */

export const PRODUCTION_GUARDRAILS = {
  // Causal confidence thresholds (for auto-action approval)
  causal: {
    confidenceFloorLowRisk: 40, // % required for low-risk actions
    confidenceFloorMediumRisk: 60, // % required for medium-risk
    confidenceFloorHighRisk: 75, // % required for high-risk (failover, scale)
    confidenceFloorCriticalRisk: 85, // % required for critical-risk (global changes)
  },

  // Consensus thresholds (for multi-agent approval)
  consensus: {
    thresholdLowRisk: 50, // % of agents must approve
    thresholdMediumRisk: 66, // 2/3 majority
    thresholdHighRisk: 75, // 3/4 majority
    thresholdCriticalRisk: 85, // 5/6+ majority
  },

  // Severity classification
  severity: {
    errorRateCritical: 0.8, // > 80% error rate = critical
    errorRateHigh: 0.5, // > 50% = high
    errorRateMedium: 0.1, // > 10% = medium
    latencyCriticalMs: 5000, // > 5s latency = critical
    latencyHighMs: 2000, // > 2s = high
    cpuCritical: 0.95, // > 95% CPU = critical
    cpuHigh: 0.85, // > 85% = high
  },

  // Cascade detection
  cascade: {
    minServicesAffected: 3, // 3+ services = cascade
    maxCascadeDepth: 5, // Stop after 5 levels of propagation
  },

  // System health
  systemHealth: {
    emergencyThreshold: 0.3, // < 30% health = emergency
    criticalThreshold: 0.5, // < 50% = critical
    degradedThreshold: 0.7, // < 70% = degraded
  },

  // Forecasting
  forecasting: {
    capacityRiskThreshold: 0.85, // > 85% capacity = risk
    forecastHorizonHours: 24, // Plan 24 hours ahead
    mapeAcceptable1h: 0.1, // < 10% error for 1h
    mapeAcceptable24h: 0.2, // < 20% error for 24h
  },

  // Emergence detection
  emergence: {
    oscillationDetectionWindowSec: 60, // Look for oscillation in 60s window
    retryStormThreshold: 0.5, // > 50% of agents retrying = storm
    resourceExhaustionThreshold: { memory: 0.9, disk: 0.9, cpu: 0.95 },
  },

  // Action execution
  execution: {
    maxConcurrentActions: 3, // Run at most 3 actions in parallel
    actionTimeoutMs: 30000, // Timeout after 30s
    rollbackIfMetricsWorse: true, // Automatically rollback if metrics don't improve
  },

  // Rate limiting
  rateLimiting: {
    maxActionsPerServicePerHour: 10, // Prevent action spam
    minTimeBetweenSimilarActionsSec: 300, // Wait 5min before repeating same action
  },
};

export function getConfidenceFloor(riskLevel: 'low' | 'medium' | 'high' | 'critical'): number {
  const floors: Record<string, number> = {
    low: PRODUCTION_GUARDRAILS.causal.confidenceFloorLowRisk,
    medium: PRODUCTION_GUARDRAILS.causal.confidenceFloorMediumRisk,
    high: PRODUCTION_GUARDRAILS.causal.confidenceFloorHighRisk,
    critical: PRODUCTION_GUARDRAILS.causal.confidenceFloorCriticalRisk,
  };
  return floors[riskLevel] || 60;
}

export function getConsensusThreshold(riskLevel: 'low' | 'medium' | 'high' | 'critical'): number {
  const thresholds: Record<string, number> = {
    low: PRODUCTION_GUARDRAILS.consensus.thresholdLowRisk,
    medium: PRODUCTION_GUARDRAILS.consensus.thresholdMediumRisk,
    high: PRODUCTION_GUARDRAILS.consensus.thresholdHighRisk,
    critical: PRODUCTION_GUARDRAILS.consensus.thresholdCriticalRisk,
  };
  return thresholds[riskLevel] || 66;
}

export function classifySeverity(context: {
  errorRate?: number;
  latencyMs?: number;
  cpuPercent?: number;
  affectedServices?: string[];
}): 'low' | 'medium' | 'high' | 'critical' {
  if (
    (context.errorRate && context.errorRate > PRODUCTION_GUARDRAILS.severity.errorRateCritical) ||
    (context.latencyMs && context.latencyMs > PRODUCTION_GUARDRAILS.severity.latencyCriticalMs) ||
    (context.cpuPercent && context.cpuPercent > PRODUCTION_GUARDRAILS.severity.cpuCritical) ||
    (context.affectedServices && context.affectedServices.length >= PRODUCTION_GUARDRAILS.cascade.minServicesAffected)
  ) {
    return 'critical';
  }

  if (
    (context.errorRate && context.errorRate > PRODUCTION_GUARDRAILS.severity.errorRateHigh) ||
    (context.latencyMs && context.latencyMs > PRODUCTION_GUARDRAILS.severity.latencyHighMs) ||
    (context.cpuPercent && context.cpuPercent > PRODUCTION_GUARDRAILS.severity.cpuHigh)
  ) {
    return 'high';
  }

  if (context.errorRate && context.errorRate > PRODUCTION_GUARDRAILS.severity.errorRateMedium) {
    return 'medium';
  }

  return 'low';
}

export default PRODUCTION_GUARDRAILS;
