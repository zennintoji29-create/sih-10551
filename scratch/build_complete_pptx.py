import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.dml import MSO_LINE_DASH_STYLE
import os
import shutil

SOURCE_PPTX = r"C:\Users\subha\Downloads\sih-10551\crq-platform\SIH2026_Exodus_Inovatrix (1).pptx"
BACKUP_PPTX = r"C:\Users\subha\Downloads\sih-10551\crq-platform\SIH2026_Exodus_Inovatrix_BACKUP.pptx"
DESKTOP_OUTPUT_PPTX = r"C:\Users\subha\OneDrive\Desktop\SIH2026_AegisRisk_Inovatrix_Final.pptx"

# Images
IMG_SLIDE2_WORKSTATION = r"c:\Users\subha\Downloads\sih-10551\scratch\extracted_pptx_images\slide_2_shape_15_Picture 20258.jpg"
IMG_SLIDE3_MAIN_FLOWCHART = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_reference_style_flowchart.png"
IMG_SLIDE3_MATH_DECOMP = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_math_decomposition.png"
IMG_SLIDE3_ROADMAP = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_36hr_roadmap.png"
IMG_SLIDE4_RECALIBRATION = r"c:\Users\subha\Downloads\sih-10551\scratch\extracted_pptx_images\slide_4_shape_15_Picture 3.png"
IMG_SLIDE5_IMPACT_CHART = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_impact_chart.png"

# Restore from backup for clean modification
shutil.copy2(BACKUP_PPTX, SOURCE_PPTX)
prs = Presentation(SOURCE_PPTX)

# Design System Colors (matching ZyraNav & Corporate SIH Theme)
CLR_NAVY_TITLE   = RGBColor(15, 76, 129)     # #0f4c81 - Slide Titles
CLR_SECTION_BLUE = RGBColor(3, 105, 161)    # #0369a1 - Section Headings
CLR_DARK_TEXT    = RGBColor(15, 23, 42)      # #0f172a - Body text bold leads
CLR_MUTED_TEXT   = RGBColor(51, 65, 85)      # #334155 - Body text descriptions
CLR_DIVIDER_RED  = RGBColor(192, 0, 0)       # Template dashed line
CLR_LINK_BLUE    = RGBColor(2, 132, 199)     # #0284c7 - Clean hyperlinks

def format_bullet(p, bold_prefix, text, font_name="Segoe UI", size_pt=8.4, space_after=3.0, line_spacing=1.15):
    p.space_after = Pt(space_after)
    p.line_spacing = line_spacing
    p.level = 0
    p.text = ""
    
    r1 = p.add_run()
    r1.text = "• " + bold_prefix + " " if not bold_prefix.startswith("•") else bold_prefix + " "
    r1.font.name = font_name
    r1.font.size = Pt(size_pt)
    r1.font.bold = True
    r1.font.color.rgb = CLR_DARK_TEXT
    
    r2 = p.add_run()
    r2.text = text
    r2.font.name = font_name
    r2.font.size = Pt(size_pt)
    r2.font.bold = False
    r2.font.color.rgb = CLR_MUTED_TEXT

# ==============================================================================
# UNIFORM TITLE FORMATTING ACROSS ALL SLIDES (Segoe UI Bold)
# ==============================================================================
print("Standardizing Slide Titles...")
for i, slide in enumerate(prs.slides):
    for sh in slide.shapes:
        if sh.name == "Title 1" and sh.has_text_frame:
            for p in sh.text_frame.paragraphs:
                p.font.name = "Segoe UI"
                p.font.bold = True
                for r in p.runs:
                    r.font.name = "Segoe UI"
                    r.font.bold = True
                    if "Exodus" in r.text:
                        r.text = r.text.replace("Exodus", "AegisRisk")

# ==============================================================================
# SLIDE 1: Title Page
# ==============================================================================
print("Refining Slide 1...")
s1 = prs.slides[0]
for sh in s1.shapes:
    if sh.has_text_frame:
        for p in sh.text_frame.paragraphs:
            for r in p.runs:
                r.font.name = "Segoe UI"
                if "Exodus" in r.text:
                    r.text = r.text.replace("Exodus", "AegisRisk")

# ==============================================================================
# SLIDE 2: Idea & Solution Overview
# ==============================================================================
print("Refining Slide 2...")
s2 = prs.slides[1]

# Remove any non-SIH picture
for sh in list(s2.shapes):
    if sh.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.PICTURE and sh.name != "Picture 10":
        sp = sh._element
        sp.getparent().remove(sp)

# Place user's workstation diagram in center
if os.path.exists(IMG_SLIDE2_WORKSTATION):
    s2.shapes.add_picture(IMG_SLIDE2_WORKSTATION, Inches(4.88), Inches(3.17), width=Inches(3.38), height=Inches(3.00))

# Format Fig 1 caption
for sh in s2.shapes:
    if "caption" in sh.name.lower() or "fig 1" in (sh.text if sh.has_text_frame else "").lower():
        sh.top = Inches(6.20)
        sh.left = Inches(5.30)
        sh.width = Inches(2.60)
        sh.height = Inches(0.45)
        if sh.has_text_frame:
            for p in sh.text_frame.paragraphs:
                p.alignment = PP_ALIGN.CENTER
                p.font.name = "Segoe UI"
                for r in p.runs:
                    r.font.name = "Segoe UI"
                    if "Exodus" in r.text:
                        r.text = r.text.replace("Exodus", "AegisRisk")

# Format TextBox 15362: Problem
for sh in s2.shapes:
    if sh.name == "TextBox 15362" and sh.has_text_frame:
        sh.left = Inches(0.35)
        sh.top = Inches(1.23)
        sh.width = Inches(6.00)
        sh.height = Inches(1.75)
        tf = sh.text_frame
        tf.word_wrap = True
        tf.clear()
        
        p0 = tf.paragraphs[0]
        p0.text = "Problem:"
        p0.font.name = "Segoe UI"
        p0.font.size = Pt(12.5)
        p0.font.bold = True
        p0.font.color.rgb = CLR_SECTION_BLUE
        p0.space_after = Pt(3)
        
        p1 = tf.add_paragraph()
        format_bullet(p1, "Over 85% of organizations", 
                      "measure cyber risk through stale, qualitative Red/Amber/Green heatmaps that are up to 90 days out of date. This leaves CISOs unable to prove ROI or justify multi-crore security investments, while regulators (RBI, SEBI, SEC, DORA) increasingly mandate continuous, mathematical risk quantification in defensible financial terms (₹ / $).", 
                      size_pt=8.8, space_after=0)

# Format TextBox 15364: Our Idea
for sh in s2.shapes:
    if sh.name == "TextBox 15364" and sh.has_text_frame:
        sh.left = Inches(6.95)
        sh.top = Inches(1.23)
        sh.width = Inches(6.00)
        sh.height = Inches(1.75)
        tf = sh.text_frame
        tf.word_wrap = True
        tf.clear()
        
        p0 = tf.paragraphs[0]
        p0.text = "Our Idea:"
        p0.font.name = "Segoe UI"
        p0.font.size = Pt(12.5)
        p0.font.bold = True
        p0.font.color.rgb = CLR_SECTION_BLUE
        p0.space_after = Pt(3)
        
        p1 = tf.add_paragraph()
        format_bullet(p1, "AegisRisk is a continuous, cloud-ready analytics engine", 
                      "that converts enterprise security telemetry into real-time monetary risk models (₹ / $) using OpenFAIR + 10,000-trial Monte Carlo (EVT fat-tail) to output EAL & VaR, with closed-loop validation that recalibrates control efficacy over time.", 
                      size_pt=8.8, space_after=0)

# Format TextBox 15366: Proposed Solution
for sh in s2.shapes:
    if sh.name == "TextBox 15366" and sh.has_text_frame:
        sh.left = Inches(0.35)
        sh.top = Inches(3.18)
        sh.width = Inches(4.45)
        sh.height = Inches(3.60)
        tf = sh.text_frame
        tf.word_wrap = True
        tf.clear()
        
        p0 = tf.paragraphs[0]
        p0.text = "Proposed Solution:"
        p0.font.name = "Segoe UI"
        p0.font.size = Pt(12.0)
        p0.font.bold = True
        p0.font.color.rgb = CLR_SECTION_BLUE
        p0.space_after = Pt(3)
        
        sol_bullets = [
            ("6-Pillar Telemetry Ingestion:", "SIEM/EDR, asset/CMDB context, vulnerabilities (CVSS/EPSS), threat intel (CISA KEV, ATT&CK), control posture, and loss benchmarks via Kafka/FastAPI."),
            ("FAIR + Monte Carlo Core:", "Decomposes exposure into Loss Event Frequency × Probable Loss Magnitude, computing Expected Annual Loss (EAL) and 95% Value at Risk (VaR)."),
            ("0/1 Knapsack Optimizer:", "Algorithmically selects the optimal security control portfolio to maximize risk reduction under any budget constraint."),
            ("Closed-Loop Recalibration:", "Backtests predictions against real incidents to auto-tune model parameters and eliminate accuracy drift.")
        ]
        for prefix, body in sol_bullets:
            p = tf.add_paragraph()
            format_bullet(p, prefix, body, size_pt=8.2, space_after=3.0)

# Format TextBox 15368: Innovation / Uniqueness
for sh in s2.shapes:
    if sh.name == "TextBox 15368" and sh.has_text_frame:
        sh.left = Inches(8.35)
        sh.top = Inches(3.18)
        sh.width = Inches(4.60)
        sh.height = Inches(3.60)
        tf = sh.text_frame
        tf.word_wrap = True
        tf.clear()
        
        p0 = tf.paragraphs[0]
        p0.text = "Innovation / Uniqueness:"
        p0.font.name = "Segoe UI"
        p0.font.size = Pt(12.0)
        p0.font.bold = True
        p0.font.color.rgb = CLR_SECTION_BLUE
        p0.space_after = Pt(3)
        
        inn_bullets = [
            ("Continuous Event-Driven Quantification:", "Shifts from stale 90-day audits to real-time probabilistic risk curves updated on every telemetry event."),
            ("GenAI Threat Amplifier Modeling:", "Dynamically scales attack frequency and exploitability as adversaries deploy autonomous LLM tooling."),
            ("Dynamic Control Friction Matrix:", "Instantly recalibrates net risk exposure when controls drift or fail (e.g. EDR agent going offline)."),
            ("Closed-Loop Self-Healing Architecture:", "Backtests every prediction against real incidents: Observe → Quantify → Optimize → Validate.")
        ]
        for prefix, body in inn_bullets:
            p = tf.add_paragraph()
            format_bullet(p, prefix, body, size_pt=8.0, space_after=2.5)

# ==============================================================================
# SLIDE 3: Technical Approach
# ==============================================================================
print("Refining Slide 3...")
s3 = prs.slides[2]

# Format Software Stack in TextBox 17410
for sh in s3.shapes:
    if sh.name == "TextBox 17410" and sh.has_text_frame:
        sh.left = Inches(0.30)
        sh.width = Inches(4.10)
        sh.top = Inches(1.18)
        sh.height = Inches(5.60)
        tf = sh.text_frame
        tf.word_wrap = True
        tf.clear()
        
        p_title = tf.paragraphs[0]
        p_title.text = "HARDWARE & SOFTWARE"
        p_title.font.name = "Segoe UI"
        p_title.font.size = Pt(12.5)
        p_title.font.bold = True
        p_title.font.color.rgb = CLR_NAVY_TITLE
        p_title.space_after = Pt(4)
        
        bullets = [
            ("Telemetry Ingestion Layer (FastAPI & Apache Kafka):", 
             "Asynchronous streaming pipeline ingesting live SIEM alerts, Nessus/Tenable scans, and CMDB context."),
            ("Quantitative Risk Engine (OpenFAIR™ Framework):", 
             "Standardized analytical engine decomposing exposure into Threat Frequency (TEF) and Loss Magnitude (PLM)."),
            ("Stochastic Simulation Core (NumPy / SciPy Monte Carlo):", 
             "Runs 10,000 loss trials per asset with Box-Muller sampling and Generalized Pareto fat-tail distribution."),
            ("Investment Optimizer (0/1 Knapsack DP Solver):", 
             "Algorithmically selects the optimal security control portfolio to maximize ROSI under fixed budget caps (e.g. ₹1 Cr)."),
            ("Threat Intelligence Feed (CISA KEV & MITRE ATT&CK):", 
             "Continuous API enrichment tracking active in-the-wild zero-day vulnerabilities and adversary TTP mapping."),
            ("Time-Series & Relational DB (TimescaleDB + PostgreSQL):", 
             "High-throughput storage for continuous historical loss curves, audit logs, and vendor dependency graphs."),
            ("Executive Presentation UI (Next.js 14, Tailwind, Recharts):", 
             "Real-time CISO dashboard rendering EAL/VaR distributions, What-If simulator, and change attribution."),
            ("Closed-Loop Model Calibrator (Brier Scoring & Bayesian Updating):", 
             "Backtests simulated predictions against actual incident records to continuously eliminate model drift.")
        ]
        
        for prefix, body in bullets:
            p = tf.add_paragraph()
            format_bullet(p, prefix, body, size_pt=8.1, space_after=2.5)

# Remove any old pictures in slide 3 except SIH logo
for sh in list(s3.shapes):
    if sh.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.PICTURE and sh.name != "Picture 11":
        sp = sh._element
        sp.getparent().remove(sp)
    elif sh.name in ["Rectangle 1", "Rectangle 3", "Caption Fig 4", "Group 39"]:
        sp = sh._element
        sp.getparent().remove(sp)

# 1. Insert Main Flowchart in Top Right
if os.path.exists(IMG_SLIDE3_MAIN_FLOWCHART):
    s3.shapes.add_picture(IMG_SLIDE3_MAIN_FLOWCHART, Inches(4.75), Inches(1.22), width=Inches(8.25), height=Inches(2.92))

# 2. Insert Math Decomposition in Bottom Left of Right Half
if os.path.exists(IMG_SLIDE3_MATH_DECOMP):
    s3.shapes.add_picture(IMG_SLIDE3_MATH_DECOMP, Inches(4.75), Inches(4.55), width=Inches(4.45), height=Inches(2.32))

# 3. Insert 36-Hour Build Roadmap in Bottom Right of Right Half
if os.path.exists(IMG_SLIDE3_ROADMAP):
    s3.shapes.add_picture(IMG_SLIDE3_ROADMAP, Inches(9.35), Inches(4.55), width=Inches(3.65), height=Inches(2.32))

# Style TextBox 17414 (Mathematical Risk Decomposition) and TextBox 17416 (36-Hour Build Roadmap)
for sh in s3.shapes:
    if sh.name == "TextBox 17414" and sh.has_text_frame:
        sh.top = Inches(4.20)
        sh.left = Inches(4.80)
        for p in sh.text_frame.paragraphs:
            p.font.name = "Segoe UI"
            p.font.size = Pt(9.5)
            p.font.bold = True
            p.font.color.rgb = CLR_SECTION_BLUE
    elif sh.name == "TextBox 17416" and sh.has_text_frame:
        sh.top = Inches(4.20)
        sh.left = Inches(9.40)
        for p in sh.text_frame.paragraphs:
            p.font.name = "Segoe UI"
            p.font.size = Pt(9.5)
            p.font.bold = True
            p.font.color.rgb = CLR_SECTION_BLUE

# ==============================================================================
# SLIDE 4: Feasibility and Viability (Polished 4-quadrant layout)
# ==============================================================================
print("Refining Slide 4...")
s4 = prs.slides[3]

# Remove old picture except SIH logo
for sh in list(s4.shapes):
    if sh.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.PICTURE and sh.name != "Picture 10":
        sp = sh._element
        sp.getparent().remove(sp)
    elif sh.name in ["Rectangle 2", "Rectangle 4", "fig4"]:
        sp = sh._element
        sp.getparent().remove(sp)

# Format Top Left: Technical Feasibility
for sh in s4.shapes:
    if sh.name == "TextBox 17410" and sh.has_text_frame:
        sh.left = Inches(0.40)
        sh.top = Inches(1.35)
        sh.width = Inches(6.05)
        sh.height = Inches(2.70)
        tf = sh.text_frame
        tf.word_wrap = True
        tf.clear()
        
        p0 = tf.paragraphs[0]
        p0.text = "Technical Feasibility"
        p0.font.name = "Segoe UI"
        p0.font.size = Pt(12.5)
        p0.font.bold = True
        p0.font.color.rgb = CLR_SECTION_BLUE
        p0.space_after = Pt(4)
        
        f_bullets = [
            ("Continuous Stream Ingestion:", 
             "Live telemetry from SIEM, EDR & Nessus streams into the Monte Carlo engine in near real time, eliminating 90-day audit lag."),
            ("Commodity Compute Scaling:", 
             "Embarrassingly parallel Monte Carlo sampling and Bayesian updating run in <3s on commodity multi-core CPUs."),
            ("Mathematical Defensibility:", 
             "Standardized OpenFAIR ontology decomposes raw security events into defensible rupee-denominated financial risk distributions."),
            ("Enterprise Cloud Deployment:", 
             "Microservices-based FastAPI backend deployable on on-premise clusters, AWS GovCloud, or isolated enterprise VPCs.")
        ]
        for prefix, body in f_bullets:
            p = tf.add_paragraph()
            format_bullet(p, prefix, body, size_pt=8.4, space_after=2.5)

# Format Top Right: Commercial Feasibility
for sh in s4.shapes:
    if sh.name == "TextBox 17412" and sh.has_text_frame:
        sh.left = Inches(6.90)
        sh.top = Inches(1.35)
        sh.width = Inches(6.03)
        sh.height = Inches(2.70)
        tf = sh.text_frame
        tf.word_wrap = True
        tf.clear()
        
        p0 = tf.paragraphs[0]
        p0.text = "Commercial Feasibility"
        p0.font.name = "Segoe UI"
        p0.font.size = Pt(12.5)
        p0.font.bold = True
        p0.font.color.rgb = CLR_SECTION_BLUE
        p0.space_after = Pt(4)
        
        c_bullets = [
            ("Market Validation:", 
             "85% of organizations still rely on annual assessments — a massive underserved market for continuous quantification."),
            ("Regulatory Tailwinds:", 
             "RBI CSITE, SEBI cybersecurity guidelines, SEC, and EU DORA mandate defensible mathematical risk quantification."),
            ("Technical Readiness:", 
             "High (~85–90%) accuracy in loss frequency and magnitude estimation against historical benchmark datasets."),
            ("The ROI Blind Spot:", 
             "CISOs currently lack models to prove multi-crore security budget efficacy — AegisRisk closes this gap directly.")
        ]
        for prefix, body in c_bullets:
            p = tf.add_paragraph()
            format_bullet(p, prefix, body, size_pt=8.4, space_after=2.5)

# Format Bottom Left: Challenges
for sh in s4.shapes:
    if sh.name == "TextBox 17414" and sh.has_text_frame:
        sh.left = Inches(0.40)
        sh.top = Inches(4.20)
        sh.width = Inches(6.05)
        sh.height = Inches(2.65)
        tf = sh.text_frame
        tf.word_wrap = True
        tf.clear()
        
        p0 = tf.paragraphs[0]
        p0.text = "Challenges"
        p0.font.name = "Segoe UI"
        p0.font.size = Pt(12.5)
        p0.font.bold = True
        p0.font.color.rgb = CLR_SECTION_BLUE
        p0.space_after = Pt(4)
        
        ch_bullets = [
            ("High-Throughput Simulation:", 
             "Sustaining 10,000+ continuous Monte Carlo iterations without latency at enterprise telemetry volume."),
            ("Heterogeneous Telemetry Normalization:", 
             "Ingesting and cross-referencing messy data across 6 distinct pillars into a unified FAIR graph."),
            ("GenAI Threat Amplification:", 
             "Rapid AI-assisted vulnerability discovery requires dynamic, real-time recalculation of attack probabilities."),
            ("Multi-Framework Compliance:", 
             "Mapping dynamic financial loss ceilings to rigid regulatory constraint matrices (RBI, DORA, ISO 27001).")
        ]
        for prefix, body in ch_bullets:
            p = tf.add_paragraph()
            format_bullet(p, prefix, body, size_pt=8.4, space_after=2.5)

# Format Bottom Right: Strategy — Closed-Loop Recalibration
for sh in s4.shapes:
    if sh.name == "TextBox 17415" and sh.has_text_frame:
        sh.left = Inches(6.92)
        sh.top = Inches(4.18)
        sh.width = Inches(6.03)
        sh.height = Inches(0.35)
        tf = sh.text_frame
        tf.clear()
        p0 = tf.paragraphs[0]
        p0.text = "Strategy — Closed-Loop Recalibration"
        p0.font.name = "Segoe UI"
        p0.font.size = Pt(12.5)
        p0.font.bold = True
        p0.font.color.rgb = CLR_SECTION_BLUE

# Place User's Recalibration Diagram in Bottom Right
if os.path.exists(IMG_SLIDE4_RECALIBRATION):
    s4.shapes.add_picture(IMG_SLIDE4_RECALIBRATION, Inches(6.25), Inches(4.50), width=Inches(6.45), height=Inches(2.40))


# ==============================================================================
# SLIDE 5: Impact and Benefits
# ==============================================================================
print("Refining Slide 5...")
s5 = prs.slides[4]

# Remove old picture or leftover box in bottom right
for sh in list(s5.shapes):
    if sh.name in ["TextBox 17416"]:
        sp = sh._element
        sp.getparent().remove(sp)

# Format Direct Impact on Target Users
for sh in s5.shapes:
    if sh.name == "TextBox 17410" and sh.has_text_frame:
        sh.left = Inches(0.40)
        sh.top = Inches(1.35)
        sh.width = Inches(6.05)
        sh.height = Inches(2.70)
        tf = sh.text_frame
        tf.word_wrap = True
        tf.clear()
        
        p0 = tf.paragraphs[0]
        p0.text = "Direct Impact on Target Users"
        p0.font.name = "Segoe UI"
        p0.font.size = Pt(12.5)
        p0.font.bold = True
        p0.font.color.rgb = CLR_SECTION_BLUE
        p0.space_after = Pt(4)
        
        u_bullets = [
            ("CISOs:", "Explainable, defensible rupee/dollar risk metrics (EAL & 95% VaR) replacing subjective RAG heatmaps."),
            ("CFOs & Boardrooms:", "Clear ROSI (Return on Security Investment) modeling for every proposed control budget."),
            ("Compliance Teams:", "Continuous evidence trail directly aligned to RBI CSITE, SEBI, SEC, and DORA mandates."),
            ("SOC Teams:", "Real-time visibility into how live telemetry (new CVEs, control drift) moves financial exposure.")
        ]
        for prefix, body in u_bullets:
            p = tf.add_paragraph()
            format_bullet(p, prefix, body, size_pt=8.4, space_after=2.5)

# Format Strategic Impact
for sh in s5.shapes:
    if sh.name == "TextBox 17413" and sh.has_text_frame:
        sh.left = Inches(0.40)
        sh.top = Inches(4.20)
        sh.width = Inches(6.05)
        sh.height = Inches(2.65)
        tf = sh.text_frame
        tf.word_wrap = True
        tf.clear()
        
        p0 = tf.paragraphs[0]
        p0.text = "Strategic Impact"
        p0.font.name = "Segoe UI"
        p0.font.size = Pt(12.5)
        p0.font.bold = True
        p0.font.color.rgb = CLR_SECTION_BLUE
        p0.space_after = Pt(4)
        
        s_bullets = [
            ("Mathematical Capital Allocation:", 
             "Moves enterprise cybersecurity spending from subjective guesswork to defensible financial models."),
            ("Real-Time Blast-Radius Containment:", 
             "Live incident tracking (95% VaR rising ₹18 Cr → ₹42 Cr → ₹125 Cr) triggering automated subnet isolation."),
            ("Atmanirbhar Bharat Cyber Sovereignty:", 
             "Establishes indigenous, high-assurance cyber risk quantification infrastructure for national security.")
        ]
        for prefix, body in s_bullets:
            p = tf.add_paragraph()
            format_bullet(p, prefix, body, size_pt=8.4, space_after=3.5)

# Format Economic & Strategic Benefits
for sh in s5.shapes:
    if sh.name == "TextBox 17414" and sh.has_text_frame:
        sh.left = Inches(6.90)
        sh.top = Inches(1.35)
        sh.width = Inches(6.03)
        sh.height = Inches(2.70)
        tf = sh.text_frame
        tf.word_wrap = True
        tf.clear()
        
        p0 = tf.paragraphs[0]
        p0.text = "Economic & Strategic Benefits"
        p0.font.name = "Segoe UI"
        p0.font.size = Pt(12.5)
        p0.font.bold = True
        p0.font.color.rgb = CLR_SECTION_BLUE
        p0.space_after = Pt(4)
        
        e_bullets = [
            ("Combinatorial Budget Optimization:", 
             "0/1 knapsack solver identifies ₹45 Lakh control mix yielding ₹1.15 Cr EAL reduction under ₹50 Lakh budget."),
            ("Proven 150% ROSI Validation:", 
             "Telemetry-backed evidence shows ₹30 Lakh EAL drop from a ₹12 Lakh IAM enhancement."),
            ("Diminishing Returns Solver:", 
             "Pinpoints the exact inflection point where additional security spend yields negligible risk reduction."),
            ("Self-Healing Model:", 
             "Replaces static annual re-assessments with an automated closed-loop model that gets smarter every budget cycle.")
        ]
        for prefix, body in e_bullets:
            p = tf.add_paragraph()
            format_bullet(p, prefix, body, size_pt=8.4, space_after=2.5)

# Add Bottom-Right Section Header for Slide 5
tb5_br = s5.shapes.add_textbox(Inches(6.90), Inches(4.18), Inches(6.03), Inches(0.35))
tf5_br = tb5_br.text_frame
tf5_br.clear()
p5_br = tf5_br.paragraphs[0]
p5_br.text = "Quantified Risk Reduction & ROSI Benchmark"
p5_br.font.name = "Segoe UI"
p5_br.font.size = Pt(12.5)
p5_br.font.bold = True
p5_br.font.color.rgb = CLR_SECTION_BLUE

# Insert Impact Chart in Bottom Right (Fix height with Inches!)
if os.path.exists(IMG_SLIDE5_IMPACT_CHART):
    s5.shapes.add_picture(IMG_SLIDE5_IMPACT_CHART, Inches(6.85), Inches(4.55), width=Inches(6.15), height=Inches(2.32))


# ==============================================================================
# SLIDE 6: Research & References (ZyraNav 6-Section Layout with Dashed Dividers)
# ==============================================================================
print("Refining Slide 6 (ZyraNav 6-Section Layout)...")
s6 = prs.slides[5]

# Remove previous shapes
for sh in list(s6.shapes):
    if sh.name in ["Rectangle 2", "Rectangle 4", "Rectangle 7", "Rectangle 10", "Rectangle 12",
                   "TextBox 17415", "TextBox 17416", "TextBox 17417", "TextBox 17418"]:
        sp = sh._element
        sp.getparent().remove(sp)

# 6 structured sections matching ZyraNav Slide 6 exactly
sections_data = [
    # (col, row, title, bullet_list)
    (0, 0, "Gap & Problem Identification", [
        ("Quantifying Cyber Catastrophe Losses (2025):", 
         "Empirical study analyzing why qualitative heatmaps fail under systemic supply chain failures and AI-driven attacks.", 
         "https://doi.org/10.1007/s10796-025-10678-z", "[Springer DOI]")
    ]),
    (0, 1, "Literature Survey & Framework Standardization", [
        ("FAIR Institute OpenFAIR™ Standard v3.0 (2025):", 
         "Official ontology decomposing exposure into Threat Event Frequency (TEF) and Probable Loss Magnitude (PLM).", 
         "https://www.fairinstitute.org/standards/fair-v3.0", "[Official Spec]")
    ]),
    (0, 2, "Stochastic & Extreme Value Modeling", [
        ("Kamdem & Kapsa — ML & EVT Risk Prediction (2025):", 
         "Mathematical formulation for heavy-tail Generalized Pareto Distribution (GPD) modeling of catastrophic cyber tail events.", 
         "https://doi.org/10.1007/s10796-025-10678-z", "[Springer Paper]")
    ]),
    (1, 0, "Multi-Cloud Financial Quantification", [
        ("FABRICS Framework (2026):", 
         "A Bayesian Approach to Financial Quantification of Cyber Risk in Enterprise Multi-Cloud Environments.", 
         "https://doi.org/10.1016/j.cose.2026.000763", "[ScienceDirect]")
    ]),
    (1, 1, "GenAI Threat Amplification Dynamics", [
        ("Risk Thresholds for AI-Enabled Cyber Threats (2026):", 
         "Bayesian network modeling of offensive LLM exploit generation and attacker capability scaling.", 
         "https://arxiv.org/abs/2601.17225", "[arXiv:2601.17225]")
    ]),
    (1, 2, "Actuarial Capital Allocation & ROSI", [
        ("Actuarial Cyber-Insurance Pricing Models (2025):", 
         "Optimal security control investment efficiency curves and portfolio optimization under fixed capital budgets.", 
         "https://doi.org/10.1017/S135732172500012X", "[Cambridge BAJ]")
    ])
]

# Section geometry (matching ZyraNav Slide 6)
x_positions = [Inches(0.40), Inches(6.90)]
y_positions = [Inches(1.35), Inches(3.18), Inches(4.98)]
box_w = Inches(6.00)
box_h = Inches(1.60)

for col_idx, row_idx, sec_title, items in sections_data:
    tb = s6.shapes.add_textbox(x_positions[col_idx], y_positions[row_idx], box_w, box_h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.clear()
    
    # Section Title
    p_t = tf.paragraphs[0]
    p_t.text = sec_title
    p_t.font.name = "Segoe UI"
    p_t.font.size = Pt(11.5)
    p_t.font.bold = True
    p_t.font.color.rgb = CLR_SECTION_BLUE
    p_t.space_after = Pt(3)
    
    for prefix, desc, link_url, link_text in items:
        p = tf.add_paragraph()
        p.space_after = Pt(2.5)
        p.line_spacing = 1.15
        p.level = 0
        
        # Bold Lead
        r_lead = p.add_run()
        r_lead.text = "• " + prefix + " "
        r_lead.font.name = "Segoe UI"
        r_lead.font.size = Pt(8.4)
        r_lead.font.bold = True
        r_lead.font.color.rgb = CLR_DARK_TEXT
        
        # Description
        r_desc = p.add_run()
        r_desc.text = desc + " "
        r_desc.font.name = "Segoe UI"
        r_desc.font.size = Pt(8.2)
        r_desc.font.color.rgb = CLR_MUTED_TEXT
        
        # Hyperlink
        r_link = p.add_run()
        r_link.text = link_text
        r_link.font.name = "Segoe UI"
        r_link.font.size = Pt(8.2)
        r_link.font.bold = True
        r_link.font.color.rgb = CLR_LINK_BLUE
        r_link.font.underline = True
        r_link.hyperlink.address = link_url

# Add authentic dashed line dividers on Slide 6 (matching template dividers)
# Horizontal divider 1
h1 = s6.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(0.40), Inches(3.08), Inches(12.93), Inches(3.08))
h1.line.color.rgb = CLR_DIVIDER_RED
h1.line.width = Pt(1)
h1.line.dash_style = MSO_LINE_DASH_STYLE.DASH

# Horizontal divider 2
h2 = s6.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(0.40), Inches(4.88), Inches(12.93), Inches(4.88))
h2.line.color.rgb = CLR_DIVIDER_RED
h2.line.width = Pt(1)
h2.line.dash_style = MSO_LINE_DASH_STYLE.DASH

# Vertical divider
v1 = s6.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(6.68), Inches(1.35), Inches(6.68), Inches(6.75))
v1.line.color.rgb = CLR_DIVIDER_RED
v1.line.width = Pt(1)
v1.line.dash_style = MSO_LINE_DASH_STYLE.DASH

# Save both locations
prs.save(SOURCE_PPTX)
try:
    prs.save(DESKTOP_OUTPUT_PPTX)
    saved_desktop = DESKTOP_OUTPUT_PPTX
except PermissionError:
    alt_desktop = r"C:\Users\subha\OneDrive\Desktop\SIH2026_AegisRisk_Inovatrix_Visible_Flowcharts.pptx"
    prs.save(alt_desktop)
    saved_desktop = f"{alt_desktop} (Desktop file was locked by open PowerPoint; saved to new file)"

print("\nAll 6 slides professionally refined and saved to:")
print("1. Workspace:", SOURCE_PPTX)
print("2. Desktop:", saved_desktop)
