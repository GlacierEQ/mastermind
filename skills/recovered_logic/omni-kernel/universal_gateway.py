#!/usr/bin/env python3
import sys
import os
import json
import subprocess

def route_intent(intent):
    print(f"🌌 [UNIVERSAL-GATEWAY] Analyzing Intent: '{intent}'")
    
    # Simple keyword routing logic
    intent_map = {
        "audit": "omni-engine/core/system_check_final.py",
        "security": "omni-engine/core/mission_004_security.py",
        "sync": "omni-engine/core/mission_005_master_sync.py",
        "optimize": "omni-engine/core/microwave_master.sh",
        "repo": "skills/super-agent-orchestrator/scripts/autonomous_flow.py",
        "skill": "skills/universal-skill/scripts/factory.py",
        "mcp": "skills/universal-mcp/scripts/mcp_gen.py"
    }
    
    target_script = None
    for key, script in intent_map.items():
        if key in intent.lower():
            target_script = script
            break
            
    if target_script:
        print(f"🎯 [UOG] Routing to: {target_script}")
        # Resolve path
        base_dir = os.path.dirname(os.path.abspath(__file__))
        root_dir = os.path.abspath(os.path.join(base_dir, "../../"))
        full_path = os.path.join(root_dir, target_script)
        
        if full_path.endswith(".py"):
            subprocess.run(["python3", full_path])
        else:
            subprocess.run(["bash", full_path])
    else:
        print("❓ [UOG] Intent not recognized. Please use specific keywords: audit, security, sync, optimize, repo, skill, mcp.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        route_intent(" ".join(sys.argv[1:]))
    else:
        print("🌌 Omni_Engine Universal Gateway - Ready for Command.")
