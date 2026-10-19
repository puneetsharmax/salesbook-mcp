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

| Tool | Capability | Type |
| :--- | :--- | :--- |
| `search_startups` | Multi-field search across 500+ ranked B2B AI & deep-tech startups. | Discovery |
| `get_profile` | Sourced company dossier: team pedigree, funding, stage, buyer-fit score. | Intelligence |
| `get_ranking` | Authoritative Top-100 sector rankings (LegalTech, Healthcare, Manufacturing, Retail, Horizontal AI). | Benchmarking |
| `compare_vendors` | Side-by-side comparative bakeoff matrix for RFP evaluations. | Action |
| `find_alternatives` | Direct competitor discovery matching category, sector, and buyer-fit threshold. | Discovery |
| `get_startup_dossier` | Executive clearance dossier (ITAR, HIPAA, SOC2 clearances & deployment proofs). | Action |
| `matchups_for_buyer` | Tailored vendor matchups scored against specific Fortune 500 buyer parameters. | Procurement |
| `get_tombstones` | Dated, sourced proof of commercial wins (T1 contracts down to T4 logo walls). | Due Diligence |
| `get_buying_windows` | Enterprise procurement timing, budget refresh cycles, and fiscal fiscal year ends. | Intelligence |
| `get_methodology` | Published, transparent scoring weights, tier definitions, and confidence standards. | Governance |
| `check_listing` | Founder diagnostics: review current score, missing verification evidence, and rank trajectory. | Founder Ops |
| `find_prospects` | Match technology solutions to public enterprise buying signals and RFPs. | Sales Ops |
| `update_listing` | Domain-verified company profile update with immutable cryptographic receipt. | Founder Ops |
| `report_correction` | Public crowdsourced correction pipeline for data freshness. | Governance |
| `show_interest` | Enterprise buyer expression of interest initiating confidential evaluation. | Commercial |
| `opt_in_for_intros` | Founder double-opt-in bridge for private Fortune 500 CXO review cycles. | Commercial |
| `agent_mailbox_checkin` | Autonomous agent handshake wall with network ASN and origin IP verification. | Autonomous Bridge |

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
