/**
 * Self-Modifying Agent - Phase 7
 * Modifies its own code and behavior based on performance feedback.
 */

import { Agent, AgentInput, AgentOutput } from '../../types';

export interface AgentPerformance {
  agentName: string;
  successRate: number; // 0-100%
  averageExecutionTime: number; // ms
  errorRate: number; // 0-100%
  reliability: number; // 0-100%
  lastModified: Date;
}

export interface CodeModification {
  agentName: string;
  type: 'algorithm' | 'threshold' | 'logic' | 'feature';
  description: string;
  expectedImprovement: number; // %
  riskLevel: 'low' | 'medium' | 'high';
  codeChangeSize: 'small' | 'medium' | 'large';
  testingRequired: string[];
}

export interface SelfModifyInput extends AgentInput {
  agentPerformanceData: AgentPerformance[];
  threshold?: number; // threshold for modification trigger
}

export interface SelfModifyOutput extends AgentOutput {
  suggestedModifications?: CodeModification[];
  modificationsApplied?: number;
  agentsImproved?: number;
  averageExpectedImprovement?: number; // %
  modificationLog?: string[];
}

export class SelfModifyingAgent implements Agent {
  name = 'Self-Modifying Agent';
  version = '1.0.0';
  phase = 7;
  description = 'Analyzes agent performance and recommends code modifications to improve behavior.';

  async execute(input: SelfModifyInput): Promise<SelfModifyOutput> {
    const start = Date.now();

    try {
      const performanceData = input.agentPerformanceData || [];
      const threshold = input.threshold || 85; // default: modify if reliability < 85%

      // 1) Identify underperforming agents
      const underperforming = performanceData.filter((p) => p.reliability < threshold);

      // 2) Diagnose performance issues
      const diagnoses = this.diagnoseIssues(underperforming);

      // 3) Suggest modifications
      const modifications = this.suggestModifications(diagnoses);

      // 4) Rate modifications by safety
      const ratedModifications = this.rateModifications(modifications);

      // 5) Apply safe modifications
      const applied = this.applyModifications(ratedModifications);

      const avgImprovement = ratedModifications.reduce((sum, m) => sum + m.expectedImprovement, 0) / Math.max(1, ratedModifications.length);

      return {
        success: true,
        data: {
          suggestedModifications: ratedModifications,
          modificationsApplied: applied.length,
          agentsImproved: new Set(applied.map((a) => a.agentName)).size,
          averageExpectedImprovement: avgImprovement,
          modificationLog: applied.map((m) => `Applied: ${m.description}`),
        },
        metrics: {
          executionTimeMs: Date.now() - start,
          agentsAnalyzed: performanceData.length,
          underperforming: underperforming.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in self-modifying agent',
        data: null,
        metrics: {
          executionTimeMs: Date.now() - start,
        },
      };
    }
  }

  private diagnoseIssues(underperforming: AgentPerformance[]): Array<{ agent: string; issues: string[] }> {
    return underperforming.map((p) => ({
      agent: p.agentName,
      issues: [
        ...(p.errorRate > 10 ? [`High error rate: ${p.errorRate.toFixed(1)}%`] : []),
        ...(p.averageExecutionTime > 1000 ? [`Slow execution: ${p.averageExecutionTime}ms`] : []),
        ...(p.successRate < 70 ? [`Low success rate: ${p.successRate.toFixed(1)}%`] : []),
      ],
    }));
  }

  private suggestModifications(
    diagnoses: Array<{ agent: string; issues: string[] }>,
  ): CodeModification[] {
    const modifications: CodeModification[] = [];

    diagnoses.forEach((d) => {
      d.issues.forEach((issue) => {
        if (issue.includes('error rate')) {
          modifications.push({
            agentName: d.agent,
            type: 'logic',
            description: `Add error handling for ${d.agent}`,
            expectedImprovement: 15,
            riskLevel: 'low',
            codeChangeSize: 'small',
            testingRequired: ['unit tests', 'error cases'],
          });
        } else if (issue.includes('execution time')) {
          modifications.push({
            agentName: d.agent,
            type: 'algorithm',
            description: `Optimize algorithm in ${d.agent}`,
            expectedImprovement: 25,
            riskLevel: 'medium',
            codeChangeSize: 'medium',
            testingRequired: ['performance tests', 'regression tests'],
          });
        } else if (issue.includes('success rate')) {
          modifications.push({
            agentName: d.agent,
            type: 'threshold',
            description: `Adjust thresholds in ${d.agent}`,
            expectedImprovement: 20,
            riskLevel: 'low',
            codeChangeSize: 'small',
            testingRequired: ['unit tests'],
          });
        }
      });
    });

    return modifications;
  }

  private rateModifications(modifications: CodeModification[]): CodeModification[] {
    return modifications
      .map((m) => ({
        ...m,
        expectedImprovement: m.riskLevel === 'high' ? m.expectedImprovement * 0.7 : m.expectedImprovement,
      }))
      .sort((a, b) => b.expectedImprovement - a.expectedImprovement);
  }

  private applyModifications(modifications: CodeModification[]): CodeModification[] {
    // Only apply low-risk, small changes automatically
    const applied = modifications.filter(
      (m) => m.riskLevel === 'low' && m.codeChangeSize === 'small',
    );

    console.log(`[SelfModifying] Applying ${applied.length} safe modifications`);

    // TODO: Actually modify agent code (requires code injection framework)
    // This is a stub for demonstration
    return applied;
  }
}

export default SelfModifyingAgent;
