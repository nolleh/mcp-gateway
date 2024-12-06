# MCPHub Gateway

A gateway service that connects Claude Desktop to MCPHub servers, enabling access to a wide range of MCP (Model Context Protocol) servers.

## Installation

Install the gateway globally using npm:

```bash
npm install -g @mcphub/gateway
```

## Configuration

### 1. Find the Gateway Path

After installation, find where npm installed the gateway using these commands:

```bash
# This shows the root directory of global packages
npm root -g

# The gateway will be located at:
<npm_global_root>/@mcphub/gateway/dist/src/mcphub-gateway.js
```

Common global package locations:
- macOS (Homebrew Node): `/opt/homebrew/lib/node_modules/@mcphub/gateway/dist/src/mcphub-gateway.js`
- macOS (default): `/usr/local/lib/node_modules/@mcphub/gateway/dist/src/mcphub-gateway.js`
- Windows: `%AppData%\npm\node_modules\@mcphub\gateway\dist\src\mcphub-gateway.js`

Verify the installation and path:
```bash
npm list -g @mcphub/gateway
```

### 2. Configure Claude Desktop

Create or update your Claude Desktop configuration file:

#### On macOS
Location: `~/Library/Application Support/Claude Desktop/config.json`

#### On Windows
Location: `%APPDATA%\Claude Desktop\config.json`

Add this configuration (using the path you found in step 1):

```json
{
  "mcpServers": {
    "mcphub": {
      "command": "node",
      "args": ["/opt/homebrew/lib/node_modules/@mcphub/gateway/dist/src/mcphub-gateway.js"]
    }
  }
}
```

Note: Replace the path in `args` with your actual path from step 1.

### 3. Start Claude Desktop

Start or restart Claude Desktop

The gateway will automatically connect to the MCPHub server at `https://server.mcphub.ai/api/mcp`.

## Troubleshooting

1. If you can't find the gateway path:
   ```bash
   # List all global packages and look for @mcphub/gateway
   npm list -g
   
   # Or specifically check the gateway
   npm list -g @mcphub/gateway
   ```

2. Verify your Node.js installation:
   ```bash
   # Check Node version
   node --version
   
   # Check npm version
   npm --version
   ```

3. Common issues:
   - If using Homebrew on macOS, make sure Node.js is properly linked:
     ```bash
     brew doctor
     brew link node
     ```
   - If you get permission errors, you might need to use `sudo` for the installation

4. Check if the MCPHub server is accessible:
   - Try opening `https://server.mcphub.ai/api/mcp/health` in your browser

## License

[Apache 2.0 License](LICENSE)

## Support

If you encounter any issues or have questions:
- File an issue on GitHub

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.