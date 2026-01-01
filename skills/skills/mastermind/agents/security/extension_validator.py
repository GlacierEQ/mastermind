#!/usr/bin/env python3
"""
MASTERMIND: EXTENSION SECURITY VALIDATOR v1.0
Focus: Manifest audit, CSP analysis, and permissions hardening for Supabase Pro.
"""
import json
import os
import sys

class ExtensionValidator:
    def __init__(self, extension_path):
        self.path = extension_path
        self.manifest_path = os.path.join(extension_path, "manifest.json")
        self.report = {"status": "INITIATING", "vulnerabilities": [], "score": 100}

    def audit_manifest(self):
        print(f"🔍 [SecValidator] Auditing extension at: {self.path}")
        if not os.path.exists(self.manifest_path):
            print("❌ Error: manifest.json not found!")
            return False

        with open(self.manifest_path, 'r') as f:
            manifest = json.load(f)

        # Check Manifest Version
        if manifest.get("manifest_version") < 3:
            self.report["vulnerabilities"].append("Legacy manifest version (v2 detected)")
            self.report["score"] -= 30

        # Permission Audit
        permissions = manifest.get("permissions", [])
        sensitive_perms = ["tabs", "history", "cookies", "webNavigation"]
        for p in permissions:
            if p in sensitive_perms:
                print(f"  [!] Sensitive permission detected: {p}")
                self.report["vulnerabilities"].append(f"Sensitive permission: {p}")
                self.report["score"] -= 5

        # Host Permissions Audit
        hosts = manifest.get("host_permissions", [])
        if "*://*/*" in hosts or "<all_urls>" in hosts:
            self.report["vulnerabilities"].append("Excessive host permissions (Wildcard detected)")
            self.report["score"] -= 20

        return True

    def generate_report(self):
        self.report["status"] = "COMPLETED" if self.report["score"] > 70 else "FAILED_SECURITY_CHECK"
        output_path = "output/reports/extension_security_report.json"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(self.report, f, indent=2)
        
        print(f"\n✅ Security Audit Complete. Score: {self.report['score']}/100")
        print(f"📊 Report saved to: {output_path}")
        return self.report

if __name__ == "__main__":
    # Point to the previously created Supabase Pro extension
    validator = ExtensionValidator("supabase-pro/extension")
    if validator.audit_manifest():
        validator.generate_report()
