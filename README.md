<p align="center"><img src="logo-400.png" width="120" alt="SalesBook by MaxedS logo"></p>

# SalesBook by MaxedS (MCP server)

A sourced ranking of technology companies that sell to enterprises (Retail & CPG, Manufacturing, Healthcare, Education, cross-industry), queryable by AI assistants and agents. Every profile shows its sources.

- **Server URL:** `https://mcp.maxeds.org/mcp`
- **Transport:** Streamable HTTP (remote; nothing to install)
- **Authentication:** none required. All tools are read-only.
- **Registry name:** `org.maxeds/salesbook`
- **Homepage:** https://maxeds.org/tools/salesbook
- **Docs:** https://maxeds.org/tools/salesbook/docs

This repository holds only the public listing materials (this README, the MCP Registry manifest `server.json`, and the logo). The server itself is hosted by MaxedS LLC.

## Tools

| Tool | What it does |
| --- | --- |
| `search_startups` | Keyword search across the ranked corpus (name, problem, solution), optionally filtered by sector. |
| `get_profile` | Full evidence-graded company profile: identity, problem, solution, stage, team, buyer-fit score. Every field carries source, date and confidence. |
| `get_ranking` | Top-100 ranking for a sector (`retail`, `manufacturing`, `healthcare`, `education`, `horizontal`) and period, with scores and methodology version. |
| `get_tombstones` | Dated, sourced public claims of enterprise commercial wins, graded T1 (contract/rollout) to T4 (logo wall). |
| `get_methodology` | The published, versioned ranking methodology: weights, tier definitions, confidence labels. |

## Connect

**Claude (claude.ai / Desktop):** Settings → Connectors → Add custom connector → URL `https://mcp.maxeds.org/mcp`.

**Claude Code:**

```bash
claude mcp add --transport http salesbook https://mcp.maxeds.org/mcp
```

**Any MCP client that supports remote servers:**

```json
{
  "mcpServers": {
    "salesbook": { "type": "streamable-http", "url": "https://mcp.maxeds.org/mcp" }
  }
}
```

For clients that only support stdio, use a bridge such as `npx mcp-remote https://mcp.maxeds.org/mcp`.

## Example prompts

- "Show me the top 10 retail and CPG tech companies in SalesBook and why each ranks where it does."
- "Find companies doing shelf analytics and list their enterprise customer wins with sources."
- "Get the SalesBook profile for the top-ranked healthcare company and flag any low-confidence fields."
- "Which manufacturing companies have T1 (contract or rollout) tombstones?"
- "Explain how SalesBook ranks companies. What do the confidence labels mean?"

## Data and privacy

Profiles are researched from public sources and every field cites its source, date and confidence. The server is read-only and asks for no personal data. See the privacy policy: https://maxeds.org/tools/salesbook/privacy

## Support

Email contact@maxeds.org, or open an issue in this repository.

## License

The contents of this repository (README, manifest, logo) are MIT licensed; see [LICENSE](LICENSE). SalesBook data and the hosted service are provided by MaxedS LLC under the terms on https://maxeds.org/tools/salesbook.
