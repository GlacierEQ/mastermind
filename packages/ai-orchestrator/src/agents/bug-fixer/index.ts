/**
 * Autonomous Bug Fixer Agent - Phase 6
 * Self-healing: analyzes errors, generates patches, validates, and deploys.
 */

import { Agent, AgentInput, AgentOutput } from '../../types';

export interface BugFixInput extends AgentInput {
  serviceId: string;
  errorLog: string;
  commitSha?: string;
}

export interface CodeLocation {
  filePath: string;
  line: number;
  column?: number;
  functionName?: string;
  snippet?: string;
}

export interface RootCause {
  type: 'null-pointer' | 'timeout' | 'db-connection' | 'resource-leak' | 'validation' | 'unknown';
  description: string;
  location: CodeLocation;
  stackTrace?: string;
}

export interface CodeFix {
  title: string;
  description: string;
  diff: string; // unified diff patch
  riskLevel: 'low' | 'medium' | 'high';
  requiresMigration?: boolean;
}

export interface BugFixOutput extends AgentOutput {
  rootCause?: RootCause;
  candidateFixes?: CodeFix[];
  selectedFix?: CodeFix;
  applied?: boolean;
  rollbackPlan?: string;
}

export class AutonomousBugFixerAgent implements Agent {
  name = 'Autonomous Bug Fixer';
  version = '1.0.0';
  phase = 6;
  description = 'Analyzes errors, proposes fixes, and can auto-apply low-risk patches.';

  async execute(input: BugFixInput): Promise<BugFixOutput> {
    const start = Date.now();

    try {
      // 1) Analyze error log
      const rootCause = await this.analyzeErrorLog(input.errorLog);

      // 2) Generate candidate fixes
      const candidateFixes = await this.generateCandidateFixes(rootCause, input);

      // 3) Select safest fix
      const selectedFix = this.selectBestFix(candidateFixes);

      // 4) Optionally apply fix (for now, dry-run only)
      const applyFix = false; // future: toggle based on config/governance
      let applied = false;
      let rollbackPlan: string | undefined;

      if (applyFix && selectedFix) {
        const result = await this.applyFix(selectedFix, input);
        applied = result.applied;
        rollbackPlan = result.rollbackPlan;
      }

      return {
        success: true,
        data: {
          rootCause,
          candidateFixes,
          selectedFix,
          applied,
          rollbackPlan,
        },
        metrics: {
          executionTimeMs: Date.now() - start,
          candidates: candidateFixes.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in bug fixer agent',
        data: null,
        metrics: {
          executionTimeMs: Date.now() - start,
        },
      };
    }
  }

  private async analyzeErrorLog(errorLog: string): Promise<RootCause> {
    // TODO: Replace with real parsing + ML/NLP
    const lower = errorLog.toLowerCase();

    if (lower.includes('null') && lower.includes('pointer')) {
      return {
        type: 'null-pointer',
        description: 'Likely null reference access detected.',
        location: {
          filePath: 'src/app/example.ts',
          line: 42,
        },
        stackTrace: errorLog,
      };
    }

    if (lower.includes('timeout')) {
      return {
        type: 'timeout',
        description: 'Operation timed out, possible slow dependency or missing index.',
        location: {
          filePath: 'src/infra/http/client.ts',
          line: 87,
        },
        stackTrace: errorLog,
      };
    }

    return {
      type: 'unknown',
      description: 'Unable to classify error yet, requires manual review.',
      location: {
        filePath: 'unknown',
        line: 0,
      },
      stackTrace: errorLog,
    };
  }

  private async generateCandidateFixes(rootCause: RootCause, input: BugFixInput): Promise<CodeFix[]> {
    const fixes: CodeFix[] = [];

    switch (rootCause.type) {
      case 'null-pointer':
        fixes.push({
          title: 'Add null check around suspected variable',
          description:
            'Wrap the access in a null/undefined guard to prevent runtime null pointer exceptions.',
          diff: [
            '--- a/src/app/example.ts',
            '+++ b/src/app/example.ts',
            '@@ -39,7 +39,11 @@',
            '-  const value = obj.field.toString();',
            '+  if (!obj || obj.field == null) {',
            '+    // TODO: handle missing field gracefully',
            '+    return; // or provide default value',
            '+  }',
            '+  const value = obj.field.toString();',
          ].join('\n'),
          riskLevel: 'low',
        });
        break;

      case 'timeout':
        fixes.push({
          title: 'Increase timeout and add retry logic',
          description:
            'Increase HTTP client timeout and add exponential backoff retries for transient failures.',
          diff: [
            '--- a/src/infra/http/client.ts',
            '+++ b/src/infra/http/client.ts',
            '@@ -80,7 +80,16 @@',
            '-  const client = new HttpClient({ timeout: 2000 });',
            '+  const client = new HttpClient({ timeout: 5000, retries: 3, backoff: 250 });',
          ].join('\n'),
          riskLevel: 'medium',
        });
        break;

      default:
        fixes.push({
          title: 'Add diagnostic logging around error site',
          description:
            'Add structured logging with context to better understand this error in future occurrences.',
          diff: [
            '--- a/src/app/unknown.ts',
            '+++ b/src/app/unknown.ts',
            '@@ -10,6 +10,10 @@',
            '+  logger.error("Unexpected error occurred", {',
            '+    serviceId: "' + input.serviceId + '",',
            '+    context: /* TODO: add context */ {},',
            '+  });',
          ].join('\n'),
          riskLevel: 'low',
        });
        break;
    }

    return fixes;
  }

  private selectBestFix(fixes: CodeFix[]): CodeFix | undefined {
    if (!fixes.length) return undefined;

    const sorted = [...fixes].sort((a, b) => {
      const riskScore = (r: CodeFix['riskLevel']) => (r === 'low' ? 1 : r === 'medium' ? 2 : 3);
      return riskScore(a.riskLevel) - riskScore(b.riskLevel);
    });

    return sorted[0];
  }

  private async applyFix(
    fix: CodeFix,
    input: BugFixInput,
  ): Promise<{ applied: boolean; rollbackPlan?: string }> {
    // NOTE: This is intentionally a stub for now.
    // Real implementation would:
    // - Create a git branch
    // - Apply patch
    // - Run tests
    // - Open PR or auto-merge based on governance

    console.log(`[AutonomousBugFixer] Would apply fix: ${fix.title} for service ${input.serviceId}`);

    const rollbackPlan = [
      '1. Revert commit if new errors appear.',
      '2. Rollback deployment to previous stable version.',
      '3. Re-run full test suite.',
    ].join('\n');

    return {
      applied: false, // dry run for now
      rollbackPlan,
    };
  }
}

export default AutonomousBugFixerAgent;
