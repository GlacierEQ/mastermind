import subprocess
import json
import time
from datetime import datetime

def call_mcp(params):
    cmd = ["mcp", "googlephotos", "list_media_items", json.dumps(params)]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if "text,\"" in result.stdout:
            json_part = result.stdout.split("text,\"")[1].rsplit("\"", 1)[0].replace("\\\"", "\"")
            return json.loads(json_part)
    except Exception as e:
        print(f"Error calling MCP: {e}")
    return None

def process_items():
    census_file = "docs/case-specific/PHOTOS_CENSUS_LOG.jsonl"
    page_token = None
    total_processed = 0
    
    print(f"🚀 Starting Google Photos Census at {datetime.now().isoformat()}")
    
    # We will try to process up to 10 pages (1000 items) in this initial pulse
    for i in range(10):
        params = {"pageSize": 100}
        if page_token:
            params["pageToken"] = page_token
            
        data = call_mcp(params)
        if not data or "mediaItems" not in data:
            print(f"⚠️ Page {i+1} returned no items or error.")
            break
            
        items = data["mediaItems"]
        with open(census_file, "a") as f:
            for item in items:
                # Add a simple heuristic tag
                filename = item.get("filename", "").lower()
                is_junk = any(x in filename for x in ["icon", "btn_", "ic_", "vector", "asset"])
                item["heuristic_tag"] = "JUNK_ASSET" if is_junk else "USER_MEDIA"
                f.write(json.dumps(item) + "\n")
        
        total_processed += len(items)
        print(f"✅ Processed page {i+1} ({total_processed} items total)")
        
        page_token = data.get("nextPageToken")
        if not page_token:
            print("🏁 Reached end of library.")
            break
        time.sleep(0.5)

if __name__ == "__main__":
    process_items()
