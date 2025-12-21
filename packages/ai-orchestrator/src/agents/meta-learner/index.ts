/**
 * Meta-Learner Agent - Phase 7
 * Learns how to learn better by analyzing its own learning process.
 */

import { Agent, AgentInput, AgentOutput } from '../../types';

export interface LearningCycle {
  agentName: string;
  cycleNumber: number;
  trainingTime: number; // ms
  dataSize: number; // training samples
  accuracy: number; // 0-100%
  convergenceTime: number; // iterations
  memoryUsed: number; // MB
}

export interface MetaInsight {
  insight: string;
  type: 'approach' | 'data' | 'algorithm' | 'hyperparameter';
  affectsAgents: string[];
  expectedGlobalImprovement: number; // %
  confidence: number; // 0-100%
}

export interface MetaLearnerInput extends AgentInput {
  agentName: string;
  learningHistory: LearningCycle[];
  benchmark?: number; // target accuracy
}

export interface MetaLearnerOutput extends AgentOutput {
  insights?: MetaInsight[];
  optimizedApproach?: string;
  bestPerformingStrategy?: string;
  trainingTimeReduction?: number; // %
  accuracyImprovement?: number; // %
}

export class MetaLearnerAgent implements Agent {
  name = 'Meta-Learner';
  version = '1.0.0';
  phase = 7;
  description = 'Analyzes learning processes and discovers how to learn more effectively.';

  async execute(input: MetaLearnerInput): Promise<MetaLearnerOutput> {
    const start = Date.now();

    try {
      const history = input.learningHistory || [];

      // 1) Analyze learning trends
      const trends = this.analyzeTrends(history);

      // 2) Identify optimal conditions
      const optimal = this.findOptimalConditions(history);

      // 3) Generate meta-insights
      const insights = this.generateMetaInsights(trends, optimal);

      // 4) Recommend best strategy
      const bestStrategy = this.recommendBestStrategy(insights, history);

      // 5) Calculate improvements
      const improvements = this.calculateImprovements(history);

      return {
        success: true,
        data: {
          insights,
          optimizedApproach: bestStrategy,
          bestPerformingStrategy: this.identifyBestStrategy(history),
          trainingTimeReduction: improvements.timeReduction,
          accuracyImprovement: improvements.accuracyGain,
        },
        metrics: {
          executionTimeMs: Date.now() - start,
          cyclesAnalyzed: history.length,
          insightsGenerated: insights.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in meta-learner',
        data: null,
        metrics: {
          executionTimeMs: Date.now() - start,
        },
      };
    }
  }

  private analyzeTrends(history: LearningCycle[]): Record<string, any> {
    if (history.length < 2) return {};

    const accuracyTrend = history.map((c) => c.accuracy);
    const timeTrend = history.map((c) => c.trainingTime);

    const accuracyImprovement = accuracyTrend[accuracyTrend.length - 1] - accuracyTrend[0];
    const timeEfficiency = (timeTrend[0] - timeTrend[timeTrend.length - 1]) / timeTrend[0];

    return {
      accuracyImprovement,
      timeEfficiency,
      convergenceImproving: accuracyImprovement > 0,
      dataScaling: history.map((c) => c.dataSize),
    };
  }

  private findOptimalConditions(history: LearningCycle[]): Record<string, any> {
    const best = history.reduce((prev, current) => (prev.accuracy > current.accuracy ? prev : current));
    const fastest = history.reduce((prev, current) => (prev.trainingTime < current.trainingTime ? prev : current));

    return {
      optimalDataSize: best.dataSize,
      optimalTrainingTime: fastest.trainingTime,
      fastestConvergence: fastest.convergenceTime,
      maxAccuracy: best.accuracy,
      minMemoryUsed: Math.min(...history.map((c) => c.memoryUsed)),
    };
  }

  private generateMetaInsights(trends: Record<string, any>, optimal: Record<string, any>): MetaInsight[] {
    const insights: MetaInsight[] = [];

    if (trends.convergenceImproving) {
      insights.push({
        insight: 'Accuracy is improving with each cycle',
        type: 'approach',
        affectsAgents: ['all'],
        expectedGlobalImprovement: 10,
        confidence: 90,
      });
    }

    if (trends.timeEfficiency > 0.2) {
      insights.push({
        insight: 'Training time is becoming more efficient',
        type: 'algorithm',
        affectsAgents: ['all'],
        expectedGlobalImprovement: 15,
        confidence: 85,
      });
    }

    if (optimal.optimalDataSize > trends.dataScaling[0]) {
      insights.push({
        insight: 'Larger datasets improve accuracy',
        type: 'data',
        affectsAgents: ['all'],
        expectedGlobalImprovement: 20,
        confidence: 80,
      });
    }

    return insights;
  }

  private recommendBestStrategy(insights: MetaInsight[], history: LearningCycle[]): string {
    const strategies = [
      'Increase data size gradually',
      'Use ensemble learning',
      'Employ transfer learning',
      'Optimize hyperparameters dynamically',
      'Implement active learning',
    ];

    // Return strategy based on insights
    return insights.length > 2 ? strategies[0] : strategies[Math.floor(Math.random() * strategies.length)];
  }

  private identifyBestStrategy(history: LearningCycle[]): string {
    const best = history.reduce((prev, current) => (prev.accuracy > current.accuracy ? prev : current));
    return `Cycle ${best.cycleNumber} approach (${best.accuracy.toFixed(1)}% accuracy)`;
  }

  private calculateImprovements(history: LearningCycle[]): { timeReduction: number; accuracyGain: number } {
    if (history.length < 2) return { timeReduction: 0, accuracyGain: 0 };

    const firstCycle = history[0];
    const lastCycle = history[history.length - 1];

    const timeReduction = ((firstCycle.trainingTime - lastCycle.trainingTime) / firstCycle.trainingTime) * 100;
    const accuracyGain = lastCycle.accuracy - firstCycle.accuracy;

    return { timeReduction: Math.max(0, timeReduction), accuracyGain: Math.max(0, accuracyGain) };
  }
}

export default MetaLearnerAgent;
