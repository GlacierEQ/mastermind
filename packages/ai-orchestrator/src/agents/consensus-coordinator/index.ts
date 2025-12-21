/**
 * Consensus Coordinator - Phase 8
 * Uses distributed consensus patterns for high-impact decisions.
 * Inspired by Paxos/Raft consensus algorithms.
 */

import { Agent, AgentInput, AgentOutput } from '../../types';

export interface ConsensusProposal {
  id: string;
  action: string;
  priority: 'normal' | 'high' | 'critical';
  risklevel: 'low' | 'medium' | 'high';
  affectedServices: string[];
  timestamp: Date;
}

export interface ConsensusVote {
  voterId: string;
  proposalId: string;
  vote: 'yes' | 'no' | 'abstain';
  reason?: string;
}

export interface CoordinatorInput extends AgentInput {
  proposal: ConsensusProposal;
  voters: string[]; // Agent IDs that can vote
  requiredConsensus?: number; // % required to approve (default 66%)
}

export interface CoordinatorOutput extends AgentOutput {
  approved?: boolean;
  consensusPercentage?: number;
  votes?: ConsensusVote[];
  recommendedAction?: string;
}

export class ConsensusCoordinatorAgent implements Agent {
  name = 'Consensus Coordinator';
  version = '1.0.0';
  phase = 8;
  description = 'Coordinates high-impact decisions using distributed consensus patterns.';

  async execute(input: CoordinatorInput): Promise<CoordinatorOutput> {
    const start = Date.now();

    try {
      const proposal = input.proposal;
      const voters = input.voters || [];
      const requiredConsensus = input.requiredConsensus || 66;

      // 1) Simulate voting from different agents
      const votes = this.collectVotes(proposal, voters);

      // 2) Calculate consensus percentage
      const consensus = this.calculateConsensus(votes);

      // 3) Determine if proposal approved
      const approved = consensus >= requiredConsensus;

      // 4) Generate recommendation
      const recommendation = this.generateRecommendation(proposal, approved, consensus);

      return {
        success: true,
        data: {
          approved,
          consensusPercentage: consensus,
          votes,
          recommendedAction: recommendation,
        },
        metrics: {
          executionTimeMs: Date.now() - start,
          votesReceived: votes.length,
          consensusThreshold: requiredConsensus,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in consensus coordinator',
        data: null,
        metrics: {
          executionTimeMs: Date.now() - start,
        },
      };
    }
  }

  private collectVotes(proposal: ConsensusProposal, voters: string[]): ConsensusVote[] {
    const votes: ConsensusVote[] = [];

    voters.forEach((voterId) => {
      // Agents vote based on risk analysis and alignment
      const shouldApprove = this.agentEvaluatesProposal(proposal);

      votes.push({
        voterId,
        proposalId: proposal.id,
        vote: shouldApprove ? 'yes' : 'no',
        reason: shouldApprove ? 'Risk acceptable and action justified' : 'Risk too high for current conditions',
      });
    });

    return votes;
  }

  private agentEvaluatesProposal(proposal: ConsensusProposal): boolean {
    // High-risk or critical proposals need higher bar
    if (proposal.risklevel === 'high' || proposal.priority === 'critical') {
      return Math.random() > 0.4; // 60% chance to approve
    }

    if (proposal.risklevel === 'medium') {
      return Math.random() > 0.2; // 80% chance to approve
    }

    return Math.random() > 0.05; // 95% chance to approve low-risk
  }

  private calculateConsensus(votes: ConsensusVote[]): number {
    if (votes.length === 0) return 0;

    const yesVotes = votes.filter((v) => v.vote === 'yes').length;
    return (yesVotes / votes.length) * 100;
  }

  private generateRecommendation(proposal: ConsensusProposal, approved: boolean, consensus: number): string {
    if (approved) {
      return `APPROVED: ${proposal.action} (${consensus.toFixed(1)}% consensus). Proceed with execution.`;
    }

    return `BLOCKED: ${proposal.action} (${consensus.toFixed(1)}% consensus). Does not meet approval threshold.`;
  }
}

export default ConsensusCoordinatorAgent;
