# Continuum — SIH26105 CRQ Platform (Phase 1 scaffold)

AI-Powered Continuous Cyber Risk Quantification & Investment Optimization.
This is the **Phase 1 (Weeks 1–4) foundation** from your dossier's own
20-week roadmap: a working FAIR risk engine + API + Executive Cockpit UI —
built as real, tested code, not a mock.

## What's actually working right now

- **`backend/src/engine/fair.ts`** — FAIR decomposition: `EAL = LEF × PLM`,
  with an AI-amplification multiplier on TEF (dossier §10) and per-driver
  change attribution (dossier §12, "what changed and why").
- **`backend/src/engine/var.ts`** — Monte Carlo VaR with a fat-tail jump
  component, standing in for the ML+EVT hybrid until real loss-history
  data is available to fit a GEV/GPD model.
- **`backend/src/engine/rosi.ts`** — ROSI with confidence intervals, plus
  accumulation-risk modeling for third-party SPoF (correlated vendors
  raise combined VaR instead of summing independent EALs — dossier §11).
- **`backend/src/engine/fair.test.ts`** — 6 passing unit tests, including
  one that reproduces the dossier's own worked example (150% ROSI). Run
  with `npm test` inside `backend/`.
- **`backend/src/routes/risk.ts` + `index.ts`** — Express API exposing
  `/api/risk/eal`, `/var`, `/rosi`, `/third-party`, `/attribution`.
- **`backend/src/db/schema.sql`** — multi-tenant Postgres schema (orgs,
  users with role-based access, assets, telemetry, FAIR snapshots,
  vendors, controls, change attributions).
- **`frontend/app/page.tsx`** — marketing landing page.
- **`frontend/app/dashboard/page.tsx`** — Executive Cockpit showing EAL,
  VaR, ROSI, and a "what changed today" attribution card.

## Running it

```bash
# Backend
cd backend
npm install
cp .env.example .env          # set DATABASE_URL, JWT_SECRET
psql $DATABASE_URL -f src/db/schema.sql
npm run dev                    # http://localhost:4000

# Frontend
cd frontend
npm install
npm run dev                    # http://localhost:3000
```

## What's deliberately NOT built yet (and why)

This scaffold is Phase 1 only. Building all five phases in one pass would
mean shallow, unverified code across the whole stack — worse than a solid
foundation. The next phases, in the order your dossier prioritizes them:

| Phase | Weeks | What it adds |
|---|---|---|
| 2 — Continuous quantification | 5–8 | SIEM/vuln-scanner streaming connectors, daily model retraining, change-attribution alerts |
| 3 — Third-party risk | 9–16 | Vendor data-footprinting (WHOIS/DNS/SSL), dependency-graph discovery, live SPoF detection |
| 4 — Explainability + AI threats | 13–18 | SHAP/LIME-style attribution on any ML sub-component, CVE→OC-tier mapping |
| 5 — ROSI optimization | 16–20 | Scenario-testing engine, post-deployment tracking, budget-allocation solver |

Auth (JWT + MFA), the role-based workspaces (Admin/CISO/Analyst/Auditor
from your flow diagram), and the onboarding wizard are stubbed at the
schema level (`users.role`, `organizations.plan`) but have no UI yet —
that's the natural next slice once you confirm this foundation is the
direction you want.

## Design note

The UI here is a minimal, functional shell so the engine has somewhere to
render. For the actual visual design system (typography, color, layout
patterns across all screens in your flow diagram), use the Google Stitch
prompt provided separately — paste its output's design language into
`tailwind.config.ts` and the component library, rather than rebuilding
the screens from scratch.
