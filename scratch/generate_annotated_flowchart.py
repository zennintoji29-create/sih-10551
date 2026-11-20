import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch

# Set figure size for 16:9 widescreen or slide placement
fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')

# Background color
fig.patch.set_facecolor('white')
ax.set_facecolor('white')

# Style helper functions
def draw_box(x, y, w, h, text, subtext="", bg="#ffffff", border="#0284c7", text_color="#0f172a", radius=1.8, fontsize=9.5, bold=True):
    box = FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0.6,rounding_size={radius}", 
                         facecolor=bg, edgecolor=border, linewidth=1.8, zorder=3)
    ax.add_patch(box)
    full_text = text if not subtext else f"{text}\n{subtext}"
    weight = 'bold' if bold else 'normal'
    ax.text(x + w/2, y + h/2, full_text, ha='center', va='center', fontsize=fontsize, 
            color=text_color, weight=weight, zorder=4, multialignment='center', linespacing=1.25)

def draw_container(x, y, w, h, title, bg="#f0f9ff", border="#bae6fd"):
    container = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.8,rounding_size=2",
                               facecolor=bg, edgecolor=border, linewidth=1.6, linestyle="--", zorder=1)
    ax.add_patch(container)
    ax.text(x + w/2, y + h - 2.8, title, ha='center', va='center', fontsize=11, 
            color="#0369a1", weight='bold', zorder=2)

def draw_arrow(x1, y1, x2, y2, color="#475569", lw=2.0, label="", label_pos=0.5, label_offset=(0, 1.8), label_bg="#ffffff"):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>", color=color, lw=lw, mutation_scale=15), zorder=2)
    if label:
        lx = x1 + (x2 - x1) * label_pos + label_offset[0]
        ly = y1 + (y2 - y1) * label_pos + label_offset[1]
        ax.text(lx, ly, label, ha='center', va='center', fontsize=8.2, color="#1e293b", 
                style='italic', weight='bold',
                bbox=dict(boxstyle="round,pad=0.25", facecolor=label_bg, edgecolor="#cbd5e1", lw=0.6, alpha=0.95), zorder=5)

# ----------------- TITLE -----------------
ax.text(4, 95.5, "FLOW CHART: AegisRisk Continuous Cyber Risk Quantification & ROSI Optimization", 
        fontsize=15, color="#0f172a", weight="bold")
ax.plot([4, 46], [94, 94], color="#0284c7", lw=2.5)

# ----------------- 1. LEFT COLUMN: TELEMETRY & INGESTION -----------------
# Main source box (Coral / Red)
draw_box(4, 76, 21, 13, "6-Pillar Security Telemetry", 
         "SIEM/EDR, CMDB Assets, CVSS/EPSS,\nThreat Intel, Controls, Financial Loss", 
         bg="#fee2e2", border="#ef4444", text_color="#991b1b", fontsize=9.5)

# Ingestion Pipeline (Teal)
draw_box(4, 50, 21, 12, "Continuous Ingestion &\nNormalization Pipeline", 
         "Kafka / REST Event Stream\nData Confidence Index (0.0–1.0)", 
         bg="#ccfbf1", border="#14b8a6", text_color="#0f766e", fontsize=9.5)

# Telemetry Drift Monitor (Cyan/Blue)
draw_box(4, 23, 21, 12, "Telemetry Drift &\nControl Efficacy Monitor", 
         "Tracks Agent Drops & Deviations\n(e.g., EDR Offline, Rule Drift)", 
         bg="#e0f2fe", border="#0284c7", text_color="#0369a1", fontsize=9.5)

# Arrows on Left Spine
draw_arrow(14.5, 76, 14.5, 62, color="#ef4444", label="Event-Driven Streaming", label_offset=(6.8, 0))
draw_arrow(14.5, 50, 14.5, 35, color="#0284c7", label="Control Drift Signals", label_offset=(6.8, 0))

# ----------------- 2. UPPER CONTAINER: PROBABILISTIC RISK ENGINE -----------------
draw_container(29, 45, 43, 47, "Continuous Probabilistic Risk Engine (OpenFAIR + EVT Fat-Tail)")

# Step 1: OpenFAIR LEF
draw_box(31, 75, 18, 11.5, "OpenFAIR LEF Engine", 
         "LEF = TEF × Vuln × (1 − CE)\nGenAI Threat Multiplier", 
         bg="#d1fae5", border="#10b981", text_color="#065f46", fontsize=8.8)

# Step 2: OpenFAIR PLM
draw_box(52.5, 75, 18, 11.5, "OpenFAIR PLM Engine", 
         "PLM = (Direct + Indirect\n+ Regulatory) × Criticality", 
         bg="#d1fae5", border="#10b981", text_color="#065f46", fontsize=8.8)

# Step 3: Monte Carlo Simulator
draw_box(31, 52, 18, 11.5, "Monte Carlo Simulation", 
         "10,000 Iterations\nBox-Muller Lognormal Jitter", 
         bg="#ecfdf5", border="#059669", text_color="#065f46", fontsize=8.8)

# Step 4: EVT GPD Tail Adjustment
draw_box(52.5, 52, 18, 11.5, "Extreme Value Theory (EVT)", 
         "Generalized Pareto Tail (GPD)\nModels Catastrophic 2% Tails", 
         bg="#ecfdf5", border="#059669", text_color="#065f46", fontsize=8.8)

# Internal arrows within Upper Container
draw_arrow(25, 82.5, 31, 82.5, color="#10b981", label="Normalized Feeds", label_offset=(-0.5, 2))
draw_arrow(49, 80.75, 52.5, 80.75, color="#10b981")
draw_arrow(40, 75, 40, 63.5, color="#10b981", label="Threat Frequency", label_offset=(4.5, 0))
draw_arrow(61.5, 75, 61.5, 63.5, color="#059669", label="Loss Magnitude", label_offset=(4.5, 0))
draw_arrow(49, 57.75, 52.5, 57.75, color="#059669")

# ----------------- 3. TOP RIGHT OUTPUT: FINANCIAL RISK CURVES -----------------
draw_box(76, 59, 20, 26, "Quantified Loss Metrics\n(₹ / $)", 
         "• Expected Annual Loss (EAL)\n• 95% & 99% Value at Risk (VaR)\n• Explainable Change Attribution\n(Root-cause ₹ attribution per CVE)\n• SEC Item 106 & RBI Compliance", 
         bg="#fef3c7", border="#f59e0b", text_color="#92400e", fontsize=9)

draw_arrow(70.5, 57.75, 76, 68, color="#d97706", label="10k Loss Trials", label_offset=(-1.5, 2.2))

# ----------------- 4. LOWER CONTAINER: 0/1 KNAPSACK OPTIMIZER -----------------
draw_container(29, 13, 43, 30, "0/1 Knapsack Investment & SPoF Optimization Engine", bg="#faf5ff", border="#d8b4fe")

# Stacked steps inside purple container
draw_box(31, 31.5, 39, 6.8, "Candidate Security Controls & Telemetry Catalog", 
         "Costs (CapEx/OpEx), Mitigation %, and Historical Validation Confidence", 
         bg="#fce7f3", border="#ec4899", text_color="#9d174d", fontsize=8.2)

draw_box(31, 23, 39, 6.8, "ROSI Maximization & Knapsack DP Solver", 
         "ROSI = (ΔEAL − Cost) / Cost under Strict Budget Limit (e.g., ₹1 Crore)", 
         bg="#fce7f3", border="#ec4899", text_color="#9d174d", fontsize=8.2)

draw_box(31, 14.5, 39, 6.8, "Vendor SPoF & Concentration Risk Surcharge", 
         "Penalizes Multi-Vendor Correlated Failures (CrowdStrike-style Outage Risk)", 
         bg="#fdf2f8", border="#db2777", text_color="#9d174d", fontsize=8.2)

# Vertical arrows in Knapsack container
draw_arrow(50.5, 31.5, 50.5, 29.8, color="#ec4899")
draw_arrow(50.5, 23, 50.5, 21.3, color="#ec4899")

# Feeding from outputs & drift into Knapsack
draw_arrow(76, 60, 70, 35, color="#d97706", label="Current EAL & VaR", label_offset=(3.5, 2))
draw_arrow(25, 29, 31, 29, color="#0284c7", label="Drift Recalibration", label_offset=(-1, 1.8))

# ----------------- 5. BOTTOM RIGHT OUTPUT: BOARD INVESTMENT PLAN -----------------
draw_box(76, 15, 20, 22, "Optimal Board-Ready\nInvestment Plan", 
         "• Mathematically Optimal Control Mix\n• Maximized Portfolio ROSI\n• SPoF Mitigation Roadmap\n• Defensible CapEx/OpEx ROI\n• Executive Board Heatmap Replacement", 
         bg="#dcfce7", border="#22c55e", text_color="#166534", fontsize=8.8)

draw_arrow(70, 20, 76, 20, color="#22c55e", label="Optimal Controls", label_offset=(-0.5, 1.8))

# ----------------- 6. CLOSED-LOOP FEEDBACK PIPELINE (PERFECT ROUTING AROUND OUTSIDE) -----------------
# 3-segment right-angle path from bottom of Board Plan back to Ingestion
ax.annotate("", xy=(86, 7), xytext=(86, 15),
            arrowprops=dict(arrowstyle="-", color="#0284c7", lw=2.2, linestyle="--"), zorder=6)
ax.annotate("", xy=(14.5, 7), xytext=(86, 7),
            arrowprops=dict(arrowstyle="-", color="#0284c7", lw=2.2, linestyle="--"), zorder=6)
ax.annotate("", xy=(14.5, 23), xytext=(14.5, 7),
            arrowprops=dict(arrowstyle="-|>", color="#0284c7", lw=2.2, linestyle="--", mutation_scale=15), zorder=6)

ax.text(50, 7, "  Closed-Loop Model Assurance: Post-Deployment Incident Tracking (trackRosiOutcome) Recalibrates Internal Distributions (Observe → Quantify → Optimize → Validate)  ", 
        ha='center', va='center', fontsize=8.5, color="#0369a1", weight='bold',
        bbox=dict(boxstyle="round,pad=0.4", facecolor="#f0f9ff", edgecolor="#0284c7", lw=1.2), zorder=7)

# Save to Desktop, Downloads, and scratch
output_desktop_png = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_flowchart_annotated.png"
output_desktop_svg = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_flowchart_annotated.svg"
output_local = r"c:\Users\subha\Downloads\sih-10551\scratch\aegisrisk_flowchart_annotated.png"

plt.tight_layout()
plt.savefig(output_desktop_png, dpi=300, bbox_inches='tight', facecolor='white')
plt.savefig(output_desktop_svg, format='svg', bbox_inches='tight', facecolor='white')
plt.savefig(output_local, dpi=300, bbox_inches='tight', facecolor='white')
print("Polished flowchart generated successfully!")
