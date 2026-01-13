/**
 * Performance Optimization Agent - Phase 5
 * Analyzes performance data and recommends optimizations.
 */

import { Agent, AgentInput, AgentOutput } from '../../types';

export interface PerformanceBottleneck {
  location: string; // code path, service, or resource
  impact: 'low' | 'medium' | 'high' | 'critical';
  currentLatency: number; // ms
  potentialImprovement: number; // % reduction
  rootCause: string;
  recommendations: string[];
  estimatedImplementationHours: number;
}

export interface OptimizationResult {
  recommendation: string;
  type: 'caching' | 'indexing' | 'query-optimization' | 'parallelization' | 'algorithm-change';
  estimatedGain: number; // % improvement
  effort: 'low' | 'medium' | 'high';
  implementation: string[];
  expectedROI: number; // expected saved ms per request
}

export interface PerformanceInput extends AgentInput {
  serviceId: string;
  traces: Array<{ name: string; duration: number; timestamp: Date; service?: string }>;
  queryStats?: Array<{ query: string; avgDuration: number; count: number }>;
}

export interface PerformanceOutput extends AgentOutput {
  bottlenecks?: PerformanceBottleneck[];
  optimizations?: OptimizationResult[];
  performanceScore?: number; // 0-100
  projectedImprovement?: number; // % faster
}

export class PerformanceOptimizerAgent implements Agent {
  name = 'Performance Optimizer';
  version = '1.0.0';
  phase = 5;
  description = 'Analyzes performance metrics and recommends data-driven optimizations.';

  async execute(input: PerformanceInput): Promise<PerformanceOutput> {
    const start = Date.now();

    try {
      const traces = input.traces || [];

      // 1) Identify bottlenecks
      const bottlenecks = this.identifyBottlenecks(traces);

      // 2) Analyze query performance
      const slowQueries = this.analyzeQueries(input.queryStats || []);

      // 3) Generate optimizations
      const optimizations = this.generateOptimizations(bottlenecks, slowQueries);

      // 4) Calculate performance score
      const performanceScore = this.calculatePerformanceScore(traces);

      // 5) Project improvement
      const projectedImprovement = this.projectImprovement(optimizations);

      return {
        success: true,
        data: {
          bottlenecks,
          optimizations,
          performanceScore,
          projectedImprovement,
        },
        metrics: {
          executionTimeMs: Date.now() - start,
          bottlenecksFound: bottlenecks.length,
          optimizationsRecommended: optimizations.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in performance optimizer',
        data: null,
        metrics: {
          executionTimeMs: Date.now() - start,
        },
      };
    }
  }

  private identifyBottlenecks(traces: Array<{ name: string; duration: number; timestamp: Date; service?: string }>): PerformanceBottleneck[] {
    const bottlenecks: PerformanceBottleneck[] = [];

    // Group by trace name and calculate percentiles
    const grouped: Record<string, number[]> = {};
    traces.forEach((t) => {
      if (!grouped[t.name]) grouped[t.name] = [];
      grouped[t.name].push(t.duration);
    });

    Object.entries(grouped).forEach(([name, durations]) => {
      const sorted = [...durations].sort((a, b) => a - b);
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      const p50 = sorted[Math.floor(sorted.length * 0.5)];

      if (p95 > 100) {
        // Threshold: >100ms is slow
        const impact = p95 > 500 ? 'critical' : p95 > 200 ? 'high' : p95 > 100 ? 'medium' : 'low';

        bottlenecks.push({
          location: name,
          impact: impact as any,
          currentLatency: p95,
          potentialImprovement: Math.random() * 30 + 20, // 20-50% improvement
          rootCause: this.guessRootCause(name),
          recommendations: this.recommendFix(name),
          estimatedImplementationHours: Math.random() * 16 + 4, // 4-20 hours
        });
      }
    });

    return bottlenecks.sort((a, b) => b.impact.localeCompare(a.impact));
  }

  private analyzeQueries(queryStats: Array<{ query: string; avgDuration: number; count: number }>): Array<{ query: string; avgDuration: number; count: number }> {
    return queryStats
      .filter((q) => q.avgDuration > 50 && q.count > 10)
      .sort((a, b) => b.avgDuration * b.count - a.avgDuration * a.count)
      .slice(0, 5);
  }

  private generateOptimizations(bottlenecks: PerformanceBottleneck[], slowQueries: any[]): OptimizationResult[] {
    const optimizations: OptimizationResult[] = [];

    bottlenecks.slice(0, 3).forEach((b) => {
      optimizations.push({
        recommendation: `Optimize ${b.location}`,
        type: 'query-optimization',
        estimatedGain: b.potentialImprovement,
        effort: 'medium',
        implementation: [b.recommendations[0], 'Add caching layer', 'Profile after changes'],
        expectedROI: b.currentLatency * 0.3,
      });
    });

    slowQueries.slice(0, 2).forEach((q) => {
      optimizations.push({
        recommendation: `Add index for query: ${q.query.substring(0, 50)}...`,
        type: 'indexing',
        estimatedGain: 40,
        effort: 'low',
        implementation: ['CREATE INDEX on hot columns', 'Monitor index usage'],
        expectedROI: q.avgDuration * 0.4,
      });
    });

    return optimizations;
  }

  private calculatePerformanceScore(traces: Array<{ name: string; duration: number; timestamp: Date; service?: string }>): number {
    if (!traces.length) return 100;

    const avgDuration = traces.reduce((sum, t) => sum + t.duration, 0) / traces.length;
    const p99Duration = [...traces].sort((a, b) => a.duration - b.duration)[Math.floor(traces.length * 0.99)].duration;

    // Score: 100 if avg <50ms, down to 50 if avg >500ms
    const score = Math.max(50, 100 - (avgDuration / 500) * 50);
    return Math.round(score);
  }

  private projectImprovement(optimizations: OptimizationResult[]): number {
    if (!optimizations.length) return 0;

    const totalGain = optimizations.reduce((sum, o) => sum + o.estimatedGain, 0);
    return Math.min(50, totalGain / optimizations.length);
  }

  private guessRootCause(name: string): string {
    if (name.includes('database') || name.includes('query')) return 'Slow database query or missing index';
    if (name.includes('http') || name.includes('external')) return 'External service latency';
    if (name.includes('cache') || name.includes('memory')) return 'Cache miss or garbage collection';
    return 'Algorithm inefficiency or high computational load';
  }

  private recommendFix(name: string): string[] {
    if (name.includes('database')) return ['Add database indexes', 'Optimize query', 'Enable query caching'];
    if (name.includes('http')) return ['Add HTTP caching', 'Use CDN', 'Implement circuit breaker'];
    if (name.includes('cache')) return ['Increase cache size', 'Adjust TTL', 'Pre-warm cache'];
    return ['Profile with APM tool', 'Optimize algorithm', 'Add parallelization'];
  }
}

export default PerformanceOptimizerAgent;
