/**
 * Chaos Runner
 * Executes chaos scenarios and collects results for observability.
 */

export interface ChaosScenario {
  name: string;
  description: string;
  inject: () => Promise<any>; // Injection function
  verify: (result: any) => boolean; // Verification function
  expectedBehavior: string;
}

export interface ChaosResult {
  scenarioName: string;
  passed: boolean;
  executionTimeMs: number;
  injectedFailure: string;
  systemBehavior: any;
  timestamp: Date;
}

export class ChaosRunner {
  private results: ChaosResult[] = [];

  async runScenario(scenario: ChaosScenario): Promise<ChaosResult> {
    const start = Date.now();

    try {
      const injected = await scenario.inject();
      const passed = scenario.verify(injected);

      const result: ChaosResult = {
        scenarioName: scenario.name,
        passed,
        executionTimeMs: Date.now() - start,
        injectedFailure: scenario.description,
        systemBehavior: injected,
        timestamp: new Date(),
      };

      this.results.push(result);
      return result;
    } catch (error) {
      return {
        scenarioName: scenario.name,
        passed: false,
        executionTimeMs: Date.now() - start,
        injectedFailure: scenario.description,
        systemBehavior: { error: error instanceof Error ? error.message : String(error) },
        timestamp: new Date(),
      };
    }
  }

  async runSuite(scenarios: ChaosScenario[]): Promise<ChaosResult[]> {
    const allResults: ChaosResult[] = [];

    for (const scenario of scenarios) {
      const result = await this.runScenario(scenario);
      allResults.push(result);
      console.log(`[${scenario.name}] ${result.passed ? '✓ PASS' : '✗ FAIL'} (${result.executionTimeMs}ms)`);
    }

    return allResults;
  }

  getReport(): {
    totalScenarios: number;
    passed: number;
    failed: number;
    successRate: number;
    results: ChaosResult[];
  } {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;

    return {
      totalScenarios: total,
      passed,
      failed,
      successRate: total > 0 ? (passed / total) * 100 : 0,
      results: this.results,
    };
  }
}

export default ChaosRunner;
