import subprocess
import json
import time

def call_mcp(token=None):
    cmd = ["mcp", "googlephotos", "list_media_items", json.dumps({"pageSize": 100, "pageToken": token} if token else {"pageSize": 100})]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        # Clean the output to get pure JSON
        raw_output = result.stdout
        if "text,\"" in raw_output:
            json_part = raw_output.split("text,\"")[1].rsplit("\"", 1)[0].replace("\\\"", "\"")
            return json.loads(json_part)
    except Exception as e:
        print(f"Error: {e}")
    return None

def dig(max_pages=10):
    current_token = "CkgKQnR5cGUuZ29vZ2xlYXBpcy5jb20vZ29vZ2xlLnBob3Rvcy5saWJyYXJ5LnYxLkxpc3RNZWRpYUl0ZW1zUmVxdWVzdBICCAoSogFBSF91UTQzNFdSSmhFZHE0X2FNblFzZ1F5c3RiTlZ5SzN4UXlyR3drNHhic01rSjdsRGhlTS1JUmVoZmp5U3lkZFNJdHRJZ0JOOG9UeFpqNEs2RVBvM0YtRXFKX0N5dy1oMXFVUGxEdGJuQm1PN3N3ZjcwYlNLQVJXVm5qZ2ZjczBnSlJRM0VrMW1uYVFxM2diVVI4WThXMjM5akVoVlV4N3caG3h0Y2JZS09FTHo5LTh3Z29nWF9pX0lhQi1Zdw"
    print(f"🚀 [SWARM] Deep-Digger starting from token cluster...")
    
    for i in range(max_pages):
        data = call_mcp(current_token)
        if not data:
            break
        
        items = data.get("mediaItems", [])
        if items:
            print(f"✅ Found {len(items)} items on page {i+1}")
            for item in items:
                print(f"  - {item.get('filename')} | Created: {item.get('mediaMetadata', {}).get('creationTime')}")
        else:
            print(f"⏳ Page {i+1} empty, following next token...")
            
        current_token = data.get("nextPageToken")
        if not current_token:
            break
        time.sleep(1)

if __name__ == "__main__":
    dig()
