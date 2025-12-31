import json
import os
import subprocess

def discover():
    print("🔍 [KEY-DISCOVERY] Scanning 82+ MCP Servers for Credentials...")
    
    # 1. Get the list of all servers from MCP CLI
    try:
        result = subprocess.run(["mcp", "--json"], capture_output=True, text=True)
        all_servers = json.loads(result.stdout).get("servers", [])
    except Exception as e:
        print(f"❌ Failed to query MCP CLI: {e}")
        return

    # 2. Map of common servers and their required keys
    requirements = {
        "linear": ["LINEAR_API_KEY"],
        "supabase": ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
        "browserbase": ["BROWSERBASE_API_KEY"],
        "oxylabs": ["OXYLABS_USERNAME", "OXYLABS_PASSWORD"],
        "bright-data": ["BRIGHT_DATA_API_KEY"],
        "notion": ["NOTION_API_KEY"],
        "slack": ["SLACK_BOT_TOKEN"],
        "github": ["GITHUB_PERSONAL_ACCESS_TOKEN"],
        "openai": ["OPENAI_API_KEY"],
        "anthropic": ["ANTHROPIC_API_KEY"],
        "perplexity": ["PERPLEXITY_API_KEY"]
    }

    missing_report = []

    for server in all_servers:
        slug = server.get("slug", "").lower()
        found_reqs = False
        for key in requirements:
            if key in slug:
                found_reqs = True
                for req_env in requirements[key]:
                    if not os.environ.get(req_env):
                        missing_report.append({"server": slug, "missing_key": req_env})
        
        if not found_reqs:
            # Generic check for server-specific variables
            # We can expand this logic
            pass

    print("\n🚨 [MISSING KEYS REPORT]")
    print("---------------------------------------")
    if not missing_report:
        print("✅ All primary known keys are present in the current environment!")
    else:
        for item in missing_report:
            print(f"❌ {item['server'].upper()}: Needs {item['missing_key']}")
    
    # Save report to exhibits
    with open("exhibits/missing_keys_report.json", "w") as f:
        json.dump(missing_report, f, indent=2)
    print("\n📄 Detailed report saved to: exhibits/missing_keys_report.json")

if __name__ == "__main__":
    discover()
