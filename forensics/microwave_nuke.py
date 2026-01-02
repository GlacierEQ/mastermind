#!/usr/bin/env python3
"""
☢️ MICROWAVE MODE: RAPID FORENSIC PACKAGING (NUKE-SPEED)
=======================================================
Designed for high-speed, high-bandwidth data extraction.
Declassified for the Primordial Titan Suite.
"""
import os
import sys
import tarfile
import hashlib
import time
from pathlib import Path

def microwave_nuke(target_dir, output_bundle):
    print(f"☢️ [MICROWAVE] Initiating NUKE-SPEED packaging of: {target_dir}")
    start = time.time()
    
    target = Path(target_dir)
    if not target.exists():
        print(f"❌ Error: {target_dir} does not exist.")
        return

    with tarfile.open(output_bundle, "w:gz") as tar:
        for file in target.rglob("*"):
            if file.is_file():
                # Rapid add without heavy metadata overhead
                tar.add(file, arcname=file.relative_to(target.parent))
    
    # Generate Bundle Hash
    with open(output_bundle, "rb") as f:
        bundle_hash = hashlib.sha256(f.read()).hexdigest()
    
    duration = time.time() - start
    print(f"✅ [MICROWAVE] Nuke Complete. Bundle: {output_bundle}")
    print(f"☢️ Hash: {bundle_hash}")
    print(f"☢️ Speed: {duration:.4f}s for high-speed compression.")
    return bundle_hash

if __name__ == "__main__":
    microwave_nuke("exhibits/processed", "output/federal_matrix/MICROWAVE_BUNDLE.tar.gz")
