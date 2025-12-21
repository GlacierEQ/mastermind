/**
 * Policy Learning Agent - Phase 7
 * Learns optimal policies from experience and continuously improves decisions.
 */

import { Agent, AgentInput, AgentOutput } from '../../types';

export interface PolicyDecision {
  decision: string; // e.g., "scale up", "cache this query"
  context: Record<string, number | string>; // metrics at time of decision
  outcome: 'positive' | 'negative' | 'neutral';
  impact: number; // -100 to +100
  timestamp: Date;
}

export interface LearnedPolicy {
  name: string;
  description: string;
  conditions: Record<string, { operator: string; value: number }>;
  action: string;
  successRate: number; // 0-100%
  timesApplied: number;
  averageImpact: number;
  confidence: number; // 0-100%
}

export interface PolicyInput extends AgentInput {
  serviceId: string;
  decisions: PolicyDecision[];
  policyType?: 'scaling' | 'caching' | 'routing' | 'provisioning';
}

export interface PolicyOutput extends AgentOutput {
  learnedPolicies?: LearnedPolicy[];
  newPoliciesGenerated?: number;
  policiesUpdated?: number;
  averageConfidence?: number;
  recommendedActions?: string[];
}

export class PolicyLearnerAgent implements Agent {
  name = 'Policy Learner';
  version = '1.0.0';
  phase = 7;
  description = 'Learns optimal policies from experience and continuously improves decision-making.';

  async execute(input: PolicyInput): Promise<PolicyOutput> {
    const start = Date.now();

    try {
      const decisions = input.decisions || [];

      // 1) Cluster similar decisions
      const clusters = this.clusterDecisions(decisions);

      // 2) Extract decision patterns
      const patterns = this.extractPatterns(clusters);

      // 3) Generate policies from patterns
      const learnedPolicies = this.generatePolicies(patterns);

      // 4) Rate policies by success
      const ratedPolicies = this.ratePolicies(learnedPolicies, decisions);

      // 5) Generate recommendations
      const recommendedActions = this.generateRecommendations(ratedPolicies);

      return {
        success: true,
        data: {
          learnedPolicies: ratedPolicies,
          newPoliciesGenerated: learnedPolicies.length,
          policiesUpdated: Math.floor(learnedPolicies.length * 0.6),
          averageConfidence: ratedPolicies.reduce((sum, p) => sum + p.confidence, 0) / Math.max(1, ratedPolicies.length),
          recommendedActions,
        },
        metrics: {
          executionTimeMs: Date.now() - start,
          decisionsAnalyzed: decisions.length,
          policiesLearned: learnedPolicies.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in policy learner',
        data: null,
        metrics: {
          executionTimeMs: Date.now() - start,
        },
      };
    }
  }

  private clusterDecisions(decisions: PolicyDecision[]): Map<string, PolicyDecision[]> {
    const clusters = new Map<string, PolicyDecision[]>();

    decisions.forEach((d) => {
      const key = d.decision;
      if (!clusters.has(key)) clusters.set(key, []);
      clusters.get(key)!.push(d);
    });

    return clusters;
  }

  private extractPatterns(
    clusters: Map<string, PolicyDecision[]>,
  ): Array<{ decision: string; conditions: any; successRate: number }> {
    const patterns: Array<{ decision: string; conditions: any; successRate: number }> = [];

    clusters.forEach((decisions, decision) => {
      const positive = decisions.filter((d) => d.outcome === 'positive').length;
      const successRate = (positive / decisions.length) * 100;

      if (decisions.length >= 3 && successRate > 60) {
        // Extract common context conditions
        const commonConditions: Record<string, number[]> = {};
        decisions.forEach((d) => {
          Object.entries(d.context).forEach(([key, value]) => {
            if (typeof value === 'number') {
              if (!commonConditions[key]) commonConditions[key] = [];
              commonConditions[key].push(value);
            }
          });
        });

        patterns.push({
          decision,
          conditions: commonConditions,
          successRate,
        });
      }
    });

    return patterns;
  }

  private generatePolicies(
    patterns: Array<{ decision: string; conditions: any; successRate: number }>,
  ): LearnedPolicy[] {
    return patterns.map((p) => ({
      name: `Policy: ${p.decision}`,
      description: `Learned policy for decision: ${p.decision}`,
      conditions: this.buildConditionRules(p.conditions),
      action: p.decision,
      successRate: p.successRate,
      timesApplied: 0,
      averageImpact: 0,
      confidence: Math.min(100, p.successRate * 1.2), // Confidence based on success rate
    }));
  }

  private buildConditionRules(conditions: Record<string, number[]>): Record<string, { operator: string; value: number }> {
    const rules: Record<string, { operator: string; value: number }> = {};

    Object.entries(conditions).forEach(([key, values]) => {
      const avg = values.reduce((a, b) => a + b) / values.length;
      const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length);

      rules[key] = {
        operator: '>',
        value: avg - stdDev, // Trigger when above (mean - 1 stdev)
      };
    });

    return rules;
  }

  private ratePolicies(policies: LearnedPolicy[], decisions: PolicyDecision[]): LearnedPolicy[] {
    return policies.map((p) => {
      const applicableDecisions = decisions.filter((d) => d.decision === p.action);
      const positive = applicableDecisions.filter((d) => d.outcome === 'positive').length;
      const totalImpact = applicableDecisions.reduce((sum, d) => sum + d.impact, 0);

      return {
        ...p,
        timesApplied: applicableDecisions.length,
        successRate: applicableDecisions.length > 0 ? (positive / applicableDecisions.length) * 100 : 0,
        averageImpact: applicableDecisions.length > 0 ? totalImpact / applicableDecisions.length : 0,
      };
    });
  }

  private generateRecommendations(policies: LearnedPolicy[]): string[] {
    const recommendations: string[] = [];

    policies
      .filter((p) => p.confidence > 75 && p.timesApplied > 5)
      .sort((a, b) => b.averageImpact - a.averageImpact)
      .slice(0, 3)
      .forEach((p) => {
        recommendations.push(`Apply policy: ${p.name} (${p.successRate.toFixed(0)}% success rate)`);
      });

    return recommendations;
  }
}

export default PolicyLearnerAgent;
