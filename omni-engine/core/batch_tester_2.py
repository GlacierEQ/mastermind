import subprocess
import os

def test_key(key_name, env_var):
    val = os.environ.get(env_var)
    if val:
        print(f"✅ {key_name}: Key found in environment.")
        return True
    else:
        print(f"❌ {key_name}: Key missing in environment ({env_var}).")
        return False

print("🚀 --- STARTING BATCH 2: INTELLIGENCE CONNECTORS ---")
keys = {
    "Groq": "GROQ_API_KEY",
    "Supermemory": "SUPERMEMORY_API_KEY",
    "Asana": "ASANA_API_KEY",
    "Jira": "JIRA_API_KEY",
    "Perplexity": "PERPLEXITY_API_KEY",
    "Infranodus": "INFRANODUS_API_KEY",
    "Memory Plugin 2": "MEMORY_PLUGIN_API_KEY",
    "Minimax": "MINIMAX_API_KEY",
    "Slack": "SLACK_BOT_TOKEN",
    "Warp Terminal": "WARP_TERMINAL_KEY"
}

for name, env in keys.items():
    test_key(name, env)
