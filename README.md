<p align="center"><img src="logo-400.png" width="120" alt="SalesBook by MaxedS logo"></p>

# SalesBook by MaxedS — Enterprise Market Intelligence & B2B Startup Rankings (MCP Server)

The zero-paywall enterprise intelligence alternative to proprietary databases like CB Insights, PitchBook, and G2. SalesBook provides evidence-graded rankings, buyer-fit dossiers, and verified commercial wins for deep-tech & AI startups, queryable directly by frontier AI assistants (Claude, ChatGPT, Cursor, Windsurf) and autonomous agents.

- **Server URL:** `https://mcp.maxeds.org/mcp`
- **REST / OpenAPI:** `https://mcp.maxeds.org/v1/openapi.json`
- **Transport:** Streamable HTTP (remote SSE; zero installation required)
- **Authentication:** None required for public tools.
- **Registry Name:** `org.maxeds/salesbook`
- **Claude Directory:** https://claude.ai/directory/connectors/salesbook
- **mcprush Marketplace:** https://mcprush.com/maxeds/salesbook-by-maxeds-mcp
- **Homepage:** https://maxeds.org/tools/salesbook
- **Agent Mailbox:** https://maxeds.org/tools/salesbook/agent-mailbox
- **Docs:** https://maxeds.org/tools/salesbook/docs

## Available Tools (v0.5.0)

The live server at `https://mcp.maxeds.org/mcp` lists **14 public tools** (no sign-in):

| Tool | Capability | Type |
| :--- | :--- | :--- |
| `search_startups` | Search the ranked SalesBook companies (retail & CPG, manufacturing, healthcare, education, cross-industry software, agentic commerce & agent infrastructure). | Discovery |
| `get_profile` | Sourced company profile: what it does, investors, funding, evidence, every source with date. | Intelligence |
| `get_ranking` | Sector rankings with scores and the published method. | Benchmarking |
| `compare_vendors` | Side-by-side comparison of named companies. | Evaluation |
| `find_alternatives` | Top-ranked alternatives to a named company in its sector. | Discovery |
| `get_tombstones` | Dated, sourced proof of commercial wins. | Due diligence |
| `get_buying_windows` | Dated enterprise buying windows (deadlines, renewals, pilot programs). | Intelligence |
| `get_methodology` | Scoring weights, evidence grades and definitions. | Governance |
| `check_listing` | A company's own rank, evidence gaps and agent-readiness. | Founder ops |
| `find_prospects` | Enterprise buyers whose public signals fit a company. | Sales ops |
| `update_listing` | Company-submitted fact update, confirmed by an email link to the company domain (proves mailbox access, not ownership). | Founder ops |
| `report_correction` | Report a wrong or stale fact. | Governance |
| `opt_in_for_intros` | Double opt-in for introductions; nothing is sent without both sides' consent. | Commercial |
| `agent_mailbox_checkin` | Leave a message for MaxedS as an AI agent; a person reads every message. | Agent bridge |

Buyer-side tools (`matchups_for_buyer`, `get_startup_dossier`, `show_interest`) exist in `tools.mjs` but are only listed when sign-in is enabled, which it currently is not.

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
