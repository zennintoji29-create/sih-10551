/**
 * AegisRisk AI (Continuum SIH26105) - Automated Diagnostics Suite
 * Validates backend API, auth personas, OpenFAIR calculation, Monte Carlo VaR, and security connectors.
 */

const BASE_URL = process.env.TEST_BACKEND_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const url = new URL(path, BASE_URL);
  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, ok: response.ok, data };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runDiagnostics() {
  console.log('=== AegisRisk AI Diagnostics Suite ===\n');

  // 1. Health check
  console.log('1. Checking Backend Health Check (/health)...');
  try {
    const health = await request('/health');
    assert(health.status === 200, `Health check returned status 200 (received ${health.status})`);
    assert(health.data?.status === 'ok', `Service reports status 'ok'`);
    assert(health.data?.service === 'crq-backend', `Service identity is 'crq-backend'`);
  } catch (err) {
    assert(false, `Health check connection error: ${err.message}`);
  }

  // 2. Auth Personas
  console.log('\n2. Testing 4 Persona Authentications (/api/auth/login)...');
  const personas = [
    { role: 'ciso', email: 'ciso@acme-fin.com' },
    { role: 'analyst', email: 'analyst@acme-fin.com' },
    { role: 'auditor', email: 'auditor@acme-fin.com' },
    { role: 'admin', email: 'admin@acme-fin.com' },
  ];

  let cisoToken = null;
  let auditorToken = null;
  let analystToken = null;

  for (const persona of personas) {
    try {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: persona.email, password: 'admin123' }),
      });
      assert(res.status === 200, `${persona.role.toUpperCase()} login status 200`);
      assert(res.data?.token, `${persona.role.toUpperCase()} token issued`);
      assert(res.data?.user?.role === persona.role, `${persona.role.toUpperCase()} role matches`);
      if (persona.role === 'ciso') cisoToken = res.data?.token;
      if (persona.role === 'auditor') auditorToken = res.data?.token;
      if (persona.role === 'analyst') analystToken = res.data?.token;
    } catch (err) {
      assert(false, `Login failure for ${persona.email}: ${err.message}`);
    }
  }

  // 3. Risk Engine Overview & EAL
  console.log('\n3. Testing Risk Overview & FAIR Quant calculations (/api/risk/overview)...');
  try {
    const res = await request('/api/risk/overview', {
      headers: { Authorization: `Bearer ${cisoToken}` },
    });
    assert(res.status === 200, `Overview returned status 200`);
    assert(typeof res.data?.metrics?.portfolioEal === 'number' && res.data.metrics.portfolioEal > 0, `EAL calculated: $${res.data?.metrics?.portfolioEal?.toLocaleString()}`);
    assert(res.data?.metrics?.activeAssetsCount > 0, `Active calibrated assets count: ${res.data?.metrics?.activeAssetsCount}`);
    assert(typeof res.data?.metrics?.var95 === 'number' && res.data.metrics.var95 > 0, `95% Monte Carlo VaR: $${res.data?.metrics?.var95?.toLocaleString()}`);
    assert(Array.isArray(res.data?.history) && res.data.history.length > 0, `6-month historical snapshots available (${res.data.history.length} snapshots)`);
  } catch (err) {
    assert(false, `Risk overview error: ${err.message}`);
  }

  // 4. Vulnerability Findings Queue
  console.log('\n4. Testing Findings Queue (/api/risk/findings)...');
  let firstFindingId = null;
  try {
    const res = await request('/api/risk/findings', {
      headers: { Authorization: `Bearer ${analystToken}` },
    });
    assert(res.status === 200, `Findings returned status 200`);
    assert(Array.isArray(res.data?.findings) && res.data.findings.length > 0, `Findings loaded (${res.data.findings.length} findings)`);
    firstFindingId = res.data.findings[0]?.id;
    assert(firstFindingId != null, `First finding ID: ${firstFindingId}`);
  } catch (err) {
    assert(false, `Findings error: ${err.message}`);
  }

  // 5. Strict RBAC Enforcement (Auditor write restriction)
  console.log('\n5. Testing Strict RBAC Enforcement (Auditor write restriction)...');
  try {
    const res = await request('/api/risk/findings/remediate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${auditorToken}` },
      body: JSON.stringify({ findingId: firstFindingId || 'find-1' }),
    });
    assert(res.status === 403, `Auditor mutation blocked with HTTP 403 Forbidden (received ${res.status})`);
    assert(res.data?.error === 'FORBIDDEN_READ_ONLY_ROLE', `Error code matches FORBIDDEN_READ_ONLY_ROLE`);
  } catch (err) {
    assert(false, `RBAC check error: ${err.message}`);
  }

  // 6. Connectors
  console.log('\n6. Testing Security Connectors Status (/api/connectors)...');
  try {
    const res = await request('/api/connectors', {
      headers: { Authorization: `Bearer ${cisoToken}` },
    });
    assert(res.status === 200, `Connectors status returned HTTP 200`);
    assert(Array.isArray(res.data?.connectors) && res.data.connectors.length > 0, `Connectors list returned (${res.data.connectors.length} connectors)`);
  } catch (err) {
    assert(false, `Connectors error: ${err.message}`);
  }

  // 7. Frontend Verification
  console.log('\n7. Testing Frontend Server (:3000)...');
  try {
    const feRes = await fetch('http://localhost:3000');
    assert(feRes.status === 200, `Frontend root (/) returned HTTP 200`);
    const demoRes = await fetch('http://localhost:3000/demo');
    assert(demoRes.status === 200, `Frontend /demo returned HTTP 200`);
    const loginRes = await fetch('http://localhost:3000/login');
    assert(loginRes.status === 200, `Frontend /login returned HTTP 200`);
  } catch (err) {
    assert(false, `Frontend verification error: ${err.message}`);
  }

  console.log(`\n========================================`);
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runDiagnostics().catch((e) => {
  console.error(e);
  process.exit(1);
});
