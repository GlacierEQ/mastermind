/**
 * Circuit Breaker & Fallback Manager Agent - Phase 6
 * Prevents cascading failures by detecting degradation and routing to fallbacks.
 */

import { Agent, AgentInput, AgentOutput } from '../../types';

export type CircuitState = 'healthy' | 'degraded' | 'failed' | 'recovering';

export interface CircuitStatus {
  serviceId: string;
  state: CircuitState;
  errorRate: number; // 0-100%
  latencyMs: number;
  threadsAvailable: number;
  lastStateChange: Date;
}

export interface FallbackRoute {
  fromService: string;
  toService: string; // fallback target
  trafficPercentage: number;
  conditions: string; // e.g., 'when from-service errors > 50%'
}

export interface CircuitInput extends AgentInput {
  serviceId: string;
  checkInterval?: number; // ms between health checks
}

export interface CircuitOutput extends AgentOutput {
  currentStatus?: CircuitStatus;
  fallbacksActive?: FallbackRoute[];
  recoveryInProgress?: boolean;
  estimatedRecoveryTime?: number; // seconds
}

export class CircuitBreakerAgent implements Agent {
  name = 'Circuit Breaker Manager';
  version = '1.0.0';
  phase = 6;
  description = 'Detects degradation, activates circuit breakers and fallbacks to prevent cascading failures.';

  async execute(input: CircuitInput): Promise<CircuitOutput> {
    const start = Date.now();

    try {
      // 1) Get current status
      const currentStatus = await this.getCircuitStatus(input.serviceId);

      // 2) Detect degradation
      const degradationLevel = this.detectDegradation(currentStatus);

      // 3) Check for cascading failure risk
      const cascadingRisk = await this.checkCascadingRisk(input.serviceId);

      // 4) Activate circuit breaker if needed
      let fallbacksActive: FallbackRoute[] = [];
      if (degradationLevel > 0.5 || cascadingRisk > 0.7) {
        fallbacksActive = await this.activateCircuitBreaker(input.serviceId);
      }

      // 5) Monitor recovery
      let recoveryInProgress = false;
      let estimatedRecoveryTime: number | undefined;

      if (currentStatus.state === 'failed' || currentStatus.state === 'degraded') {
        recoveryInProgress = true;
        estimatedRecoveryTime = await this.estimateRecoveryTime(currentStatus);
      }

      return {
        success: true,
        data: {
          currentStatus,
          fallbacksActive,
          recoveryInProgress,
          estimatedRecoveryTime,
        },
        metrics: {
          executionTimeMs: Date.now() - start,
          state: currentStatus?.state || 'unknown',
          fallbacksCount: fallbacksActive.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in circuit breaker',
        data: null,
        metrics: {
          executionTimeMs: Date.now() - start,
        },
      };
    }
  }

  private async getCircuitStatus(serviceId: string): Promise<CircuitStatus> {
    // TODO: Query from monitoring/service discovery
    const errorRate = Math.random() * 100;

    return {
      serviceId,
      state: errorRate > 50 ? 'failed' : errorRate > 20 ? 'degraded' : 'healthy',
      errorRate,
      latencyMs: 50 + Math.random() * 200,
      threadsAvailable: Math.floor(Math.random() * 100) + 10,
      lastStateChange: new Date(Date.now() - Math.random() * 300000),
    };
  }

  private detectDegradation(status: CircuitStatus): number {
    // Return score 0-1 indicating severity
    let score = 0;

    if (status.errorRate > 50) score = Math.min(1, score + 0.8);
    else if (status.errorRate > 20) score = Math.min(1, score + 0.5);

    if (status.latencyMs > 500) score = Math.min(1, score + 0.3);

    if (status.threadsAvailable < 5) score = Math.min(1, score + 0.4);

    return score;
  }

  private async checkCascadingRisk(serviceId: string): Promise<number> {
    // TODO: Check downstream services that depend on this one
    // Return 0-1 risk score
    return Math.random() * 0.5; // simulated
  }

  private async activateCircuitBreaker(serviceId: string): Promise<FallbackRoute[]> {
    console.log(`[CircuitBreaker] Activating circuit breaker for ${serviceId}`);

    const fallbacks: FallbackRoute[] = [
      {
        fromService: serviceId,
        toService: `${serviceId}-backup`,
        trafficPercentage: 100,
        conditions: 'when primary errors > 50%',
      },
      {
        fromService: `downstream-of-${serviceId}`,
        toService: 'cache-layer',
        trafficPercentage: 50,
        conditions: 'when degraded, use stale cache',
      },
    ];

    // TODO: Actually apply circuit breaker (load balancer config, service mesh, etc.)
    return fallbacks;
  }

  private async estimateRecoveryTime(status: CircuitStatus): Promise<number> {
    // Based on degradation level, estimate how long until healthy
    if (status.state === 'failed') return 60 + Math.random() * 120; // 1-3 minutes
    if (status.state === 'degraded') return 30 + Math.random() * 60; // 30-90 seconds
    if (status.state === 'recovering') return 10 + Math.random() * 20; // 10-30 seconds
    return 0;
  }
}

export default CircuitBreakerAgent;
