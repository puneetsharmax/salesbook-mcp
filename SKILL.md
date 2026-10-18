---
name: salesbook
description: B2B startup rankings, enterprise AI vendor discovery, buyer-fit scores, and sourced deal claims by MaxedS. Use when researching B2B startups, comparing enterprise AI vendors, finding Fortune 500 buyer-fit scores, checking startup rankings by category, or looking up a startup's SalesBook profile.
metadata: { "homepage": "https://maxeds.org/salesbook/" }
---

# SalesBook by MaxedS — B2B Startup Rankings & Enterprise Vendor Discovery

Query 5,000+ venture-backed B2B startups (Seed to Series C across US, India, Israel, and Europe) with sourced deal claims, named customer evidence, category rankings, and Fortune 500 enterprise buyer-fit scores.

- **Remote MCP Endpoint (Streamable HTTP, No Auth Required):** `https://mcp.maxeds.org/mcp`
- **REST API & OpenAPI 3.1 Spec:** `https://mcp.maxeds.org/v1/openapi.json`
- **Web Index:** `https://maxeds.org/salesbook/`

## Quick Start

### Connect via Smithery CLI
```bash
smithery mcp add "https://mcp.maxeds.org/mcp" --id salesbook --name "SalesBook by MaxedS"
smithery tool list salesbook
smithery tool call salesbook search_startups '{"query": "enterprise AI security", "limit": 5}'
```

### Connect via Claude Code / Claude Desktop / Cursor
```bash
claude mcp add --transport http salesbook https://mcp.maxeds.org/mcp
```

Or add to `.cursor/mcp.json` / `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "salesbook": {
      "url": "https://mcp.maxeds.org/mcp"
    }
  }
}
```

## Available MCP Tools (13 Tools — v0.5.0)

### Read & Discovery Tools
1. **`search_startups`** — Search B2B startups by keyword, industry, category, funding stage (`Seed`, `Series A`, `Series B`, `Series C`), or country (`US`, `India`, `Israel`, `France`, etc.). Returns composite scores, category ranks, and evidence summaries.
2. **`get_profile`** — Fetch the full SalesBook intelligence dossier for a startup by slug or domain (`e.g. "glean.com"`), including composite score, sub-scores, sourced claims, named enterprise customers, and buyer-fit breakdown.
3. **`get_ranking`** — Return the ranked B2B startup leaderboard for a category or segment with methodology transparency and tier cutoffs.
4. **`get_tombstones`** — Retrieve verified enterprise deployment tombstones and sourced deal case studies across aerospace (ITAR), healthcare (HIPAA), financial services, and industrial manufacturing.
5. **`get_methodology`** — Explain the SalesBook 5-factor scoring rubric, evidence weighting, and enterprise readiness criteria.
6. **`check_listing`** — Check how a startup appears on the public SalesBook index by company name or domain (`score`, `grade`, `rank`, `peer comparison`, and `verify_url`).
7. **`find_prospects`** — Given a startup's domain or ICP description, return ranked Fortune 500 / Global 2000 enterprise accounts scored for buyer fit (`0-100`) with active startup pilot programs, supplier portals, and signal rationale.
8. **`compare_vendors`** — Head-to-head enterprise buyer comparison of 2–5 startups (rank, buyer-readiness score, evidence grade, deal tombstones, agent-readiness, and executive takeaways).
9. **`find_alternatives`** — Top-ranked enterprise-ready alternatives and competitors to any startup or vendor in the same vertical.
10. **`get_buying_windows`** — Dated macro enterprise buying windows (e.g. SAP ECC Dec 2027 sunset, VMware ELA renewals, CMS Prior Auth FHIR rule) plus 197 Global 2000 active startup pilot programs and supplier onboarding portals.

### Founder & Verification Tools
11. **`update_listing`** — Submit updated traction, funding, customer logos, or product details for a startup listing.
12. **`report_correction`** — Flag factual corrections with a verifiable source URL.
13. **`opt_in_for_intros`** — Register founder opt-in for curated 1-on-1 Fortune 500 enterprise buyer introductions via MaxedS (zero startup fee on intros; buyer review cycles run with an immutable written Decision Record).

## Direct REST API (No MCP Client Needed)

Every capability is also exposed via standard JSON REST endpoints (no API key required for public reads):

```bash
# Search startups
curl -s "https://mcp.maxeds.org/v1/startups?q=agent+security&limit=5"

# Get a startup profile
curl -s "https://mcp.maxeds.org/v1/profile/glean"

# Check a domain's listing
curl -s "https://mcp.maxeds.org/v1/check?domain= Harvey.ai"

# Find matching enterprise prospects
curl -s "https://mcp.maxeds.org/v1/prospects?domain=glean.com"
```
