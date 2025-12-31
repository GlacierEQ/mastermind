import json
from datetime import datetime

MANIFEST_PATH = 'skills/SKILLS_MANIFEST.json'
PAYLOADS_PATH = 'skills/skills/SUPERMEMORY_SKILLS_PAYLOADS.json'

def update_payloads():
    with open(MANIFEST_PATH, 'r') as f:
        manifest = json.load(f)
    
    payloads = [
        {
            "id": "skills_global_overview",
            "thingToRemember": f"Workspace Power Skills System overview and manifest integration.\n\nConceptual skills: {manifest['total_skills']} total, across domains: {', '.join(manifest['domains'].keys())}.\nSource files: SKILLS_MANIFEST.json, COLLECTED_SKILLS_INDEX.md.\nLocal implementation skills are defined via SKILL.md files under skills/*/*/SKILL.md.",
            "suggestedProjectId": ""
        }
    ]
    
    for domain_key, domain_obj in manifest['domains'].items():
        domain_name = domain_key.replace('_', ' ').title()
        skills = domain_obj.get('skills', [])
        skill_list = "\n".join([f"- {s['name']}: {s.get('description', '')[:100]}..." for s in skills[:20]]) # Limit to 20 per domain for brevity
        if len(skills) > 20:
            skill_list += f"\n- ... and {len(skills) - 20} more."
            
        payloads.append({
            "id": f"skills_domain_{domain_key}",
            "domain": domain_key,
            "thingToRemember": f"Conceptual skills domain: {domain_name} (key: {domain_key}).\n\nIncluded skills:\n{skill_list}",
            "suggestedProjectId": ""
        })
    
    # Keep the local implementation one
    payloads.append({
        "id": "skills_local_implementation",
        "thingToRemember": "Local implementation skills available in this workspace (actual tools / processes).\n- pdf (skills/anthropics/pdf/SKILL.md)\n- gemini (skills/cexll/gemini/SKILL.md)\n- file-organizer (skills/composiohq/file-organizer/SKILL.md)\n- brainstorming (skills/obra/brainstorming/SKILL.md)",
        "suggestedProjectId": ""
    })
    
    output = {
        "meta": {
            "generated_at": datetime.now().isoformat(),
            "note": "Pre-built Supermemory addMemory payloads for the workspace skills system.",
            "source_files": [MANIFEST_PATH]
        },
        "payloads": payloads
    }
    
    with open(PAYLOADS_PATH, 'w') as f:
        json.dump(output, f, indent=2)

if __name__ == "__main__":
    update_payloads()
