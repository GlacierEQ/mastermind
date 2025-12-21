/**
 * Phase 6 Self-Healing Coordinator
 * Orchestrates all self-healing agents: bug fixer, scaling adjuster, capacity planner,
 * circuit breaker, and resource exhaustion predictor.
 */

import AutonomousBugFixerAgent from '../agents/bug-fixer';
import AutomaticScalingAdjusterAgent from '../agents/scaling-adjuster';
import CapacityPlannerAgent from '../agents/capacity-planner';
import CircuitBreakerAgent from '../agents/circuit-breaker';
import ResourceExhaustionAgent from '../agents/resource-exhaustion';

export interface HealthCheckResult {
  serviceId: string;
  healthy: boolean;
  issues: string[];
  healingApplied: string[];
  timestamp: Date;
}

export class Phase6Coordinator {
  private bugFixer = new AutonomousBugFixerAgent();
  private scalingAdjuster = new AutomaticScalingAdjusterAgent();
  private capacityPlanner = new CapacityPlannerAgent();
  private circuitBreaker = new CircuitBreakerAgent();
  private resourceExhaustion = new ResourceExhaustionAgent();

  async checkAndHeal(serviceId: string): Promise<HealthCheckResult> {
    const issues: string[] = [];
    const healingApplied: string[] = [];
    let healthy = true;

    // 1. Check for resource exhaustion
    const exhaustionResult = await this.resourceExhaustion.execute({ serviceId });
    if (!exhaustionResult.success) {
      issues.push(`Resource exhaustion check failed: ${exhaustionResult.error}`);
      healthy = false;
    } else if (exhaustionResult.data?.leaks && exhaustionResult.data.leaks.length > 0) {
      issues.push(`Resource leaks detected: ${exhaustionResult.data.leaks.map((l) => l.type).join(', ')}`);
      if (exhaustionResult.data.cleanupApplied) {
        healingApplied.push('Resource cleanup applied');
      }
    }

    // 2. Check circuit breaker / cascading failures
    const circuitResult = await this.circuitBreaker.execute({ serviceId });
    if (!circuitResult.success) {
      issues.push(`Circuit breaker check failed: ${circuitResult.error}`);
      healthy = false;
    } else if (circuitResult.data?.currentStatus?.state !== 'healthy') {
      issues.push(`Service degraded: ${circuitResult.data.currentStatus?.state}`);
      if ((circuitResult.data?.fallbacksActive || []).length > 0) {
        healingApplied.push('Fallbacks activated');
      }
    }

    // 3. Check capacity and provision if needed
    const capacityResult = await this.capacityPlanner.execute({ serviceId });
    if (!capacityResult.success) {
      issues.push(`Capacity planning failed: ${capacityResult.error}`);
    } else if (capacityResult.data?.provisioned) {
      healingApplied.push('Capacity provisioned');
    }

    // 4. Optimize scaling policies
    const scalingResult = await this.scalingAdjuster.execute({ serviceId });
    if (!scalingResult.success) {
      issues.push(`Scaling optimization failed: ${scalingResult.error}`);
    } else if (Object.keys(scalingResult.data?.appliedAdjustments || {}).length > 0) {
      healingApplied.push('Scaling policies optimized');
    }

    // 5. Fix bugs (if error patterns detected)
    // In real implementation, would monitor error logs in real-time
    // For now, just check if needed

    healthy = healthy && issues.length === 0;

    return {
      serviceId,
      healthy,
      issues,
      healingApplied,
      timestamp: new Date(),
    };
  }

  async fullSystemCheck(serviceIds: string[]): Promise<HealthCheckResult[]> {
    const results = await Promise.all(serviceIds.map((id) => this.checkAndHeal(id)));
    return results;
  }
}

export default Phase6Coordinator;
