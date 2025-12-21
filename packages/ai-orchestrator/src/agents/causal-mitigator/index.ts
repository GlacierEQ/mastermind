/**
 * Causal Mitigation Engine - Phase 8
 * Uses causal inference to find root causes and recommend optimal mitigations.
 * Based on patterns from Microsoft's Deoxys and causal ML research.
 */

import { Agent, AgentInput, AgentOutput } from '../../types';

export interface IncidentHistory {
  incidentId: string;
  affectedService: string;
  actionTaken: string;
  contextVariables: Record<string, number>;
  downtimeMinutes: number;
  timestamp: Date;
}

export interface CausalEffect {
  action: string;
  expectedDowntimeReduction: number; // minutes
  confidence: number; // 0-100%
  causalEstimate: number; // treatment effect
  isSafe: boolean; // based on historical safety
}

export interface MitigationInput extends AgentInput {
  serviceId: string;
  currentContext: Record<string, number>; // current metrics
  incidentHistory: IncidentHistory[];
  incidentSeverity: 'low' | 'medium' | 'high' | 'critical';
}

export interface MitigationOutput extends AgentOutput {
  recommendedAction?: string;
  causalEffects?: CausalEffect[];
  confidenceLevel?: number; // 0-100%
  fallbackAction?: string; // if causal model uncertain
  expectedOutcome?: string;
}

export class CausalMitigatorAgent implements Agent {
  name = 'Causal Mitigation Engine';
  version = '1.0.0';
  phase = 8;
  description = 'Uses causal inference to recommend optimal mitigation actions based on historical incident data.';

  async execute(input: MitigationInput): Promise<MitigationOutput> {
    const start = Date.now();

    try {
      const history = input.incidentHistory || [];

      // 1) Build causal model from historical data
      const causalModel = this.buildCausalModel(history);

      // 2) Estimate treatment effects (causal effects of each action)
      const treatmentEffects = this.estimateTreatmentEffects(causalModel, input.currentContext);

      // 3) Rank actions by causal impact
      const rankedActions = this.rankActionsByCausalImpact(treatmentEffects);

      // 4) Select best action with confidence check
      const bestAction = rankedActions[0];
      const confidence = bestAction?.confidence || 0;

      // 5) Determine fallback if model uncertain
      const fallbackAction = this.selectFallbackAction(input.incidentSeverity);

      return {
        success: true,
        data: {
          recommendedAction: confidence > 60 ? bestAction?.action : fallbackAction,
          causalEffects: treatmentEffects,
          confidenceLevel: confidence,
          fallbackAction,
          expectedOutcome: `Expected downtime reduction: ${bestAction?.expectedDowntimeReduction || 0} minutes`,
        },
        metrics: {
          executionTimeMs: Date.now() - start,
          historicalIncidents: history.length,
          actionsCandidates: treatmentEffects.length,
          modelConfidence: confidence,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in causal mitigator',
        data: null,
        metrics: {
          executionTimeMs: Date.now() - start,
        },
      };
    }
  }

  private buildCausalModel(history: IncidentHistory[]): Record<string, any> {
    // Simplified causal model: action → outcome relationship
    // In production: implement double ML, causal forests, or structured causal models

    const model: Record<string, any> = {
      actions: {},
      contextInfluence: {},
    };

    history.forEach((incident) => {
      const action = incident.actionTaken;
      if (!model.actions[action]) {
        model.actions[action] = {
          instances: 0,
          totalDowntime: 0,
          successCount: 0,
        };
      }

      const actionData = model.actions[action];
      actionData.instances += 1;
      actionData.totalDowntime += incident.downtimeMinutes;
      if (incident.downtimeMinutes < 5) actionData.successCount += 1;
    });

    return model;
  }

  private estimateTreatmentEffects(
    causalModel: Record<string, any>,
    context: Record<string, number>,
  ): CausalEffect[] {
    const effects: CausalEffect[] = [];

    const actionNames = ['restart-service', 'scale-up', 'failover', 'drain-connections', 'rollback', 'throttle-traffic'];

    actionNames.forEach((action) => {
      const actionData = causalModel.actions[action];
      if (!actionData) {
        effects.push({
          action,
          expectedDowntimeReduction: 0,
          confidence: 40, // low confidence for untried actions
          causalEstimate: 0,
          isSafe: true,
        });
        return;
      }

      const avgDowntime = actionData.totalDowntime / actionData.instances;
      const successRate = (actionData.successCount / actionData.instances) * 100;
      const downtimeReduction = Math.max(0, avgDowntime - avgDowntime * 0.5); // assume 50% improvement

      effects.push({
        action,
        expectedDowntimeReduction: downtimeReduction,
        confidence: Math.min(100, 50 + successRate),
        causalEstimate: downtimeReduction,
        isSafe: successRate > 60,
      });
    });

    return effects;
  }

  private rankActionsByCausalImpact(effects: CausalEffect[]): CausalEffect[] {
    return [...effects]
      .filter((e) => e.isSafe)
      .sort(
        (a, b) =>
          b.expectedDowntimeReduction * (b.confidence / 100) -
          a.expectedDowntimeReduction * (a.confidence / 100),
      );
  }

  private selectFallbackAction(severity: string): string {
    // When causal model is uncertain, use heuristic fallback
    const fallbacks: Record<string, string> = {
      critical: 'immediate-failover', // most drastic
      high: 'scale-up-and-throttle',
      medium: 'restart-affected-service',
      low: 'increase-monitoring', // least invasive
    };

    return fallbacks[severity] || 'restart-affected-service';
  }
}

export default CausalMitigatorAgent;
