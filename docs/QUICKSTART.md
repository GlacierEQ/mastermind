# Quick Start

## Installation

```bash
git clone https://github.com/GlacierEQ/mastermind.git
cd mastermind
pnpm install
pnpm build
```

## Generate Your First Service

```bash
pnpm ai:new-service payments --domain=billing --environment=production
```

## What Gets Generated

- ✅ Complete service code (domain, API, database)
- ✅ 40+ test files (85%+ coverage)
- ✅ Docker configuration
- ✅ Kubernetes manifests
- ✅ Terraform infrastructure
- ✅ GitHub Actions CI/CD
- ✅ Prometheus & Grafana setup
- ✅ OpenTelemetry tracing
- ✅ Loki structured logging
- ✅ API documentation
- ✅ Architecture guides
- ✅ Deployment procedures
- ✅ Incident runbooks
- ✅ SLO definitions

## Review the Generated PR

```bash
git show HEAD
```

## Deploy to Production

```bash
pnpm ai:deploy --service=payments --environment=production
```

## Monitor Your Service

```bash
# View logs
kubectl logs -f deployment/payments

# View Grafana dashboards
open http://localhost:3000/d/payments-overview

# Check metrics
open http://localhost:9090/graph
```

That's it! Your service is production-ready. 🚀