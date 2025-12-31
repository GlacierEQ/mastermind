import json

def generate_markdown():
    with open('skills/MEGA_ECOSYSTEM_MANIFEST.json', 'r') as f:
        mega = json.load(f)
    
    md = f"# 🌌 OMNI-ECOSYSTEM MASTER INDEX\n\n"
    md += f"**Version**: {mega['version']} | **Updated**: {mega['timestamp']}\n\n"
    md += "## 🚀 Meta-Categories (Streamlined & Dynamic)\n\n"
    
    for name, cat in mega['categories'].items():
        name_display = name.replace('_', ' ')
        md += f"### 🛡️ {name_display}\n"
        md += f"*{cat['description']}*\n\n"
        md += "**Integrated Infrastructure:**\n"
        md += ", ".join([f"`{s}`" for s in cat['integrated_servers']]) + "\n\n"
        md += "**Core Capabilities:**\n"
        md += ", ".join(cat['capabilities'][:15]) + "...\n\n"
        md += "---\n\n"
        
    with open('skills/MEGA_INDEX.md', 'w') as f:
        f.write(md)

if __name__ == "__main__":
    generate_markdown()
