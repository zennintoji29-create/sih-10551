-- SIH26105 CRQ Platform — multi-tenant schema
-- Each organization's data is isolated via org_id + row-level policies.

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'ciso', 'analyst', 'auditor')),
  mfa_secret TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  criticality NUMERIC(3,2) NOT NULL DEFAULT 0.5 CHECK (criticality BETWEEN 0 AND 1),
  owner TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('siem', 'vuln_scanner', 'threat_intel', 'asset_inventory')),
  severity NUMERIC(3,2),
  confidence NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fair_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  tef NUMERIC NOT NULL,
  vulnerability NUMERIC NOT NULL,
  control_effectiveness NUMERIC NOT NULL,
  ai_amplification_factor NUMERIC NOT NULL DEFAULT 1,
  direct_costs NUMERIC NOT NULL,
  indirect_costs NUMERIC NOT NULL,
  regulatory_costs NUMERIC NOT NULL,
  lef NUMERIC NOT NULL,
  plm NUMERIC NOT NULL,
  eal NUMERIC NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_fair_snapshots_org_time ON fair_snapshots (org_id, computed_at DESC);

CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  eal_contribution NUMERIC NOT NULL DEFAULT 0,
  shared_dependency_group TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cost NUMERIC NOT NULL,
  predicted_mitigation_pct NUMERIC NOT NULL,
  confidence_pct NUMERIC NOT NULL DEFAULT 0.8,
  deployed_at TIMESTAMPTZ,
  observed_eal_reduction NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE change_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  delta_eal NUMERIC NOT NULL,
  narrative TEXT NOT NULL,
  drivers JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
