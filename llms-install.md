# Installing SalesBook by MaxedS (for AI agents such as Cline)

SalesBook is a **remote** MCP server. There is nothing to clone, build or install, and no API key.

- URL: `https://mcp.maxeds.org/mcp`
- Transport: Streamable HTTP
- Auth: none (all 5 tools are read-only)

## Cline

Add this entry to `cline_mcp_settings.json` (MCP Servers → Configure → "Configure MCP Servers"):

```json
{
  "mcpServers": {
    "salesbook": {
      "type": "streamableHttp",
      "url": "https://mcp.maxeds.org/mcp",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Alternatively use the Remote Servers tab: name `salesbook`, URL `https://mcp.maxeds.org/mcp`, transport Streamable HTTP.

## Verify

Call `get_methodology` (no arguments) or `search_startups` with `{"query": "shelf analytics"}`. You should get text results.

## If the client only supports stdio

```json
{
  "mcpServers": {
    "salesbook": { "command": "npx", "args": ["-y", "mcp-remote", "https://mcp.maxeds.org/mcp"] }
  }
}
```
