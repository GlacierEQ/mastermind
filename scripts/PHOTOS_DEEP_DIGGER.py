import subprocess
import json
import time
import os

def get_mcp_output(server, tool, args):
    cmd = ["mcp", server, tool, json.dumps(args)]
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
    token = "CkgKQnR5cGUuZ29vZ2xlYXBpcy5jb20vZ29vZ2xlLnBob3Rvcy5saWJyYXJ5LnYxLkxpc3RNZWRpYUl0ZW1zUmVxdWVzdBICCAESogFBSF91UTQzNFdSSmhFZHE0X2FNblFzZ1F5c3RiTlZ5SzN4UXlyR3drNHhic01rSjdsQThlNXVNSkFMNXJZbF9jV3FaVEE0V1daZC1oVnN2bmxpRmJrWWZ1cGF5M1kxTlRVLTQ0NmQ5d3RZVmJicC1qMXQxWG9YYzJWT05rLThCSmVXSF9vbFpFOFJQQUs5TkROS2h0WVRXNi1odWdJNzBadVEaG2VOenpoUHlDUUw0YTY0UUFRZ01JSlRYT00xNA"
    log_file = "docs/case-specific/FORENSIC_PHOTOS_LOG.jsonl"
    
    print("🔋 [AIONIC] Starting Deep Photo Harvest...")
    
    for page in range(50): # Dig up to 5000 items deep
        data = get_mcp_output("googlephotos", "list_media_items", {"pageSize": 100, "pageToken": token})
        if not data: break
        
        items = data.get("mediaItems", [])
        if items:
            print(f"💎 Page {page+1}: Found {len(items)} items.")
            with open(log_file, "a") as f:
                for item in items:
                    f.write(json.dumps(item) + "\n")
        else:
            if page % 5 == 0:
                print(f"⏳ Page {page+1}: Empty (Following tokens...)")
        
        token = data.get("nextPageToken")
        if not token: break
        time.sleep(0.1)

if __name__ == "__main__":
    main()
