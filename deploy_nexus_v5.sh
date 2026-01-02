#!/bin/bash
# Zenith Nexus V5.0 Deployment Script
# Author: GlacierEQ | GUID: 983DE8C8-E120-1-B5A0-C6D8AF97BB09

echo "[$(date)] Starting Zenith Nexus v5.0 Deployment..."

# 1. Lock down structure
chmod -R 700 /home/user/ZENITH_NEXUS/core
chmod -R 700 /home/user/ZENITH_NEXUS/forensics

# 2. Initialize Swarm
python3 /home/user/ZENITH_NEXUS/swarms/harvester/proprietary_pulse.py

# 3. Start Background Forensic Scan
python3 /home/user/ZENITH_NEXUS/swarms/forensic_scanner/repo_leak_detector.py &

# 4. Finalize Manifest
cp /home/user/ZENITH_NEXUS/manifests/operator_manifest_v5.json /home/user/ZENITH_NEXUS/active_manifest.json

echo "[$(date)] Deployment Complete. Swarm Active."
