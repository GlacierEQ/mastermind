# Contributing to Mastermind

**TL;DR: This repository is LOCKED. Fork it to use it.**

---

## Repository Status: LOCKED 🔒

Mastermind source code is intentionally locked to maintain:
- ✅ Integrity of the reference implementation
- ✅ Immutability of the production baseline
- ✅ Security against unauthorized changes
- ✅ Clarity about the canonical version

---

## How to Contribute

### Option 1: Fork and Build Your Own

**Best for**: Teams building infrastructure AI

```bash
# Fork on GitHub
# Clone your fork
git clone https://github.com/YOUR_ORG/mastermind.git
cd mastermind

# Make your changes
# Test thoroughly
# Deploy to your systems
```

Your fork is fully independent. Make whatever changes you need.

### Option 2: Extend in Your Own Repo

**Best for**: Building on top of Mastermind

```bash
# Create a new repo for your extensions
git init my-infra-orchestrator
cd my-infra-orchestrator

# Add mastermind as a dependency
npm install @glaciereq/mastermind@1.8.1

# Build Phase 9, 10, 11, etc.
# Add your own guardrails
# Extend with your infrastructure
```

### Option 3: Reference Implementation

**Best for**: Learning the patterns

```bash
# Clone (read-only)
git clone https://github.com/GlacierEQ/mastermind.git

# Study the code
cat PHASE_*.md
cat packages/ai-orchestrator/src/agents/*

# Learn from the patterns
# Apply to your own systems
```

---

## Direct Contributions: Not Accepted

We do **NOT** accept:
- ❌ Pull requests to source code
- ❌ Direct commits to this repository
- ❌ Feature requests for this codebase
- ❌ Bug reports on locked code

### Why?

1. **Integrity**: Source code is canonical and immutable
2. **Safety**: No unauthorized modifications
3. **Clarity**: One true version for reference
4. **Security**: Locked against runaway automation

---

## Feedback / Ideas

If you have:
- Ideas for improvements → Build them in YOUR fork
- Suggestions for guardrails → Test in YOUR deployment
- New phases to add → Implement in YOUR repo
- Performance optimizations → Deploy in YOUR systems

**Everything goes in YOUR fork. Source stays locked.**

---

## License

Mastermind is MIT licensed. You can:

✅ Fork it  
✅ Copy it  
✅ Modify it  
✅ Use commercially  
✅ Extend it  

Just use it—don't modify the source repository.

---

## Questions?

Refer to:
- `README.md` – Overview
- `LOCKED.md` – Lock explanation
- `PHASE_*_NOTES.md` – Implementation guides
- `RELEASES.md` – Version history

---

**Fork it. Make it yours. Deploy it. 🚀**
