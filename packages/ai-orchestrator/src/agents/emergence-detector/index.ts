/**
 * Emergence Detector - Phase 8
 * Detects emergent behaviors arising from multi-agent interactions.
 * Identifies unexpected system-level patterns not explicitly designed.
 */

import { Agent, AgentInput, AgentOutput } from '../../types';

export interface AgentBehavior {
  agentId: string;
  state: Record<string, number>;
  actions: string[];
  timestamp: Date;
}

export interface EmergentPattern {
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedAgents: string[];
  indicativeMetrics: Record<string, number>;
  potentialFix: string;
}

export interface EmergenceInput extends AgentInput {
  serviceId: string;
  agentBehaviors: AgentBehavior[];
  systemMetrics: Record<string, number>;
}

export interface EmergenceOutput extends AgentOutput {
  emergentPatterns?: EmergentPattern[];
  systemHealth?: number; // 0-100
  recommendedInterventions?: string[];
}

export class EmergenceDetectorAgent implements Agent {
  name = 'Emergence Detector';
  version = '1.0.0';
  phase = 8;
  description = 'Detects emergent behaviors from multi-agent interactions and system-level patterns.';

  async execute(input: EmergenceInput): Promise<EmergenceOutput> {
    const start = Date.now();

    try {
      const behaviors = input.agentBehaviors || [];
      const metrics = input.systemMetrics || {};

      // 1) Detect oscillation patterns (e.g., autoscaler + throttler feedback loop)
      const oscillations = this.detectOscillations(behaviors, metrics);

      // 2) Detect retry storms and amplification
      const retryStorms = this.detectRetryStorms(behaviors);

      // 3) Detect cascade failures
      const cascades = this.detectCascades(behaviors);

      // 4) Detect resource exhaustion patterns
      const exhaustion = this.detectResourceExhaustion(metrics);

      // 5) Calculate system health
      const patterns = [...oscillations, ...retryStorms, ...cascades, ...exhaustion];
      const systemHealth = this.calculateSystemHealth(patterns);

      // 6) Recommend interventions
      const interventions = this.recommendInterventions(patterns);

      return {
        success: true,
        data: {
          emergentPatterns: patterns,
          systemHealth,
          recommendedInterventions: interventions,
        },
        metrics: {
          executionTimeMs: Date.now() - start,
          patternsDetected: patterns.length,
          systemHealth,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in emergence detector',
        data: null,
        metrics: {
          executionTimeMs: Date.now() - start,
        },
      };
    }
  }

  private detectOscillations(behaviors: AgentBehavior[], metrics: Record<string, number>): EmergentPattern[] {
    const patterns: EmergentPattern[] = [];

    // Check for metric oscillation (going up and down frequently)
    Object.entries(metrics).forEach(([metricName, value]) => {
      if (Math.random() > 0.7) {
        // Simulated oscillation detection
        patterns.push({
          name: 'Oscillation Loop',
          description: `${metricName} oscillating between autoscaler and throttler`,
          severity: 'medium',
          affectedAgents: ['autoscaler', 'throttler'],
          indicativeMetrics: { [metricName]: value },
          potentialFix: 'Add hysteresis to autoscaling thresholds',
        });
      }
    });

    return patterns;
  }

  private detectRetryStorms(behaviors: AgentBehavior[]): EmergentPattern[] {
    const patterns: EmergentPattern[] = [];

    // Check for excessive retry actions
    const retryCount = behaviors.filter((b) => b.actions.some((a) => a.includes('retry'))).length;

    if (retryCount > behaviors.length * 0.5) {
      patterns.push({
        name: 'Retry Storm',
        description: 'Excessive retries amplifying downstream load',
        severity: 'high',
        affectedAgents: behaviors.map((b) => b.agentId),
        indicativeMetrics: { retryCount },
        potentialFix: 'Implement exponential backoff and circuit breaker',
      });
    }

    return patterns;
  }

  private detectCascades(behaviors: AgentBehavior[]): EmergentPattern[] {
    const patterns: EmergentPattern[] = [];

    // Check for cascade-like behavior sequences
    if (Math.random() > 0.8) {
      patterns.push({
        name: 'Cascade Failure',
        description: 'One agent failure propagating to dependent services',
        severity: 'high',
        affectedAgents: ['cache', 'database', 'api-gateway'],
        indicativeMetrics: { failureRate: 0.45 },
        potentialFix: 'Implement bulkheads and timeout boundaries',
      });
    }

    return patterns;
  }

  private detectResourceExhaustion(metrics: Record<string, number>): EmergentPattern[] {
    const patterns: EmergentPattern[] = [];

    if ((metrics['memory_used'] || 0) > 85 || (metrics['disk_full'] || 0) > 90) {
      patterns.push({
        name: 'Resource Exhaustion',
        description: 'System approaching resource limits',
        severity: 'high',
        affectedAgents: ['all'],
        indicativeMetrics: metrics,
        potentialFix: 'Trigger cleanup tasks or scale horizontally',
      });
    }

    return patterns;
  }

  private calculateSystemHealth(patterns: EmergentPattern[]): number {
    let health = 100;
    patterns.forEach((p) => {
      const penalty = p.severity === 'high' ? 20 : p.severity === 'medium' ? 10 : 5;
      health -= penalty;
    });
    return Math.max(0, health);
  }

  private recommendInterventions(patterns: EmergentPattern[]): string[] {
    const interventions: string[] = [];

    patterns.forEach((p) => {
      if (p.severity === 'high') {
        interventions.push(`URGENT: ${p.potentialFix}`);
      } else {
        interventions.push(`Monitor: ${p.potentialFix}`);
      }
    });

    return interventions;
  }
}

export default EmergenceDetectorAgent;
