import subprocess
import json
import time
import sys

def call_mcp(token=None):
    params = {"pageSize": 100}
    if token:
        params["pageToken"] = token
    
    cmd = ["mcp", "googlephotos", "list_media_items", json.dumps(params)]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if "text,\"" in result.stdout:
            json_part = result.stdout.split("text,\"")[1].rsplit("\"", 1)[0].replace("\\\"", "\"")
            return json.loads(json_part)
    except Exception as e:
        print(f"Error calling MCP: {e}", file=sys.stderr)
    return None

def dig(max_pages=20):
    # Starting token from the previous attempt
    current_token = "CkgKQnR5cGUuZ29vZ2xlYXBpcy5jb20vZ29vZ2xlLnBob3Rvcy5saWJyYXJ5LnYxLkxpc3RNZWRpYUl0ZW1zUmVxdWVzdBICCAUSogFBSF91UTQzNFdSSmhFZHE0X2FNblFzZ1F5c3RiTlZ5SzN4UXlyR3drNHhic01rSjdsRHBhWHotQkh6MlZTalZLZVVlWGloekpjcUMxU0w4ZlpTV3Jrc1plMERSNEZNV0VBVlBlWV91UVdhU0w5TGVCa2Z2LTc0QnUzVFlMcVRVTUJqM1BoNXlPSkh6QW9kUnNuTjEwam1fbVRKSlZPTmV3amcaG3ZEVEM5eEppTFRrc2RFelg1VWJtOE5YTlFxVQ"
    census_file = "docs/case-specific/PHOTOS_CENSUS_DATA.jsonl"
    
    print(f"⛏️  [DIGGER] Starting deep sweep from token cluster...")
    
    for i in range(max_pages):
        data = call_mcp(current_token)
        if not data:
            print("❌ Failed to retrieve data.")
            break
            
        items = data.get("mediaItems", [])
        if items:
            print(f"💎 Found {len(items)} items on page {i+1}")
            with open(census_file, "a") as f:
                for item in items:
                    f.write(json.dumps(item) + "\n")
                    f.flush()
        else:
            print(f"⏳ Page {i+1} empty (Token jump)...")
            
        current_token = data.get("nextPageToken")
        if not current_token:
            print("🏁 End of data reached.")
            break
        # Aggressive paging to get to the data
        time.sleep(0.2)

if __name__ == "__main__":
    dig()
