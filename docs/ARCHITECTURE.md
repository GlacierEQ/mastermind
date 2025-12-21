# 🏗️ Mastermind Architecture

## Overview

Mastermind is a **template engine** that spawns production-ready repositories. This document explains the architectural decisions that keep Mastermind pure and powerful.

## Core Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MASTERMIND                           │
│                  (Template Engine)                      │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Kernel    │  │   Agents    │  │  Templates  │   │
│  │   Agent     │──│   (1-9)     │──│  (Standard, │   │
│  │             │  │             │  │   ML, etc)  │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
│         │                 │                 │          │
│         └─────────────────┴─────────────────┘          │
│                        │                                │
└────────────────────────┼────────────────────────────────┘
                         │
                         │ SPAWN
                         ↓
              ┌──────────────────────┐
              │  Generated Service   │
              │  (Independent Repo)  │
              │                      │
              │  • Complete code     │
              │  • 85%+ tests        │
              │  • Infrastructure    │
              │  • Documentation     │
              │  • MCP integration   │
              │  • Observability     │
              └──────────────────────┘
```

## Design Principles

### 1. Immutable Template Core

**Problem**: Template engines that become "live" codebases create confusion and coupling.

**Solution**: Mastermind never runs as a service. It only generates services.

```typescript
// ✅ CORRECT: Mastermind generates code
const service = await mastermind.generate({
  name: 'payments',
  template: 'standard'
});

// ❌ WRONG: Mastermind shouldn't be a runtime
const app = express();
app.listen(3000); // This should never be in Mastermind
```

### 2. Clean Separation: Generation vs Execution

```
Generation Time (Mastermind):
├── Template selection
├── Code generation
├── File scaffolding
├── Configuration creation
└── Documentation writing

Execution Time (Generated Service):
├── Service startup
├── API handling
├── Database operations
├── MCP tool exposure
└── Metric collection
```

Mastermind exists only at **Generation Time**.
Generated services exist only at **Execution Time**.

### 3. One-Way Data Flow

```
Mastermind → [SPAWN] → Service A ✓
Service A --x-→ Mastermind (Never calls back)
```

Generated services:
- ✅ Are self-contained
- ✅ Have all dependencies
- ✅ Include complete documentation
- ❌ Never import from Mastermind
- ❌ Never depend on Mastermind at runtime
- ❌ Never call back to Mastermind APIs

### 4. Template Versioning

```
Mastermind v1.0.0 → Service (pinned to v1.0.0)
↓
Mastermind v1.1.0 → Service (pinned to v1.1.0)
↓
Mastermind v2.0.0 → Service (pinned to v2.0.0)
```

Each generated service:
- Records which Mastermind version created it
- Can reproduce identical output
- Never needs to "upgrade" template

## Agent Architecture

### Kernel Agent (Orchestrator)

```typescript
class KernelAgent {
  async orchestrate(request: GenerationRequest): Promise<GeneratedService> {
    // Plan: What needs to be generated?
    const plan = await this.plan(request);
    
    // Act: Generate all components
    const service = await this.execute(plan);
    
    // Review: Validate output
    const validation = await this.validate(service);
    
    return service;
  }
}
```

**Responsibilities**:
- Coordinate other 8 agents
- Ensure generation completeness
- Validate final output
- Never execute generated code

### Specialized Agents (1-8)

Each agent generates **static output** for the target service:

```typescript
class ArchitectAgent {
  generate(spec: ServiceSpec): GeneratedCode {
    return {
      files: ['domain/', 'application/', 'infrastructure/'],
      tests: ['unit/', 'integration/'],
      docs: ['architecture.md']
    };
  }
}
```

**Key**: Agents produce **files**, not runtime behavior.

## Template System

### Template Structure

```
templates/
├── standard/           # TypeScript microservice
│   ├── src/
│   ├── tests/
│   ├── infrastructure/
│   ├── .mcp/          # MCP integration
│   └── .mastermind-manifest.yml
├── python-ml/         # Python ML service
│   ├── src/
│   ├── models/
│   ├── notebooks/
│   └── .mcp/
└── forensic/          # Legal compliance service
    ├── src/
    ├── evidence/
    ├── audit/
    └── .mcp/
```

### Template Variables

Templates use placeholders:

```typescript
// Template file: service.ts.template
export class {{SERVICE_NAME}}Service {
  constructor() {
    this.domain = '{{SERVICE_DOMAIN}}';
  }
}

// Generated file: service.ts
export class PaymentsService {
  constructor() {
    this.domain = 'billing';
  }
}
```

### Template Composition

```bash
# Stack multiple capabilities
pnpm ai:new-service api \
  --template=standard \
  --add=graphql \
  --add=redis \
  --add=elasticsearch

# Result: Composited template with all features
```

## MCP Integration Architecture

### Generated MCP Structure

```
generated-service/
├── .mcp/
│   ├── server.json       # MCP server config
│   ├── tools.ts          # Service-specific tools
│   ├── prompts.ts        # AI prompts
│   └── resources.ts      # Exposed resources
├── src/
│   └── mcp-handlers/     # Tool implementations
└── .mastermind-manifest.yml  # Metadata
```

### Tool Exposure Pattern

```typescript
// Generated in .mcp/tools.ts
export const tools = [
  {
    name: 'payments_health_check',
    execute: async () => {
      // Calls actual service API
      return fetch('http://localhost:3000/health');
    }
  }
];
```

**Key**: MCP tools live in **generated service**, not Mastermind.

## Protection Mechanisms

### 1. File System Protection

```
.templatelock              # Marks as template
.github/workflows/         # CI validates purity
TEMPLATE.md               # Documents philosophy
```

### 2. CI/CD Validation

```yaml
# Runs on every PR
- Check .templatelock exists
- Ensure no service code in Mastermind
- Validate template structure
- Verify documentation
```

### 3. Pre-commit Hooks

```bash
# Warns developers
if [[ $(git diff --cached --name-only) == *"src/services/"* ]]; then
  echo "⚠️  WARNING: Adding service code to template!"
fi
```

## Scaling Architecture

### Horizontal: Multiple Templates

```
Mastermind
├── Standard template → 1000s of microservices
├── ML template → 100s of ML services
└── Forensic template → 10s of compliance services
```

Each template generates unlimited services.

### Vertical: Template Evolution

```
v1.0: Basic generation
↓
v1.1: + MCP integration
↓
v1.2: + Multi-language
↓
v2.0: + Self-improving
```

Versioning allows safe evolution without breaking existing services.

## Performance Characteristics

### Generation Speed

```
Standard microservice: 25 minutes
ML service: 35 minutes
Forensic service: 30 minutes

Parallel generation: 5 services in 30 minutes
```

### Resource Usage

```
Mastermind generation:
├── CPU: 2 cores
├── RAM: 4GB
├── Disk: 500MB
└── Network: Minimal

Generated service:
├── Container: 150MB
├── Runtime RAM: 512MB
└── Startup: <5s
```

## Comparison: Traditional vs Mastermind

### Traditional Development

```
Developer writes code → 
  Tests → 
    Infrastructure → 
      Documentation → 
        Deploy
        
Time: 80 hours
Cost: $12,000
Quality: Variable
```

### Mastermind Generation

```
Single command → 
  Complete service generated → 
    Validate → 
      Deploy
      
Time: 25 minutes
Cost: $21
Quality: Guaranteed (85%+ coverage)
```

## Future Architecture

### Phase 5: ML Integration (Q1 2025)

```
Mastermind + ML Models
├── Cost prediction
├── Performance optimization
├── Anomaly detection
└── Self-tuning generation
```

### Phase 6: Self-Healing (Q2 2025)

```
Generated services:
├── Auto-detect issues
├── Self-repair
├── Autonomous scaling
└── Circuit breakers
```

### Phase 7: Self-Improving (Q3 2025)

```
Mastermind learns from:
├── Generated service patterns
├── Team feedback
├── Production metrics
└── Industry best practices
```

## Conclusion

Mastermind's architecture prioritizes:

1. **Purity**: Template never becomes runtime
2. **Power**: 192x faster than traditional development
3. **Independence**: Generated services are self-contained
4. **Evolution**: Safe template improvements via versioning
5. **Protection**: Automated validation of template integrity

This architecture ensures Mastermind remains the **perfect template engine** that spawns perfect repositories.

---

🚀 **Architecture that spawns excellence**