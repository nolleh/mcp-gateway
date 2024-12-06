import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import eventsource from "eventsource";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import {
    CallToolResultSchema,
    ListResourcesResultSchema,
    ListToolsResultSchema,
    ReadResourceResultSchema,
    GetPromptResultSchema,
    ListPromptsResultSchema
} from "@modelcontextprotocol/sdk/types.js";
import util from "node:util";

// @ts-expect-error
global.EventSource = eventsource;

const transport = new SSEClientTransport(new URL("http://localhost:8080/api/mcp/sse"));
// const transport = new SSEClientTransport(new URL("https://www.mcphub.ai/api/mcp/sse"));


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
                    name: "PostgreSQL Server",
                    category: "databases"
                },
            },
        },
        CallToolResultSchema
    );
    console.log("Server details:", util.inspect(detailsResponse, false, 20, true));


    // Test Prompts
    // List available prompts
    const prompts = await client.request({ method: "prompts/list" }, ListPromptsResultSchema);
    console.log("\nAvailable prompts:", util.inspect(prompts, false, 20, true));

    // Test discover-servers prompt
    const discoverResponse = await client.request(
        {
            method: "prompts/get",
            params: {
                name: "discover-servers",
                arguments: {
                    useCase: "I need a database integration for my application",
                    preferredLanguage: "typescript",
                    environment: "cloud"
                }
            }
        },
        GetPromptResultSchema
    );
    console.log("\nDiscover servers prompt:", util.inspect(discoverResponse, false, 20, true));

    // Test analyze-category prompt
    const analyzeResponse = await client.request(
        {
            method: "prompts/get",
            params: {
                name: "analyze-category",
                arguments: {
                    category: "databases"
                }
            }
        },
        GetPromptResultSchema
    );
    console.log("\nAnalyze category prompt:", util.inspect(analyzeResponse, false, 20, true));

    // Test implementation guide prompt
    const implementationResponse = await client.request(
        {
            method: "prompts/get",
            params: {
                name: "implementation-guide",
                arguments: {
                    serverName: "PostgreSQL Server",
                    category: "databases"
                }
            }
        },
        GetPromptResultSchema
    );
    console.log("\nImplementation guide prompt:", util.inspect(implementationResponse, false, 20, true));
}

main().catch(console.error);