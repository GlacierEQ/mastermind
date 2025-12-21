/**
 * Cost Optimization Agent - Phase 5
 * Analyzes cloud spend and infrastructure costs, recommends optimizations.
 */

import { Agent, AgentInput, AgentOutput } from '../../types';

export interface ResourceAllocation {
  type: 'compute' | 'storage' | 'network' | 'database';
  current: number; // actual usage
  allocated: number; // provisioned capacity
  cost: number; // monthly cost
  utilizationPercent: number;
}

export interface CostSaving {
  name: string;
  category: 'rightsizing' | 'reserved-instances' | 'auto-scaling' | 'waste-elimination';
  monthlySavings: number; // dollars
  implementationEffort: 'low' | 'medium' | 'high';
  paybackPeriodDays: number;
  steps: string[];
}

export interface CostInput extends AgentInput {
  serviceId: string;
  currentMonthlySpend: number;
  resourceAllocations: ResourceAllocation[];
}

export interface CostOutput extends AgentOutput {
  totalMonthlySpend?: number;
  projectedAnnualCost?: number;
  savings?: CostSaving[];
  potentialMonthlySavings?: number;
  savingsPercentage?: number;
}

export class CostOptimizerAgent implements Agent {
  name = 'Cost Optimizer';
  version = '1.0.0';
  phase = 5;
  description = 'Analyzes cloud spend and recommends cost optimizations.';

  async execute(input: CostInput): Promise<CostOutput> {
    const start = Date.now();

    try {
      const allocations = input.resourceAllocations || [];

      // 1) Analyze current allocation
      const analysis = this.analyzeAllocations(allocations);

      // 2) Identify overprovisioning
      const overprovisioned = this.findOverprovisioned(allocations);

      // 3) Find unused resources
      const unused = this.findUnused(allocations);

      // 4) Calculate savings opportunities
      const savings = this.calculateSavings(overprovisioned, unused, allocations);

      // 5) Rank by ROI
      savings.sort((a, b) => b.monthlySavings / Math.max(1, a.paybackPeriodDays) - a.monthlySavings / Math.max(1, b.paybackPeriodDays));

      const potentialMonthlySavings = savings.reduce((sum, s) => sum + s.monthlySavings, 0);
      const savingsPercentage = (potentialMonthlySavings / input.currentMonthlySpend) * 100;

      return {
        success: true,
        data: {
          totalMonthlySpend: input.currentMonthlySpend,
          projectedAnnualCost: input.currentMonthlySpend * 12,
          savings,
          potentialMonthlySavings,
          savingsPercentage,
        },
        metrics: {
          executionTimeMs: Date.now() - start,
          savingsIdentified: savings.length,
          potentialMonthlySavings,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in cost optimizer',
        data: null,
        metrics: {
          executionTimeMs: Date.now() - start,
        },
      };
    }
  }

  private analyzeAllocations(allocations: ResourceAllocation[]): Record<string, any> {
    const byType: Record<string, ResourceAllocation[]> = {};

    allocations.forEach((a) => {
      if (!byType[a.type]) byType[a.type] = [];
      byType[a.type].push(a);
    });

    const analysis: Record<string, any> = {};
    Object.entries(byType).forEach(([type, items]) => {
      const totalCost = items.reduce((sum, a) => sum + a.cost, 0);
      const avgUtilization = items.reduce((sum, a) => sum + a.utilizationPercent, 0) / items.length;

      analysis[type] = { totalCost, avgUtilization, count: items.length };
    });

    return analysis;
  }

  private findOverprovisioned(allocations: ResourceAllocation[]): ResourceAllocation[] {
    return allocations.filter((a) => a.utilizationPercent < 40);
  }

  private findUnused(allocations: ResourceAllocation[]): ResourceAllocation[] {
    return allocations.filter((a) => a.utilizationPercent < 5);
  }

  private calculateSavings(overprovisioned: ResourceAllocation[], unused: ResourceAllocation[], all: ResourceAllocation[]): CostSaving[] {
    const savings: CostSaving[] = [];

    // Unused resources - immediate elimination
    unused.forEach((u) => {
      savings.push({
        name: `Eliminate unused ${u.type} (${u.allocated} units)`,
        category: 'waste-elimination',
        monthlySavings: u.cost,
        implementationEffort: 'low',
        paybackPeriodDays: 0,
        steps: [`Verify ${u.type} is truly unused`, 'Decommission', 'Cancel billing'],
      });
    });

    // Overprovisioned resources - rightsize
    overprovisioned.forEach((o) => {
      const rightsize = (o.allocated * o.utilizationPercent) / 100;
      const newCost = (rightsize / o.allocated) * o.cost;
      const savings_amount = o.cost - newCost;

      if (savings_amount > 10) {
        savings.push({
          name: `Rightsize ${o.type} (${o.allocated} → ${Math.ceil(rightsize)})`,
          category: 'rightsizing',
          monthlySavings: savings_amount,
          implementationEffort: 'medium',
          paybackPeriodDays: 7,
          steps: ['Monitor usage for 2 weeks', 'Resize allocation', 'Monitor performance'],
        });
      }
    });

    // Reserved instances for stable workloads
    const stableResources = all.filter((a) => a.utilizationPercent > 50 && a.utilizationPercent < 100);
    stableResources.slice(0, 3).forEach((s) => {
      const reservedSavings = s.cost * 0.3; // Assume 30% savings with RI

      savings.push({
        name: `Purchase 1-year Reserved Instance for ${s.type}`,
        category: 'reserved-instances',
        monthlySavings: reservedSavings,
        implementationEffort: 'low',
        paybackPeriodDays: 365,
        steps: ['Commit to 1-year RI', 'Apply to instance'],
      });
    });

    return savings;
  }
}

export default CostOptimizerAgent;
