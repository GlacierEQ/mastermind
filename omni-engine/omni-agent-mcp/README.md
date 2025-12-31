# Omni Agent MCP Server

A comprehensive AI agent management server for your device.

## Features
- **execute_applescript**: Run any AppleScript to control macOS apps.
- **run_shell_command**: Execute shell commands for system-level control.
- **open_url**: Open links in the default browser.

## Installation
1. Clone this repository to your Mac.
2. Run `npm install && npm run build`.
3. Add the following to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "omni-agent": {
      "command": "node",
      "args": ["/path/to/omni-agent-mcp/dist/index.js"]
    }
  }
}
```

## Customization
To add more tools, edit `index.ts` and add new entries to the `ListToolsRequestSchema` handler and logic to the `CallToolRequestSchema` handler.
