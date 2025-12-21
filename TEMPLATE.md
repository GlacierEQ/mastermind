# 🎯 Mastermind Template Engine

## What Is Mastermind?

Mastermind is a **TEMPLATE ENGINE** - not a working repository.

It's the blueprint that spawns hyper-optimized, production-ready repositories in minutes.

## Architecture Philosophy

```
Mastermind (pristine template)
    ↓
[SPAWN] → Service A (independent)
    ↓
[SPAWN] → Service B (independent)
    ↓
[SPAWN] → Service C (independent)

Each service:
✅ Self-contained
✅ Production-ready
✅ Never calls back to Mastermind
✅ MCP-constellation ready
✅ Fully documented
✅ Complete test coverage
```

## Core Principles

### 1. Template Purity
- Mastermind remains untouched after generation
- No circular dependencies
- No service-specific code in Mastermind
- Clean separation of template vs generated code

### 2. Spawn, Don't Mutate
- Generate new repos, don't modify Mastermind
- Each generated repo is independent
- Template evolution happens through versioning
- Generated repos never need to update Mastermind

### 3. Unreasonable Efficiency
- 25-minute service generation
- 192x faster than traditional development
- 571x cost reduction per service
- Zero-downtime deployments by default

### 4. Hyper Power
- 9 specialized AI agents
- 85%+ test coverage guaranteed
- Complete infrastructure automation
- Production-grade observability

## Usage Pattern

### ✅ CORRECT: Generate New Services

```bash
# Clone Mastermind
git clone https://github.com/GlacierEQ/mastermind.git
cd mastermind

# Install dependencies
pnpm install

# Generate a new service (creates independent repo)
pnpm ai:new-service payments --domain=billing

# Result: New 'payments' repo created, fully independent
# Mastermind remains untouched
```

### ❌ INCORRECT: Building Into Mastermind

```bash
# DON'T DO THIS:
cd mastermind
# Add service-specific code here ❌
# Modify core agents for one use case ❌
# Add dependencies for specific service ❌
```

## Template Variations

Mastermind supports multiple template types:

```bash
# Standard microservice (default)
pnpm ai:new-service api --template=standard

# Python ML service
pnpm ai:new-service model --template=python-ml

# Forensic compliance service
pnpm ai:new-service evidence --template=forensic

# Blockchain service
pnpm ai:new-service contract --template=blockchain
```

## Enhancing Mastermind

### To Add New Template Variations:

1. Create feature branch
2. Add template to `templates/<name>/`
3. Update template registry
4. Add tests for new template
5. Document in README
6. PR with version bump

### To Improve Generation Logic:

1. Modify agents in `src/agents/`
2. Ensure changes apply to ALL templates
3. Add comprehensive tests
4. Update documentation
5. Version bump according to semver

## Protection Mechanisms

- `.templatelock` file marks template status
- Pre-commit hooks prevent accidental modifications
- CI/CD validates template purity
- Version tracking for reproducibility
- Clear documentation and warnings

## Version Strategy

```
v1.0.0: Original 9 agents, Node/TypeScript
v1.1.0: + MCP-ready output
v1.2.0: + Multi-language templates
v1.3.0: + Forensic compliance
v2.0.0: + Self-improving generation
```

Users can pin versions:
```bash
pnpm ai:new-service api --mastermind-version=1.2.0
```

## Generated Service Structure

Every spawned service includes:

```
generated-service/
├── .mcp/                    # MCP integration
│   ├── server.json
│   ├── tools.ts
│   └── prompts.ts
├── .mastermind-manifest.yml # Generation metadata
├── src/                     # Service code
├── tests/                   # 85%+ coverage
├── infrastructure/          # K8s, Terraform
├── docs/                    # Complete documentation
└── README.md               # Service-specific
```

## MCP Integration

Generated services are MCP-constellation ready:

- Expose service-specific MCP tools
- Include orchestration metadata
- Compatible with Zenith orchestrator
- Self-documenting capabilities
- Discoverable by AI agents

## Support

- Issues: https://github.com/GlacierEQ/mastermind/issues
- Discussions: https://github.com/GlacierEQ/mastermind/discussions
- License: MIT

---

🚀 **Mastermind: The Template Engine That Spawns Perfect Repos**

⚠️ **Remember: Copy, don't modify. Spawn, don't mutate.**