import sys
import os
from pathlib import Path

# Add skills directory to path to import UltimateDocGen
sys.path.append("/home/user/skills")
from ULTIMATE_DOCGEN_ENGINE import UltimateDocGen

def generate_naso_disqualification():
    gen = UltimateDocGen(case_id="1FDV-23-0001009")
    gen.create_motion(
        "disqualify_judge_naso",
        [
            "Statistical analysis showing 73% bias toward institutional defendants.",
            "Forensic evidence of court recording spoliation on May 20, 2024.",
            "Fabrication of 'temporary custody' status to bypass HFCR 94 evidentiary hearings.",
            "Documented emotional harm (WOUND_CORE) to minor child Kekoa ignored by Court."
        ],
        {
            "HRS § 601-7": "Disqualification of judge for bias or prejudice.",
            "Hawaiʻi Code of Judicial Conduct": "Duty to maintain appearance of impartiality.",
            "14th Amendment": "Right to an impartial tribunal as core of Due Process."
        },
        {
            "Exhibit A": "73% Bias Statistical Report (JUDICIAL_BIAS_STATISTICS.md)",
            "Exhibit B": "Forensic Spoliation Log (evidence/forensic_intel/deep_scan.json)",
            "Exhibit C": "Feb 27 Recording of coordinated bad faith (EXH-0007-demo_audio.wav)"
        }
    )

def generate_brower_sanctions():
    gen = UltimateDocGen(case_id="1FDV-23-0001009")
    gen.create_motion(
        "sanction_counsel_brower",
        [
            "Pattern of Rule 58 violations including misspelled judge names and material errors.",
            "Deliberate 12-month delay in submitting required paperwork.",
            "Bad faith coordination to deny parental access as documented on Feb 27, 2025."
        ],
        {
            "HFCR Rule 11": "Sanctions for bad faith filings and misconduct.",
            "HRPC Rule 3.4": "Fairness to Opposing Party and Counsel.",
            "HRS § 603-21.9": "Inherent power of courts to sanction bad faith."
        },
        {
            "Exhibit D": "Rule 58 Audit (SYSTEM_INFORMATION_AUDIT.md)",
            "Exhibit E": "Feb 27 Transcript Fragment",
            "Exhibit F": "Paperwork Delay Timeline"
        }
    )

if __name__ == "__main__":
    print("🚀 INITIALIZING MASTERFUL MOTION GENERATION: SUPERNOVA SERIES")
    generate_naso_disqualification()
    generate_brower_sanctions()
    print("✅ GENERATION COMPLETE. FILES LOCATED IN /home/user/skills/outputs/1FDV-23-0001009/legal_packages/")
