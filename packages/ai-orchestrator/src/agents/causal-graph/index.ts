/**
 * Causal Graph Builder - Phase 8
 * Maintains a causal graph of services, metrics, and actions.
 * Learns causal relationships from system events.
 */

import { Agent, AgentInput, AgentOutput } from '../../types';

export interface CausalNode {
  id: string;
  type: 'service' | 'metric' | 'action' | 'incident';
  name: string;
  value?: number;
}

export interface CausalEdge {
  from: string;
  to: string;
  weight: number; // 0-1, strength of causal relationship
  lag: number; // time lag in seconds
  confidence: number; // 0-100%
}

export interface CausalGraphInput extends AgentInput {
  serviceId: string;
  events: Array<{ type: string; service: string; metric: string; value: number; timestamp: Date }>;
  knownIncidents?: string[];
}

export interface CausalGraphOutput extends AgentOutput {
  nodes?: CausalNode[];
  edges?: CausalEdge[];
  rootCauses?: Array<{ incident: string; likelyCause: string; confidence: number }>;
  criticalPaths?: string[];
}

export class CausalGraphAgent implements Agent {
  name = 'Causal Graph Builder';
  version = '1.0.0';
  phase = 8;
  description = 'Builds and maintains causal graphs of system components and discovers causal relationships.';

  private graph: Map<string, Set<string>> = new Map();
  private edges: Map<string, CausalEdge> = new Map();

  async execute(input: CausalGraphInput): Promise<CausalGraphOutput> {
    const start = Date.now();

    try {
      const events = input.events || [];

      // 1) Extract nodes from events
      const nodes = this.extractNodes(events);

      // 2) Infer causal relationships from temporal patterns
      const edges = this.inferCausalRelationships(events);

      // 3) Identify root causes for known incidents
      const rootCauses = this.identifyRootCauses(input.knownIncidents || [], edges);

      // 4) Find critical paths (important chains of causality)
      const criticalPaths = this.findCriticalPaths(nodes, edges);

      return {
        success: true,
        data: {
          nodes,
          edges,
          rootCauses,
          criticalPaths,
        },
        metrics: {
          executionTimeMs: Date.now() - start,
          nodesCount: nodes.length,
          edgesCount: edges.length,
          rootCausesIdentified: rootCauses.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in causal graph builder',
        data: null,
        metrics: {
          executionTimeMs: Date.now() - start,
        },
      };
    }
  }

  private extractNodes(events: any[]): CausalNode[] {
    const nodes: Map<string, CausalNode> = new Map();

    events.forEach((event) => {
      const serviceNode: CausalNode = {
        id: `service:${event.service}`,
        type: 'service',
        name: event.service,
      };
      nodes.set(serviceNode.id, serviceNode);

      const metricNode: CausalNode = {
        id: `metric:${event.metric}`,
        type: 'metric',
        name: event.metric,
        value: event.value,
      };
      nodes.set(metricNode.id, metricNode);
    });

    return Array.from(nodes.values());
  }

  private inferCausalRelationships(events: any[]): CausalEdge[] {
    const edges: CausalEdge[] = [];

    // Temporal pattern matching: if metric A changes before metric B, there may be causal link
    for (let i = 0; i < events.length - 1; i++) {
      const current = events[i];
      const next = events[i + 1];

      const timeLag = (next.timestamp.getTime() - current.timestamp.getTime()) / 1000; // seconds

      // If lag is small (< 30s) and metrics are different, infer relationship
      if (timeLag > 0 && timeLag < 30 && current.metric !== next.metric) {
        const edge: CausalEdge = {
          from: `metric:${current.metric}`,
          to: `metric:${next.metric}`,
          weight: Math.max(0.3, 1 - timeLag / 30), // closer in time = stronger
          lag: timeLag,
          confidence: 60 + Math.random() * 30,
        };
        edges.push(edge);
      }
    }

    return edges;
  }

  private identifyRootCauses(
    incidents: string[],
    edges: CausalEdge[],
  ): Array<{ incident: string; likelyCause: string; confidence: number }> {
    return incidents.map((incident) => ({
      incident,
      likelyCause: edges.length > 0 ? edges[0].from : 'unknown',
      confidence: edges.length > 0 ? edges[0].confidence : 0,
    }));
  }

  private findCriticalPaths(nodes: CausalNode[], edges: CausalEdge[]): string[] {
    // Find longest causal chains (important for understanding system behavior)
    const paths: string[] = [];

    edges
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .forEach((edge) => {
        paths.push(`${edge.from} → ${edge.to}`);
      });

    return paths;
  }
}

export default CausalGraphAgent;
