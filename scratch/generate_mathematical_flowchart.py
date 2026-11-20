import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch

# 3-Column x 2-Row Publication-Grade Architecture
fig, ax = plt.subplots(figsize=(15.5, 9.2), dpi=300)
ax.set_xlim(0, 155)
ax.set_ylim(0, 95)
ax.axis('off')
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#ffffff')

def draw_card(x, y, w, h, title, formula, details, bg="#ffffff", border="#0284c7", 
              title_color="#0f172a", formula_color="#0284c7", radius=1.6):
    box = FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0.5,rounding_size={radius}",
                         facecolor=bg, edgecolor=border, linewidth=1.8, zorder=3)
    ax.add_patch(box)
    
    # Title Banner
    ax.text(x + w/2, y + h - 2.8, title, ha='center', va='center', fontsize=10,
            weight='bold', color=title_color, zorder=4)
    
    # Formula Box
    if formula:
        f_box = FancyBboxPatch((x + 2, y + h - 9.2), w - 4, 5.2, 
                               boxstyle="round,pad=0.2,rounding_size=0.9",
                               facecolor="#ffffff", edgecolor=border, linewidth=0.9, alpha=0.95, zorder=4)
        ax.add_patch(f_box)
        ax.text(x + w/2, y + h - 6.6, formula, ha='center', va='center', fontsize=9.2,
                weight='bold', color=formula_color, zorder=5)
    
    # Details text
    if details:
        ax.text(x + 3.0, y + (h - 9.2)/2 + 0.2, details, ha='left', va='center', fontsize=8.0,
                color="#334155", zorder=4, linespacing=1.35)

def draw_arrow(x1, y1, x2, y2, color="#0284c7", lw=2.0, label="", label_pos=0.5, label_offset=(0, 2.0)):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>", color=color, lw=lw, mutation_scale=14), zorder=2)
    if label:
        lx = x1 + (x2 - x1) * label_pos + label_offset[0]
        ly = y1 + (y2 - y1) * label_pos + label_offset[1]
        ax.text(lx, ly, label, ha='center', va='center', fontsize=7.6, color="#1e293b",
                weight='bold', style='italic',
                bbox=dict(boxstyle="round,pad=0.25", facecolor="#ffffff", edgecolor="#94a3b8", lw=0.7, alpha=0.98), zorder=5)

# HEADER / TITLE
ax.text(77.5, 91.8, "AegisRisk: Quantitative Cyber Risk Mathematical Architecture", 
        ha='center', va='center', fontsize=15, weight='bold', color='#0f172a')
ax.text(77.5, 88.5, "Standardized OpenFAIR™ Decomposition  →  Extreme Value Theory (EVT)  →  10,000 Monte Carlo Trials  →  0/1 Knapsack ROSI Solver", 
        ha='center', va='center', fontsize=8.8, style='italic', color='#64748b')

# ----------------- COLUMN 1: TELEMETRY & INPUT DISTRIBUTIONS -----------------
# STAGE 1: FREQUENCY (LEF)
draw_card(4, 52, 42, 33, 
          title="Stage 1: Threat Frequency (LEF)", 
          formula=r"$\mathbf{LEF}_i = \mathbf{TEF}_i \times \mathbf{V}_i \times (1 - \eta_{\mathrm{ctrl}})$", 
          details="• TEF: Baseline Threat Event Frequency (Poisson $\\lambda$)\n• GenAI Multiplier: $\\lambda_{\\mathrm{eff}} = \\lambda_{\\mathrm{base}} \\times M_{\\mathrm{AI}} \\;(1.0-2.5\\times)$\n• $V_i \\in [0, 1]$: Asset Vulnerability score from CVSS / EPSS\n• $\\eta_{\\mathrm{ctrl}} \\in [0, 1]$: Control Mitigation Efficacy",
          bg="#ecfdf5", border="#10b981", title_color="#065f46", formula_color="#047857")

# STAGE 2: LOSS MAGNITUDE (PLM)
draw_card(4, 15, 42, 33, 
          title="Stage 2: Loss Magnitude (PLM)", 
          formula=r"$\mathbf{PLM}_i = (\mathbf{L}_{\mathrm{dir}} + \mathbf{L}_{\mathrm{ind}} + \mathbf{L}_{\mathrm{reg}}) \times \omega_{\mathrm{crit}}$", 
          details="• Direct ($L_{\\mathrm{dir}}$): Forensics, incident response, notification\n• Indirect ($L_{\\mathrm{ind}}$): Operational outage, customer churn\n• Regulatory ($L_{\\mathrm{reg}}$): DPDPA / SEC statutory fines\n• Baseline Body: Lognormal $\\ln(L) \\sim \\mathcal{N}(\\mu, \\sigma^2)$",
          bg="#eff6ff", border="#3b82f6", title_color="#1e40af", formula_color="#1d4ed8")

# ----------------- COLUMN 2: OPENFAIR BASELINE & EVT TAIL PHYSICS -----------------
# STAGE 3: BASELINE EAL
draw_card(55, 52, 43, 33, 
          title="Stage 3: Expected Annual Loss (EAL)", 
          formula=r"$\mathbf{EAL}_{\mathrm{base}} = \sum_{i=1}^K \mathbf{LEF}_i \times \mathbb{E}[\mathbf{PLM}_i]$", 
          details="• Aggregates baseline risk across all enterprise assets\n• Yields deterministic annualized loss expectation (₹ / $)\n• Connects live asset telemetry to monetary exposure\n• Sets foundational baseline prior to stochastic trials",
          bg="#fef3c7", border="#f59e0b", title_color="#92400e", formula_color="#b45309")

# STAGE 4: EVT HEAVY-TAIL BREACH MODELING
draw_card(55, 15, 43, 33, 
          title="Stage 4: Extreme Value Theory (EVT)", 
          formula=r"$F_{\xi, \beta}(y) = 1 - \left(1 + \frac{\xi y}{\beta}\right)^{-1/\xi}$", 
          details="• Generalized Pareto Distribution (GPD) for losses $L > u$\n• Heavy-tail shape parameter $\\xi = 0.25$ (black-swan events)\n• Models catastrophic 98th+ percentile ransomware shock\n• Eliminates normal distribution breach underestimation",
          bg="#fff1f2", border="#f43f5e", title_color="#9f1239", formula_color="#be123c")

# ----------------- COLUMN 3: SIMULATION & OPTIMAL DECISION MAKING -----------------
# STAGE 5: 10,000 MONTE CARLO ITERATIONS
draw_card(107, 52, 44, 33, 
          title="Stage 5: 10,000 Monte Carlo Trials", 
          formula=r"$S^{(k)} = \sum_{i=1}^K \sum_{j=1}^{N_i^{(k)}} L_{i,j}^{(k)}$", 
          details="• For trial $k = 1 \\dots 10{,}000$:\n  - Sample count $N_i \\sim \\mathrm{Poisson}(\\mathrm{LEF}_i)$\n  - Sample severity $L_{i,j}$: Body (Lognormal) + Tail (GPD)\n• Board Metric Outputs:\n  - Mean EAL: $\\mu_S = \\frac{1}{M}\\sum S^{(k)}$\n  - 95% & 99% VaR: $F_S^{-1}(0.95)$ (Tail Risk Ceiling)",
          bg="#faf5ff", border="#a855f7", title_color="#6b21a8", formula_color="#7e22ce")

# STAGE 6: 0/1 KNAPSACK OPTIMIZATION
draw_card(107, 15, 44, 33, 
          title="Stage 6: 0/1 Knapsack ROSI Solver", 
          formula=r"$\max \sum \Delta \mathbf{EAL}_j \cdot x_j \;\; \mathrm{s.t.} \;\; \sum c_j x_j \leq B$", 
          details="• $x_j \\in \\{0, 1\\}$: Binary adoption decision per security control\n• $c_j$: Annualized control cost (e.g. ₹20L for EDR upgrade)\n• $\\Delta \\mathrm{EAL}_j$: Net risk reduction simulated via OpenFAIR\n• Objective: Maximize Return on Security Investment:\n  $\\mathrm{ROSI} = [(\\Delta \\mathrm{EAL} - \\mathrm{Cost}) / \\mathrm{Cost}] \\times 100\\%$",
          bg="#ecfeff", border="#06b6d4", title_color="#0e7490", formula_color="#0891b2")

# ----------------- INTER-STAGE ARROWS & ANNOTATIONS -----------------
# Col 1 -> Col 2
draw_arrow(46, 68.5, 55, 68.5, color="#10b981", lw=2.2, label="LEF Vector", label_pos=0.5, label_offset=(0, 2.0))
draw_arrow(46, 40.0, 55, 60.0, color="#3b82f6", lw=2.0, label="Loss Magnitude", label_pos=0.45, label_offset=(-1.5, 2.5))
draw_arrow(46, 31.5, 55, 31.5, color="#f43f5e", lw=2.2, label="Tail Exceedance (>u)", label_pos=0.5, label_offset=(0, 2.0))

# Col 2 -> Col 3
draw_arrow(98, 68.5, 107, 68.5, color="#f59e0b", lw=2.2, label="Baseline Prior", label_pos=0.5, label_offset=(0, 2.0))
draw_arrow(98, 35.0, 107, 60.0, color="#f43f5e", lw=2.0, label="Tail Shocks (GPD)", label_pos=0.45, label_offset=(-1.5, 2.5))

# Col 3: Stage 5 -> Stage 6 (Vertical Flow)
draw_arrow(129, 52, 129, 48, color="#a855f7", lw=2.4, label="Simulated Risk Deltas (ΔEAL)", label_pos=0.5, label_offset=(18.5, 0))

# ----------------- CLOSED LOOP TELEMETRY FOOTER -----------------
legend_box = FancyBboxPatch((4, 2.5), 147, 8.8, boxstyle="round,pad=0.4,rounding_size=1.2",
                            facecolor="#f8fafc", edgecolor="#cbd5e1", linewidth=1.4, zorder=3)
ax.add_patch(legend_box)

ax.text(6.5, 8.2, "Closed-Loop Telemetry & Verification Feedback Loop:", fontsize=9.0, weight='bold', color="#0f172a", zorder=4)
ax.text(6.5, 5.0, "1. Live Ingestion: SIEM alerts, Tenable CVSS/EPSS, and CMDB changes update LEF & PLM in real time.\n2. Closed-Loop Recalibration: trackRosiOutcome() validates post-deployment loss reductions against Knapsack projections.",
        fontsize=8.0, color="#475569", zorder=4, linespacing=1.3)

plt.tight_layout()

# Output destinations
p_desk_png = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_mathematical_flowchart.png"
p_desk_svg = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_mathematical_flowchart.svg"
p_down_png = r"c:\Users\subha\Downloads\aegisrisk_mathematical_flowchart.png"

plt.savefig(p_desk_png, dpi=300, bbox_inches='tight', facecolor='white')
plt.savefig(p_desk_svg, format='svg', bbox_inches='tight', facecolor='white')
plt.savefig(p_down_png, dpi=300, bbox_inches='tight', facecolor='white')

print("Enhanced Mathematical Flowchart generated successfully!")
