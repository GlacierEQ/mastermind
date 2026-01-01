#!/usr/bin/env python3
"""
MASTERMIND: FORENSIC IMAGING PROTOCOL
Focus: Bit-by-bit acquisition with hash verification
"""
import hashlib

def generate_evidence_hash(data):
    return hashlib.sha256(data).hexdigest()

def verify_integrity(original_hash, current_data):
    current_hash = generate_evidence_hash(current_data)
    if original_hash == current_hash:
        print("✅ INTEGRITY VERIFIED: Evidence is pristine.")
        return True
    else:
        print("❌ INTEGRITY BREACH: Evidence mismatch detected!")
        return False

print("Mastermind Forensic Imaging Protocol Loaded.")
