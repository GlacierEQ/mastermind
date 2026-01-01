import os
import json
import re
from pathlib import Path

def redact(text):
    patterns = [
        r"\d{3}-\d{2}-\d{4}", # SSN
        r"(\+1|1)?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}", # Phone
        r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+" # Email
    ]
    for p in patterns:
        text = re.sub(p, "[REDACTED]", text)
    return text

def scan():
    entities = {
        "Subject": ["KKDCB", "Minor Child", "Kekoa"],
        "Injury": ["fractured arm", "surgery", "cuts", "bleeding", "burn", "titanium screws"],
        "Evidence": ["oven", "birthday party", "OFW", "Communication Log"],
        "Legal": ["FC-DA-24", "procudural misconduct", "due process", "Mandamus", "Recusal"]
    }
    graph = []
    base_dir = Path("/home/user")
    dirs = [base_dir / "evidence", base_dir / "exhibits/processed", base_dir / "skills"]
    
    for d in dirs:
        if not d.exists(): continue
        for file_path in d.rglob("*"):
            if file_path.suffix in [".txt", ".md", ".json"] and file_path.is_file():
                if "TITAN_RELATIONSHIP_GRAPH.json" in str(file_path): continue
                try:
                    content = file_path.read_text()
                    safe_content = redact(content)
                    for category, terms in entities.items():
                        for term in terms:
                            if term.lower() in safe_content.lower():
                                # Find context
                                idx = safe_content.lower().find(term.lower())
                                start = max(0, idx - 50)
                                end = min(len(safe_content), idx + len(term) + 50)
                                snippet = safe_content[start:end].replace("\n", " ").strip()
                                
                                graph.append({
                                    "category": category,
                                    "entity": term,
                                    "context": f"...{snippet}...",
                                    "file": str(file_path.relative_to(base_dir)),
                                    "relevance": "HIGH"
                                })
                except:
                    pass
                    
    output_file = base_dir / "output/federal_matrix/TITAN_RELATIONSHIP_GRAPH.json"
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w") as f:
        json.dump(graph, f, indent=2)
    print(f"✅ [TITAN] Redacted Graph established with {len(graph)} nodes.")

if __name__ == "__main__":
    scan()
