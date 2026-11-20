import os

# ==============================================================================
# FIELD 1: ABSTRACT / SUMMARY (Target: 9,000 - 9,400 chars | Limit: 10,000)
# ==============================================================================

abstract_text = """EXECUTIVE SUMMARY AND STRATEGIC VISION

AegisRisk AI is an enterprise-grade Continuous Cyber Risk Quantification (CRQ) and Autonomous Cybersecurity Investment Optimization Platform engineered to resolve the critical disconnect between technical security operations and boardroom financial governance. Modern public and private sector enterprises, government ministries, banking institutions, and critical national infrastructure entities invest billions annually across disparate cybersecurity tooling—including Endpoint Detection and Response (EDR), Security Information and Event Management (SIEM), Cloud Security Posture Management (CSPM), Vulnerability Management platforms, and Identity and Access Management (IAM) suites.

Despite these massive capital and operational outlays, the prevailing methodology for communicating cyber risk to executive leadership, Boards of Directors, Chief Financial Officers, and regulatory bodies remains tethered to subjective, qualitative Red-Amber-Green (RAG) heatmaps, ordinal risk matrices (such as Low, Medium, High, Critical), and periodic manual audit spreadsheets. These legacy qualitative models possess fundamental structural flaws: they compress multi-dimensional probabilistic distributions into arbitrary color buckets, treat unrelated vulnerabilities as homogeneous risks, ignore the financial velocity of weaponized exploits, and fail to calculate the actual monetary value at stake. Consequently, Chief Information Security Officers (CISOs) struggle to justify security budgets in terms of return on investment, while executive leadership lacks defensible data to determine whether cyber investments are adequate, redundant, or sub-optimally distributed across the enterprise.

AegisRisk AI resolves this systemic challenge by delivering a continuous, cloud-ready analytical platform that ingests real-time technical telemetry directly from enterprise security infrastructure and threat intelligence feeds. The platform synthesizes this live technical data with business asset criticality, dependencies, and control efficacy to calculate empirical, actuarially sound financial loss metrics—principally Expected Annual Loss (EAL) and Value at Risk (VaR at 90%, 95%, and 99% confidence intervals)—expressed in both Indian Rupees (INR) and US Dollars (USD).

Furthermore, AegisRisk AI closes the operational loop by moving beyond passive risk measurement to active, mathematically optimal capital allocation. Utilizing a multi-constraint 0/1 Knapsack optimization algorithm and microeconomic production theory, the platform evaluates an organization's candidate security mitigations against an explicit capital ceiling (such as INR 1 Crore or USD 500,000) to recommend the exact portfolio of security controls that produces the maximum net reduction in financial risk, proving an explicit Return on Security Investment (ROSI).


CORE ARCHITECTURAL PILLARS AND METHODOLOGICAL INNOVATION

1. Automated Telemetry Normalization and Real-Time Asset Correlation
AegisRisk AI establishes bi-directional streaming connectors into modern enterprise infrastructure, including Splunk, Microsoft Sentinel, CrowdStrike Falcon, AWS Security Hub, Tenable.io, Qualys, and authoritative global threat intelligence feeds such as CISA Known Exploited Vulnerabilities (KEV) and FIRST Exploit Prediction Scoring System (EPSS). Rather than evaluating vulnerabilities in isolation, the platform cross-references technical severity (CVSS v3.1 and v4.0) with an organization's Configuration Management Database (CMDB) to evaluate business criticality, revenue exposure, operational uptime requirements, and service dependency graphs.

2. Rigorous Actuarial Risk Engine Based on OpenFAIR and Extreme Value Theory
Traditional quantitative models assume cyber loss events follow standard Gaussian normal distributions. This assumption is catastrophic in cybersecurity, where breach losses exhibit heavy-tailed power-law characteristics. AegisRisk AI addresses this by coupling the OpenFAIR (Factor Analysis of Information Risk) loss factorization ontology with high-performance, 10,000-trial vectorized Monte Carlo simulations. The engine incorporates Extreme Value Theory (EVT) utilizing Generalized Pareto Distributions (GPD) with a tail shape parameter of xi = 0.25 above the 98th percentile. This mathematical formulation accurately captures low-frequency, high-severity tail catastrophes—such as ransomware-induced complete business interruption or massive database exfiltration—without underestimating systemic tail risk.

3. Closed-Loop Investment Optimization via 0/1 Knapsack Formulations
To resolve the chronic problem of arbitrary security budgeting, AegisRisk AI treats cyber defense as a bounded combinatorial optimization problem. Each potential remediation—such as deploying Hardware Security Keys, implementing zero-trust microsegmentation, expanding automated patch pipelines, or purchasing cyber insurance—is characterized by its verifiable monetary implementation cost and its modeled risk mitigation percentage. The platform executes a dynamic programming knapsack solver to generate the optimal Pareto-efficient frontier of security investments, maximizing aggregate portfolio risk reduction while guaranteeing that total spend does not exceed the enterprise budget ceiling.

4. Explainable Root-Cause Attribution and Delta Intelligence
A primary failure of automated machine learning systems in enterprise risk governance is the lack of explainability. AegisRisk AI implements a deterministic delta-attribution engine that continuously compares consecutive organizational risk snapshots. When an organization's financial exposure shifts, the platform programmatically decomposes the change into its underlying physical drivers: Threat Event Frequency shifts, Vulnerability weaponization, Control degradation, or Loss Magnitude expansion. It translates these complex mathematical movements into plain business prose for board executives, for example: "Expected Annual Loss increased by INR 12.4 Lakhs due to newly published unpatched remote code execution vulnerability CVE-2026-1055 detected across Core Banking production database clusters."

5. Guardrailed AI Copilot for Natural Language Strategic Governance
To democratize quantitative cyber intelligence across non-technical C-suite stakeholders, AegisRisk AI provides an interactive AI Copilot powered by large language models wrapped in safety and operational guardrails inspired by NVIDIA NeMo. The Copilot is constrained by semantic policy rails, input validation layers, and role-based execution boundaries. Non-technical executives can query the platform in conversational language—such as asking "What is our single greatest financial cyber exposure this quarter?" or "How does our risk profile change if we delay database patching by 30 days?"—while strict guardrails intercept prompt injections, prevent unauthorized data exfiltration, and block unapproved configuration alterations.

6. Comprehensive Regulatory Compliance and Governance Mapping
AegisRisk AI natively aligns technical security metrics and financial exposure figures with mandatory domestic and international regulatory governance frameworks:
- Reserve Bank of India (RBI) Cyber Security Framework for Banks: Continuous baseline cyber security controls, digital payment defense, third-party dependency oversight, and board reporting.
- Securities and Exchange Board of India (SEBI) Cybersecurity and Cyber Resilience Framework (CCRF): Mandated cybersecurity audits, quantitative risk tiering, cyber resilience indexes, and standard operating procedures for market infrastructure entities.
- Indian Computer Emergency Response Team (CERT-In) Directions: Mandatory 6-hour incident reporting tracking, synchronized NTP logging, and verifiable audit records.
- Digital Personal Data Protection (DPDP) Act 2023: Continuous assessment of data principal exposure and personal data breach liability quantification.
- ISO/IEC 27001:2022 and NIST Cybersecurity Framework 2.0: Mapping control effectiveness against the core functions: Govern, Identify, Protect, Detect, Respond, and Recover.
- US SEC Form 8-K Cybersecurity Disclosure Mandates: Automated financial materiality evaluation determining within 4 business days whether a security incident causes material financial impact.
- European Union Digital Operational Resilience Act (DORA): Continuous ICT operational risk management, resilience testing, and concentration risk monitoring for third-party cloud providers.


EXPECTED OUTCOMES AND STRATEGIC IMPACT

- Elimination of Qualitative Ambiguity: Replaces subjective intuition and static heatmaps with verifiable, empirically derived probability distributions and monetary loss metrics.
- Defensible Cybersecurity Budgeting: Empowers CISOs to converse in the financial language of CFOs and Boards of Directors, proving that proposed cybersecurity programs yield positive return on investment.
- Real-Time Risk Posture Awareness: Reduces the risk assessment cycle from 6 to 12 months down to sub-second streaming updates, enabling immediate response to zero-day vulnerabilities and active adversary campaigns.
- Mathematical Capital Efficiency: Prevents both wasteful over-spending on redundant security tools and dangerous under-spending on critical enterprise single points of failure.
- Audit and Regulatory Readiness: Generates automated, tamper-evident cryptographic reports and board-ready executive dossiers that fulfill compliance requirements across RBI, SEBI, CERT-In, ISO, and NIST frameworks."""

abstract_clean = abstract_text.strip()
print(f"Final Abstract Length: {len(abstract_clean)} characters (Target: 9,000 - 9,400 | Max: 10,000)")

with open(r"c:\Users\subha\Downloads\sih-10551\crq-platform\SIH_ABSTRACT_SUBMISSION.txt", "w", encoding="utf-8") as f:
    f.write(abstract_clean)
