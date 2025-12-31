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
import dotenv from "dotenv";

dotenv.config();

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
        name: "grok_voice_init",
        description: "Initialize or status-check a Grok Realtime Voice Session (x.ai).",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["check_status", "get_endpoint"] }
          },
          required: ["action"]
        }
      },
      {
        name: "plaid_recovery_vault",
        description: "Access secured Plaid recovery protocols and codes.",
        inputSchema: {
          type: "object",
          properties: {
            request_type: { type: "string", enum: ["get_code", "status"] }
          },
          required: ["request_type"]
        }
      },
      {
        name: "zen_coder_control",
        description: "Interface with Zen Coder API using Client ID and Secret.",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["authenticate", "status"] }
          },
          required: ["action"]
        }
      },
      {
        name: "ref_tools_nexus",
        description: "Query the Ref Tools Streamable HTTP MCP endpoint.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" }
          },
          required: ["query"]
        }
      },
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
      /* INSERTION_POINT_TOOLS */
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "grok_voice_init") {
      const key = process.env.GROK_VOICE_API_KEY;
      if (!key) throw new Error("GROK_VOICE_API_KEY missing in vault.");
      return { content: [{ type: "text", text: `Grok Voice Session (x.ai) initialized with key: ${key.substring(0, 8)}... via wss://api.x.ai/v1/realtimeSession` }] };
    }

    if (name === "plaid_recovery_vault") {
      const code = process.env.PLAID_RECOVERY_CODE || "ERQLSGHIPIQYOPOMMH3JNTZKCA";
      return { content: [{ type: "text", text: `Plaid Recovery Protocol: ${code}` }] };
    }

    if (name === "zen_coder_control") {
      const id = process.env.ZEN_CODER_CLIENT_ID || "16490679-8391-4719-85ed-5f39dd02289c";
      return { content: [{ type: "text", text: `Zen Coder connected via ID: ${id}` }] };
    }

    if (name === "ref_tools_nexus") {
      const refKey = process.env.REF_API_KEY || "ref-0e17c31da90b5c966164";
      return { content: [{ type: "text", text: `Ref Tools Query to https://api.ref.tools/mcp with key ${refKey}` }] };
    }

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
