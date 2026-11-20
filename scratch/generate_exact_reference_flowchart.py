import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch

fig, ax = plt.subplots(figsize=(16, 8.5), dpi=300)
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')
fig.patch.set_facecolor('white')
ax.set_facecolor('white')

# Reference colors
C_RED_BG = "#ffb4a2"
C_RED_BORDER = "#e07a5f"
C_TEAL_BG = "#5eead4"
C_TEAL_BORDER = "#14b8a6"
C_BLUE_CONTAINER = "#bae6fd"
C_BLUE_BORDER = "#0284c7"
C_PURPLE_CONTAINER = "#e9d5ff"
C_PURPLE_BORDER = "#a855f7"
C_PINK_BG = "#fbcfe8"
C_PINK_BORDER = "#ec4899"
C_GREEN_LINE = "#22c55e"
C_GRAY_ARROW = "#64748b"

def draw_pill(x, y, w, h, text, bg, border, fontsize=9, text_color="#0f172a", bold=True):
    pill = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.3,rounding_size=1.2",
                          facecolor=bg, edgecolor=border, linewidth=1.5, zorder=4)
    ax.add_patch(pill)
    weight = 'bold' if bold else 'normal'
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=fontsize,
            color=text_color, weight=weight, zorder=5, multialignment='center', linespacing=1.15)

def draw_container(x, y, w, h, title, bg, border):
    container = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5,rounding_size=1.5",
                               facecolor=bg, edgecolor=border, linewidth=1.5, zorder=1)
    ax.add_patch(container)
    ax.text(x + w/2, y + h + 1.8, title, ha='center', va='bottom', fontsize=11,
            color="#0f172a", weight='normal', zorder=2)

def draw_arrow(x1, y1, x2, y2, color=C_GRAY_ARROW, lw=1.6, label="", label_pos=0.5, label_offset=(0, 1.2)):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", color=color, lw=lw, mutation_scale=12), zorder=3)
    if label:
        lx = x1 + (x2 - x1) * label_pos + label_offset[0]
        ly = y1 + (y2 - y1) * label_pos + label_offset[1]
        ax.text(lx, ly, label, ha='center', va='center', fontsize=7.6, color="#1e293b",
                weight='normal', zorder=6)

# TITLE
ax.text(3, 94.5, "FLOW CHART", fontsize=20, color="#1e40af", weight="bold")
ax.plot([3, 19], [93, 93], color="#1e40af", lw=2.2)

# LEFT OUTPUT BOX (PNT equivalent)
draw_pill(4, 42, 8, 12, "EAL\n&\nVaR", bg="white", border="#64748b", fontsize=11, bold=True)
ax.text(8, 38, "(₹ / $ Metric)", ha='center', fontsize=7.5, color="#475569", weight='bold')

# 3-TIER PRIMARY COLUMN
# Tier 1: LIVE TELEMETRY (GNSS equivalent)
draw_pill(18, 64, 15, 17, "Live 6-Pillar\nTelemetry\n(API / SIEM / EDR)", 
          bg=C_RED_BG, border=C_RED_BORDER, fontsize=10.5, bold=True)

# Tier 2: BATCH VULN SCANS (LEO SoO equivalent)
draw_pill(19.5, 43, 12, 9, "Batch Vuln Scans\n& CMDB (CSV)", 
          bg=C_TEAL_BG, border=C_TEAL_BORDER, fontsize=8.5, bold=True)

# Tier 3: INDUSTRY BENCHMARKS (INS IMU equivalent)
draw_pill(19.5, 22, 12, 11, "Industry Priors\n& MITRE Benchmarks\n(Synthetic)", 
          bg=C_TEAL_BG, border=C_TEAL_BORDER, fontsize=8, bold=True)

# Top intermediate pill (PNT pill equivalent)
draw_pill(34, 76, 11, 6.5, "FAIR\nDecomposition", bg=C_TEAL_BG, border=C_TEAL_BORDER, fontsize=8, bold=True)

# Arrows between Tiers on Left
draw_arrow(33, 72.5, 34, 78, color=C_GRAY_ARROW)
ax.text(34.5, 69.5, "For simulation", fontsize=7.5, color="#334155")

draw_arrow(25.5, 64, 25.5, 52, color="#ef4444")
ax.text(29, 58, "No live stream", fontsize=7.5, color="#334155")

draw_arrow(25.5, 43, 25.5, 33, color="#ef4444")
ax.text(29, 38, "No scan data", fontsize=7.5, color="#334155")

# Left green arrows converging to EAL/VaR box
ax.plot([18, 14.5, 14.5], [72.5, 72.5, 48], color=C_GREEN_LINE, lw=1.8, zorder=2)
ax.plot([19.5, 14.5], [47.5, 47.5], color=C_GREEN_LINE, lw=1.8, zorder=2)
ax.plot([19.5, 14.5, 14.5], [27.5, 27.5, 48], color=C_GREEN_LINE, lw=1.8, zorder=2)
draw_arrow(14.5, 48, 12, 48, color=C_GREEN_LINE, lw=1.8)
ax.text(15.5, 50.5, "loss curve", fontsize=7.5, color="#15803d", weight='bold')

# TOP-RIGHT BLUE CONTAINER (Simulation of LEO Satellite signal equivalent)
draw_container(54, 49, 43, 38, "Continuous Monte Carlo & EVT Threat Simulation", C_BLUE_CONTAINER, C_BLUE_BORDER)

# Top arrow from FAIR pill into Simulation container
ax.annotate("", xy=(56, 75), xytext=(45, 79.25),
            arrowprops=dict(arrowstyle="->", color=C_GRAY_ARROW, lw=1.5), zorder=3)
ax.text(50.5, 83, "avoiding static bias\n(EVT parameterization)", fontsize=7.2, color="#334155", ha='center')

# Step 1
draw_pill(56, 71, 16, 8, "Threat Event\nModeling (TEF)", bg=C_TEAL_BG, border=C_TEAL_BORDER, fontsize=8)
# Step 2
draw_pill(76, 71, 8.5, 8, "GenAI Threat\nAmplifier", bg=C_TEAL_BG, border=C_TEAL_BORDER, fontsize=7.5)
# Step 3
draw_pill(88, 71, 8, 8, "Loss Magnitude\n(PLM Vectors)", bg=C_TEAL_BG, border=C_TEAL_BORDER, fontsize=7.2)
# Step 4
draw_pill(73, 53, 14, 8, "Box-Muller Lognormal +\nGPD Fat-Tail (EVT)", bg=C_TEAL_BG, border=C_TEAL_BORDER, fontsize=7.5)
# Step 5
draw_pill(56, 53, 14, 8, "Simulate 10,000 Trials\n& Compute VaR", bg=C_TEAL_BG, border=C_TEAL_BORDER, fontsize=7.8)

# Arrows inside Blue Container
draw_arrow(72, 75, 76, 75)
draw_arrow(84.5, 75, 88, 75)
ax.plot([96, 96, 87], [75, 57, 57], color=C_GRAY_ARROW, lw=1.5, zorder=2)
draw_arrow(87.5, 57, 87, 57)
draw_arrow(73, 57, 70, 57)

# Loop back inside simulation if <95% CI
draw_arrow(63, 61, 63, 71, label="<95% CI\nRe-simulate", label_pos=0.5, label_offset=(4.5, 0))

# Exit arrow from Blue Container down to Purple Container (>95% Converged)
ax.plot([56, 51.5, 51.5], [57, 57, 44], color=C_BLUE_BORDER, lw=1.6, zorder=2)
draw_arrow(51.5, 45, 51.5, 43, color=C_BLUE_BORDER)
ax.text(55.5, 46.5, ">95% Converged", fontsize=7.5, color="#0369a1", weight='bold')

# MIDDLE-BOTTOM PURPLE CONTAINER (Adaptive signal processing equivalent)
draw_container(34, 4, 18, 40, "0/1 Knapsack ROSI Optimizer", C_PURPLE_CONTAINER, C_PURPLE_BORDER)

# 5 Stacked vertical pink boxes
pink_steps = [
    "Control Catalog & Costs",
    "Telemetry Drift Efficacy",
    "ROSI Solver ((ΔEAL-Cost)/Cost)",
    "Vendor SPoF Surcharge",
    "Optimal Control Mix"
]

py = 34.5
for i, step in enumerate(pink_steps):
    draw_pill(35.5, py, 15, 5.5, step, bg=C_PINK_BG, border=C_PINK_BORDER, fontsize=7.5)
    if i < len(pink_steps) - 1:
        draw_arrow(43, py, 43, py - 2.8, color="#a855f7")
    py -= 7.2

# External Pink Callout (AI Avoids Spoofed equivalent)
draw_pill(56, 22.5, 17, 7.5, "Zero-Day & KEV Priority\nPenalty Matrix", bg=C_PINK_BG, border=C_PINK_BORDER, fontsize=8)
draw_arrow(56, 26.25, 50.5, 26.25, color="#ec4899")

# Loop from bottom of purple stack back to Tier 2 (Batch Vuln Scans)
ax.plot([35.5, 31.5, 31.5], [6.75, 6.75, 47.5], color=C_GRAY_ARROW, lw=1.5, zorder=2)
draw_arrow(31.5, 47.5, 31.5, 47.5, color=C_GRAY_ARROW)

plt.tight_layout()
out_png = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_reference_style_flowchart.png"
out_svg = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_reference_style_flowchart.svg"
plt.savefig(out_png, dpi=300, bbox_inches='tight', facecolor='white')
plt.savefig(out_svg, format='svg', bbox_inches='tight', facecolor='white')
plt.savefig(r"c:\Users\subha\Downloads\aegisrisk_reference_style_flowchart.png", dpi=300, bbox_inches='tight', facecolor='white')
print(f"Refined flowchart saved to {out_png}")
