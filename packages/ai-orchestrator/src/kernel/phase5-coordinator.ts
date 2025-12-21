/**
 * Phase 5 Intelligence Coordinator
 * Orchestrates all intelligence agents: anomaly detection, predictive alerting,
 * performance optimization, and cost optimization.
 */

import MLAnomalyDetectorAgent from '../agents/ml-anomaly-detector';
import PredictiveAlertingAgent from '../agents/predictive-alerting';
import PerformanceOptimizerAgent from '../agents/performance-optimizer';
import CostOptimizerAgent from '../agents/cost-optimizer';

export interface IntelligenceReport {
  serviceId: string;
  timestamp: Date;
  anomalies: number;
  alerts: number;
  optimizations: number;
  potentialSavings: number; // dollars
  healthScore: number; // 0-100
}

export class Phase5Coordinator {
  private anomalyDetector = new MLAnomalyDetectorAgent();
  private predictiveAlerting = new PredictiveAlertingAgent();
  private performanceOptimizer = new PerformanceOptimizerAgent();
  private costOptimizer = new CostOptimizerAgent();

  async analyzeIntelligence(input: any): Promise<IntelligenceReport> {
    const timestamp = new Date();

    // 1. Detect anomalies
    const anomalyResult = await this.anomalyDetector.execute({
      serviceId: input.serviceId,
      metrics: input.metrics || [],
    });

    // 2. Predict problems
    const alertResult = await this.predictiveAlerting.execute({
      serviceId: input.serviceId,
      historicalData: input.historicalData || [],
    });

    // 3. Optimize performance
    const perfResult = await this.performanceOptimizer.execute({
      serviceId: input.serviceId,
      traces: input.traces || [],
      queryStats: input.queryStats,
    });

    // 4. Optimize costs
    const costResult = await this.costOptimizer.execute({
      serviceId: input.serviceId,
      currentMonthlySpend: input.monthlySpend || 5000,
      resourceAllocations: input.allocations || [],
    });

    const anomalies = (anomalyResult.data?.anomalies || []).length;
    const alerts = (alertResult.data?.alerts || []).length;
    const optimizations =
      (perfResult.data?.optimizations || []).length + (costResult.data?.savings || []).length;
    const potentialSavings = costResult.data?.potentialMonthlySavings || 0;
    const healthScore = anomalyResult.data?.anomalyScore
      ? 100 - (anomalyResult.data.anomalyScore as number)
      : 95;

    return {
      serviceId: input.serviceId,
      timestamp,
      anomalies,
      alerts,
      optimizations,
      potentialSavings,
      healthScore,
    };
  }

  async fullIntelligenceAnalysis(services: string[], inputs: Record<string, any>): Promise<IntelligenceReport[]> {
    const reports = await Promise.all(
      services.map((serviceId) => this.analyzeIntelligence({ ...inputs[serviceId], serviceId })),
    );
    return reports;
  }
}

export default Phase5Coordinator;
