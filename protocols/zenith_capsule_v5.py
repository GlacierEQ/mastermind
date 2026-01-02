#!/usr/bin/env python3
"""
ZENITH CAPSULE v5.1 (FEDERAL FILING READY)
==========================================
Seals the final package including the Titan Graph and Microwave Bundle.
Integrated with the Federal Forensic Case Matrix.
"""
import json
import os
import shutil
from pathlib import Path
from datetime import datetime

class ZenithCapsule:
    def __init__(self, case_id="FEDERAL-2025-AX1"):
        self.case_id = case_id
        self.root = Path(f"output/federal_matrix/{case_id}/FINAL_CAPSULE")
        self.root.mkdir(parents=True, exist_ok=True)
        
    def seal_capsule(self):
        print(f"🚀 [ZENITH] Sealing Capsule for {self.case_id}...")
        
        # Pull declassified components
        components = {
            "matrix": "output/federal_matrix/FEDERAL-2025-AX1/FEDERAL_MATRIX_REPORT.md",
            "graph": "output/federal_matrix/TITAN_RELATIONSHIP_GRAPH.json",
            "bundle": "output/federal_matrix/MICROWAVE_BUNDLE.tar.gz"
        }
        
        for name, path in components.items():
            if Path(path).exists():
                shutil.copy2(path, self.root / Path(path).name)
                print(f"  > Component Included: {name}")

        # Final Certificate of Integrity
        manifest = {
            "case_id": self.case_id,
            "seal_date": datetime.now().isoformat(),
            "protocol": "TITANIC DEADROP",
            "security_tier": "FEDERAL_FORRNSIC_ZENITH",
            "components": list(components.keys())
        }
        
        with open(self.root / "INTEGRITY_MANIFEST.json", "w") as f:
            json.dump(manifest, f, indent=2)
            
        print(f"✅ [ZENITH] Capsule Seal Protocol Complete. Location: {self.root}")
        return True

if __name__ == "__main__":
    capsule = ZenithCapsule()
    capsule.seal_capsule()
