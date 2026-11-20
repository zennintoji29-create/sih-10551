# AegisRisk AI (Continuum SIH26105) — Complete Project Handover & Context Document
> **Confidential & Comprehensive Handover Document**  
> **Prepared for:** Google Antigravity Engineering Agent  
> **Workspace Root:** `/Users/subhadip/Documents/Code/sih105` (Main app in `crq-platform/`)  
> **GitHub Repository:** `https://github.com/zennintoji29-create/sih-10551.git` (Branch: `main`)  
> **Last Verified Git Commit:** `0a01c9c`  
---
## Table of Contents
- Step 1 — Project Overview & Environment
- Step 2 — Feature Implementation Status Matrix
- Step 3 — Original Project Goal & User Journey
- Step 4 — Technical Architecture Map
- Step 5 — Repository File & Folder Map
- Step 6 — Critical Architectural & Design Decisions
- Step 7 — Current State Snapshot
- Step 8 — Prioritized Next Steps (P0 / P1 / P2)
- Step 9 — "Continue From Here" Agent Instructions
- Step 10 — Compact Antigravity Project Memory
- Step 11 — Single Copy-Paste Handover Prompt
---
## Step 1 — Project Overview & Environment
### 1.1 What the Project Is
AegisRisk AI (codename Continuum) is an enterprise Continuous Cyber Risk Quantification (CRQ) and Return on Security Investment (ROSI) Optimization Platform developed for the Smart India Hackathon (Problem Statement SIH26105).
The platform replaces subjective, qualitative "High/Medium/Low" heatmaps with mathematical OpenFAIR (Factor Analysis of Information Risk) calculations, Monte Carlo simulations, and real-time loss forecasting in actual currency ($ USD / ₹ INR). It ingests security scanner telemetry (GitHub Dependabot, Secret Scanning, SAST, SIEM, Tenable/Wiz), computes financial loss exposure (Expected Annual Loss / EAL and 95% Value-at-Risk / VaR), and models systemic Nth-party supply chain blast radii.

### 1.2 Technology Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React icons, Recharts data visualization library.
- **Backend**: Node.js, Express, TypeScript, Helmet, CORS, Pino HTTP logging, JSON Web Tokens (JWT), Crypto.
- **Math & Statistical Engines**:
  - `fair.ts`: Pure mathematical OpenFAIR implementation (`EAL = LEF × PLM`) with AI-threat amplification factors.
  - `var.ts`: 10,000-trial Monte Carlo VaR simulator with fat-tail jump modeling.
  - `rosi.ts`: Return on Security Investment calculator with confidence intervals and Nth-party vendor accumulation risk.
- **Database Layer**:
  - `schema.sql`: Multi-tenant PostgreSQL schema with tables for organizations, users, assets, findings, telemetry logs, FAIR snapshots, vendor dependencies, and cryptographic audit logs.
  - `store.ts`: High-performance in-memory state repository implementing full transactional CRUD, seeded with calibrated enterprise benchmark data (ACME Global Financial Services, $27.3M baseline loss) and automatic OpenFAIR recalculation triggers.

### 1.3 Running Services & Ports
- **Frontend Server**: `http://localhost:3000` (Next.js App Router)
  - Run command: `npm run dev` inside `crq-platform/frontend`
  - Production build: `npm run build` (Verified: 8/8 routes compiled)
- **Backend API**: `http://localhost:4000` (Express REST API)
  - Run command: `npm run dev` inside `crq-platform/backend`
  - Health check: `http://localhost:4000/health` (`{"status":"ok","service":"crq-backend"}`)
- **Diagnostics Script**: `scratch/test_diagnostics.mjs` executes full end-to-end audit of all web routes, APIs, auth personas, and Monte Carlo calculations.

### 1.4 Environment Configuration
> **Note**: Never expose secrets. The following environment variables are referenced:
- Backend (`backend/.env`):
  - `PORT`: `4000`
  - `CORS_ORIGIN`: `http://localhost:3000`
  - `JWT_SECRET`: Secret key for signing bearer tokens.
  - `DATABASE_URL`: PostgreSQL connection string (optional in demo/in-memory store mode).
- Frontend (`frontend/.env.local`):
  - `NEXT_PUBLIC_API_URL`: `http://localhost:4000`

---
## Step 2 — Feature Implementation Status Matrix
| Feature / Capability | Implementation Location | Status | Description & Operational State |
| :--- | :--- | :--- | :--- |
| OpenFAIR Calculation Engine | `backend/src/engine/fair.ts` | Fully Implemented | Decomposes Threat Event Frequency (TEF), Vulnerability, Control Effectiveness, and Primary/Secondary Loss to output exact EAL. Tested in `fair.test.ts` (16 passing). |
| Monte Carlo VaR Simulation | `backend/src/engine/var.ts` | Fully Implemented | Generates 10,000 statistical trials with EVT fat-tail jump distribution to output 95% and 99% Value-at-Risk. Latency < 15ms. |
| ROSI & Budget Optimization | `backend/src/engine/rosi.ts` | Fully Implemented | Computes `(Net Risk Reduction - Cost) / Cost` with lower/upper confidence bounds. Includes vendor concentration accumulation modeling. |
| Multi-Tenant Seeded Data Store | `backend/src/db/store.ts` | Fully Implemented | Holds organizations, assets, 5 active CVE findings, 6-month historical trend line, telemetry logs, and immutable audit logs. Recalculates on mutation. |
| Strict 1-to-1 Role Isolation (RBAC) | `backend/src/routes/auth.ts`, `frontend/app/dashboard/page.tsx` | Fully Implemented | 4 distinct enterprise personas (`ciso`, `analyst`, `auditor`, `admin`). When logged in as CISO, Admin and Analyst tabs are completely removed from DOM and restricted on API. |
| Dedicated Interactive Demo Sandbox | `frontend/app/demo/page.tsx` | Fully Implemented | `/demo` route featuring live What-If sliders, 4-pillar incident breakdown, system topology data sheet explainer, and role isolation guide. |
| Ultra-Clean Corporate Login | `frontend/app/login/page.tsx` | Fully Implemented | Minimalist corporate login with email & password only. Intelligent backend routing (e.g. `ciso@acme-fin.com` routes directly to CISO Cockpit). |
| Streamlined Landing Page | `frontend/app/page.tsx` | Fully Implemented | Executive hero, OpenFAIR capability overview, regulatory compliance metrics, and direct CTAs to `/demo` and `/login`. |
| Historical Financial Trend Chart | `frontend/app/dashboard/page.tsx` | Fully Implemented | AreaChart displaying EAL and 95% VaR over 6 months with 4 clickable incident pins (Alert, Failure, Log, Fix). Zero repetitive sliding animation. |
| Static Recharts Tooltip Override | `frontend/app/globals.css`, `frontend/app/dashboard/page.tsx` | Fully Implemented | CSS rules eliminate `.recharts-tooltip-wrapper` transitions. Chart renders instant static tooltips on hover and modal triggers on click. |
| 4-Pillar Incident & Forensic Modal | `frontend/app/dashboard/page.tsx` | Fully Implemented | Full modal with 4 interactive forensic modes: System Failure Blast Radius, Threat Vector Map, SIEM Log Infiltration Trace, and Solution Simulation. |
| System Telemetry & Architecture Graph | `frontend/app/dashboard/page.tsx` | Fully Implemented | Interactive 6-tier node topology visualizer (GitHub Repos → Bastion Ingress → Okta IAM → K8s Cluster → PostgreSQL DB → S3 Cold Vault). |
| GitHub Telemetry Ingestion Connector | `frontend/app/dashboard/page.tsx`, `backend/src/routes/connectors.ts` | Fully Implemented | 1-Click test ingestion button uploading Dependabot, Secret Leak, and CodeQL findings directly into OpenFAIR risk portfolio. |
| SEC Form 8-K & DORA Assurance | `backend/src/routes/risk.ts`, `frontend/app/dashboard/page.tsx` | Fully Implemented | Quantitative evaluation of materiality threshold ($1M / 10% operating income). Read-only cryptographic audit logs for Auditors. |
| PostgreSQL Live DB Driver | `backend/src/db/schema.sql` | Partially Implemented | Schema is complete. Backend currently operates against the in-memory transactional store (`store.ts`) for zero-dependency instant spinup. |
| Real GitHub REST Webhook Listener | `backend/src/routes/connectors.ts` | Partially Implemented | Connector supports CSV upload and manual ingestion; live OAuth2 webhook receiver endpoint is stubbed. |

---
## Step 3 — Original Project Goal & User Journey
### 3.1 Problem Statement (SIH26105)
Enterprise CISOs and boards struggle to answer: "What is our financial loss exposure if attacked today, and which security investment saves the most money per dollar spent?"
Existing solutions provide subjective "High/Medium/Low" heatmaps that cannot be audited or justified to CFOs, board members, or regulators (SEC Form 8-K, EU DORA).

### 3.2 Solution Architecture
AegisRisk AI introduces continuous quantification:
1. Telemetry Ingestion: Gathers live CVEs, SIEM incidents, GitHub security data sheets, and asset inventories.
2. OpenFAIR Quant Engine: Calculates Threat Event Frequency (TEF), Contact Frequency, Vulnerability, and Primary/Secondary Loss Magnitude.
3. Monte Carlo VaR: Simulates 10,000 risk trials to determine Expected Annual Loss ($) and 95% Value-at-Risk ($).
4. Separation of Duties (RBAC):
   - **CISO**: Strategic risk curve, What-If capital allocation, and model assurance.
   - **Security Analyst**: CVE queue prioritized strictly by dollar loss rather than technical CVSS alone.
   - **Compliance Auditor**: Cryptographic read-only ledger of model changes and SEC 8-K materiality reports.
   - **Tenant Administrator**: Organization provisioning, API connectors, and RBAC management.

---
## Step 4 — Technical Architecture Map
```
                          [ Client Browser ]
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
    Landing Page           Interactive Demo          Corporate Login
       (` / `)                (` /demo `)             (` /login `)
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
                    Authenticated Role Dashboard
                          (` /dashboard `)
                                  │
             ┌────────────────────┼────────────────────┐
             ▼                    ▼                    ▼
       [CISO View]          [Analyst View]       [Auditor View]
     Executive Cockpit     Triage Queue & KEV   Audit Logs & SEC 8-K
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  │
                                  ▼ (HTTP REST with Bearer JWT)
                 [ Express Backend API (Port 4000) ]
                   │              │              │
                   ▼              ▼              ▼
              `/api/auth`   `/api/risk`   `/api/connectors`
                   │              │              │
         ┌─────────┴──────────────┼──────────────┴─────────┐
         ▼                        ▼                        ▼
   [ Auth Router ]          [ OpenFAIR Engine ]      [ Connectors ]
   - Token creation         - `fair.ts` (EAL)        - GitHub SCA/SAST
   - Role resolution        - `var.ts` (Monte Carlo) - SIEM manual TEF
   - Role enforcement       - `rosi.ts` (ROSI/SPoF)  - Sample switch
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
               [ Transactional In-Memory Store / DB ]
                    - Organizations & Users
                    - Assets ($27.3M baseline)
                    - Active Findings (CVEs)
                    - 6-Month Trend & Audit Ledger
                    - (Mirrored to `schema.sql`)
```

---
## Step 5 — Repository File & Folder Map
```
sih105/
├── README.md                           <- Root repository marker
├── PROJECT_HANDOVER.md                 <- THIS COMPLETE HANDOVER DOCUMENT
├── package.json                        <- Root convenience scripts
├── crq-platform/                       <- PRIMARY ACTIVE APPLICATION
│   ├── README.md                       <- Architecture overview & roadmap
│   ├── backend/                        <- Express API & Risk Calculation Engine
│   │   ├── package.json                <- Backend dependencies & scripts
│   │   ├── tsconfig.json               <- TypeScript configuration
│   │   └── src/
│   │       ├── index.ts                <- Express app entrypoint, Helmet, CORS (Port 4000)
│   │       ├── engine/
│   │       │   ├── fair.ts             <- OpenFAIR mathematical decomposition (EAL = LEF × PLM)
│   │       │   ├── fair.test.ts        <- 16 automated unit tests validating OpenFAIR & ROSI
│   │       │   ├── var.ts              <- 10,000-trial Monte Carlo VaR simulator
│   │       │   ├── rosi.ts             <- ROSI optimizer & Nth-party SPoF accumulation
│   │       │   └── ingestion.ts        <- Telemetry parsing and confidence scoring
│   │       ├── routes/
│   │       │   ├── auth.ts             <- Corporate login, JWT generation & role resolution
│   │       │   ├── risk.ts             <- EAL, VaR, ROSI simulation, SEC 8-K & audit endpoints
│   │       │   └── connectors.ts       <- GitHub CSV ingestion, SIEM TEF calculation, sample switch
│   │       └── db/
│   │           ├── schema.sql          <- Multi-tenant PostgreSQL DDL schema
│   │           └── store.ts            <- High-speed in-memory store with seeded benchmark assets
│   └── frontend/                       <- Next.js 14 App Router User Interface
│       ├── package.json                <- Frontend dependencies (Next 14, Tailwind, Lucide, Recharts)
│       ├── tailwind.config.ts          <- Design system & color tokens
│       ├── next.config.mjs             <- Next.js configuration
│       ├── lib/
│       │   └── api.ts                  <- Type-safe HTTP client wrapping all backend endpoints
│       └── app/
│           ├── layout.tsx              <- Root layout with metadata and styling
│           ├── globals.css             <- Color tokens and .recharts-tooltip-wrapper animation kill
│           ├── page.tsx                <- Executive SaaS Landing Page with CTAs
│           ├── demo/
│           │   └── page.tsx            <- Dedicated interactive sandbox & OpenFAIR explainer
│           ├── login/
│           │   └── page.tsx            <- Ultra-clean corporate login (no demo clutter)
│           ├── signup/
│           │   └── page.tsx            <- Multi-plan tenant registration & provisioning
│           └── dashboard/
│               └── page.tsx            <- Role-isolated enterprise cockpit (CISO, Analyst, Auditor, Admin)
```

---
## Step 6 — Critical Architectural & Design Decisions
### 6.1 The 4-Tone Design Palette
- Canvas / Background: `#E3FDFD` (Soft ice canvas)
- Surface / Card: `#CBF1F5` (Frosted accent surfaces)
- Border / Outline: `#A6E3E9` (Clean structural borders)
- Primary / Action: `#71C9CE` (High-contrast interactive teal)
- Text & Contrast Dark: `#0C262D` / `#083344` (Deep navy ink)
- Critical Risk: `#E11D48` / `#BE123C` (Rose/crimson alert)

### 6.2 Elimination of Recharts Tooltip Animation
- **Decision**: In `frontend/app/globals.css`, the `.recharts-tooltip-wrapper` has `transition: none !important; animation: none !important;`.  
- **Rationale**: Recharts injects a CSS sliding transition causing tooltips to float and lag across curves. The CSS override combined with `<Tooltip isAnimationActive={false} animationDuration={0} cursor={false} />` guarantees static rendering with click-to-inspect popouts.

### 6.3 Strict 1-to-1 Role Isolation
- **CISO** (`ciso@acme-fin.com`): Only sees Executive Cockpit, What-If ROSI, and Model Assurance.
- **Analyst** (`analyst@acme-fin.com`): Only sees Vulnerability Triage Queue and Telemetry Ingestion.
- **Auditor** (`auditor@acme-fin.com`): Only sees SEC 8-K Materiality and Cryptographic Audit Logs (write actions blocked with HTTP 403).
- **Admin** (`admin@acme-fin.com`): Only sees Tenant RBAC and Connector Configuration.

### 6.4 Clean Login vs. Dedicated `/demo` Route
- The login page (`/login`) is kept 100% minimalist with only Work Email and Password inputs. All interactive explainers, What-If sliders, and incident breakdowns live at `/demo`.

---
## Step 7 — Current State Snapshot
- Full compilation of Next.js frontend and Express backend.
- Pure TypeScript OpenFAIR mathematical engine & Monte Carlo simulator passing all unit tests.
- Static Recharts tooltips with click incident popouts.
- 4-Pillar Incident & Forensics modal.
- Node topology visualizer.
- GitHub Security Telemetry data sheet ingestion.
- Remote Git repository synchronized on branch `main` at `https://github.com/zennintoji29-create/sih-10551.git`.

---
## Step 8 — Prioritized Next Steps (P0 / P1 / P2)
- **P0 — PostgreSQL Adapter Activation**: Allow `backend/src/db/store.ts` to optionally persist records to a live PostgreSQL database when `DATABASE_URL` is supplied in `.env`.
- **P1 — Live GitHub App OAuth & Webhook Receiver**: Receive real-time `dependabot_alert` and `secret_scanning_alert` webhooks.
- **P1 — SEC Form 8-K PDF Exporter**: 1-click "Export Form 8-K Item 1.05 Disclosure" button in Auditor view.
- **P2 — Nth-Party Supply Chain Interactive Graph**: Expand 6-tier system topology map into an interactive force-directed graph showing vendor concentration risks.

---
## Step 9 — Default Logins
- **CISO**: `ciso@acme-fin.com` / `admin123`
- **Security Analyst**: `analyst@acme-fin.com` / `admin123`
- **Compliance Auditor**: `auditor@acme-fin.com` / `admin123`
- **Administrator**: `admin@acme-fin.com` / `admin123`
