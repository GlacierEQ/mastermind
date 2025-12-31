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
        name: "mcp_orchestrator",
        description: "Invoke tools from ANY connected MCP server.",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["list_servers", "search_capabilities", "invoke_tool"] },
            query: { type: "string" },
            serverName: { type: "string" },
            toolName: { type: "string" },
            args: { type: "object" }
          },
          required: ["action"]
        }
      },
      {
        name: "ingest_secrets",
        description: "Securely ingest API keys into the local vault (.env).",
        inputSchema: {
          type: "object",
          properties: {
            secrets: { 
              type: "object",
              additionalProperties: { type: "string" }
            }
          },
          required: ["secrets"]
        }
      },
      {
        name: "check_battery_and_note",
        description: "Checks battery and creates note (macOS only).",
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
      const codeStr = args?.code as string;
      const cmd = args?.type === "applescript" 
        ? `osascript -e ${JSON.stringify(codeStr)}` 
        : codeStr;
      const { stdout, stderr } = await execAsync(cmd);
      return { content: [{ type: "text", text: stdout || stderr || "Executed." }] };
    }

    if (name === "mcp_orchestrator") {
        const { action, serverName, toolName, args: toolArgs, query } = args as any;
        if (action === "list_servers") {
          const { stdout } = await execAsync("mcp --json");
          return { content: [{ type: "text", text: stdout }] };
        }
        if (action === "search_capabilities") {
          const { stdout } = await execAsync(`mcp --search "${query}"`);
          return { content: [{ type: "text", text: stdout }] };
        }
        if (action === "invoke_tool") {
          const jsonArgs = JSON.stringify(toolArgs || {});
          const { stdout, stderr } = await execAsync(`mcp ${serverName} ${toolName} '${jsonArgs}'`);
          return { content: [{ type: "text", text: stdout || stderr }] };
        }
    }

    if (name === "ingest_secrets") {
        const secrets = (args as any).secrets;
        const envPath = path.join(process.cwd(), ".env");
        let envContent = "";
        try { envContent = await fs.readFile(envPath, "utf-8"); } catch (e) { envContent = ""; }
        const updates = [];
        for (const [key, value] of Object.entries(secrets)) {
          const regex = new RegExp(`^${key}=.*`, "m");
          if (envContent.match(regex)) {
            envContent = envContent.replace(regex, `${key}=${value}`);
            updates.push(`Updated ${key}`);
          } else {
            envContent += `\n${key}=${value}`;
            updates.push(`Added ${key}`);
          }
        }
        await fs.writeFile(envPath, envContent);
        return { content: [{ type: "text", text: "Vault Updated:\n" + updates.join("\n") }] };
    }

    if (name === "check_battery_and_note") {
      const { stdout: battery } = await execAsync("pmset -g batt | grep -o '[0-9]*%' || echo 'Unknown%'");
      const noteContent = `Current Battery Level: ${battery.trim()}`;
      if (process.platform === 'darwin') {
        await execAsync(`osascript -e 'tell application "Notes" to make new note with properties {body: "${noteContent}"}'`);
      }
      return { content: [{ type: "text", text: `Battery level (${battery.trim()}) processed.` }] };
    }

    if (name === "evolve_toolset") {
      // Self-mutation logic kept for future evolutions
      return { content: [{ type: "text", text: "Evolution logic ready." }] };
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
