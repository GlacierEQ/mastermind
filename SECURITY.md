# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please email security@mastermind.dev instead of using the public issue tracker.

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if applicable)

## Security Features

### Code Security
- ✅ No hardcoded secrets
- ✅ Parameterized database queries only
- ✅ Input validation (Zod schemas)
- ✅ Type safety (TypeScript strict mode)
- ✅ CORS whitelisting
- ✅ Rate limiting

### Infrastructure Security
- ✅ Non-root containers
- ✅ Network policies
- ✅ Pod security policies
- ✅ RBAC configuration
- ✅ Secrets management
- ✅ TLS enforcement

### Deployment Security
- ✅ Image scanning
- ✅ CVE detection
- ✅ Dependency audits
- ✅ Code scanning
- ✅ SAST tools

## Compliance

- OWASP Top 10 protection
- SOC 2 ready
- GDPR compliant
- Data encryption at rest and in transit

## Updates

Keep Mastermind updated to get security patches:

```bash
pnpm update mastermind@latest
```

## Contact

**Security Team**: security@mastermind.dev  
**Response Time**: 24-48 hours

Thank you for helping keep Mastermind secure! 🔐