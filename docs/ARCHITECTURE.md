# Mastermind Architecture

## System Overview

```
┌─────────────────────────────────────┐
│         CLI Interface               │
├─────────────────────────────────────┤
│      Orchestration Kernel           │
│   (Plan → Act → Review → Validate)  │
├─────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌────┐ │
│  │Architect │  │  Tester  │  │Infra│
│  └──────────┘  └──────────┘  └────┘ │
│  ┌──────────┐  ┌──────────┐  ┌────┐ │
│  │   Docs   │  │Migration │  │Ops │ │
│  └──────────┘  └──────────┘  └────┘ │
├─────────────────────────────────────┤
│  Governance Rules (Hard-coded)      │
├─────────────────────────────────────┤
│  Artifact Storage (Versioned)       │
└─────────────────────────────────────┘
```

## The 9 Agents

### 1. Kernel Agent (750 lines)
**Core orchestration engine**
- Plan phase: Design execution strategy
- Act phase: Generate artifacts
- Review phase: Validate outputs
- Learn phase: Improve from patterns

### 2. Architect Agent (698 lines)
**Service scaffolding**
- Analyzes domain requirements
- Designs clean architecture (3 layers)
- Generates domain entities
- Creates repositories pattern
- Type-safe Zod schemas

### 3. Tester Agent (766 lines)
**Test generation**
- Unit tests (70% coverage)
- Integration tests (20% coverage)
- E2E tests (10% coverage)
- Test factories & fixtures
- Ensures 85%+ coverage

### 4. Infrastructure Agent (1,263 lines)
**Infrastructure-as-Code**
- Multi-stage Docker builds
- Kubernetes manifests (deployments, services, ingress, HPA)
- Terraform (ECR, RDS, CloudWatch)
- GitHub Actions CI/CD
- Monitoring setup

### 5. Docs Agent (1,177 lines)
**Documentation generation**
- API documentation
- OpenAPI specifications
- Architecture diagrams
- Contributing guidelines
- Deployment procedures
- Mermaid diagrams

### 6. Migration Agent (742 lines)
**Database & breaking changes**
- Kysely migrations
- Deprecation notices
- Codemods for refactoring
- Rollback procedures
- Schema versioning

### 7. Analytics Agent (1,577 lines)
**Observability stack**
- Prometheus metrics
- Grafana dashboards (3 custom)
- Alert rules (8+ critical)
- OpenTelemetry tracing
- Loki structured logging
- SLO definitions

### 8. DevOps Agent (1,055 lines)
**Autonomous operations**
- Blue-green deployments
- Canary rollouts
- Automated scaling
- Incident response
- Disaster recovery
- Health checks

### 9. Security Agent (~400 lines)
**Governance & security**
- CVE scanning rules
- Authentication patterns
- OWASP compliance
- Audit logging

## Generated Service Architecture

```
┌─────────────────────────────────────┐
│     HTTP Layer (tRPC routers)       │  Input validation, HTTP concerns
├─────────────────────────────────────┤
│     App Layer (use cases)           │  Business logic, orchestration
├─────────────────────────────────────┤
│     Domain Layer (entities)         │  Domain models, repositories
├─────────────────────────────────────┤
│     Infrastructure Layer            │  Database, external services
└─────────────────────────────────────┘
```

## Data Flow

1. **Request comes in** → HTTP layer validates with Zod
2. **Route to use case** → App layer orchestrates
3. **Query repository** → Domain layer retrieves data
4. **Execute SQL** → Infrastructure queries database
5. **Return response** → Type-safe result to client
6. **Log & trace** → OpenTelemetry records span
7. **Metrics emitted** → Prometheus collects
8. **Alert if needed** → Alert rules evaluate

## Governance Model

All generated services enforce:
- ✅ 85%+ test coverage (non-negotiable)
- ✅ Clean 3-layer architecture
- ✅ Type safety (TypeScript strict)
- ✅ No circular dependencies
- ✅ Security best practices
- ✅ Performance budgets
- ✅ Production readiness

## Integration Points

- **GitHub** (source control, PR creation)
- **Docker Hub** (image registry)
- **Kubernetes** (deployment orchestration)
- **AWS** (ECR, RDS, CloudWatch)
- **Prometheus** (metrics collection)
- **Grafana** (dashboards)
- **Slack** (notifications)
- **PagerDuty** (incident management)