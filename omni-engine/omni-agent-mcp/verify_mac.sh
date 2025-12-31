#!/bin/bash
echo "🔍 VERIFYING OMNI-BRIDGE ON MAC..."

# Check Battery
echo "[🔋] Testing Battery Access..."
pmset -g batt | grep -q "InternalBattery" && echo "✅ Battery Access: OK" || echo "❌ Battery Access: FAILED"

# Check AppleScript
echo "[🍎] Testing AppleScript (Notes)..."
osascript -e 'tell application "Notes" to make new note with properties {body: "Omni_Engine Connection Test: SUCCESS"}' && echo "✅ AppleScript/Notes: OK" || echo "❌ AppleScript: FAILED"

# Check Node
echo "[📦] Testing Node/MCP..."
node -e "import('@modelcontextprotocol/sdk/server/index.js')" && echo "✅ MCP SDK: OK" || echo "❌ MCP SDK: MISSING"

echo "---------------------------------------"
echo "🏁 VERIFICATION COMPLETE."
