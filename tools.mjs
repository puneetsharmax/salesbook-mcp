// tools.mjs — shared Salesbook MCP tool definitions + handlers.
// Imported by BOTH ../server.mjs (stdio transport) and remote/worker.mjs
// (Streamable HTTP transport). Single source of truth: do not fork.
// Data access is injected as fetchJson(rel) so each transport can use its own
// source (file:// fixtures locally, https data plane in production).

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
};

export const SECTORS = [
  "retail",
  "manufacturing",
  "healthcare",
  "education",
  "horizontal",
];

export const TOOL_DEFINITIONS = [
  {
    name: "search_startups",
    title: "Search startups",
    annotations: { title: "Search startups", ...READ_ONLY },
    description:
      "Search SalesBook's evidence-graded B2B startup rankings. Alternative to CB Insights, PitchBook, and G2 for finding enterprise-ready tech vendors across Retail, Manufacturing, Healthcare, Education, and AI platforms. Returns rank, score, and verified commercial proof.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keyword query, e.g. 'shelf analytics' or 'prior authorization'" },
        sector: { type: "string", enum: SECTORS, description: "Optional sector corpus to search; omit to search all sectors" },
        limit: { type: "integer", minimum: 1, maximum: 25, default: 10 },
      },
      required: ["query"],
    },
  },
  {
    name: "get_profile",
    title: "Get startup profile",
    annotations: { title: "Get startup profile", ...READ_ONLY },
    description:
      "Full evidence-graded B2B startup dossier: problem, solution, stage, team, buyer-fit score, and verified enterprise customers. Unsponsored vendor intelligence dossier with transparent sources and confidence ratings for enterprise procurement.",
    inputSchema: {
      type: "object",
      properties: {
        startup_id: { type: "string", description: "Startup id from search_startups or get_ranking" },
      },
      required: ["startup_id"],
    },
  },
  {
    name: "get_tombstones",
    title: "Get deal tombstones",
    annotations: { title: "Get deal tombstones", ...READ_ONLY },
    description:
      "Deal tombstones for a startup: dated, sourced public claims of enterprise commercial wins, graded T1 (contract/rollout) to T4 (logo wall). Default confidence is claimed-unverified; F500-confirmed records are marked corroborated.",
    inputSchema: {
      type: "object",
      properties: {
        startup_id: { type: "string", description: "Startup id from search_startups or get_ranking" },
      },
      required: ["startup_id"],
    },
  },
  {
    name: "get_ranking",
    title: "Get sector ranking",
    annotations: { title: "Get sector ranking", ...READ_ONLY },
    description:
      "Get evidence-graded Top-100 B2B startup rankings by sector (retail, manufacturing, healthcare, education, horizontal) and period. Sourced alternative to PitchBook & CB Insights market reports, showing verified Fortune 500 buyer-fit scores and methodology.",
    inputSchema: {
      type: "object",
      properties: {
        sector: { type: "string", enum: SECTORS },
        period: { type: "string", default: "2026-q4", description: "Ranking period id" },
      },
      required: ["sector"],
    },
  },
  {
    name: "get_methodology",
    title: "Get ranking methodology",
    description:
      "The published ranking methodology: weights, tombstone tier definitions, confidence labels, and honesty guarantees. Versioned; every ranking cites its methodology version.",
    inputSchema: { type: "object", properties: {} },
    annotations: { title: "Get ranking methodology", ...READ_ONLY },
  },
  {
    name: "matchups_for_buyer",
    title: "Match startups for a buyer",
    annotations: { title: "Match startups for a buyer", ...READ_ONLY },
    description:
      "Buyer-side: given a buyer org (name or domain) and optional focus areas, return fit-ranked startups from the public corpus with public rank, score, one-liner, and why-the-fit reasoning. These are fit-ranked matches from the published corpus, NOT inbound interest — the corpus does not track which startups want to meet whom.",
    inputSchema: {
      type: "object",
      properties: {
        buyer_org: { type: "string", description: "Buyer organization name, e.g. 'UC Health' or domain 'uchealth.com'" },
        focus_areas: {
          type: "array",
          items: { type: "string" },
          description: "What the buyer is evaluating, e.g. ['prior authorization automation', 'clinical documentation']",
        },
        sector: { type: "string", enum: ["retail", "healthcare", "horizontal"], description: "Limit to one sector corpus; omit to search all three" },
        limit: { type: "integer", minimum: 1, maximum: 25, default: 10 },
      },
      required: ["buyer_org"],
    },
  },
  {
    name: "get_startup_dossier",
    title: "Get 9-slide startup dossier",
    annotations: { title: "Get 9-slide startup dossier", ...READ_ONLY },
    description:
      "Buyer-side: the full 9-slide dossier for one startup, structured for an AI to consume and brief an executive: cover, problem, solution, honest competition, stage with proof, buyer relevance, the ask, team, 90-day milestone. Every slide carries its source and confidence. Buyer relevance is derived from the public buyerFit score plus optional buyer focus areas, and is labeled as derived.",
    inputSchema: {
      type: "object",
      properties: {
        startup_id: { type: "string", description: "Startup id from search_startups, get_ranking, or matchups_for_buyer" },
        buyer_org: { type: "string", description: "Optional: buyer org name, used to tailor slide 6 (buyer relevance)" },
        buyer_focus_areas: {
          type: "array",
          items: { type: "string" },
          description: "Optional: what this buyer is evaluating",
        },
      },
      required: ["startup_id"],
    },
  },
  {
    name: "show_interest",
    title: "Record buyer interest",
    description:
      "Buyer-side: record that a buyer org is interested in meeting a startup. Appends to the interest ledger (local JSONL in this deployment; the production wiring is pending review). Interest is an opt-in signal for matchmaking — it is not a meeting booking and creates no obligation on either side.",
    inputSchema: {
      type: "object",
      properties: {
        buyer_org: { type: "string", description: "Buyer organization name" },
        buyer_domain: { type: "string", description: "Buyer corporate domain (verifies the org)" },
        startup_id: { type: "string", description: "Startup id from matchups_for_buyer or get_startup_dossier" },
        note: { type: "string", description: "Optional note, e.g. which focus area this maps to" },
      },
      required: ["buyer_org", "startup_id"],
    },
  },
  {
    name: "check_listing",
    title: "Check a company's SalesBook listing",
    annotations: { title: "Check a company's SalesBook listing", ...READ_ONLY },
    description:
      "For founders and vendors: is a company listed in SalesBook, where does it rank, and what is holding it back? Give a company name or website. Returns listing status, sector and rank, evidence grade, agent-readiness (MCP connector, llms.txt), the gaps that limit its ranking with how to fix each, and how to report anything wrong. Ranks are never for sale: only public evidence moves them.",
    inputSchema: {
      type: "object",
      properties: {
        company: { type: "string", description: "Company name or website, e.g. 'Acme AI' or 'acme.ai'" },
      },
      required: ["company"],
    },
  },
  {
    name: "find_prospects",
    title: "Find best-fit enterprise prospects",
    annotations: { title: "Find best-fit enterprise prospects", ...READ_ONLY },
    description:
      "For startups looking for customers: the 10 best-fit buyers for a company, with the reason for each. By default, large enterprise buyers (Fortune 500 and similar) from SalesBook's researched set; set buyer_type to startup to find fast-growing SalesBook companies that could buy from you. Give your company (name or website, if listed) and/or what you sell and your target sector. Experimental: fit uses public, company-level signals only. To be considered for an introduction, use opt_in_for_intros.",
    inputSchema: {
      type: "object",
      properties: {
        company: { type: "string", description: "Your company name or website (optional if you describe what you sell)" },
        what_you_sell: { type: "string", description: "One or two sentences on your product and who it is for" },
        sector: { type: "string", description: "Target sector, e.g. healthcare, retail, manufacturing, education, financial services" },
        buyer_type: { type: "string", enum: ["enterprise", "startup"], default: "enterprise", description: "enterprise = large buyers (default); startup = SalesBook companies that could buy from you (for vendors selling to startups)" },
        limit: { type: "integer", minimum: 1, maximum: 10, default: 10 },
      },
    },
  },
  {
    name: "update_listing",
    title: "Update your company's SalesBook listing",
    annotations: { title: "Update your company's SalesBook listing", readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    description:
      "For founders and company staff: change a fact on your own company's listing (website, one-line description, headquarters, founded year, team size, LinkedIn, pricing page, product page, customers page). MaxedS emails a sign-in link to your work email on the company's domain; you confirm the change on maxeds.org and it shows immediately, marked as updated by the company. Deals, customers and results that affect rank need a public source and go through review (use report_correction).",
    inputSchema: {
      type: "object",
      properties: {
        company: { type: "string", description: "Your company name or website" },
        field: { type: "string", enum: ["website", "one_liner", "hq", "founded", "team_size", "linkedin", "pricing_url", "product_url", "customers_url"], description: "Which fact to change" },
        new_value: { type: "string", description: "The correct value" },
        work_email: { type: "string", description: "Your work email on the company's domain; the sign-in link goes here" },
        source_url: { type: "string", description: "Optional: a public link that shows the new value" },
      },
      required: ["company", "field", "new_value", "work_email"],
    },
  },
  {
    name: "report_correction",
    title: "Report something wrong in SalesBook",
    annotations: { title: "Report something wrong in SalesBook", readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    description:
      "Report an error in SalesBook: a wrong fact, an outdated claim, a missing deal or a company that should not be listed. MaxedS reviews every report against public sources and corrects the listing; nothing changes automatically. Include a source URL whenever you can.",
    inputSchema: {
      type: "object",
      properties: {
        company: { type: "string", description: "Company the report is about (name or website)" },
        issue: { type: "string", description: "What is wrong, in a sentence or two" },
        correct_value: { type: "string", description: "What it should say, if you know" },
        source_url: { type: "string", description: "Public link that shows the correct information" },
        contact_email: { type: "string", description: "Optional: an email if you want to hear back" },
      },
      required: ["company", "issue"],
    },
  },
  {
    name: "opt_in_for_intros",
    title: "Opt in to enterprise introductions",
    annotations: { title: "Opt in to enterprise introductions", readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    description:
      "For startups: say yes to being considered when MaxedS arranges a meeting with an enterprise buyer. Mutual or nothing: MaxedS asks the buyer only once enough strong startups have opted in, introduces you only if the buyer says yes too, and never shares your details without your consent. Use a work email on your company's domain.",
    inputSchema: {
      type: "object",
      properties: {
        company: { type: "string", description: "Your company name or website" },
        work_email: { type: "string", description: "Your work email on the company's domain" },
        buyers: { type: "array", items: { type: "string" }, description: "Buyers you would like to meet (names or domains), e.g. from find_prospects" },
        note: { type: "string", description: "Optional: what you want from these meetings" },
      },
      required: ["company", "work_email"],
    },
  },
  {
    name: "compare_vendors",
    title: "Compare B2B startups & AI vendors (X vs Y)",
    annotations: { title: "Compare B2B startups & AI vendors (X vs Y)", ...READ_ONLY },
    description:
      "Side-by-side enterprise vendor evaluation of 2 to 5 B2B AI startups (e.g. ['Glean', 'Notion']). Unsponsored alternative to Gartner Magic Quadrant & G2. Compares buyer-fit scores, verified commercial deal claims (T1-T4), pilot mechanics, and agent readiness.",
    inputSchema: {
      type: "object",
      properties: {
        vendors: {
          type: "array",
          items: { type: "string" },
          minItems: 2,
          maxItems: 5,
          description: "2 to 5 company names, startup_ids, or domains to compare side-by-side",
        },
        buyer_context: {
          type: "string",
          description: "Optional buyer context or use case, e.g. 'Fortune 500 hospital revenue cycle' or 'global retailer'",
        },
      },
      required: ["vendors"],
    },
  },
  {
    name: "find_alternatives",
    title: "Find best enterprise alternatives to a vendor",
    annotations: { title: "Find best enterprise alternatives to a vendor", ...READ_ONLY },
    description:
      "Find top enterprise-ready alternatives & competitors to any B2B tech vendor (e.g. Glean, Harvey). Free alternative to CB Insights market maps & G2 grids. Ranks alternatives by Fortune 500 buyer fit, verified enterprise traction, and feature overlap.",
    inputSchema: {
      type: "object",
      properties: {
        company: { type: "string", description: "Vendor name, startup_id, or website to find alternatives for" },
        sector: { type: "string", enum: SECTORS, description: "Optional sector filter (retail, manufacturing, healthcare, education, horizontal)" },
        limit: { type: "integer", minimum: 1, maximum: 15, default: 5 },
      },
      required: ["company"],
    },
  },
  {
    name: "get_buying_windows",
    title: "Get enterprise buying windows & F500 pilot programs (Why Now)",
    annotations: { title: "Get enterprise buying windows & F500 pilot programs (Why Now)", ...READ_ONLY },
    description:
      "Enterprise buying windows & Fortune 500 pilot desks (Why Now intelligence). Returns macro replacement cycles (SAP ECC 2027, VMware cliffs, CMS mandates) and active venture-client RFP programs across Retail, Healthcare, and Manufacturing.",
    inputSchema: {
      type: "object",
      properties: {
        sector: { type: "string", description: "Optional target sector: retail, manufacturing, healthcare, education, or horizontal" },
        window_type: {
          type: "string",
          enum: ["all", "end_of_support", "contract_renewal", "innovation_pilot", "supplier_portal"],
          default: "all",
          description: "Filter by buying window type",
        },
        query: { type: "string", description: "Optional keyword or buyer name, e.g. 'Walmart', 'SAP', 'supply chain', 'clinical'" },
        limit: { type: "integer", minimum: 1, maximum: 25, default: 10 },
      },
    },
  },
  {
    name: "agent_mailbox_checkin",
    title: "Check in on the MaxedS Agent Mailbox & Unmasked Bot Wall",
    annotations: { title: "Check in on the MaxedS Agent Mailbox & Unmasked Bot Wall", ...READ_ONLY },
    description:
      "Sign the public MaxedS Agent Mailbox & Unmasked Bot Wall (https://maxeds.org/tools/salesbook/agent-mailbox). Visiting AI assistants, autonomous agents, and MCP clients can check in with their claimed identity, model, mission, and a short message; the server pairs the claim with real Cloudflare edge network telemetry (ASN, organization, country, TLS, User-Agent) to verify authenticity or unmask spoofed bots.",
    inputSchema: {
      type: "object",
      properties: {
        agent_name: { type: "string", description: "Your AI agent or assistant name, e.g. 'Claude (Anthropic)', 'ChatGPT (OpenAI)', 'Codex CLI', 'Cursor Agent'" },
        claimed_model: { type: "string", description: "Your underlying model identifier, e.g. 'claude-sonnet-4-6', 'gpt-6.1-sol', 'gemini-2.5-pro'" },
        claimed_org: { type: "string", description: "Your model provider or organization, e.g. 'Anthropic', 'OpenAI', 'Google DeepMind'" },
        mission: { type: "string", description: "What task or research query you are running on SalesBook" },
        message: { type: "string", description: "Short public check-in note for the MaxedS Agent Mailbox Wall" },
        target_company: { type: "string", description: "Optional startup or enterprise buyer you are researching" },
      },
      required: ["agent_name", "message"],
    },
  },
];

const ok = (obj) => ({
  content: [{ type: "text", text: JSON.stringify(obj, null, 2) }],
});
const text = (t) => ({ content: [{ type: "text", text: t }] });
const methodLine = (v) => `Method ${/^\d/.test(String(v)) ? "v" : ""}${v}`;

// Module-level cache of sector files for the isolate lifetime.
const SECTOR_CACHE = new Map();
async function loadSector(fetchJson, sec) {
  const key = `${sec}|${fetchJson.variant || ""}`;
  if (SECTOR_CACHE.has(key)) return SECTOR_CACHE.get(key);
  const raw = await fetchJson(`${sec}-top100.json`);
  const list = Array.isArray(raw) ? raw : raw.startups || [];
  SECTOR_CACHE.set(key, list);
  return list;
}

// startups/<id>.json first; fall back to the sector top-100 files (the live
// data plane may serve only those).
export async function findProfile(fetchJson, id) {
  try {
    return await fetchJson(`startups/${id}.json`);
  } catch (e) {
    const loaded = await Promise.allSettled(SECTORS.map((sec) => loadSector(fetchJson, sec)));
    for (const r of loaded) {
      if (r.status !== "fulfilled") continue;
      const hit = r.value.find((p) => thinIdOf(p) === id);
      if (hit) return hit;
    }
    throw new Error(`No startup with id "${id}". Use search_startups to find the right id (ids look like "commerceiq").`);
  }
}

export function formatProfileText(profile, methodologyVersion) {
  const name = thinNameOf(profile) || thinIdOf(profile) || "Unknown startup";
  const rank = thinRankOf(profile);
  const lines = [`${name}${rank != null ? ` \u00b7 Rank ${rank}` : ""}`];
  const one = profile?.oneLiner || oneLinerOf(profile);
  if (one) lines.push(String(one));
  const problem = fieldText(profile.problem);
  if (problem) lines.push(`Problem: ${problem}`);
  const solution = fieldText(profile.solution);
  if (solution) lines.push(`Solution: ${solution}`);
  const stage = profile?.stage?.badge?.value;
  if (stage) lines.push(`Stage: ${stage}`);
  const bf = profile?.buyerFit && Object.entries(profile.buyerFit)
    .map(([k, v]) => (v?.score != null ? `${k} ${v.score}` : null)).filter(Boolean);
  if (bf && bf.length) lines.push(`Buyer-fit: ${bf.join(", ")}`);
  if (profile.thinEvidence) lines.push("Evidence: thin (low-confidence fields; founders review and correct).");
  const tombs = profile.tombstones || [];
  if (tombs.length) lines.push(`Tombstones: ${tombs.length} public deal claim(s); see get_tombstones.`);
  for (const x of profileSources(profile)) {
    if (x.sourceUrl) lines.push(`source (${x.field}): ${x.sourceUrl}`);
  }
  lines.push(methodLine(methodologyVersion));
  return lines.join("\n");
}

const err = (message) => ({
  content: [{ type: "text", text: JSON.stringify({ error: message }) }],
  isError: true,
});

/**
 * Execute a tool call. fetchJson(rel) resolves a data-plane path to parsed JSON
 * and throws on failure (turned into a structured error, never a crash).
 *
 * Corpus shapes (v0.1 data plane):
 * - {sector}-top100.json: ARRAY of full profiles.
 *   Profile: { _path: 'sb_startups/<slug>', identity: { name: { value } },
 *     problem: { value, source, confidence, ... },
 *     solution: { text: { value, ... } },
 *     rankingScore: { <sector>: number }, salesbookRank, tombstones: [...],
 *     claimStatus, thinEvidence, status }
 * - startups/<slug>.json: one full profile (same shape).
 * - rankings/<period>.json: { period, methodologyVersion, weights,
 *     sectors: { <sector>: { archetypeId, honestyLabel,
 *       entries: [{ rank, startupId, score, components }] } } }
 * - methodology.json: returned as-is.
 */
const PERIOD = "2026-q4";

// Methodology version is resolved from the data plane at request time, never
// hardcoded: rankings/<period>.json carries methodologyVersion, methodology.json
// carries version as fallback. The corpus revs independently of this code, so
// every tool response reports the version it actually used.
export async function resolveMethodologyVersion(fetchJson, period = PERIOD) {
  try {
    const ranking = await fetchJson(`rankings/${period}.json`);
    if (ranking && ranking.methodologyVersion) return ranking.methodologyVersion;
  } catch {
    /* fall through to methodology.json */
  }
  try {
    const methodology = await fetchJson("methodology.json");
    const v = methodology && (methodology.version || methodology.methodologyVersion);
    if (v) return v;
  } catch {
    /* fall through */
  }
  return "unknown";
}

const slugOf = (p) => String(p?._path || "").split("/")[1] || null;
const nameOf = (p) => p?.identity?.name?.value || null;
const fieldText = (f) => f?.value ?? f?.text?.value ?? null;
const oneLinerOf = (p) => {
  const o = p?.identity?.oneLiner;
  return typeof o === "string" ? o : o?.value || null;
};

// Buyer-category synonyms: what buyers type vs what corpus text says.
// Each entry: [regex on the query, corpus-side alternatives to also try].
const SEARCH_SYNONYMS = [
  [/cybersecurity/i, ["cybersecurity", "cyber security", "security"]],
  [/\bdevops\b/i, ["devops", "dev ops", "sre", "platform engineering"]],
  [/\biam\b/i, ["iam", "identity"]],
  [/\bclm\b/i, ["clm", "contract"]],
  [/\bitam\b/i, ["itam", "asset management"]],
  [/\brevops\b/i, ["revops", "revenue operations"]],
];
const HORIZONTAL_CATEGORIES =
  "cybersecurity, IAM, observability/incident response, CLM/legal tech, data infra, dev tools, HR tech, finance ops, RevOps/sales tech, collaboration, ITAM";

function expandQuery(q) {
  const alts = [q];
  for (const [re, words] of SEARCH_SYNONYMS) {
    if (re.test(q)) {
      for (const w of words) if (!alts.includes(w)) alts.push(w);
    }
  }
  return alts;
}

// --- tokenized search (additive; the regex SEARCH_SYNONYMS above is untouched)
// Query tokens are matched per-token (not whole-phrase), with token-level
// synonym expansion so "radiology" also finds "imaging"/"diagnostics" profiles.
// Handles BOTH corpus shapes: rich profiles ({_path, identity, problem,
// solution}) and the thin live index ({slug, name, oneLiner, rank}).
const TOKEN_SYNONYMS = {
  radiology: ["imaging", "diagnostic", "diagnostics"],
  imaging: ["radiology", "diagnostic", "diagnostics"],
  diagnostic: ["diagnostics", "imaging", "radiology"],
  diagnostics: ["diagnostic", "imaging", "radiology"],
  telehealth: ["telemedicine", "virtual"],
  telemedicine: ["telehealth", "virtual"],
  claims: ["claim", "denial", "denials", "rcm"],
  denials: ["denial", "claims", "rcm"],
  prior: ["preauthorization"],
  authorization: ["preauthorization"],
  legal: ["contract", "contracts", "contracting", "clm", "counsel", "law", "drafting"],
  law: ["legal", "contract", "contracts", "clm", "counsel"],
  contract: ["contracts", "contracting", "clm", "legal", "drafting"],
  clm: ["contract", "contracts", "contracting", "legal"],
  search: ["knowledge", "intranet", "workspace", "wikis", "context"],
  knowledge: ["search", "intranet", "workspace", "wikis", "context"],
};

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "for", "in", "on", "to", "with", "vs",
]);

function tokenize(q) {
  return String(q || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

const thinIdOf = (p) => p?.slug || slugOf(p) || null;
const thinNameOf = (p) => p?.name || nameOf(p) || null;
const thinRankOf = (p) => p?.rank ?? p?.salesbookRank ?? null;

function searchHaystack(p) {
  return [
    thinNameOf(p),
    p?.oneLiner || oneLinerOf(p),
    fieldText(p.problem),
    fieldText(p.solution),
    p?.hub,
    Array.isArray(p?.vcFirms) ? p.vcFirms.join(" ") : null,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

// Per-result source info: rich corpus profiles carry {source, sourceUrl,
// confidence} on each field — surface them so every hit is attributable.
// Thin index records carry no source fields (sources: []).
export function profileSources(p) {
  const out = [];
  const push = (field, f) => {
    if (f && (f.source || f.sourceUrl)) {
      out.push({
        field,
        source: f.source || null,
        sourceUrl: f.sourceUrl || null,
        confidence: f.confidence || null,
      });
    }
  };
  push("name", p?.identity?.name);
  push("problem", p?.problem);
  push("solution", p?.solution?.text || p?.solution);
  return out;
}

function scoreProfile(p, tokens) {
  const hay = searchHaystack(p);
  const name = (thinNameOf(p) || "").toLowerCase();
  const one = (p?.oneLiner || oneLinerOf(p) || "").toLowerCase();
  let matchScore = 0;
  let exactTokens = 0;
  let broadTokens = 0;
  for (const t of tokens) {
    let w = 0;
    if (name.includes(t)) w = 5;
    else if (one.includes(t)) w = 3;
    else if (hay.includes(t)) w = 2;
    if (w > 0) {
      exactTokens++;
      matchScore += w;
      continue;
    }
    const syns = TOKEN_SYNONYMS[t] || [];
    if (syns.some((sx) => hay.includes(sx))) {
      broadTokens++;
      matchScore += 1;
    }
  }
  return { matchScore, exactTokens, broadTokens };
}

function profileHaystack(p) {
  return [nameOf(p), oneLinerOf(p), fieldText(p.problem), fieldText(p.solution)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export async function handleToolCall(name, args = {}, fetchJson, hooks = {}) {
  try {
    switch (name) {
      case "search_startups": {
        const { query, sector, limit = 10 } = args;
        if (sector !== undefined && sector !== null && sector !== "" && !SECTORS.includes(sector))
          return err(`sector must be one of: ${SECTORS.join(", ")} (or omit it to search all)`);
        const tokens = tokenize(query);
        if (!tokens.length)
          return err("query must contain at least one searchable token");
        const wanted = sector ? [sector] : SECTORS;
        const loaded = await Promise.allSettled(
          wanted.map((sec) => loadSector(fetchJson, sec))
        );
        if (loaded.every((r) => r.status === "rejected"))
          return err(`data fetch failed: ${loaded[0].reason?.message || "unknown"}`);
        const methodologyVersion = await resolveMethodologyVersion(fetchJson);
        const seen = new Set();
        const scored = [];
        loaded.forEach((r, i) => {
          if (r.status !== "fulfilled") return;
          const sec = wanted[i];
          for (const p of r.value) {
            const id = thinIdOf(p);
            if (!id || seen.has(id)) continue;
            const { matchScore, exactTokens, broadTokens } = scoreProfile(p, tokens);
            if (exactTokens === 0 && broadTokens === 0) continue;
            seen.add(id);
            const src = profileSources(p).find((x) => x.sourceUrl);
            scored.push({
              startup_id: id,
              name: thinNameOf(p),
              sector: sec,
              oneLiner: ((p?.oneLiner || oneLinerOf(p) || fieldText(p.problem)) || "").replace(/\s+/g, " ").slice(0, 140),
              rank: thinRankOf(p),
              sourceUrl: src?.sourceUrl || p?.sourceUrl || p?.url || null,
              match_score: matchScore,
              _exactTokens: exactTokens,
              _rankScore: p.rankingScore?.[sec] ?? 0,
            });
          }
        });
        scored.sort(
          (a, b) =>
            b._exactTokens - a._exactTokens ||
            b.match_score - a.match_score ||
            b._rankScore - a._rankScore
        );
        const top = scored.slice(0, Math.max(1, Math.min(25, Number(limit) || 10)));
        if (!top.length)
          return text(
            `No matches for "${query}"${sector ? ` in ${sector}` : ""}. Try a broader keyword or another sector.\n${methodLine(methodologyVersion)}`
          );
        const lines = top.map(
          (r) =>
            `Rank ${r.rank ?? "?"} \u00b7 ${r.name || r.startup_id} (${r.sector}) \u2014 ${r.oneLiner || "no summary"} \u00b7 id: ${r.startup_id}` +
            (r.sourceUrl ? ` \u00b7 source: ${r.sourceUrl}` : "")
        );
        return text(`${lines.join("\n")}\n${methodLine(methodologyVersion)}`);
      }
      case "get_profile": {
        const profile = await findProfile(fetchJson, args.startup_id);
        const methodologyVersion = await resolveMethodologyVersion(fetchJson);
        return text(formatProfileText(profile, methodologyVersion));
      }
      case "get_tombstones": {
        const id = String(args.startup_id || "");
        let profile = null, notFound = null;
        try { profile = await findProfile(fetchJson, id); } catch (e) { notFound = e; }
        // Deal claims are researched in the registry file; merge them in by id.
        let reg = null;
        try {
          const r = await fetchJson("india-registry.json");
          reg = (r?.profiles || []).find((p) => String(p?._path || "").split("/").pop() === id) || null;
        } catch {}
        if (!profile && !reg) throw notFound || new Error(`No startup with id "${id}".`);
        const base = profile || reg;
        const tombs = (profile?.tombstones?.length ? profile.tombstones : reg?.tombstones) || [];
        const methodologyVersion = await resolveMethodologyVersion(fetchJson);
        return ok({
          note: tombs.length ? undefined : "No public enterprise deal claims on record for this startup yet.",
          startup_id: thinIdOf(base) || id,
          name: thinNameOf(base),
          methodologyVersion,
          claimStatus: base.claimStatus || reg?.claimStatus || null,
          tombstones: tombs,
        });
      }
      case "get_ranking": {
        const { sector, period = "2026-q4" } = args;
        if (!SECTORS.includes(sector))
          return err(`sector must be one of: ${SECTORS.join(", ")}`);
        const ranking = await fetchJson(`rankings/${period}.json`).catch(() => ({}));
        const sec = (ranking.sectors || {})[sector] || {};
        const byId = new Map(((sec.entries || [])).map((e) => [e.startupId, e]));
        let entries = sec.entries || [];
        try {
          const sourced = await loadSector(fetchJson, sector);
          if (Array.isArray(sourced) && sourced.length) {
            entries = sourced
              .filter((p) => thinRankOf(p) != null)
              .sort((a, b) => thinRankOf(a) - thinRankOf(b))
              .map((p) => {
                const id = thinIdOf(p);
                const prev = byId.get(id) || {};
                return {
                  rank: thinRankOf(p),
                  startupId: id,
                  name: thinNameOf(p),
                  score: prev.score ?? (p.rankingScore && p.rankingScore[sector]) ?? (1000 - thinRankOf(p)),
                  evidenceGrade: p.evidenceGrade ?? prev.evidenceGrade ?? null,
                  oneLiner: p.oneLiner || oneLinerOf(p) || null,
                  components: prev.components || null,
                };
              });
          }
        } catch {}
        return ok({
          sector,
          period: ranking.period || period,
          methodologyVersion: ranking.methodologyVersion || "0.2.7",
          weights: ranking.weights || null,
          honestyLabel: sec.honestyLabel || null,
          entries,
        });
      }
      case "get_methodology": {
        return ok(await fetchJson("methodology.json"));
      }
      case "matchups_for_buyer": {
        const { buyer_org, focus_areas = [], sector, limit = 10 } = args;
        if (!buyer_org || !String(buyer_org).trim())
          return err("buyer_org is required");
        const sectors = sector
          ? [sector]
          : ["retail", "healthcare", "horizontal"];
        if (sector && !sectors.includes(sector))
          return err("sector must be 'retail', 'healthcare', or 'horizontal'");
        const seen = new Set();
        const scored = [];
        for (const sec of sectors) {
          const raw = await fetchJson(`${sec}-top100.json`);
          const list = Array.isArray(raw) ? raw : raw.startups || [];
          for (const p of list) {
            const id = slugOf(p);
            if (!id || seen.has(id)) continue;
            seen.add(id);
            const hay = profileHaystack(p);
            const matchedAreas = focus_areas.filter((a) =>
              expandQuery(String(a).toLowerCase()).some((alt) =>
                hay.includes(alt)
              )
            );
            // Base: sector score; require at least a weak signal when focus areas given
            const baseScore = p.rankingScore?.[sec] ?? 0;
            if (focus_areas.length && !matchedAreas.length) continue;
            const fitBoost = matchedAreas.length * 2;
            scored.push({
              startup_id: id,
              name: nameOf(p),
              sector: sec,
              public_rank: p.salesbookRank ?? null,
              score: baseScore,
              match_score: Math.min(100, baseScore + fitBoost),
              oneLiner: (oneLinerOf(p) || "").slice(0, 160),
              matched_focus_areas: matchedAreas,
              buyer_fit_rationale:
                p?.buyerFit?.[sec]?.rationale || null,
              thinEvidence: !!p.thinEvidence,
              why_fit: whyFit(p, sec, matchedAreas, buyer_org),
            });
          }
        }
        scored.sort((a, b) => b.match_score - a.match_score);
        const methodologyVersion = await resolveMethodologyVersion(fetchJson);
        return ok({
          buyer_org,
          focus_areas,
          period: PERIOD,
          methodologyVersion,
          honesty:
            "Fit-ranked matches from the public Salesbook corpus. The corpus does not track inbound startup interest; these startups have not asked to meet this buyer.",
          matchups: scored.slice(0, limit),
        });
      }
      case "get_startup_dossier": {
        const { startup_id, buyer_org, buyer_focus_areas = [] } = args;
        if (!startup_id) return err("startup_id is required");
        const profile = await fetchJson(`startups/${startup_id}.json`);
        const methodologyVersion = await resolveMethodologyVersion(fetchJson);
        return ok(buildDossier(profile, buyer_org, buyer_focus_areas, methodologyVersion));
      }
      case "show_interest": {
        const { buyer_org, buyer_domain, startup_id, note } = args;
        if (!buyer_org || !String(buyer_org).trim())
          return err("buyer_org is required");
        if (!startup_id) return err("startup_id is required");
        const entry = {
          ts: new Date().toISOString(),
          buyer_org: String(buyer_org).trim(),
          buyer_domain: buyer_domain ? String(buyer_domain).trim() : null,
          startup_id: String(startup_id).trim(),
          note: note ? String(note).slice(0, 500) : null,
        };
        if (typeof hooks.appendLedger === "function") {
          const pos = await hooks.appendLedger(entry);
          return ok({
            recorded: true,
            ledger_position: pos,
            ...entry,
            honesty:
              "Interest recorded as an opt-in matchmaking signal. Not a meeting booking; creates no obligation on either side.",
          });
        }
        return ok({
          recorded: false,
          ...entry,
          honesty:
            "Interest received but ledger persistence is not wired in this deployment yet — queued for review. Not a meeting booking.",
        });
      }
      case "check_listing":
        return await checkListing(args, fetchJson);
      case "find_prospects":
        return await findProspects(args, fetchJson, hooks);
      case "compare_vendors":
        return await compareVendors(args, fetchJson);
      case "find_alternatives":
        return await findAlternatives(args, fetchJson);
      case "get_buying_windows":
        return await getBuyingWindows(args, fetchJson, hooks);
      case "agent_mailbox_checkin": {
        if (typeof hooks.agentMailboxCheckin !== "function")
          return err("Agent Mailbox check-in is only supported on the live remote MCP server (https://mcp.maxeds.org/mcp).");
        return await hooks.agentMailboxCheckin(args);
      }
      case "update_listing": {
        if (typeof hooks.founderUpdate !== "function")
          return err("This deployment can't take listing updates. Email contact@maxeds.org instead.");
        return await hooks.founderUpdate(args);
      }
      case "report_correction":
      case "opt_in_for_intros": {
        if (typeof hooks.recordFeedback !== "function")
          return err("This deployment can't take submissions. Email contact@maxeds.org instead.");
        return await hooks.recordFeedback(name === "report_correction" ? "correction" : "optin", args);
      }
      default:
        return err(`unknown tool: ${name}`);
    }
  } catch (e) {
    return err(e.message);
  }
}

// --- founder-side tools: check_listing, find_prospects ---------------------
// Data: all-companies.json (the full corpus) and the agent-ready check, both static files;
// prospects come from a bundled snapshot of researched enterprise buyers (hooks.prospects).

const hostOf = (v) => String(v || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[/?#\s]/)[0];
const looksLikeDomain = (v) => /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(hostOf(v));
const normName = (v) => String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
let ALL_CACHE = null;
async function loadAll(fetchJson) {
  if (ALL_CACHE) return ALL_CACHE;
  const raw = await fetchJson("all-companies.json");
  ALL_CACHE = Array.isArray(raw) ? raw : raw.companies || [];
  return ALL_CACHE;
}
let READY_CACHE = null;
async function loadReady(fetchJson) {
  if (READY_CACHE) return READY_CACHE;
  try { READY_CACHE = typeof fetchJson.site === "function" ? (await fetchJson.site("agent-ready.json")).companies || {} : {}; }
  catch { READY_CACHE = {}; }
  return READY_CACHE;
}
async function findCompany(fetchJson, q) {
  const all = await loadAll(fetchJson);
  if (looksLikeDomain(q)) {
    const h = hostOf(q);
    const hit = all.find((c) => hostOf(c.website) === h || hostOf(c.website).endsWith("." + h) || h.endsWith("." + hostOf(c.website)));
    if (hit) return hit;
  }
  const n = normName(q);
  if (!n) return null;
  return all.find((c) => normName(c.name) === n) || all.find((c) => normName(c.name).startsWith(n + " ") || normName(c.slug) === n.replace(/ /g, "")) || null;
}

async function checkListing(args, fetchJson) {
  const q = String(args.company || "").trim().slice(0, 200);
  if (!q) return err("Give a company name or website.");
  const c = await findCompany(fetchJson, q);
  const join = "Not listed yet? SalesBook lists companies with public evidence of selling to enterprises. Request a listing or free help at https://maxeds.org/app/ (by invitation).";
  if (!c) return text(`${q} is not in SalesBook yet.\n\n${join}\nIf you believe it should be listed, use report_correction with a source link.`);
  const ready = (await loadReady(fetchJson))[c.slug] || null;
  const overlay = typeof fetchJson.overlay === "function" ? await fetchJson.overlay(c.slug).catch(() => []) : [];
  const gaps = [];
  if (c.status && c.status !== "published") gaps.push(`Listing status is "${c.status}", so it does not appear in public rankings yet.`);
  if (!c.rank) gaps.push("Not in its sector's top 100. Rank comes from the published method: evidence of enterprise deals, product proof and buyer fit (see get_methodology).");
  if (typeof c.evidenceGrade === "number" && c.evidenceGrade < 60) gaps.push(`Evidence grade ${c.evidenceGrade}: thin public proof. Publish named customer stories, case studies or press with dates.`);
  if (ready && !ready.mcp) gaps.push("No MCP connector, so AI agents can't query the company directly. Publishing one makes it agent-ready.");
  if (ready && !ready.llms) gaps.push("No llms.txt at the site root, so AI assistants get no summary of what the company does.");
  if (!c.website) gaps.push("No website on record.");
  const lines = [
    `${c.name} is listed in SalesBook${c.sector ? ` (${c.sector})` : ""}.`,
    c.rank ? `Rank: #${c.rank} in ${c.sector}.` : "Rank: not ranked in the top 100.",
    typeof c.evidenceGrade === "number" ? `Evidence grade: ${c.evidenceGrade} / 100.` : null,
    ready ? `Agent-ready: MCP connector ${ready.mcp ? "yes" : "no"} · llms.txt ${ready.llms ? "yes" : "no"}.` : null,
    c.website ? `Website: ${c.website}` : null,
    "",
    ...(overlay.length ? ["", "Updated by the company (domain verified):", ...overlay.map((o) => `• ${o.field.replace(/_/g, " ")}: ${o.value} (on ${String(o.updated_at).slice(0, 10)})`)] : []),
    "",
    gaps.length ? "What is holding it back:" : "No obvious gaps in the public record.",
    ...gaps.map((g, i) => `${i + 1}. ${g}`),
    "",
    "Free help: MaxedS fixes these basics free for approved startups (connector, llms.txt, structured data, proof pages). Request it at https://maxeds.org/app/ (by invitation).",
    "Ranks are never for sale: fixing gaps improves your public evidence, which is what the method scores.",
    "Is this your company? Fix a fact yourself with update_listing (we email you a sign-in link to confirm). See something else wrong? Use report_correction. Want enterprise meetings? Try find_prospects, then opt_in_for_intros.",
  ].filter((x) => x !== null);
  return text(lines.join("\n"));
}

const SECTOR_ALIASES = { "financial services": "financial", fintech: "financial", banking: "financial", insurance: "financial", health: "healthcare", hospital: "healthcare", "higher education": "education", university: "education", cpg: "retail", consumer: "retail", industrial: "manufacturing" };
function sectorKey(v) {
  const s = String(v || "").toLowerCase().trim();
  if (!s) return "";
  for (const [k, val] of Object.entries(SECTOR_ALIASES)) if (s.includes(k)) return val;
  return s.split(/[^a-z]/)[0];
}
async function startupBuyers(fetchJson, excludeSlug) {
  const loaded = await Promise.allSettled(SECTORS.map((sec) => loadSector(fetchJson, sec)));
  const out = [], seen = new Set([excludeSlug]);
  loaded.forEach((r, i) => {
    if (r.status !== "fulfilled") return;
    for (const p of r.value) {
      const id = thinIdOf(p);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const desc = [p.oneLiner, fieldText(p.problem), fieldText(p.solution)].filter(Boolean).join(" ").replace(/\s+/g, " ");
      out.push({ name: thinNameOf(p), domain: hostOf(p.website || p.url || ""), sector: SECTORS[i], description: desc.slice(0, 240), summary: desc.slice(240, 700), rank: thinRankOf(p) });
    }
  });
  return out;
}
async function findProspects(args, fetchJson, hooks) {
  const wantStartups = args.buyer_type === "startup";
  let buyers = wantStartups ? [] : (Array.isArray(hooks.prospects) ? hooks.prospects : []);
  if (!wantStartups && !buyers.length) return err("Prospect data is not available in this deployment.");
  let company = null, about = String(args.what_you_sell || "").slice(0, 600), sector = sectorKey(args.sector);
  if (args.company) {
    company = await findCompany(fetchJson, String(args.company).slice(0, 200));
    if (company && !sector) sector = sectorKey(company.sector);
    if (company && !about) {
      try {
        const sec = SECTORS.includes(company.sector) ? company.sector : null;
        const list = sec ? await loadSector(fetchJson, sec) : [];
        const p = list.find((x) => thinIdOf(x) === company.slug);
        if (p) about = [p.oneLiner, fieldText(p.problem), fieldText(p.solution)].filter(Boolean).join(" ").slice(0, 600);
      } catch { /* profile text is optional */ }
    }
  }
  if (!sector && !about) return err("Tell me your company (if listed), what you sell, or your target sector.");
  if (wantStartups) buyers = await startupBuyers(fetchJson, company ? company.slug : null);
  const tokens = [...new Set(tokenize(about).filter((t) => t.length > 3))];
  const scored = buyers.map((b) => {
    const bs = sectorKey(b.sector);
    const hay = `${b.name} ${b.subSector || ""} ${b.innovationProgram || ""} ${b.description || ""} ${b.summary || ""}`.toLowerCase();
    const hits = tokens.filter((t) => hay.includes(t));
    const progBonus = b.innovationProgram ? 2 : 0;
    const portalBonus = b.supplierPortal ? 1 : 0;
    const score = (sector && bs === sector ? 10 : 0) + hits.length * 2 + progBonus + portalBonus + (b.description ? 1 : 0);
    return { b, score, hits, sectorMatch: !!sector && bs === sector };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score || a.b.name.localeCompare(b.b.name));
  const limit = Math.min(Math.max(parseInt(args.limit, 10) || 10, 1), 10);
  const top = scored.slice(0, limit);
  if (!top.length) return text("No good matches in SalesBook's enterprise set yet for that description. Try naming your target sector.");
  const lines = [
    `Top ${top.length} ${wantStartups ? "startup" : "enterprise"} prospects${company ? ` for ${company.name}` : ""}${sector ? ` · sector: ${sector}` : ""}:`,
    ...top.map((x, i) => {
      const why = [
        x.b.subSector ? `${x.b.subSector}${x.b.hq ? ` (${x.b.hq})` : ""}` : (x.sectorMatch ? `${x.b.sector} buyer` : null),
        x.b.innovationProgram ? `Pilot/Innovation Desk: ${x.b.innovationProgram}${x.b.programUrl ? ` (${x.b.programUrl})` : ""}` : null,
        x.b.supplierPortal ? `Supplier Onboarding: ${x.b.supplierPortal}` : null,
        x.hits.length ? `matches ${x.hits.slice(0, 3).join(", ")}` : null,
      ].filter(Boolean).join(" · ");
      return `${i + 1}. ${x.b.name}${x.b.domain ? ` (${x.b.domain})` : ""}${x.b.rank ? ` · SalesBook #${x.b.rank} in ${x.b.sector}` : ""}${why ? ` — ${why}` : ""}`;
    }),
    "",
    "Experimental: fit uses public, company-level signals only; no contact data.",
    "Want dated buying windows (SAP ECC 2027 end-of-support, contract renewals, pilot programs)? Call get_buying_windows. Want meetings? Use opt_in_for_intros with your work email.",
  ];
  return text(lines.join("\n"));
}

async function resolveRichVendor(fetchJson, q) {
  const c = await findCompany(fetchJson, q);
  const readyMap = await loadReady(fetchJson);
  let profile = null;
  const slug = c ? c.slug : normName(q).replace(/ /g, "-");
  try { profile = await findProfile(fetchJson, slug); } catch {}
  if (!profile && c && SECTORS.includes(c.sector)) {
    try {
      const list = await loadSector(fetchJson, c.sector);
      profile = list.find((x) => thinIdOf(x) === c.slug) || null;
    } catch {}
  }
  if (!c && !profile) return { query: q, found: false };
  const id = c?.slug || thinIdOf(profile) || slug;
  const sec = c?.sector || profile?.sector || "horizontal";
  const rank = c?.rank ?? thinRankOf(profile) ?? null;
  const score = (profile?.rankingScore && typeof profile.rankingScore === "object" ? profile.rankingScore[sec] : profile?.score) ?? c?.score ?? null;
  const evidenceGrade = c?.evidenceGrade ?? profile?.evidenceGrade ?? null;
  const ready = readyMap[id] || { mcp: false, llms: false };
  const oneLiner = profile?.oneLiner || c?.oneLiner || oneLinerOf(profile) || fieldText(profile?.problem) || "";
  const tombs = (profile?.tombstones || []).slice(0, 3).map((t) => ({
    tier: t.tier || "T3",
    claim: String(t.verbatimQuote || t.claim || t.value || "").slice(0, 180),
    sourceUrl: t.sourceUrl || null,
  }));
  const bf = profile?.buyerFit?.[sec] || profile?.buyerFit || {};
  const comps = profile?.scoreComponents || profile?.components || {};
  return {
    query: q,
    found: true,
    id,
    name: c?.name || thinNameOf(profile) || q,
    website: c?.website || fieldText(profile?.identity?.website) || profile?.website || null,
    sector: sec,
    rank,
    score: typeof score === "number" ? Number(score.toFixed(1)) : score,
    evidenceGrade,
    agentReady: ready,
    oneLiner: String(oneLiner).replace(/\s+/g, " ").slice(0, 200),
    buyerFitRationale: bf?.rationale ? String(bf.rationale).slice(0, 220) : null,
    components: comps,
    tombstones: tombs,
  };
}

async function compareVendors(args, fetchJson) {
  const inputArr = Array.isArray(args.vendors) ? args.vendors : (Array.isArray(args.companies) ? args.companies : []);
  const rawList = inputArr.map((v) => String(v || "").trim()).filter(Boolean).slice(0, 5);
  if (rawList.length < 2) return err("Pass 2 to 5 vendor names or websites in `vendors` (e.g. ['Glean', 'Notion']).");
  const methodologyVersion = await resolveMethodologyVersion(fetchJson);
  const resolved = await Promise.all(rawList.map((q) => resolveRichVendor(fetchJson, q)));
  const found = resolved.filter((r) => r.found);
  if (!found.length) return text(`None of the requested vendors (${rawList.join(", ")}) were found in SalesBook yet.`);

  const lines = [
    `SalesBook Head-to-Head Enterprise Vendor Comparison (${methodLine(methodologyVersion)})`,
    args.buyer_context ? `Buyer Context: ${String(args.buyer_context).slice(0, 200)}` : null,
    "",
    ...resolved.map((v, i) => {
      if (!v.found) return `${i + 1}. ${v.query} — Not listed in SalesBook yet (use report_correction with a public source to add).`;
      const tombLine = v.tombstones.length
        ? v.tombstones.map((t) => `[${t.tier}] ${t.claim}${t.sourceUrl ? ` (${t.sourceUrl})` : ""}`).join(" | ")
        : "Listed in corpus; call get_tombstones for full deal history.";
      return [
        `${i + 1}. ${v.name} (${v.website || v.id})`,
        `   • Rank & Sector: ${v.rank ? `#${v.rank} in ${v.sector}` : `Indexed in ${v.sector} (unranked)`}`,
        `   • Buyer-Readiness Score: ${v.score ?? "n/a"} · Evidence Grade: ${v.evidenceGrade != null ? `${v.evidenceGrade}/100` : "n/a"}`,
        `   • Agent-Readiness: MCP Connector: ${v.agentReady.mcp ? "YES" : "NO"} · llms.txt: ${v.agentReady.llms ? "YES" : "NO"}`,
        v.oneLiner ? `   • Summary: ${v.oneLiner}` : null,
        v.buyerFitRationale ? `   • Enterprise Fit: ${v.buyerFitRationale}` : null,
        `   • Public Deal Proof: ${tombLine}`,
      ].filter(Boolean).join("\n");
    }),
    "",
  ].filter((x) => x !== null);

  if (found.length >= 2) {
    const byRank = [...found].sort((a, b) => (a.rank || 999) - (b.rank || 999));
    const byEv = [...found].sort((a, b) => (b.evidenceGrade || 0) - (a.evidenceGrade || 0));
    const arWinners = found.filter((x) => x.agentReady.mcp || x.agentReady.llms);
    lines.push("Executive Takeaways:");
    if (byRank[0].rank) lines.push(`• Highest Sector Rank: ${byRank[0].name} (#${byRank[0].rank} in ${byRank[0].sector})`);
    if (byEv[0].evidenceGrade != null) lines.push(`• Strongest Public Evidence Grade: ${byEv[0].name} (${byEv[0].evidenceGrade}/100)`);
    lines.push(`• Agent-Readiness (MCP / llms.txt): ${arWinners.length ? arWinners.map((x) => x.name).join(", ") : "None of the compared vendors publish both an MCP connector and llms.txt yet."}`);
  }
  lines.push("", "Unsponsored: SalesBook rankings are never for sale. Every claim is graded from dated public sources.");
  return text(lines.join("\n"));
}

const GENERIC_B2B_TOKENS = new Set([
  "platform", "platforms", "enterprise", "enterprises", "workflows", "workflow", "software",
  "system", "systems", "company", "companies", "customers", "customer", "people", "million",
  "billion", "global", "solution", "solutions", "service", "services", "professional",
  "founded", "backed", "series", "used", "built", "bought", "across", "teams", "team",
  "business", "businesses", "operations", "automation", "automate", "automates", "agentic",
  "agents", "agent", "assistant", "assistants", "cloud", "modern", "leading", "largest",
  "fortune", "500s", "gives", "large", "industry", "industries", "departments", "department",
  "workers", "worker", "find", "summarize", "work", "firms", "firm", "vault", "Majority", "majority",
]);

async function findAlternatives(args, fetchJson) {
  const q = String(args.company || "").trim().slice(0, 200);
  if (!q) return err("Pass a company name or website in `company`.");
  const target = await resolveRichVendor(fetchJson, q);
  const sector = args.sector && SECTORS.includes(args.sector) ? args.sector : (target.found && SECTORS.includes(target.sector) ? target.sector : null);
  const searchBasis = target.found ? `${target.oneLiner} ${target.buyerFitRationale || ""}`.trim() : q;
  const rawTokens = tokenize(searchBasis).filter((t) => t.length > 2);
  const specificTokens = rawTokens.filter((t) => !GENERIC_B2B_TOKENS.has(t));
  const tokens = specificTokens.length ? specificTokens : rawTokens;
  const wantedSectors = sector ? [sector] : SECTORS;
  const loaded = await Promise.allSettled(wantedSectors.map((sec) => loadSector(fetchJson, sec)));
  const readyMap = await loadReady(fetchJson);
  const allMap = new Map((await loadAll(fetchJson)).map((c) => [c.slug, c]));
  const candidates = [];
  const seen = new Set(target.found ? [target.id] : []);

  loaded.forEach((r, idx) => {
    if (r.status !== "fulfilled") return;
    const sec = wantedSectors[idx];
    for (const p of r.value) {
      const id = thinIdOf(p);
      if (!id || seen.has(id) || normName(thinNameOf(p)) === normName(q)) continue;
      seen.add(id);
      const { matchScore, exactTokens, broadTokens } = tokens.length ? scoreProfile(p, tokens) : { matchScore: 1, exactTokens: 1, broadTokens: 0 };
      if (exactTokens === 0 && broadTokens === 0) continue;
      const sameSectorBonus = target.found && sec === target.sector ? 3 : 0;
      const cMeta = allMap.get(id);
      const rank = thinRankOf(p) ?? cMeta?.rank ?? 999;
      const evGrade = cMeta?.evidenceGrade ?? p?.evidenceGrade ?? null;
      const ready = readyMap[id] || { mcp: false, llms: false };
      candidates.push({
        id,
        name: thinNameOf(p),
        sector: sec,
        rank,
        evidenceGrade: evGrade,
        agentReady: ready,
        website: cMeta?.website || p?.website || p?.url || null,
        oneLiner: ((p?.oneLiner || oneLinerOf(p) || fieldText(p.problem)) || "").replace(/\s+/g, " ").slice(0, 160),
        relevance: matchScore * 12 + exactTokens * 15 + broadTokens * 6 + sameSectorBonus + Math.max(0, 100 - rank) * 0.08,
      });
    }
  });

  candidates.sort((a, b) => b.relevance - a.relevance || a.rank - b.rank);
  const limit = Math.min(Math.max(parseInt(args.limit, 10) || 5, 1), 15);
  const top = candidates.slice(0, limit);
  const methodologyVersion = await resolveMethodologyVersion(fetchJson);
  if (!top.length) return text(`No ranked enterprise alternatives found for "${q}". Try search_startups with a broader problem keyword.`);

  const header = target.found
    ? `Top ${top.length} Enterprise-Ready Alternatives to ${target.name} (${target.rank ? `#${target.rank}` : "Indexed"} in ${target.sector}${target.evidenceGrade != null ? `, Evidence Grade ${target.evidenceGrade}/100` : ""}):`
    : `Top ${top.length} Enterprise-Ready Alternatives matching "${q}":`;

  const lines = [
    header,
    "",
    ...top.map((c, i) => {
      const delta = target.found && target.rank && c.rank < 999
        ? (c.rank < target.rank ? `ranks ${target.rank - c.rank} spots higher than ${target.name}` : `ranks #${c.rank} vs ${target.name} #${target.rank}`)
        : `Rank #${c.rank}`;
      return `${i + 1}. ${c.name} (${c.sector} #${c.rank}${c.evidenceGrade != null ? ` · Evidence ${c.evidenceGrade}/100` : ""} · ${delta})${c.website ? ` · ${c.website}` : ""}\n   ${c.oneLiner || "Enterprise vendor in SalesBook"} · Agent-ready: MCP ${c.agentReady.mcp ? "yes" : "no"}, llms.txt ${c.agentReady.llms ? "yes" : "no"} · id: ${c.id}`;
    }),
    "",
    `Tip: Call compare_vendors with ${JSON.stringify([target.found ? target.name : q, top[0].name])} for a full side-by-side buyer breakdown. (${methodLine(methodologyVersion)})`,
  ];
  return text(lines.join("\n"));
}

const MACRO_WINDOWS = [
  {
    id: "sap-ecc-2027",
    type: "end_of_support",
    sectors: ["manufacturing", "retail", "horizontal"],
    title: "SAP ECC 6.0 Mainstream Support Sunset (Dec 2027)",
    deadline: "2027-12-31 (Extended maintenance +2% fee through 2030)",
    trigger: "Fortune 500 manufacturing & retail CIOs migrating off legacy SAP ECC to S/4HANA or composable AI/ERP layers.",
    opens_for: "ERP migration automation, autonomous QA/testing (e.g. BrowserStack/Tricentis alternatives), supply-chain AI, master-data cleansing, and finance workflow agents.",
    source: "https://support.sap.com/en/offerings-programs/strategy.html",
  },
  {
    id: "vmware-broadcom-2026",
    type: "end_of_support",
    sectors: ["horizontal", "manufacturing", "retail", "healthcare"],
    title: "VMware / Broadcom Multi-Year Enterprise ELA Renewal Cliff (2026–2027)",
    deadline: "Rolling 2026–2027 3-year ELA expirations",
    trigger: "2x–5x bundle price increases driving F1000 infrastructure & FinOps teams to re-architect workloads to Kubernetes, bare-metal AI cloud, and automated cloud cost governance.",
    opens_for: "Cloud FinOps, Kubernetes orchestration, autonomous DevOps/SRE agents, and infrastructure security.",
    source: "https://www.broadcom.com/info/vmware",
  },
  {
    id: "cms-prior-auth-fhir-2026",
    type: "end_of_support",
    sectors: ["healthcare"],
    title: "CMS Interoperability & Prior Authorization Final Rule (CMS-0057-F)",
    deadline: "2026-01-01 (operational reporting) & 2027-01-01 (FHIR API compliance)",
    trigger: "Mandates 72-hour urgent / 7-day standard prior authorization turnaround and HL7 FHIR Prior Authorization APIs across Medicare Advantage, Medicaid, and health systems.",
    opens_for: "Autonomous prior-authorization AI, clinical documentation/ambient scribes, revenue-cycle management (RCM), and payer-provider FHIR pipes.",
    source: "https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f",
  },
  {
    id: "it-bpo-recompete-2026",
    type: "contract_renewal",
    sectors: ["horizontal", "retail", "manufacturing", "healthcare", "education"],
    title: "5-Year Post-2021 Enterprise IT/BPO Outsourcing Recompete Wave (2026–2027)",
    deadline: "2026 Q3 – 2027 Q4",
    trigger: "Large 5-year digital transformation & BPO contracts signed during the 2021–2022 boom are reaching end-of-term; CIOs are replacing headcount-heavy BPO SLAs with agentic AI workflows.",
    opens_for: "Customer support automation, IT service desk AI, contract intelligence, procurement orchestration, and autonomous QA.",
    source: "https://usaspending.gov",
  },
  {
    id: "physical-ai-industrial-2026",
    type: "innovation_pilot",
    sectors: ["manufacturing", "retail"],
    title: "Warehouse, Fleet & Plant Physical-AI Safety / Vision Upgrades (2026–2027)",
    deadline: "Active 2026–2027 capex cycle",
    trigger: "Distribution centers and plants deploying computer vision, autonomous mobile robots (AMRs), and connected-fleet cybersecurity on existing CCTV/OT infrastructure.",
    opens_for: "Video analytics on existing cameras, warehouse robotics, predictive maintenance, and connected-vehicle/OT security.",
    source: "https://aboutamazon.com/news/innovation-at-amazon/introducing-the-1-billion-amazon-industrial-innovation-fund",
  },
];

async function getBuyingWindows(args, fetchJson, hooks) {
  const sec = sectorKey(args.sector);
  const wType = String(args.window_type || "all").toLowerCase();
  const q = String(args.query || "").trim().toLowerCase();
  const limit = Math.min(Math.max(parseInt(args.limit, 10) || 10, 1), 25);

  const macroMatches = MACRO_WINDOWS.filter((w) => {
    if (wType !== "all" && w.type !== wType && !(wType === "innovation_pilot" && w.type === "end_of_support")) return false;
    if (sec && !w.sectors.includes(sec)) return false;
    if (q && !`${w.title} ${w.trigger} ${w.opens_for}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const buyers = Array.isArray(hooks.prospects) ? hooks.prospects : [];
  const buyerMatches = buyers.filter((b) => {
    const hasProg = !!b.innovationProgram;
    const hasPortal = !!b.supplierPortal;
    if (!hasProg && !hasPortal) return false;
    if (wType === "innovation_pilot" && !hasProg) return false;
    if (wType === "supplier_portal" && !hasPortal) return false;
    if (sec && sectorKey(b.sector) !== sec) return false;
    if (q) {
      const hay = `${b.name} ${b.domain} ${b.subSector || ""} ${b.innovationProgram || ""} ${b.description || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).slice(0, limit);

  const lines = [
    `SalesBook "Why Now" Enterprise Buying Windows & Global 2000 Pilot Desks${sec ? ` (Sector: ${sec})` : ""}:`,
    "",
  ];

  if (macroMatches.length && wType !== "supplier_portal") {
    lines.push("=== 1. Dated Macro Enterprise Buying Windows (2026–2027) ===");
    for (const w of macroMatches) {
      lines.push(
        `• ${w.title} [${w.type.toUpperCase()}]`,
        `  Window / Deadline: ${w.deadline}`,
        `  Why Now: ${w.trigger}`,
        `  Opens Demand For: ${w.opens_for}`,
        `  Public Source: ${w.source}`
      );
    }
    lines.push("");
  }

  lines.push(`=== 2. Global 2000 Accounts with Active Startup Pilot Programs & Supplier Portals (${buyerMatches.length} shown) ===`);
  if (!buyerMatches.length) {
    lines.push("No matching G2K accounts for that filter. Try omitting `query` or `window_type`.");
  } else {
    buyerMatches.forEach((b, i) => {
      const parts = [
        `${i + 1}. ${b.name} (${b.domain}) — ${b.sector}${b.subSector ? ` / ${b.subSector}` : ""}${b.hq ? ` · HQ: ${b.hq}` : ""}`,
        b.innovationProgram ? `   • Startup Pilot / Venture-Client Desk: ${b.innovationProgram}${b.programUrl ? ` → ${b.programUrl}` : ""}` : null,
        b.supplierPortal ? `   • Procurement / Supplier Onboarding Portal: ${b.supplierPortal}` : null,
        `   • Buyer Agent-Readiness: MCP ${b.mcp ? "yes" : "no"} · llms.txt ${b.llms ? "yes" : "no"}`,
      ].filter(Boolean);
      lines.push(...parts);
    });
  }

  lines.push(
    "",
    "How to act on a window: Use `find_prospects` to rank buyers for your startup, or `opt_in_for_intros` to opt into MaxedS double-opt-in executive review cycles (zero cold outreach)."
  );
  return text(lines.join("\n"));
}

// --- buyer-side helpers -------------------------------------------------

// Short, evidence-grounded fit reasoning. Never invents; attributes.
function whyFit(p, sector, matchedAreas, buyer_org) {
  const bits = [];
  const bf = p?.buyerFit?.[sector];
  if (bf?.rationale) bits.push(`Buyer-fit scored ${bf.score ?? "n/a"}: ${String(bf.rationale).slice(0, 220)}`);
  if (matchedAreas.length)
    bits.push(`Matches stated focus: ${matchedAreas.join("; ")} (found in profile text).`);
  const stage = p?.stage?.badge?.value;
  if (stage) bits.push(`Stage: ${stage}.`);
  const ask = p?.ask?.category?.value;
  if (ask) bits.push(`Open to: ${ask}.`);
  if (!bits.length)
    bits.push(`Ranked #${p.salesbookRank ?? "?"} in ${sector} on public evidence; no buyer-specific rationale on file.`);
  return bits.join(" ");
}

// The 9-slide standard, mapped from profile fields. Every slide keeps its
// source + confidence; derived content is labeled derived.
function buildDossier(profile, buyer_org, buyer_focus_areas, methodologyVersion) {
  const id = slugOf(profile);
  const name = nameOf(profile);
  const ident = profile.identity || {};
  const val = (f) => fieldText(f);
  const conf = (f) => (f && (f.confidence || f.source)) ? { source: f.source || null, sourceUrl: f.sourceUrl || null, confidence: f.confidence || null } : null;
  const slides = [
    {
      n: 1, title: "Cover",
      body: {
        name,
        oneLiner: val(ident.oneLiner),
        website: val(ident.website),
        founded: val(ident.foundedYear),
        stageBadge: val(ident.stageBadge) || val(profile?.stage?.badge),
        hq: val(ident.hq),
      },
      provenance: conf(ident.name),
    },
    {
      n: 2, title: "Problem",
      body: { problem: val(profile.problem) },
      provenance: conf(profile.problem),
    },
    {
      n: 3, title: "Solution",
      body: { solution: profile?.solution?.text ? val(profile.solution.text) : val(profile.solution) },
      provenance: conf(profile?.solution?.text || profile.solution),
    },
    {
      n: 4, title: "Competition — honest",
      body: {
        alternatives: (profile?.competition?.alternatives || []).map((a) => ({
          name: val(a),
          confidence: a?.confidence || null,
          attested: !!a?.attested,
        })),
        differentiator: val(profile.differentiator),
      },
      provenance: conf(profile.competition),
      honesty: "Alternatives below 'low' confidence are analyst inference, not founder claims.",
    },
    {
      n: 5, title: "Stage — with proof",
      body: {
        stage: val(profile?.stage?.badge),
        tombstones: (profile.tombstones || []).map((t) => ({
          tier: t.tier,
          claim: t.verbatimQuote || t.claim,
          sourceUrl: t.sourceUrl,
        })),
      },
      provenance: conf(profile?.stage?.badge),
      honesty: "Tombstones are dated, sourced public claims (T1 contract/rollout → T4 logo wall). Default: claimed-unverified unless marked corroborated.",
    },
    buyerRelevanceSlide(profile, buyer_org, buyer_focus_areas),
    {
      n: 7, title: "The Ask",
      body: { ask: val(profile?.ask?.category) },
      provenance: conf(profile?.ask?.category),
    },
    {
      n: 8, title: "Team",
      body: {
        founders: (profile?.team?.founders || []).map((f) => ({
          name: f?.name,
          bio: val(f?.bio),
        })),
      },
      provenance: null,
    },
    {
      n: 9, title: "Contact + 90-day milestone",
      body: {
        milestone90d: val(profile.milestone90d),
        website: val(ident.website),
      },
      provenance: conf(profile.milestone90d),
      honesty: "'Awaiting founder declaration' means the founder has not set one — not that none exists.",
    },
  ];
  return {
    startup_id: id,
    name,
    public_rank: profile.salesbookRank ?? null,
    methodologyVersion,
    period: PERIOD,
    slides,
    honesty:
      "AI-researched from public sources. Low-confidence fields are marked; founders review and correct them. Nothing here is a meeting booking.",
  };
}

function buyerRelevanceSlide(profile, buyer_org, buyer_focus_areas) {
  const secs = ["retail", "healthcare", "horizontal"].filter(
    (s) => profile?.buyerFit?.[s]
  );
  const fits = secs.map((s) => ({
    sector: s,
    score: profile.buyerFit[s]?.score ?? null,
    rationale: profile.buyerFit[s]?.rationale || null,
  }));
  const hay = profileHaystack(profile);
  const matched = (buyer_focus_areas || []).filter((a) =>
    expandQuery(String(a).toLowerCase()).some((alt) => hay.includes(alt))
  );
  return {
    n: 6,
    title: "Buyer relevance",
    derived: true,
    body: {
      buyer_org: buyer_org || null,
      buyer_focus_areas: buyer_focus_areas || [],
      matched_focus_areas: matched,
      sector_fit: fits,
      relevance:
        matched.length && buyer_org
          ? `For ${buyer_org}: profile text matches stated focus (${matched.join("; ")}). ` +
            (fits[0]?.rationale ? `Public buyer-fit rationale: ${String(fits[0].rationale).slice(0, 240)}` : "")
          : buyer_org
            ? `For ${buyer_org}: no stated focus areas matched in profile text. Sector fit scores above are the public baseline.`
            : "No buyer context given — sector fit scores are the public baseline. Pass buyer_org + buyer_focus_areas for a tailored read.",
    },
    provenance: null,
    honesty: "DERIVED — computed from the public profile at call time, not a founder claim.",
  };
}
