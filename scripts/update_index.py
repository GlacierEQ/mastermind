import json

MANIFEST_PATH = 'skills/SKILLS_MANIFEST.json'
INDEX_PATH = 'skills/skills/COLLECTED_SKILLS_INDEX.md'

def update_index():
    with open(MANIFEST_PATH, 'r') as f:
        manifest = json.load(f)
    
    with open(INDEX_PATH, 'w') as f:
        f.write("# Collected Skills Index\n\n")
        f.write(f"_Updated: {manifest['timestamp']}_\n\n")
        f.write(f"Total skills: **{manifest['total_skills']}**\n\n")
        
        for domain_key, domain_obj in manifest['domains'].items():
            domain_name = domain_key.replace('_', ' ').title()
            skills = domain_obj.get('skills', [])
            f.write(f"## {domain_name} ({len(skills)} skills)\n\n")
            for skill in skills:
                f.write(f"- **{skill['name']}**\n")
                f.write(f"  - {skill.get('description', 'No description available.')}\n")
            f.write("\n")

if __name__ == "__main__":
    update_index()
