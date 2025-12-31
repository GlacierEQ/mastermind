import json
import argparse
from pathlib import Path

def deploy_category(category_name):
    manifest_path = Path('skills/MEGA_ECOSYSTEM_MANIFEST.json')
    if not manifest_path.exists():
        print("Mega manifest not found. Run organize_ecosystem.py first.")
        return

    with open(manifest_path, 'r') as f:
        mega = json.load(f)
    
    cat = mega['categories'].get(category_name)
    if not cat:
        print(f"Category {category_name} not found.")
        return
    
    print(f"🚀 Deploying {category_name}...")
    print(f"Connecting servers: {', '.join(cat['integrated_servers'])}")
    print(f"Enabling {len(cat['combined_skills'])} combined skills.")
    
    # In a real implementation, this would trigger MCP server connections
    # and load the relevant skill logic into the agent's context.
    
    return cat

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('category', help='Category to deploy')
    args = parser.parse_args()
    deploy_category(args.category)
