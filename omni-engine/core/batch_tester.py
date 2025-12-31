import subprocess
import json
import os

def test_mcp_connection(server_slug):
    print(f"📡 Testing connection to: {server_slug}...")
    try:
        # Attempt to list tools for the server
        result = subprocess.run(["mcp", server_slug], capture_output=True, text=True, timeout=15)
        if result.returncode == 0:
            print(f"✅ {server_slug.upper()} is ONLINE and tools are reachable.")
            return True
        else:
            print(f"❌ {server_slug.upper()} failed. Error: {result.stderr.strip()}")
            return False
    except subprocess.TimeoutExpired:
        print(f"⚠️ {server_slug.upper()} timed out.")
        return False
    except Exception as e:
        print(f"❌ Error testing {server_slug}: {e}")
        return False

def run_batch(batch_name, servers):
    print(f"\n🚀 --- STARTING {batch_name} ---")
    results = {}
    for server in servers:
        results[server] = test_mcp_connection(server)
    return results

if __name__ == "__main__":
    # BATCH 1: Primary Operations & Developer Tools
    batch_1_servers = ["linear", "attio", "openai", "render", "vercel", "github"]
    run_batch("BATCH 1: PRIMARY CONNECTORS", batch_1_servers)
