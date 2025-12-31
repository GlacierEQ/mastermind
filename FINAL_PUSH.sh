#!/bin/bash
echo "🚀 INITIATING OMNI_ENGINE FINAL PUSH..."

# Add core engine updates and the new agent
git add omni-engine/omni-agent-mcp/
git add omni-engine/README_OMNI.md
git add INDEX.md
git add scripts/analysis.py scripts/completion.py scripts/validation.py scripts/deploy.py scripts/deployment_prep.py

# Commit the payload
git commit -m "🔥 OMNI_ENGINE EVOLUTION: Integrated Omni Agent MCP v3.1.0 + System Health Restored"

echo "✅ LOCAL FINALIZATION COMPLETE."
echo "👉 TO ACTIVATE ON MAC: run 'git pull' followed by './omni-engine/omni-agent-mcp/launch.sh'"
