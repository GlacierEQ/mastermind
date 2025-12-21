/**
 * Capacity Planning & Forecasting Agent - Phase 6
 * Predicts 30/60/90 day capacity needs and auto-provisions.
 */

import { Agent, AgentInput, AgentOutput } from '../../types';

export interface CapacityMetrics {
  cpu: number; // 0-100%
  memory: number; // 0-100%
  storage: number; // 0-100%
  networkBandwidth: number; // Mbps
  connectionCount: number;
}

export interface CapacityForecast {
  days: number; // 30, 60, or 90
  projectedMetrics: CapacityMetrics;
  saturationRisk: 'low' | 'medium' | 'high'; // will we hit limits?
  daysUntilSaturation?: number;
  recommendedAction: string;
}

export interface PlanningInput extends AgentInput {
  serviceId: string;
  horizonDays?: number; // default 90
}

export interface PlanningOutput extends AgentOutput {
  current?: CapacityMetrics;
  forecast30?: CapacityForecast;
  forecast60?: CapacityForecast;
  forecast90?: CapacityForecast;
  provisioned?: boolean;
  estimatedCost?: number; // Annual cost of recommended capacity
}

export class CapacityPlannerAgent implements Agent {
  name = 'Capacity Planning & Forecasting';
  version = '1.0.0';
  phase = 6;
  description = 'Forecasts 30/60/90 day capacity needs and auto-provisions before saturation.';

  async execute(input: PlanningInput): Promise<PlanningOutput> {
    const start = Date.now();

    try {
      // 1) Get current metrics
      const current = await this.getCurrentCapacity(input.serviceId);

      // 2) Calculate growth rates
      const growthRates = await this.calculateGrowthRates(input.serviceId);

      // 3) Forecast 30, 60, 90 days
      const forecast30 = this.forecast(current, growthRates, 30);
      const forecast60 = this.forecast(current, growthRates, 60);
      const forecast90 = this.forecast(current, growthRates, 90);

      // 4) Check if provisioning needed
      const needsProvisioning = forecast30.saturationRisk === 'high' || forecast60.saturationRisk === 'medium';
      let provisioned = false;

      if (needsProvisioning) {
        provisioned = await this.autoProvision(input.serviceId, forecast90);
      }

      // 5) Estimate annual cost
      const estimatedCost = this.estimateAnnualCost(forecast90);

      return {
        success: true,
        data: {
          current,
          forecast30,
          forecast60,
          forecast90,
          provisioned,
          estimatedCost,
        },
        metrics: {
          executionTimeMs: Date.now() - start,
          riskLevel: forecast90.saturationRisk,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in capacity planner',
        data: null,
        metrics: {
          executionTimeMs: Date.now() - start,
        },
      };
    }
  }

  private async getCurrentCapacity(serviceId: string): Promise<CapacityMetrics> {
    // TODO: Query from Prometheus/monitoring
    return {
      cpu: 45 + Math.random() * 20,
      memory: 50 + Math.random() * 15,
      storage: 30 + Math.random() * 10,
      networkBandwidth: 500 + Math.random() * 200,
      connectionCount: 5000 + Math.random() * 2000,
    };
  }

  private async calculateGrowthRates(serviceId: string): Promise<Record<string, number>> {
    // TODO: Calculate from 90-day historical data
    // For demo: simulate growth rates
    return {
      cpu: 0.5, // % per day
      memory: 0.3,
      storage: 1.2,
      networkBandwidth: 0.4,
      connectionCount: 0.8,
    };
  }

  private forecast(current: CapacityMetrics, growthRates: Record<string, number>, days: number): CapacityForecast {
    const projected: CapacityMetrics = {
      cpu: Math.min(100, current.cpu + growthRates.cpu * days),
      memory: Math.min(100, current.memory + growthRates.memory * days),
      storage: Math.min(100, current.storage + growthRates.storage * days),
      networkBandwidth: current.networkBandwidth + growthRates.networkBandwidth * days,
      connectionCount: current.connectionCount + growthRates.connectionCount * days,
    };

    // Determine saturation risk
    const resourceRisks = [
      projected.cpu > 90 ? 'high' : projected.cpu > 75 ? 'medium' : 'low',
      projected.memory > 90 ? 'high' : projected.memory > 75 ? 'medium' : 'low',
      projected.storage > 85 ? 'high' : projected.storage > 70 ? 'medium' : 'low',
    ];

    const saturationRisk = resourceRisks.includes('high') ? 'high' : resourceRisks.includes('medium') ? 'medium' : 'low';

    const daysUntilSaturation = Math.min(...[
      Math.max(0, Math.floor((90 - current.cpu) / (growthRates.cpu || 0.1))),
      Math.max(0, Math.floor((90 - current.memory) / (growthRates.memory || 0.1))),
    ]);

    return {
      days,
      projectedMetrics: projected,
      saturationRisk,
      daysUntilSaturation: daysUntilSaturation > 0 ? daysUntilSaturation : undefined,
      recommendedAction:
        saturationRisk === 'high'
          ? 'Immediate provisioning required'
          : saturationRisk === 'medium'
            ? 'Provision within 2 weeks'
            : 'Monitor; no immediate action needed',
    };
  }

  private async autoProvision(serviceId: string, forecast: CapacityForecast): Promise<boolean> {
    console.log(`[CapacityPlanner] Auto-provisioning for ${serviceId}:`);
    console.log(`  Projected in 90d: CPU=${forecast.projectedMetrics.cpu.toFixed(1)}%, Memory=${forecast.projectedMetrics.memory.toFixed(1)}%`);

    // TODO: Actually provision infrastructure (cloud provider APIs, Terraform, etc.)
    return true;
  }

  private estimateAnnualCost(forecast: CapacityForecast): number {
    // Rough estimate: $0.10/GB/month, $0.05/vCPU/month
    const cpuCost = (forecast.projectedMetrics.cpu / 100) * 16 * 0.05 * 12; // 16 vCPU max
    const memoryCost = (forecast.projectedMetrics.memory / 100) * 64 * 0.1 * 12; // 64GB max
    return cpuCost + memoryCost;
  }
}

export default CapacityPlannerAgent;
