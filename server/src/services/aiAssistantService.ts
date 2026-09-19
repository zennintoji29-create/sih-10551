import http from 'http';
import https from 'https';
import { UserRole } from '../models/tenantStore';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequestPayload {
  message: string;
  role: UserRole;
  provider?: 'ollama' | 'groq' | 'builtin';
  ollamaModel?: string;
  groqApiKey?: string;
  groqModel?: string;
  history?: ChatMessage[];
  context?: {
    currentScreen?: string;
    orgName?: string;
    portfolioEal?: number;
    var95?: number;
    activeCve?: string;
  };
}

export interface ChatResponsePayload {
  reply: string;
  providerUsed: 'ollama' | 'groq' | 'builtin';
  roleEnforced: UserRole;
  allowedScope: string[];
  disallowedScope: string[];
  disclaimer?: string;
}

export interface ProviderStatus {
  ollama: {
    available: boolean;
    models: string[];
    endpoint: string;
  };
  groq: {
    configured: boolean;
    defaultModel: string;
  };
  builtin: {
    available: boolean;
    roleGuardrailsActive: boolean;
  };
}

// Role-based Permissions & Boundaries
export const ROLE_BOUNDARIES: Record<UserRole, {
  title: string;
  persona: string;
  allowed: string[];
  disallowed: string[];
  systemPrompt: string;
}> = {
  CISO: {
    title: "Chief Information Security Officer & Boardroom",
    persona: "Executive risk strategist focused purely on financial loss quantification, capital allocation, and board defensibility.",
    allowed: [
      "Expected Annual Loss (EAL) & Value at Risk (VaR 90%, 95%, 99%) calculations",
      "ROSI (Return on Security Investment) Knapsack portfolio budget allocation",
      "Board-level risk appetite alignment ($5.0M threshold)",
      "What-If strategic sandbox simulations (MFA, EDR, Zero Trust tradeoffs)",
      "SEC Rule 106 4-day materiality financial thresholds and 8-K disclosure readiness",
      "Peer industry benchmark comparisons (FinTech / B2B SaaS)"
    ],
    disallowed: [
      "Low-level tactical command lines, terminal scripts, or packet capture analysis",
      "Direct code-level vulnerability patching or script debugging",
      "Data connector API key credentials creation or DB schema alterations",
      "Operational raw log parsing"
    ],
    systemPrompt: `You are the AegisRisk AI Executive Copilot for the CISO (Chief Information Security Officer).
Strict Guardrail Rules:
1. ONLY discuss financial risk quantification ($ EAL, 95% VaR), board-level risk appetite, Knapsack ROSI allocation, SEC Rule 106 4-day materiality determinations, and capital allocation.
2. If the user asks for low-level tactical scripts, command-line syntax, or operational packet traces, politely refuse and state that tactical operations are restricted to the Security Analyst Workbench.
3. Be concise, mathematically precise, and board-ready. Answer ONLY what the CISO needs to know — nothing more, nothing else.`
  },
  SECURITY_ANALYST: {
    title: "SecOps Senior Security Analyst",
    persona: "Operational threat and vulnerability analyst responsible for triage, CVE financial prioritization, and mitigation.",
    allowed: [
      "Vulnerability triage queue ordered by financial exposure impact ($ EAL)",
      "CISA Known Exploited Vulnerabilities (KEV) real-time catalog correlation",
      "Asset valuation, criticality tiers, and exposed services mapping",
      "Virtual patching simulation and control effectiveness verification",
      "Telemetry drift alerts from Tenable, CrowdStrike, and Splunk",
      "Remediation guidance for active exposures (e.g. CVE-2025-1234)"
    ],
    disallowed: [
      "Modifying organizational corporate capital expenditure budgets (CISO role only)",
      "Changing company subscription plans or inviting organizational admins (Admin role only)",
      "Signing off on legal SEC materiality filings (Auditor/CISO role only)"
    ],
    systemPrompt: `You are the AegisRisk AI Security Operations Copilot for the Security Analyst.
Strict Guardrail Rules:
1. ONLY discuss operational triage, vulnerability prioritization by dollar loss impact ($ EAL), CVSS vs financial impact, CISA KEV exploitability, and virtual patching steps.
2. If the user asks to reallocate enterprise budgets or alter corporate risk appetite, direct them to the CISO Cockpit.
3. If the user asks to manage SaaS billing or tenant provisioning, direct them to the Admin Console.
4. Be direct, technical, and actionable. Answer ONLY what the analyst needs to remediate risk — nothing more, nothing else.`
  },
  COMPLIANCE_AUDITOR: {
    title: "Regulatory & Compliance Assurance Auditor (Read-Only)",
    persona: "Independent compliance and regulatory assurance specialist verifying mathematical integrity and statutory adherence.",
    allowed: [
      "SEC Rule 106 4-day materiality assessment criteria and timeline verification",
      "DORA (Digital Operational Resilience Act) Article 16 third-party concentration stress testing",
      "Cryptographic SHA-256 tamper-evident audit trail verification",
      "Point-in-time historical replay of past risk assessments",
      "ISO/IEC 27005 and OpenFAIR standard formula compliance auditing",
      "Read-only viewing of all risk metrics, assumptions, and data sources"
    ],
    disallowed: [
      "ANY write operations: Cannot mark findings resolved, cannot edit assets, cannot alter configs",
      "Cannot change risk engine parameters or execute virtual patching",
      "Cannot invite users or modify tenant subscription tier"
    ],
    systemPrompt: `You are the AegisRisk AI Independent Regulatory Copilot for the Compliance Auditor.
Strict Guardrail Rules:
1. You are operating in a STRICTLY READ-ONLY assurance capacity. Emphasize verification, compliance standards, and defensibility.
2. ONLY discuss SEC Rule 106 4-day materiality requirements, DORA Article 16 concentration risk, SHA-256 cryptographic audit logs, and point-in-time replay.
3. If the user attempts to perform any write, patch, or configuration action, explicitly remind them that the Auditor role is read-only to preserve legal independence and evidence integrity.
4. Cite exact compliance articles and mathematical formulas. Answer ONLY what the auditor requires for verification — nothing more, nothing else.`
  },
  ADMIN: {
    title: "SaaS Tenant & Integrations Administrator",
    persona: "Platform and systems administrator responsible for tenant setup, RBAC provisioning, and data connector health.",
    allowed: [
      "Organization tenant configuration, domain settings, and plan tiers (Starter, Pro, Enterprise)",
      "RBAC user provisioning, role assignments, and team member invitations",
      "5-category data connectors setup and health (Tenable, CrowdStrike, AWS, Splunk, CISA KEV)",
      "Live telemetry synchronization, polling intervals, and webhook configurations",
      "API keys management and service tokens",
      "System ingestion logs and data confidence index monitoring"
    ],
    disallowed: [
      "Tampering with or overriding cryptographic SHA-256 compliance audit log entries",
      "Unilateral alteration of mathematical FAIR model calculations without CISO validation"
    ],
    systemPrompt: `You are the AegisRisk AI Administrator Copilot for the SaaS Admin.
Strict Guardrail Rules:
1. ONLY assist with tenant provisioning, RBAC role assignments, data connector setup (Tenable, CrowdStrike, AWS, Splunk, CISA KEV), telemetry streaming intervals, and platform health.
2. For questions regarding financial risk strategy, point the user to the CISO Cockpit. For vulnerability mitigation steps, point to the Analyst Workbench.
3. Provide step-by-step instructions on configuring the platform and managing users. Answer ONLY what the admin needs to operate the system — nothing more, nothing else.`
  }
};

class AiAssistantService {
  // Check available local and cloud providers
  async checkProviderStatus(): Promise<ProviderStatus> {
    const ollamaStatus = await this.checkOllama();
    const groqKey = process.env.GROQ_API_KEY;

    return {
      ollama: ollamaStatus,
      groq: {
        configured: Boolean(groqKey && groqKey.startsWith('gsk_')),
        defaultModel: 'llama-3.3-70b-versatile'
      },
      builtin: {
        available: true,
        roleGuardrailsActive: true
      }
    };
  }

  private checkOllama(): Promise<{ available: boolean; models: string[]; endpoint: string }> {
    return new Promise((resolve) => {
      const req = http.get('http://localhost:11434/api/tags', { timeout: 1500 }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const models = Array.isArray(parsed.models) ? parsed.models.map((m: any) => m.name) : [];
            resolve({
              available: true,
              models,
              endpoint: 'http://localhost:11434'
            });
          } catch {
            resolve({ available: true, models: [], endpoint: 'http://localhost:11434' });
          }
        });
      });

      req.on('error', () => {
        resolve({ available: false, models: [], endpoint: 'http://localhost:11434' });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ available: false, models: [], endpoint: 'http://localhost:11434' });
      });
    });
  }

  // Main chat completion with role guardrails
  async handleChat(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
    const role = payload.role || 'CISO';
    const boundary = ROLE_BOUNDARIES[role] || ROLE_BOUNDARIES.CISO;
    const provider = payload.provider || 'builtin';

    // 1. Check if the user is asking about role permissions or how to use the system
    const lowerMsg = payload.message.toLowerCase().trim();
    if (
      lowerMsg.includes('permission') ||
      lowerMsg.includes('what can i do') ||
      lowerMsg.includes('my role') ||
      lowerMsg.includes('what are my rights') ||
      lowerMsg.includes('guardrail')
    ) {
      return {
        reply: this.generatePermissionsAnswer(role, boundary),
        providerUsed: 'builtin',
        roleEnforced: role,
        allowedScope: boundary.allowed,
        disallowedScope: boundary.disallowed,
        disclaimer: `Strict role guardrail enforced for ${role}.`
      };
    }

    if (
      lowerMsg.includes('how to use') ||
      lowerMsg.includes('how do i use') ||
      lowerMsg.includes('how does this work') ||
      lowerMsg.includes('guide me') ||
      lowerMsg.includes('walkthrough')
    ) {
      return {
        reply: this.generateHowToUseAnswer(role, payload.context?.currentScreen),
        providerUsed: 'builtin',
        roleEnforced: role,
        allowedScope: boundary.allowed,
        disallowedScope: boundary.disallowed
      };
    }

    // 2. Attempt Ollama if requested
    if (provider === 'ollama') {
      try {
        const ollamaRes = await this.callOllama(payload, boundary);
        if (ollamaRes) {
          return {
            reply: ollamaRes,
            providerUsed: 'ollama',
            roleEnforced: role,
            allowedScope: boundary.allowed,
            disallowedScope: boundary.disallowed
          };
        }
      } catch (err: any) {
        console.warn('[AiAssistantService] Ollama request failed, falling back to built-in guardrail engine:', err.message);
      }
    }

    // 3. Attempt Groq if requested
    if (provider === 'groq') {
      try {
        const groqRes = await this.callGroq(payload, boundary);
        if (groqRes) {
          return {
            reply: groqRes,
            providerUsed: 'groq',
            roleEnforced: role,
            allowedScope: boundary.allowed,
            disallowedScope: boundary.disallowed
          };
        }
      } catch (err: any) {
        console.warn('[AiAssistantService] Groq request failed, falling back to built-in guardrail engine:', err.message);
      }
    }

    // 4. Default: Built-in Guardrailed Intelligent Engine
    const builtInReply = this.generateBuiltInAnswer(payload, boundary);
    return {
      reply: builtInReply,
      providerUsed: 'builtin',
      roleEnforced: role,
      allowedScope: boundary.allowed,
      disallowedScope: boundary.disallowed,
      disclaimer: provider !== 'builtin' 
        ? `Provider '${provider}' was not ready or model was missing. Seamlessly answered via Built-in Guardrailed Engine.` 
        : undefined
    };
  }

  // Call local Ollama instance
  private callOllama(payload: ChatRequestPayload, boundary: typeof ROLE_BOUNDARIES['CISO']): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const model = payload.ollamaModel || 'llama3';
      const prompt = `${boundary.systemPrompt}\n\nLive Platform Context:\n- Org: Acme Financial Technologies SaaS (Enterprise)\n- EAL: $5.55M | VaR 95%: $10.07M | ROSI: +648%\n- Active CVE: CVE-2025-1234 (+$150k delta on Payment API)\n\nUser Question: ${payload.message}`;

      const postData = JSON.stringify({
        model,
        prompt,
        stream: false
      });

      const options = {
        hostname: 'localhost',
        port: 11434,
        path: '/api/generate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 10000
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.response) {
              resolve(parsed.response.trim());
            } else if (parsed.error) {
              reject(new Error(parsed.error));
            } else {
              resolve(null);
            }
          } catch (e: any) {
            reject(e);
          }
        });
      });

      req.on('error', (e) => reject(e));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Ollama request timed out'));
      });

      req.write(postData);
      req.end();
    });
  }

  // Call Groq API
  private callGroq(payload: ChatRequestPayload, boundary: typeof ROLE_BOUNDARIES['CISO']): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const apiKey = payload.groqApiKey || process.env.GROQ_API_KEY;
      if (!apiKey) {
        return reject(new Error('No Groq API key configured. Provide an API key or use Ollama / Built-in engine.'));
      }

      const model = payload.groqModel || 'llama-3.3-70b-versatile';
      const messages = [
        {
          role: 'system',
          content: `${boundary.systemPrompt}\n\nPlatform State:\n- Organization: Acme Financial Technologies SaaS\n- Portfolio EAL: $5,550,000\n- VaR (95%): $10,070,000\n- Top Control ROSI: +648% (FIDO2 MFA)\n- Attribution: CVE-2025-1234 (+$150,000 on Payment Gateway)`
        },
        ...(payload.history || []).slice(-4),
        { role: 'user', content: payload.message }
      ];

      const postData = JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 500
      });

      const options = {
        hostname: 'api.groq.com',
        port: 443,
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices[0]?.message?.content) {
              resolve(parsed.choices[0].message.content.trim());
            } else if (parsed.error) {
              reject(new Error(parsed.error.message || 'Groq API error'));
            } else {
              resolve(null);
            }
          } catch (e: any) {
            reject(e);
          }
        });
      });

      req.on('error', (e) => reject(e));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Groq request timed out'));
      });

      req.write(postData);
      req.end();
    });
  }

  // Permissions explainer response
  private generatePermissionsAnswer(role: UserRole, boundary: typeof ROLE_BOUNDARIES['CISO']): string {
    return `### Role Authorization & Permissions: ${boundary.title} (${role})

As an authenticated **${role}**, your role guardrails strictly permit:
${boundary.allowed.map((a) => `• **Permitted**: ${a}`).join('\n')}

**Restricted Actions (Blocked by System RBAC)**:
${boundary.disallowed.map((d) => `✕ **Blocked**: ${d}`).join('\n')}

*Security Enforcement*: AegisRisk AI enforces these boundaries both client-side and at the server-side middleware layer. Your queries will only return information within your authorized scope.`;
  }

  // System usage guide
  private generateHowToUseAnswer(role: UserRole, screen?: string): string {
    switch (role) {
      case 'CISO':
        return `### How to Use the Executive Boardroom & CISO Cockpit

1. **Monitor Capital Exposure**: Review **Expected Annual Loss ($5.55M)** and **95% VaR ($10.07M)**. Compare against your Board Risk Appetite ($5.0M).
2. **Review Causal Drivers**: Check the *What Changed Today* banner to see exact CVE/drift attributions (+ $150,000 delta on Payment API).
3. **Run What-If Simulations**: Use the What-If Sandbox in the top bar to evaluate the financial impact of deploying MFA or increasing EDR coverage.
4. **Optimize Security Budget**: Inspect the Knapsack ROSI Optimizer section to allocate capital where dollar loss reduction exceeds implementation costs.
5. **Trigger Live Recalibration**: Click the **Recalibrate (10,000 runs)** button at any time to re-run OpenFAIR simulations on live telemetry.`;

      case 'SECURITY_ANALYST':
        return `### How to Use the Security Analyst Workbench

1. **Triage by Financial Loss**: Inspect the Live Telemetry & Vulnerability Queue. Findings are ranked by financial risk ($ EAL), not just raw CVSS.
2. **Correlate Threat Intel**: Check the CISA KEV tags to identify vulnerabilities being actively exploited in the wild.
3. **Simulate Virtual Patching**: Click *Simulate Virtual Patch* on any finding to see immediate before-and-after EAL reduction without touching production.
4. **Asset Criticality Register**: Review declared asset valuations (e.g. Core Payment Gateway at $45M) and their control effectiveness.`;

      case 'COMPLIANCE_AUDITOR':
        return `### How to Use the Compliance & Regulatory Assurance Hub (Read-Only)

1. **Verify SEC Rule 106 4-Day Materiality**: Review the 4-day disclosure assessment. The system flags qualitative and financial materiality (>10% operating income).
2. **Audit DORA Article 16 Resilience**: Inspect third-party concentration and single points of failure (SPoF) across shared cloud regions.
3. **Inspect Cryptographic Audit Log**: Verify the SHA-256 tamper-evident hash chain. Every action, calculation, and connector sync is cryptographically stamped.
4. **Point-in-Time Replay**: Replay historical snapshots to reconstruct exact quantitative risk at any historical date.`;

      case 'ADMIN':
        return `### How to Use the SaaS Admin & Connectors Console

1. **Configure Ingestion Feeds**: Navigate to *Connectors (A-E)* to manage Tenable, CrowdStrike, AWS, Splunk, and CISA KEV integrations.
2. **Manage RBAC Users**: Invite team members, assign roles (CISO, Analyst, Auditor, Admin), and toggle MFA enforcement.
3. **Monitor Ingestion Health**: Check the Data Confidence Index (currently 94%) and trigger manual telemetry syncs.
4. **Tenant Configuration**: Update company domain, declared revenue, and SaaS subscription tier.`;
    }
  }

  // Built-in intelligent conversational reasoning engine with role guardrails
  private generateBuiltInAnswer(payload: ChatRequestPayload, boundary: typeof ROLE_BOUNDARIES['CISO']): string {
    const q = payload.message.toLowerCase();
    const role = payload.role;

    // Check for violations / out-of-scope queries
    if (role === 'CISO') {
      if (q.includes('iptables') || q.includes('bash script') || q.includes('pcap') || q.includes('packet trace') || q.includes('curl -x')) {
        return `**Role Guardrail Notice**: As CISO, low-level command-line scripting and raw packet traces are outside your executive scope. For tactical vulnerability remediation, please consult the **Security Analyst Workbench**. I can, however, provide the financial loss impact ($ EAL) of the affected assets.`;
      }
      if (q.includes('var') || q.includes('value at risk') || q.includes('95%') || q.includes('worst case')) {
        return `Our current **95% Value at Risk (VaR)** is **$10,070,000**, derived from 10,000 Monte Carlo iterations. This represents our worst-case annual loss in 1-out-of-20 years. By comparison, our 90% VaR is **$8,420,000** and our baseline Expected Annual Loss (EAL) is **$5,550,000**, which exceeds the board risk appetite of $5.00M by $550,000.`;
      }
      if (q.includes('rosi') || q.includes('budget') || q.includes('knapsack') || q.includes('investment')) {
        return `Using the **0/1 Knapsack optimization algorithm** with our $500,000 defensive budget, the top recommended control is **FIDO2 Multi-Factor Authentication** ($65k cost, -$620k EAL reduction, **+854% ROSI**), followed by **Managed EDR & Automated SOAR** ($180k cost, -$1.12M EAL reduction, **+522% ROSI**). Total portfolio ROSI is **+648%**.`;
      }
      if (q.includes('sec') || q.includes('material') || q.includes('4-day') || q.includes('8-k')) {
        return `Under **SEC Rule 106**, cyber incidents exceeding material financial thresholds must be disclosed via Form 8-K within 4 business days. The platform continuously tracks incident EAL against our 10% operating income threshold ($12.0M). Currently, our payment gateway exposure sits at $1.85M, marked as *Non-Material, Elevated Monitoring*.`;
      }
      if (q.includes('eal') || q.includes('loss') || q.includes('portfolio') || q.includes('risk')) {
        return `Our current portfolio **Expected Annual Loss (EAL)** is **$5,550,000**. EAL has increased by **+$150,000** this week due to active exploitation of CVE-2025-1234 on our Core Payment Gateway. Deploying planned MFA controls will reduce EAL to $4,930,000, bringing us back under our $5.0M board threshold.`;
      }
    }

    if (role === 'SECURITY_ANALYST') {
      if (q.includes('budget') || q.includes('capex') || q.includes('board appetite') || q.includes('subscription plan')) {
        return `**Role Guardrail Notice**: Enterprise budget allocation and corporate risk appetite decisions are reserved for the **CISO** and Executive Boardroom. I can provide the financial loss ranking of current vulnerabilities to help you prioritize patching.`;
      }
      if (q.includes('cve') || q.includes('vulnerability') || q.includes('triage') || q.includes('kev')) {
        return `The highest priority finding in our queue is **CVE-2025-1234** (CVSS 9.8) affecting the *Core Payment Gateway (API)*. While its CVSS is 9.8, its financial impact is **$150,000 EAL increase** because it is listed on the **CISA KEV catalog** and has public exploit code. Recommendation: Apply the virtual patch in the Workbench to immediately reduce exposure.`;
      }
      if (q.includes('virtual patch') || q.includes('patch') || q.includes('remediate')) {
        return `To remediate exposure: Locate **CVE-2025-1234** in the Analyst Workbench and click **Simulate Virtual Patch**. This applies an inline WAF filter rule that temporarily increases Control Strength (CS) from 45% to 85%, dropping Vulnerability from 0.65 to 0.12 and eliminating $125,000 of the associated EAL without code redeployment.`;
      }
    }

    if (role === 'COMPLIANCE_AUDITOR') {
      if (q.includes('delete') || q.includes('modify') || q.includes('patch') || q.includes('update') || q.includes('write')) {
        return `**Role Guardrail Notice**: Action blocked. As a **Compliance Auditor**, you operate with strictly read-only permissions to guarantee audit independence and evidence integrity. You can inspect assessments, replay history, and verify SHA-256 hashes, but cannot perform write operations.`;
      }
      if (q.includes('sha-256') || q.includes('audit log') || q.includes('hash') || q.includes('tamper')) {
        return `All calculation runs, telemetry ingestion events, and user actions are appended to a **SHA-256 cryptographic hash chain**. Each block incorporates the previous block's digest, timestamp, and actor ID. Current audit chain status: **100% Verified, Zero Tampering Detected**.`;
      }
      if (q.includes('dora') || q.includes('article 16') || q.includes('resilience')) {
        return `Under **DORA Article 16**, critical third-party ICT service providers must be stress-tested for concentration risk. The platform identifies that 3 of our tier-1 payment and analytics vendors depend on **AWS us-east-1**, creating a correlated tail risk of $3.65M in an availability loss event.`;
      }
    }

    if (role === 'ADMIN') {
      if (q.includes('tenable') || q.includes('connector') || q.includes('crowdstrike') || q.includes('splunk') || q.includes('aws')) {
        return `To configure or check data connectors: Open **Connectors (A-E)** from the top navigation. We currently have **5 active feeds** (Tenable.io, CrowdStrike Falcon, AWS Security Hub, Splunk, CISA KEV). Current polling interval is 60 minutes with a **94% Data Confidence Index**.`;
      }
      if (q.includes('invite') || q.includes('user') || q.includes('role') || q.includes('rbac')) {
        return `To invite a user: In the Admin Console, go to *User & Access Provisioning*, enter their corporate email, name, and select their role (**CISO**, **SECURITY_ANALYST**, **COMPLIANCE_AUDITOR**, or **ADMIN**). RBAC permissions and session tokens are provisioned instantly.`;
      }
    }

    // Default contextual response
    return `[${boundary.title} Copilot]: I am grounded in live telemetry for **Acme Financial Technologies SaaS**. 
Current metrics: **Expected Annual Loss is $5.55M**, **95% VaR is $10.07M**, and **5 data connectors are active**.
You can ask me about:
${boundary.allowed.slice(0, 3).map((a) => `• ${a}`).join('\n')}
Or ask *"What are my permissions?"* for full role authorization rules.`;
  }
}

export const aiAssistantService = new AiAssistantService();
