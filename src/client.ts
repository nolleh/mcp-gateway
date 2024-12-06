import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import eventsource from "eventsource";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import {
  CallToolResultSchema,
  ListResourcesResultSchema,
  ListToolsResultSchema,
  ReadResourceResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import util from "node:util";

// @ts-expect-error
global.EventSource = eventsource;

const transport = new SSEClientTransport(new URL("http://localhost:3000/api/mcp/sse"));

// const transport = new StdioClientTransport({
//   command: "path/to/server",
// });

const client = new Client(
  {
    name: "mcphub-server",
    version: "1.0.0",
  },
  {
    capabilities: {},
  }
);

async function main() {
  console.log("Connecting...");
  await client.connect(transport);
  console.log("Connected:", client.getServerCapabilities());

  // List available tools
  const tools = await client.request({ method: "tools/list" }, ListToolsResultSchema);
  console.log("Available tools:", util.inspect(tools, false, 20, true));

  // Example: Search for Python servers
  const searchResponse = await client.request(
    {
      method: "tools/call",
      params: {
        name: "searchServers",
        arguments: {
          codebase: ["python"]
        },
      },
    },
    CallToolResultSchema
  );
  console.log("Search results:", util.inspect(searchResponse, false, 20, true));

  // Example: Get server details
  const detailsResponse = await client.request(
    {
      method: "tools/call",
      params: {
        name: "getServerDetails",
        arguments: {
          name: "sqlite",
          category: "database"
        },
      },
    },
    CallToolResultSchema
  );
  console.log("Server details:", util.inspect(detailsResponse, false, 20, true));
}

main().catch(console.error);