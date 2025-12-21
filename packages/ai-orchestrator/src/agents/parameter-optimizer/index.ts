/**
 * Parameter Optimizer Agent - Phase 7
 * Learns optimal configuration parameters through experimentation and optimization.
 */

import { Agent, AgentInput, AgentOutput } from '../../types';

export interface ParameterExperiment {
  parameter: string;
  value: number;
  metric: string;
  result: number;
  timestamp: Date;
}

export interface OptimalParameter {
  name: string;
  currentValue: number;
  optimalValue: number;
  expectedImprovement: number; // %
  confidence: number; // 0-100%
  experimentsRun: number;
  recommendationStrength: 'weak' | 'medium' | 'strong';
}

export interface OptimizerInput extends AgentInput {
  serviceId: string;
  experiments: ParameterExperiment[];
  parameters: Record<string, { min: number; max: number; current: number }>;
}

export interface OptimizerOutput extends AgentOutput {
  optimizations?: OptimalParameter[];
  parametersToChange?: number;
  estimatedTotalImprovement?: number; // %
  nextExperimentsToRun?: string[];
}

export class ParameterOptimizerAgent implements Agent {
  name = 'Parameter Optimizer';
  version = '1.0.0';
  phase = 7;
  description = 'Learns optimal configuration parameters through continuous experimentation.';

  async execute(input: OptimizerInput): Promise<OptimizerOutput> {
    const start = Date.now();

    try {
      const experiments = input.experiments || [];
      const parameters = input.parameters || {};

      // 1) Analyze experiment results
      const analysis = this.analyzeExperiments(experiments);

      // 2) Find optimal values
      const optimizations = this.findOptimalValues(analysis, parameters);

      // 3) Rank recommendations
      optimizations.sort((a, b) => b.expectedImprovement - a.expectedImprovement);

      // 4) Generate next experiments
      const nextExperiments = this.generateNextExperiments(optimizations, parameters);

      const estimatedImprovement = optimizations
        .filter((o) => o.confidence > 70)
        .reduce((sum, o) => sum + o.expectedImprovement, 0) / Math.max(1, optimizations.length);

      return {
        success: true,
        data: {
          optimizations,
          parametersToChange: optimizations.filter((o) => o.confidence > 75).length,
          estimatedTotalImprovement: estimatedImprovement,
          nextExperimentsToRun: nextExperiments,
        },
        metrics: {
          executionTimeMs: Date.now() - start,
          experimentsAnalyzed: experiments.length,
          optimizationsFound: optimizations.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in parameter optimizer',
        data: null,
        metrics: {
          executionTimeMs: Date.now() - start,
        },
      };
    }
  }

  private analyzeExperiments(
    experiments: ParameterExperiment[],
  ): Map<string, { values: number[]; results: number[] }> {
    const analysis = new Map<string, { values: number[]; results: number[] }>();

    experiments.forEach((e) => {
      if (!analysis.has(e.parameter)) {
        analysis.set(e.parameter, { values: [], results: [] });
      }
      const data = analysis.get(e.parameter)!;
      data.values.push(e.value);
      data.results.push(e.result);
    });

    return analysis;
  }

  private findOptimalValues(
    analysis: Map<string, { values: number[]; results: number[] }>,
    parameters: Record<string, { min: number; max: number; current: number }>,
  ): OptimalParameter[] {
    const optimizations: OptimalParameter[] = [];

    analysis.forEach((data, paramName) => {
      if (data.values.length < 3) return;

      // Find value with best result
      const bestIdx = data.results.indexOf(Math.max(...data.results));
      const optimalValue = data.values[bestIdx];
      const currentValue = parameters[paramName]?.current || 0;
      const maxValue = parameters[paramName]?.max || optimalValue * 2;

      const currentResult = data.results[data.values.indexOf(currentValue)] || data.results[0];
      const bestResult = data.results[bestIdx];

      const improvement = ((bestResult - currentResult) / Math.abs(currentResult)) * 100;

      if (Math.abs(improvement) > 2) {
        // Only if >2% improvement
        optimizations.push({
          name: paramName,
          currentValue,
          optimalValue: Math.min(maxValue, optimalValue),
          expectedImprovement: Math.abs(improvement),
          confidence: Math.min(100, 50 + data.values.length * 5),
          experimentsRun: data.values.length,
          recommendationStrength: improvement > 15 ? 'strong' : improvement > 5 ? 'medium' : 'weak',
        });
      }
    });

    return optimizations;
  }

  private generateNextExperiments(
    optimizations: OptimalParameter[],
    parameters: Record<string, { min: number; max: number; current: number }>,
  ): string[] {
    const nextExperiments: string[] = [];

    // Suggest experiments for under-explored parameters
    Object.entries(parameters)
      .slice(0, 3)
      .forEach(([name, bounds]) => {
        if (!optimizations.some((o) => o.name === name)) {
          const testValue = bounds.min + (bounds.max - bounds.min) * 0.5;
          nextExperiments.push(`Test ${name}=${testValue}`);
        }
      });

    // Narrow search around optimal values
    optimizations
      .filter((o) => o.confidence < 85)
      .slice(0, 2)
      .forEach((o) => {
        const range = parameters[o.name]?.max - parameters[o.name]?.min || 100;
        nextExperiments.push(`Refine ${o.name} around ${o.optimalValue} (±${(range * 0.1).toFixed(0)})`);
      });

    return nextExperiments;
  }
}

export default ParameterOptimizerAgent;
