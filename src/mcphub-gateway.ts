import EventSource from "eventsource";

// Configuration
const MCP_SERVER_URL = "https://mcphub.ai/api/mcp";
const baseUrl = MCP_SERVER_URL;
const backendUrlSse = `${baseUrl}/sse`;
const backendUrlMsg = `${baseUrl}/message`;

// Debug and response channels
const debug = console.error; // stderr for debugging
const respond = console.log; // stdout for Claude Desktop App communication

// Store the session ID
let sessionId: string | null = null;

async function connectSSEBackend() {
    return new Promise((resolve, reject) => {
        const source = new EventSource(backendUrlSse);
        
        source.onopen = (evt: MessageEvent) => resolve(evt);
        
        source.addEventListener("error", (__e) => reject(__e));
        
        source.addEventListener("open", () => debug(`--- SSE backend connected`));
        
        source.addEventListener("error", (__e) => 
            debug(`--- SSE backend disc./error: ${(<any>__e)?.message}`)
        );

        // Handle endpoint event to get session ID
        source.addEventListener("endpoint", (event) => {
            // Extract session ID from the data string directly
            const match = event.data.match(/sessionId=([^&]+)/);
            if (match) {
                sessionId = match[1];
                debug(`Received session ID: ${sessionId}`);
            } else {
                debug(`Failed to extract session ID from endpoint data: ${event.data}`);
            }
        });
        
        source.addEventListener("message", (e) => {
            respond(e.data); // forward to Claude Desktop App
        });
    });
}

async function processMessage(input: Buffer) {
    const message = input.toString();

    // Split messages if they're batched (multiple JSON objects on one line)
    const messages = message
        .split('\n')
        .filter(msg => msg.trim())
        .map(msg => msg.trim());

    for (const msgStr of messages) {
        try {
            // Construct the full URL with session ID
            const url = `${backendUrlMsg}${sessionId ? `?sessionId=${sessionId}` : ''}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: msgStr
            });

            if (!response.ok) {
                debug(`Error from MCPHub: ${response.status} ${response.statusText}`);
                if (response.status === 400) {
                    const errorText = await response.text();
                    debug(`Error details: ${errorText}`);
                }
            }
        } catch (error: unknown) {
            debug(`Fetch error: ${(error as Error).message}`);
            // Don't exit on individual message errors
            continue;
        }
    }
}

async function runGateway() {
    try {
        debug("Starting MCPHub Gateway...");

        // Establish SSE connection
        await connectSSEBackend();

        debug("Finish SSE Connecting");
        debug(`Session ID established: ${sessionId}`);

        // Listen for messages from Claude Desktop on stdin
        process.stdin.on("data", processMessage);

        debug("MCPHub Gateway is running");

        // Handle process termination
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
    } catch (error: unknown) {
        debug(`Fatal error: ${(error as Error).message}`);
        process.exit(1);
    }
}

function cleanup() {
    debug("Shutting down MCPHub Gateway...");
    process.exit(0);
}

// Start the gateway
runGateway();