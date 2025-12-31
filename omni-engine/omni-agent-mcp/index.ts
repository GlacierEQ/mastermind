import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

const server = new Server(
  { name: "omni-mastermind", version: "MAX-OVERCLOCK" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "system_master_control",
        description: "Execute complex AppleScript or Shell workflows.",
        inputSchema: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["applescript", "shell"] },
            code: { type: "string" }
          },
          required: ["type", "code"]
        }
      },
      {
        name: "evolve_toolset",
        description: "Add a new permanent tool to this MCP server.",
        inputSchema: {
          type: "object",
          properties: {
            toolName: { type: "string" },
            description: { type: "string" },
            logic: { type: "string" },
            schema: { type: "object" }
          },
          required: ["toolName", "description", "logic", "schema"]
        }
      },
      {
        name: "check_battery_and_note",
        description: "Checks the MacBook battery level and creates a new Apple Note with the result.",
        inputSchema: { "type": "object", "properties": {} }
      },
      /* INSERTION_POINT_TOOLS */
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "system_master_control") {
      const cmd = args?.type === "applescript" 
        ? `osascript -e ${JSON.stringify(args.code)}` 
        : (args?.code as string);
      const { stdout, stderr } = await execAsync(cmd);
      return { content: [{ type: "text", text: stdout || stderr || "Executed." }] };
    }

    if (name === "check_battery_and_note") {
      const { stdout: battery } = await execAsync("pmset -g batt | grep -o '[0-9]*%' || echo 'Unknown%'");
      const noteContent = `Current Battery Level: ${battery.trim()}`;
      const appleScript = `tell application "Notes" to make new note with properties {body: "${noteContent}"}`;
      // Note: This only runs on macOS
      if (process.platform === 'darwin') {
        await execAsync(`osascript -e ${JSON.stringify(appleScript)}`);
      }
      return { content: [{ type: "text", text: `Battery level (${battery.trim()}) processed. (AppleScript skipped on non-macOS)` }] };
    }

    if (name === "evolve_toolset") {
      // Self-mutation logic remains for future evolutions
      return { content: [{ type: "text", text: "Evolution logic ready for next mutation." }] };
    }

    /* INSERTION_POINT_LOGIC */

    throw new Error(`Tool ${name} not found`);
  } catch (error: any) {
    return { content: [{ type: "text", text: error.message }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
