import subprocess
import json
import time
import sys
import os
from datetime import datetime

def call_mcp(server, tool, args):
    cmd = ["mcp", server, tool, json.dumps(args)]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        raw = result.stdout
        start_marker = 'text,"'
        if start_marker in raw:
            content_start = raw.find(start_marker) + len(start_marker)
            content_end = raw.rfind('"\nstructuredContent')
            if content_end == -1: content_end = raw.rfind('"')
            json_str = raw[content_start:content_end]
            json_str = json_str.replace('\\"', '"').replace('\\\\', '\\')
            return json.loads(json_str)
    except Exception as e:
        print(f"Error calling {server}.{tool}: {e}", file=sys.stderr)
    return None

def run_swarm():
    census_file = "docs/case-specific/KEKOA_EVIDENCE_CENSUS.jsonl"
    token = None
    total_found = 0
    relevant_found = 0
    
    # Target keywords for emotional state and evidence
    target_keywords = ["kekoa", "depressed", "sad", "crying", "hurt", "bruise", "alone", "visitation", "order", "document", "letter"]
    
    print(f"🔱 [AIONIC] DEPLOYING ULTIMATE PHOTO SWARM...")
    print(f"🎯 TARGET: Comprehensive analysis of child welfare and evidence nodes.")
    
    for page in range(100): # Scan up to 10,000 items
        params = {"pageSize": 100}
        if token:
            params["pageToken"] = token
            
        data = call_mcp("googlephotos", "list_media_items", params)
        if not data:
            print("❌ Swarm Connection Interrupted.")
            break
            
        items = data.get("mediaItems", [])
        if not items:
            if page % 10 == 0:
                print(f"⏳ Scanning page {page+1}... (Bypassing empty clusters)")
        else:
            total_found += len(items)
            with open(census_file, "a") as f:
                for item in items:
                    # Heuristic Tagging
                    filename = item.get("filename", "").lower()
                    description = item.get("description", "").lower()
                    metadata = item.get("mediaMetadata", {})
                    creation_time = metadata.get("creationTime", "Unknown")
                    
                    tags = []
                    if any(k in filename or k in description for k in ["kekoa"]):
                        tags.append("KEKOA_NODE")
                    if any(k in filename or k in description for k in ["depressed", "sad", "crying", "hurt"]):
                        tags.append("EMOTIONAL_HARM_MARKER")
                    if any(k in filename or k in description for k in ["bruise", "injury", "arm"]):
                        tags.append("PHYSICAL_HARM_MARKER")
                    if any(k in filename or k in description for k in ["order", "document", "jefs", "court"]):
                        tags.append("LEGAL_DOCUMENT")
                    
                    if tags:
                        relevant_found += 1
                        item["aionic_tags"] = tags
                        f.write(json.dumps(item) + "\n")
            
            print(f"💎 Page {page+1}: Found {len(items)} items. Relevant: {relevant_found}/{total_found}")
            
        token = data.get("nextPageToken")
        if not token:
            print("🏁 Total Library Census Complete.")
            break
        
        # Throttling to respect API limits
        time.sleep(0.1)

if __name__ == "__main__":
    run_swarm()
