import json
import os
from datetime import datetime

# Load current manifest
MANIFEST_PATH = 'skills/SKILLS_MANIFEST.json'
with open(MANIFEST_PATH, 'r') as f:
    manifest = json.load(f)

# Define New Master Categories (Streamlined & Dynamic)
# We will map existing domains and servers to these "Meta-Skills"
META_CATEGORIES = {
    "Document_Ops": {
        "description": "Full lifecycle of documents: scan, parse, analyze, create, save, send.",
        "sub_skills": ["pdf-reader", "file-extractor", "pocketbase-document-extractor", "gen-pdf", "google-docs", "docfork", "file-organizer"],
        "manifest_domains": ["content_creation", "communication"]
    },
    "Knowledge_Nexus": {
        "description": "Advanced research, learning, deep study, and cross-source synthesis.",
        "sub_skills": ["exa", "perplexity-mcp", "ai-research-assistant", "microsoft-learn", "courtlistener-case-law-explorer", "infranodus-mcp-server-infranodus", "scientific-computations"],
        "manifest_domains": ["learning", "strategy", "data_analysis"]
    },
    "Memory_Protocol": {
        "description": "Long-term persistence, knowledge graphs, and contextual recall.",
        "sub_skills": ["supermemory", "letta-ai-memory-mcp", "mem0-private", "neo4j-knowledge-graph-memory", "mem0ai-mem0-memory-mcp"],
        "manifest_domains": ["quantum-context"]
    },
    "Hyper_Development": {
        "description": "Rapid coding, system architecture, remote execution, and autonomous repair.",
        "sub_skills": ["github", "bitbucket", "code-runner", "e2b-remote", "ssh-remote-command-executor", "local-terminal", "repo-operator", "ai-autonomous-repair"],
        "manifest_domains": ["development", "integration", "hyper_ops", "github_ops"]
    },
    "Business_Intelligence": {
        "description": "Revenue optimization, market analysis, CRM, and executive reporting.",
        "sub_skills": ["linear", "atimevil-kali", "supabase", "clickup", "notion", "clay", "bright-data"],
        "manifest_domains": ["strategy", "sales_revenue", "finance_accounting", "operations_supply_chain"]
    },
    "Automation_Engine": {
        "description": "Process orchestration, workflow automation, and multi-agent coordination.",
        "sub_skills": ["flowengine-n8n-workflow-builder", "multi-orchestrator", "super-agent-orchestrator", "workflow-automator", "rpa-specialist"],
        "manifest_domains": ["automation", "universal_factories", "mastermind"]
    }
}

def build_mega_manifest():
    mega = {
        "system_name": "Omni-Ecosystem Master",
        "version": "3.0.0",
        "timestamp": datetime.now().isoformat(),
        "categories": {}
    }
    
    for meta_name, meta_data in META_CATEGORIES.items():
        category_entry = {
            "description": meta_data["description"],
            "integrated_servers": meta_data["sub_skills"],
            "legacy_domains": meta_data["manifest_domains"],
            "capabilities": [],
            "combined_skills": []
        }
        
        # Collect skills from manifest domains
        for domain in meta_data["manifest_domains"]:
            if domain in manifest.get("domains", {}):
                skills = manifest["domains"][domain].get("skills", [])
                category_entry["combined_skills"].extend(skills)
                for s in skills:
                    category_entry["capabilities"].extend(s.get("capabilities", []))
        
        # Deduplicate capabilities
        category_entry["capabilities"] = list(set(category_entry["capabilities"]))
        mega["categories"][meta_name] = category_entry

    with open('skills/MEGA_ECOSYSTEM_MANIFEST.json', 'w') as f:
        json.dump(mega, f, indent=2)
    
    print("Created MEGA_ECOSYSTEM_MANIFEST.json with streamlined categories.")

if __name__ == "__main__":
    build_mega_manifest()
