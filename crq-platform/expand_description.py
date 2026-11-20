import os

# Target:
# Abstract: ~9,200 chars (< 10,000)
# Description: ~48,200 chars (< 50,000)

with open(r"c:\Users\subha\Downloads\sih-10551\crq-platform\generate_description_text.py", "r", encoding="utf-8") as f:
    code = f.read()

# Let's add Section 12: Adversary Tactics, MITRE ATT&CK Mapping & Threat Intelligence Integration
# And Section 13: Enterprise Incident Response, ITSM Integration & Board Reporting
section_12_and_13 = '''
    # -------------------------------------------------------------
    # SECTION 12
    # -------------------------------------------------------------
    parts.append("""
12. ADVERSARY TACTICS, MITRE ATT&CK MAPPING, AND THREAT INTELLIGENCE INTEGRATION

12.1 Dynamic Threat Actor Capability Modeling
Modern cybersecurity defenses cannot treat adversary behavior as static or uniform. AegisRisk AI integrates continuous threat intelligence feeds to modulate the Threat Event Frequency (TEF) and Vulnerability parameters based on active adversary campaigns observed across global and domestic telemetry:
- MITRE ATT&CK Framework Alignment: Every detected vulnerability and system misconfiguration is mapped to specific adversary Tactics, Techniques, and Procedures (TTPs). For example, an unpatched credential dumping vulnerability is mapped to T1003 (OS Credential Dumping), while an exposed remote desktop service is mapped to T1133 (External Remote Services).
- Exploit Prediction Scoring System (EPSS): Unlike static CVSS base scores which only measure theoretical severity, AegisRisk AI ingests daily EPSS probability scores from FIRST.org. An asset with a CVSS 9.8 flaw that has an EPSS score of 0.02 is prioritized lower than a CVSS 7.5 vulnerability with an EPSS score of 0.89 and active exploit code circulating on underground forums.
- CISA Known Exploited Vulnerabilities (KEV) Catalog: When a CVE is added to the CISA KEV catalog, the AegisRisk AI engine flags the vulnerability as actively weaponized, dynamically increasing the vulnerability parameter by +0.50 and triggering an immediate re-evaluation of portfolio Expected Annual Loss.

12.2 Generative AI Adversary Tactics Amplification
Adversaries increasingly deploy automated AI agents for large-scale reconnaissance, polymorphic malware synthesis, and automated phishing campaigns. AegisRisk AI incorporates a proprietary AI Threat Amplification factor:
- Standard Automated Attacks: Factor = 1.0x to 1.25x (brute force, generic vulnerability scanning).
- GenAI Weaponized Reconnaissance: Factor = 1.5x (AI-synthesized exploit scripts targeting perimeter APIs).
- Adaptive Multi-Stage Autonomous Intrusions: Factor = 2.0x to 2.5x (autonomous agents evading traditional EDR detections).
This dynamic multiplier ensures that the quantitative loss projections reflect the rapidly accelerating velocity of modern cyber warfare.
""")

    # -------------------------------------------------------------
    # SECTION 13
    # -------------------------------------------------------------
    parts.append("""
13. ENTERPRISE INCIDENT RESPONSE, ITSM INTEGRATION, AND BOARD REPORTING

13.1 Automated Closed-Loop Remediation via ITSM Gateways
A primary operational advantage of AegisRisk AI is its seamless integration into enterprise IT Service Management (ITSM) pipelines:
- Automated Ticket Dispatch: When the Knapsack Optimization Engine determines the optimal remediation package, the platform automatically generates prioritized tickets within Jira Software, ServiceNow SecOps, or BMC Remedy.
- Context-Rich Engineering Guidance: Each ticket includes technical remediation steps, patch URLs, target asset identifiers, and the specific monetary risk reduction (Delta EAL in Lakhs) achieved upon ticket resolution.
- Verification and Feedback Loop: Upon ticket closure in Jira or ServiceNow, AegisRisk AI initiates an automated verification scan against the target asset. Once telemetry confirms the patch or configuration change is active, the asset record is updated, the risk delta is archived in the immutable ledger, and the executive dashboard reflects the reduced risk score in real time.

13.2 Automated Executive Board Memos and C-Suite Reporting
To empower CISOs during strategic executive meetings, AegisRisk AI features an automated C-Suite Dossier Generator:
- Board of Directors Summary: Non-technical executive briefs summarizing quarterly risk movements, total capital at risk, capital investment efficiency, and regulatory compliance postures across SEBI, RBI, and DPDP mandates.
- CFO Capital Allocation Memo: Detailed actuarial balance sheet impact statements, highlighting net Expected Annual Loss reductions, total cost of defensive controls, calculated Return on Security Investment (ROSI), and cyber insurance policy limit adequacy recommendations.
- Chief Risk Officer (CRO) Solvency Ledger: Extreme Value Theory tail-risk profiles, 95% and 99% Value at Risk exceedance probabilities, and third-party vendor concentration risk analysis.
All generated memos are exportable in high-resolution PDF and cryptographically signed JSON formats, providing audit-proof evidentiary documentation.
""")
'''

# Insert before `return "".join(parts)`
insert_pos = code.rfind('return "".join(parts)')
new_code = code[:insert_pos] + section_12_and_13 + code[insert_pos:]

with open(r"c:\Users\subha\Downloads\sih-10551\crq-platform\generate_description_text.py", "w", encoding="utf-8") as f:
    f.write(new_code)

print("Updated generate_description_text.py successfully.")
