import json
from datetime import datetime

categories = [
    "Data & Analytics", "Content & Marketing", "Software Development", 
    "Productivity & Management", "Strategy & Business", "Automation & Integration",
    "Communication & Training", "Learning & Research", "Legal & Compliance",
    "Security & Forensics", "Design & Creative", "Customer Success",
    "Human Resources", "Finance & Accounting", "Sales & Revenue",
    "Operations & Supply Chain", "AI & Machine Learning", "Cloud & Infrastructure",
    "Quality Assurance", "Project Management"
]

skills = []
id_counter = 1

for cat in categories:
    for i in range(10):  # 20 categories * 10 skills each = 200 skills
        skill_id = f"{cat.lower().replace(' ', '-').replace('&', 'and')}-{i+1}"
        skill = {
            "id": id_counter,
            "name": f"{cat} Skill {i+1}",
            "category": cat,
            "level": "Expert" if i < 3 else ("Advanced" if i < 7 else "Intermediate"),
            "description": f"Expertise in {cat} with focus on specialization {i+1}.",
            "capabilities": [f"Capability {cat} {i+1}.{j}" for j in range(1, 5)],
            "technologies": ["Tool A", "Tool B", "Tool C"],
            "use_cases": [f"Use Case {i+1}.1", f"Use Case {i+1}.2"]
        }
        
        # Customize some names based on categories
        if cat == "Software Development":
            names = ["Frontend Architect", "Backend Master", "DevOps Ninja", "Security Guru", "Full-Stack Lead", "Mobile Specialist", "API Designer", "Cloud Engineer", "Database Expert", "UI/UX Developer"]
            skill["name"] = names[i]
        elif cat == "AI & Machine Learning":
            names = ["ML Engineer", "Data Scientist", "LLM Specialist", "NLP Researcher", "Computer Vision Expert", "Reinforcement Learning Eng", "AI Ethicist", "Prompt Engineer", "MLOps Lead", "Neural Network Designer"]
            skill["name"] = names[i]
        elif cat == "Strategy & Business":
            names = ["Strategic Planner", "Market Analyst", "Business Architect", "Growth Hacker", "Venture Strategist", "M&A Analyst", "Competitive Intel", "Operations Strategist", "Product Strategist", "Business Transformation"]
            skill["name"] = names[i]
        elif cat == "Security & Forensics":
            names = ["Forensic Analyst", "Incident Responder", "Threat Hunter", "Penetration Tester", "Security Auditor", "Compliance Officer", "Malware Researcher", "Crypto Expert", "SOC Analyst", "Cloud Security"]
            skill["name"] = names[i]
            
        skills.append(skill)
        id_counter += 1

output = {
    "version": "2.0.0",
    "timestamp": datetime.now().strftime("%Y-%m-%d"),
    "organization": "Omni Engine",
    "total_skills": len(skills),
    "skills": skills
}

with open("skills/data/SKILLS_200_COMPLETE.json", "w") as f:
    json.dump(output, f, indent=2)

print(f"Generated {len(skills)} skills in skills/data/SKILLS_200_COMPLETE.json")
