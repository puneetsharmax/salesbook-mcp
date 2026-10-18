<p align="center"><img src="logo-400.png" width="120" alt="SalesBook by MaxedS logo"></p>

# SalesBook by MaxedS — B2B Startup Rankings & Enterprise Vendor Discovery (MCP Server)

An evidence-graded ranking and discovery engine of B2B technology startups that sell to enterprises (Retail & CPG, Manufacturing, Healthcare, Education, and cross-industry SaaS/AI), queryable by AI assistants and agents. Every profile shows its sources, dates, and buyer-fit score.

- **Server URL:** `https://mcp.maxeds.org/mcp`
- **REST / OpenAPI:** `https://mcp.maxeds.org/v1/openapi.json`
- **Transport:** Streamable HTTP (remote; nothing to install)
- **Authentication:** none required for all 10 public tools.
- **Registry name:** `org.maxeds/salesbook`
- **Claude Directory:** https://claude.ai/directory/connectors/salesbook
- **Homepage:** https://maxeds.org/tools/salesbook
- **Docs:** https://maxeds.org/tools/salesbook/docs

This repository holds the public listing materials (this README, the MCP Registry manifest `server.json`, and the logo). The server itself is hosted by MaxedS LLC.

## Tools (v0.4.0)

| Tool | What it does |
| --- | --- |
| `search_startups` | Keyword search across the ranked B2B startup corpus (company name, problem, solution, category), optionally filtered by sector. |
| `get_profile` | Full evidence-graded company profile: identity, problem, solution, stage, team, buyer-fit score. Every field carries source, date and confidence. |
| `get_ranking` | Top-100 ranking for a sector (`retail`, `manufacturing`, `healthcare`, `education`, `horizontal`) and period, with scores and methodology version. |
| `get_tombstones` | Dated, sourced public claims of enterprise commercial wins, graded T1 (contract/rollout) to T4 (logo wall). |
| `get_methodology` | The published, versioned ranking methodology: weights, tier definitions, confidence labels. |
| `check_listing` | Founders & vendors: check how a startup is listed in SalesBook, what evidence is missing, and how to improve its rank. |
| `find_prospects` | Find best-fit enterprise or startup buyers for what you sell, matched against public buying signals. |
| `update_listing` | Founders: update a field on your company's SalesBook profile via domain-verified work email link and receive a signed receipt. |
| `opt_in_for_intros` | Startups: opt in to be considered for mutual double-opt-in introductions to enterprise buyers. |
| `report_correction` | Report an inaccurate or outdated fact on any profile with a public source URL. |

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
