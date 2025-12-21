# Examples

## Service Generation Example

### Generate a Payments Service

```bash
pnpm ai:new-service payments --domain=billing --environment=production
```

This command generates a complete payment processing microservice with:

### What Gets Generated

**Service Code**
```
packages/payments/
├── src/
│   ├── domain/        # Business logic
│   ├── app/           # Use cases
│   ├── api/           # HTTP layer
│   └── infra/         # Database
├── __tests__/         # 40+ test files
├── Dockerfile         # Multi-stage build
├── docker-compose.yml # Local development
└── package.json       # Dependencies
```

**Infrastructure**
```
infra/
├── docker/payments/
│   ├── Dockerfile
│   └── .dockerignore
├── k8s/payments/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
├── terraform/payments/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
└── monitoring/
    ├── prometheus.yml
    └── grafana-dashboard.json
```

**Documentation**
```
docs/payments/
├── README.md
├── API.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── DEPLOYMENT.md
└── DIAGRAMS.md
```

**CI/CD**
```
.github/workflows/
├── payments-build.yml
├── payments-deploy.yml
└── payments-security.yml
```

### Deployment Example

```bash
# Deploy to production
pnpm ai:deploy --service=payments --environment=production

# Monitor deployment
kubectl rollout status deployment/payments -n payments

# Check logs
kubectl logs -f deployment/payments -n payments
```

### Monitoring Example

```bash
# View Grafana dashboards
open http://localhost:3000/d/payments-overview

# Check metrics
curl http://localhost:9090/api/v1/query?query=http_requests_total

# View logs
open http://localhost:3100/explore?datasource=Loki
```

### Incident Response Example

```bash
# Automated response
pnpm ai:devops payments --operation=incident-response --incident-type=HighErrorRate

# Scales service
kubectl scale deployment payments --replicas=6

# Creates incident log
# Generates runbook
# Updates stakeholders
```

## What's Possible

✅ Generate 10+ services in a day  
✅ Ship production-ready code immediately  
✅ Maintain 85%+ test coverage  
✅ Deploy with zero downtime  
✅ Monitor automatically  
✅ Respond to incidents automatically  

## Next Steps

1. Read [QUICKSTART.md](../docs/QUICKSTART.md)
2. Run `pnpm ai:new-service my-service --domain=users`
3. Review generated PR
4. Deploy to staging
5. Test in production

That's it! Your service is ready. 🚀