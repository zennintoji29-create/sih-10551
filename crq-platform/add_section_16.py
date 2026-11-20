with open(r"c:\Users\subha\Downloads\sih-10551\crq-platform\build_idea_description.py", "r", encoding="utf-8") as f:
    content = f.read()

section_16 = '''
    sections.append("""
16. COMPARATIVE ADVANTAGE AND ARCHITECTURAL DIFFERENTIATION

16.1 Systematic Benchmark Against Legacy Approaches
To substantiate the technical and operational superiority of AegisRisk AI, the platform was benchmarked against the prevailing industry approaches to enterprise cyber risk management:

- Approach A: Periodic Qualitative Audits (Manual Spreadsheets & Big 4 Consultancies)
  * Data Frequency: Annual or bi-annual point-in-time snapshots (stale within 48 hours).
  * Measurement Metric: Subjective 1-to-5 ordinal scales or High/Medium/Low qualitative heatmaps.
  * Capital Optimization: None. Recommendations are generic checklists detached from budget constraints.
  * Integration: Manual interview questionnaires; zero automated telemetry correlation.
  * Operational Cost: Extremely high recurring professional service fees with zero real-time alerting.

- Approach B: Outside-In Cyber Rating Services (BitSight, SecurityScorecard)
  * Data Frequency: Daily passive external network scans (DNS records, open ports, expired SSL certificates).
  * Measurement Metric: FICO-style 300-850 scores that correlate poorly with actual internal financial loss.
  * Capital Optimization: Passive score tracking without financial optimization or ROSI calculation.
  * Limitations: Completely blind to internal network architecture, database controls, EDR efficacy, and CMDB business asset criticality.

- Approach C: Legacy Quantitative Tools (Traditional RiskLens / First-Generation FAIR Calculators)
  * Data Frequency: Manual data entry through complex multi-week stakeholder workshop surveys.
  * Measurement Metric: FAIR Expected Annual Loss, but relying on thin-tailed lognormal assumptions that underestimate catastrophic fat-tail events.
  * Capital Optimization: Static scenario comparison without dynamic combinatorial knapsack optimization.
  * Limitations: Inability to connect to streaming SIEM/EDR telemetry; high operational friction.

- AegisRisk AI (Next-Generation Continuous CRQ & Autonomous Optimization)
  * Data Frequency: Continuous, real-time bi-directional streaming via REST, webhooks, and eBPF kernel agents.
  * Measurement Metric: Empirical OpenFAIR Expected Annual Loss (EAL) coupled with Extreme Value Theory (EVT) Generalized Pareto Tail Value at Risk (95% and 99% VaR) in INR and USD.
  * Capital Optimization: Autonomous 0/1 Knapsack optimization providing mathematically verified maximum ROSI portfolios under explicit budget caps.
  * Governance: NeMo-style guardrailed conversational AI Copilot, deterministic explainable delta attribution, and immutable Merkle-chained compliance ledgers for RBI, SEBI, and CERT-In mandates.
""")
'''

insert_point = content.find('full_text = "".join(sections).strip()')
new_content = content[:insert_point] + section_16 + "\n    " + content[insert_point:]

with open(r"c:\Users\subha\Downloads\sih-10551\crq-platform\build_idea_description.py", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Added Section 16 to build_idea_description.py")
