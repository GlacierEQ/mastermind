import subprocess
import json
import time
import os

def get_mcp_output(token=None):
    params = {"pageSize": 100}
    if token:
        params["pageToken"] = token
    cmd = ["mcp", "googlephotos", "list_media_items", json.dumps(params)]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    raw = proc.stdout
    start_marker = 'text,"'
    if start_marker in raw:
        content_start = raw.find(start_marker) + len(start_marker)
        content_end = raw.rfind('"\nstructuredContent')
        if content_end == -1: content_end = raw.rfind('"')
        json_str = raw[content_start:content_end]
        json_str = json_str.replace('\\"', '"').replace('\\\\', '\\')
        try:
            return json.loads(json_str)
        except:
            return None
    return None

def main():
    token = "CkgKQnR5cGUuZ29vZ2xlYXBpcy5jb20vZ29vZ2xlLnBob3Rvcy5saWJyYXJ5LnYxLkxpc3RNZWRpYUl0ZW1zUmVxdWVzdBICCAoSogFBSF91UTQzNFdSSmhFZHE0X2FNblFzZ1F5c3RiTlZ5SzN4UXlyR3drNHhic01rSjdsRGhlTS1JUmVoZmp5U3lkZFNJdHRJZ0JOOG9UeFpqNEs2RVBvM0YtRXFKX0N5dy1oMXFVUGxEdGJuQm1PN3N3ZjcwYlNLQVJXVm5qZ2ZjczBnSlJRM0VrMW1uYVFxM2diVVI4WThXMjM5akVoVlV4N3caG3h0Y2JZS09FTHo5LTh3Z29nWF9pX0lhQi1Zdw"
    log_file = "docs/case-specific/KEKOA_EVIDENCE_CENSUS.jsonl"
    
    print("⛏️  [AIONIC] Starting Deep Driller...")
    
    for page in range(100): # Drill up to 10,000 nodes deep
        data = get_mcp_output(token)
        if not data: 
            print("❌ Connection Lost.")
            break
        
        items = data.get("mediaItems", [])
        if items:
            print(f"💎 SUCCESS: Found {len(items)} items on page {page+1}")
            with open(log_file, "a") as f:
                for item in items:
                    f.write(json.dumps(item) + "\n")
        else:
            if page % 10 == 0:
                print(f"⏳ Page {page+1}: Empty (Drilling through cloud layers...)")
        
        token = data.get("nextPageToken")
        if not token: 
            print("🏁 Reached end of cloud archive.")
            break
        time.sleep(0.1)

if __name__ == "__main__":
    main()
