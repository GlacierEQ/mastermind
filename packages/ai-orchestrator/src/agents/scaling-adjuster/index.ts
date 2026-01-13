/**
 * Automatic Scaling Adjuster Agent - Phase 6
 * Self-optimizing: learns from scaling patterns and adjusts policies automatically.
 */

import { Agent, AgentInput, AgentOutput } from '../../types';

export interface ScalingEvent {
  timestamp: Date;
  serviceId: string;
  action: 'scale-up' | 'scale-down';
  replicasFrom: number;
  replicasTo: number;
  metric: string; // 'cpu', 'memory', 'requests'
  metricValue: number;
  success: boolean; // Did this scaling prevent the problem?
}

export interface ScalingPolicy {
  scaleUpThreshold: number; // e.g., 70% CPU
  scaleDownThreshold: number; // e.g., 30% CPU
  scaleUpSpeed: number; // replicas to add per step
  scaleDownSpeed: number; // replicas to remove per step
  cooldownPeriodSeconds: number;
  maxReplicas: number;
  minReplicas: number;
}

export interface AdjustmentSuggestion {
  parameter: keyof ScalingPolicy;
  currentValue: number;
  suggestedValue: number;
  reason: string;
  expectedImprovement: number; // 0-100%
}

export interface AdjustmentInput extends AgentInput {
  serviceId: string;
  lookbackDays?: number;
  aggressive?: boolean; // fast learning vs conservative
}

export interface AdjustmentOutput extends AgentOutput {
  currentPolicy?: ScalingPolicy;
  suggestions?: AdjustmentSuggestion[];
  appliedAdjustments?: Partial<ScalingPolicy>;
  accuracy?: {
    correctScaleUps: number;
    incorrectScaleUps: number;
    correctScaleDowns: number;
    incorrectScaleDowns: number;
  };
}

export class AutomaticScalingAdjusterAgent implements Agent {
  name = 'Automatic Scaling Adjuster';
  version = '1.0.0';
  phase = 6;
  description = 'Learns from scaling events and optimizes policies to reduce waste and improve response.';

  async execute(input: AdjustmentInput): Promise<AdjustmentOutput> {
    const start = Date.now();

    try {
      const lookback = input.lookbackDays || 7;

      // 1) Load current policy
      const currentPolicy = await this.loadCurrentPolicy(input.serviceId);

      // 2) Get recent scaling events
      const events = await this.getScalingEvents(input.serviceId, lookback);

      // 3) Analyze effectiveness
      const accuracy = this.analyzeAccuracy(events);

      // 4) Generate adjustment suggestions
      const suggestions = this.generateSuggestions(currentPolicy, accuracy, input.aggressive);

      // 5) Apply adjustments (automatic for low-risk changes)
      const appliedAdjustments = this.selectAndApplyAdjustments(suggestions);

      return {
        success: true,
        data: {
          currentPolicy,
          suggestions,
          appliedAdjustments,
          accuracy,
        },
        metrics: {
          executionTimeMs: Date.now() - start,
          eventCount: events.length,
          suggestionsCount: suggestions.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in scaling adjuster',
        data: null,
        metrics: {
          executionTimeMs: Date.now() - start,
        },
      };
    }
  }

  private async loadCurrentPolicy(serviceId: string): Promise<ScalingPolicy> {
    // TODO: Load from Kubernetes HPA or database
    return {
      scaleUpThreshold: 70,
      scaleDownThreshold: 30,
      scaleUpSpeed: 2,
      scaleDownSpeed: 1,
      cooldownPeriodSeconds: 300,
      maxReplicas: 20,
      minReplicas: 2,
    };
  }

  private async getScalingEvents(serviceId: string, days: number): Promise<ScalingEvent[]> {
    // TODO: Query from event log/database
    const now = new Date();
    const events: ScalingEvent[] = [];

    // Simulate some events for demo
    for (let i = 0; i < Math.floor(Math.random() * 20) + 5; i++) {
      const daysAgo = Math.floor(Math.random() * days);
      events.push({
        timestamp: new Date(now.getTime() - daysAgo * 86400000),
        serviceId,
        action: Math.random() > 0.5 ? 'scale-up' : 'scale-down',
        replicasFrom: Math.floor(Math.random() * 10) + 2,
        replicasTo: Math.floor(Math.random() * 10) + 2,
        metric: ['cpu', 'memory', 'requests'][Math.floor(Math.random() * 3)],
        metricValue: Math.random() * 100,
        success: Math.random() > 0.2,
      });
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private analyzeAccuracy(events: ScalingEvent[]): AdjustmentOutput['accuracy'] {
    const scaleUps = events.filter((e) => e.action === 'scale-up');
    const scaleDowns = events.filter((e) => e.action === 'scale-down');

    return {
      correctScaleUps: scaleUps.filter((e) => e.success).length,
      incorrectScaleUps: scaleUps.filter((e) => !e.success).length,
      correctScaleDowns: scaleDowns.filter((e) => e.success).length,
      incorrectScaleDowns: scaleDowns.filter((e) => !e.success).length,
    };
  }

  private generateSuggestions(
    policy: ScalingPolicy,
    accuracy: AdjustmentOutput['accuracy'],
    aggressive?: boolean,
  ): AdjustmentSuggestion[] {
    const suggestions: AdjustmentSuggestion[] = [];

    if (!accuracy) return suggestions;

    const upFailureRate = accuracy.incorrectScaleUps / (accuracy.correctScaleUps + accuracy.incorrectScaleUps);
    const downFailureRate = accuracy.incorrectScaleDowns / (accuracy.correctScaleDowns + accuracy.incorrectScaleDowns);

    // If we're scaling up too much, lower threshold
    if (upFailureRate > 0.3) {
      suggestions.push({
        parameter: 'scaleUpThreshold',
        currentValue: policy.scaleUpThreshold,
        suggestedValue: Math.min(100, policy.scaleUpThreshold + 5),
        reason: 'Scale-up triggering too frequently; increase threshold to be more conservative.',
        expectedImprovement: 20,
      });
    }

    // If we're scaling up too slowly, increase speed
    if (accuracy.incorrectScaleUps > accuracy.correctScaleUps * 2) {
      suggestions.push({
        parameter: 'scaleUpSpeed',
        currentValue: policy.scaleUpSpeed,
        suggestedValue: policy.scaleUpSpeed + 1,
        reason: 'Scale-up is too slow; increase replicas per step.',
        expectedImprovement: 25,
      });
    }

    // If we're scaling down and causing issues, be more aggressive with cool-down
    if (downFailureRate > 0.25) {
      suggestions.push({
        parameter: 'cooldownPeriodSeconds',
        currentValue: policy.cooldownPeriodSeconds,
        suggestedValue: policy.cooldownPeriodSeconds + 120,
        reason: 'Scale-down causing issues; increase cool-down period.',
        expectedImprovement: 15,
      });
    }

    // If being aggressive, increase scale-up speed further
    if (aggressive && accuracy.correctScaleUps > 5) {
      suggestions.push({
        parameter: 'scaleUpSpeed',
        currentValue: policy.scaleUpSpeed,
        suggestedValue: Math.max(policy.scaleUpSpeed, 3),
        reason: 'Aggressive mode: faster response to load spikes.',
        expectedImprovement: 30,
      });
    }

    return suggestions;
  }

  private selectAndApplyAdjustments(suggestions: AdjustmentSuggestion[]): Partial<ScalingPolicy> {
    // Apply only low-risk, high-confidence suggestions
    const applied: Partial<ScalingPolicy> = {};

    suggestions
      .filter((s) => s.expectedImprovement >= 15) // Only apply if 15%+ expected improvement
      .forEach((s) => {
        applied[s.parameter] = s.suggestedValue;
      });

    if (Object.keys(applied).length > 0) {
      console.log('[ScalingAdjuster] Auto-applying adjustments:', applied);
      // TODO: Actually update the policy in Kubernetes/database
    }

    return applied;
  }
}

export default AutomaticScalingAdjusterAgent;
