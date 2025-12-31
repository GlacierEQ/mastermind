import subprocess
import json
import sys

def get_mcp_output(server, tool, args):
    cmd = ["mcp", server, tool, json.dumps(args)]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    
    # The output is like 'content[1]{type,text}:\n  text,"{...}"'
    # We want to extract the string between text," and the last "
    raw = proc.stdout
    start_marker = 'text,"'
    if start_marker in raw:
        # Find the content inside the quotes
        content_start = raw.find(start_marker) + len(start_marker)
        # Find the last closing quote of the text field
        # The output format usually ends with structuredContent or similar
        content_end = raw.rfind('"\nstructuredContent')
        if content_end == -1: # fallback
            content_end = raw.rfind('"')
            
        json_str = raw[content_start:content_end]
        # Unescape the string
        # It's double escaped: \" -> "
        json_str = json_str.replace('\\"', '"').replace('\\\\', '\\')
        try:
            return json.loads(json_str)
        except Exception as e:
            # If standard unescape fails, try a simpler approach
            return {"error": str(e), "raw": json_str[:500]}
    return {"error": "Marker not found", "stdout": raw}

if __name__ == "__main__":
    # Test call
    res = get_mcp_output("googlephotos", "list_media_items", {"pageSize": 1})
    print(json.dumps(res))
