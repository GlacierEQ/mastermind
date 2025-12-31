import json
import os
from datetime import datetime

# Paths
MANIFEST_PATH = 'skills/SKILLS_MANIFEST.json'
SOURCE_PATH = 'skills/skills/data/SKILLS_200_COMPLETE.json'
OUTPUT_PATH = 'skills/SKILLS_MANIFEST_200.json'

# Category mapping
CAT_MAP = {
    "Data & Analytics": "data_analysis",
    "Content & Marketing": "content_creation",
    "Software Development": "development",
    "Productivity & Management": "productivity",
    "Strategy & Business": "strategy",
    "Automation & Integration": "automation",
    "Communication & Training": "communication",
    "Learning & Research": "learning",
    "Legal & Compliance": "legal_compliance",
    "Security & Forensics": "security_forensics",
    "Design & Creative": "design_creative",
    "Customer Success": "customer_success",
    "Human Resources": "human_resources",
    "Finance & Accounting": "finance_accounting",
    "Sales & Revenue": "sales_revenue",
    "Operations & Supply Chain": "operations_supply_chain",
    "AI & Machine Learning": "ai_machine_learning",
    "Cloud & Infrastructure": "cloud_infrastructure",
    "Quality Assurance": "quality_assurance",
    "Project Management": "project_management"
}

def migrate():
    with open(MANIFEST_PATH, 'r') as f:
        manifest = json.load(f)
    
    with open(SOURCE_PATH, 'r') as f:
        source = json.load(f)
    
    new_skills_count = 0
    for skill in source['skills']:
        cat_name = skill.get('category')
        domain_key = CAT_MAP.get(cat_name, 'general')
        
        if domain_key not in manifest['domains']:
            manifest['domains'][domain_key] = {"skills": []}
            
        # Check if skill already exists (by name)
        existing_names = [s.get('name').lower() for s in manifest['domains'][domain_key]['skills']]
        if skill['name'].lower() not in existing_names:
            skill_id = skill['name'].lower().replace(" ", "-").replace("&", "and")
            new_skill = {
                "id": skill_id,
                "name": skill['name'],
                "description": skill.get('description', ''),
                "capabilities": skill.get('capabilities', []),
                "use_cases": skill.get('use_cases', [])
            }
            manifest['domains'][domain_key]['skills'].append(new_skill)
            new_skills_count += 1
            
    manifest['total_skills'] = sum(len(d['skills']) for d in manifest['domains'].values())
    manifest['timestamp'] = datetime.now().strftime("%Y-%m-%d")
    manifest['version'] = "2.0.0"
    
    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)
        
    print(f"Migrated {new_skills_count} new skills. Total skills: {manifest['total_skills']}")

if __name__ == "__main__":
    migrate()
