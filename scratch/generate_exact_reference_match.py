import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch

plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'DejaVu Sans', 'sans-serif']
plt.rcParams['font.family'] = 'sans-serif'

fig, ax = plt.subplots(figsize=(16, 8.5), dpi=300)
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')
fig.patch.set_facecolor('white')
ax.set_facecolor('white')

# Exact colors from reference
CLR_CORAL = "#ff8d70"
CLR_CORAL_BORDER = "#e06343"
CLR_TEAL = "#3dd5c3"
CLR_TEAL_BORDER = "#1fb8a5"
CLR_BLUE_BG = "#bfe5ff"
CLR_BLUE_BORDER = "#42a5f5"
CLR_PURPLE_BG = "#e5c8ff"
CLR_PURPLE_BORDER = "#ba68c8"
CLR_PINK = "#ff80ab"
CLR_PINK_BORDER = "#f50057"
CLR_GREEN_LINE = "#4caf50"
CLR_GRAY_ARROW = "#757575"
CLR_TEXT_DARK = "#212121"

def draw_pill(x, y, w, h, text, bg, border, fontsize=10, bold=True, text_color=CLR_TEXT_DARK):
    pill = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.2,rounding_size=1.2",
                          facecolor=bg, edgecolor=border, linewidth=1.6, zorder=4)
    ax.add_patch(pill)
    weight = 'bold' if bold else 'normal'
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=fontsize,
            color=text_color, weight=weight, zorder=5, multialignment='center', linespacing=1.2)

def draw_container(x, y, w, h, title, bg, border):
    container = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.3,rounding_size=1.5",
                               facecolor=bg, edgecolor=border, linewidth=1.6, zorder=1)
    ax.add_patch(container)
    ax.text(x + w/2, y + h + 1.6, title, ha='center', va='bottom', fontsize=11,
            color=CLR_TEXT_DARK, weight='normal', zorder=2)

def draw_arrow(x1, y1, x2, y2, color=CLR_GRAY_ARROW, lw=1.6, label="", label_pos=0.5, label_offset=(0, 1.2), label_fs=8):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", color=color, lw=lw, mutation_scale=13), zorder=3)
    if label:
        lx = x1 + (x2 - x1) * label_pos + label_offset[0]
        ly = y1 + (y2 - y1) * label_pos + label_offset[1]
        ax.text(lx, ly, label, ha='center', va='center', fontsize=label_fs, color=CLR_TEXT_DARK,
                weight='normal', zorder=6)

# 1. TITLE
ax.text(3, 94.5, "FLOW CHART", fontsize=22, color="#1565c0", weight="bold")
ax.plot([3, 19], [93, 93], color="#1565c0", lw=2.2)

# 2. FAR-LEFT OUTPUT BOX (PNT equivalent)
draw_pill(4, 43, 7.5, 12, "EAL\n&\nVaR", bg="white", border="#757575", fontsize=11, bold=True)

# 3. LEFT COLUMN (GNSS -> LEO SoO -> INS equivalent)
draw_pill(18, 64, 15, 17, "6-Pillar\nTelemetry\n(Live Data)", 
          bg=CLR_CORAL, border=CLR_CORAL_BORDER, fontsize=12, bold=True)

draw_pill(19.5, 44, 12, 10, "Batch Vuln\nScans & CMDB", 
          bg=CLR_TEAL, border=CLR_TEAL_BORDER, fontsize=9.5, bold=True)

draw_pill(19.5, 23, 12, 11, "Industry Priors\n& Benchmarks\n(MITRE/KEV)", 
          bg=CLR_TEAL, border=CLR_TEAL_BORDER, fontsize=9, bold=True)

# FAIR pill top
draw_pill(34, 76, 11, 6.5, "FAIR\nDecomposition", bg=CLR_TEAL, border=CLR_TEAL_BORDER, fontsize=8.5, bold=True)

draw_arrow(33, 72.5, 34, 77.5, color=CLR_GRAY_ARROW)
ax.text(35, 69.5, "For simulation", fontsize=8, color=CLR_TEXT_DARK)

draw_arrow(25.5, 64, 25.5, 54, color=CLR_CORAL_BORDER)
ax.text(28.5, 59, "No live stream", fontsize=8, color=CLR_TEXT_DARK)

draw_arrow(25.5, 44, 25.5, 34, color=CLR_CORAL_BORDER)
ax.text(28.5, 39, "No scan data", fontsize=8, color=CLR_TEXT_DARK)

# Green lines
ax.plot([18, 14.5, 14.5], [72.5, 72.5, 49], color=CLR_GREEN_LINE, lw=2.0, zorder=2)
ax.plot([19.5, 14.5], [49, 49], color=CLR_GREEN_LINE, lw=2.0, zorder=2)
ax.plot([19.5, 14.5, 14.5], [28.5, 28.5, 49], color=CLR_GREEN_LINE, lw=2.0, zorder=2)
draw_arrow(14.5, 49, 11.5, 49, color=CLR_GREEN_LINE, lw=2.0)
ax.text(16, 51.5, "loss curve", fontsize=8, color="#2e7d32", weight='normal')

# 4. TOP-RIGHT BLUE CONTAINER (Stimulation container)
draw_container(54, 49, 43, 38, "Simulation of Cyber Loss Events (Monte Carlo + EVT)", CLR_BLUE_BG, CLR_BLUE_BORDER)

# Arrow from FAIR pill into blue container
ax.annotate("", xy=(56, 75), xytext=(45, 79.25),
            arrowprops=dict(arrowstyle="->", color=CLR_GRAY_ARROW, lw=1.5), zorder=3)
ax.text(50.5, 84.5, "avoiding static bias\n(EVT parameterization)", fontsize=7.8, color=CLR_TEXT_DARK, ha='center')

# 5 Boxes inside Blue container
draw_pill(56, 71, 15, 8, "Threat Event\nModeling", bg=CLR_TEAL, border=CLR_TEAL_BORDER, fontsize=8.5)
draw_pill(74.5, 71, 9.5, 8, "GenAI Threat\nAmplifier", bg=CLR_TEAL, border=CLR_TEAL_BORDER, fontsize=8)
draw_pill(87.5, 71, 8, 8, "Loss Magnitude\n(PLM)", bg=CLR_TEAL, border=CLR_TEAL_BORDER, fontsize=7.8)
draw_pill(72.5, 53, 14.5, 8, "Adding Fat-Tail Noise\n& EVT Modeling (GPD)", bg=CLR_TEAL, border=CLR_TEAL_BORDER, fontsize=7.8)
draw_pill(56, 53, 13.5, 8, "Simulate 10,000 Trials\n& Compute VaR", bg=CLR_TEAL, border=CLR_TEAL_BORDER, fontsize=8)

draw_arrow(71, 75, 74.5, 75)
draw_arrow(84, 75, 87.5, 75)
ax.plot([95.5, 95.5, 87], [75, 57, 57], color=CLR_GRAY_ARROW, lw=1.5, zorder=2)
draw_arrow(87.5, 57, 87, 57)
draw_arrow(72.5, 57, 69.5, 57)

# Inner loop
draw_arrow(62.75, 61, 62.75, 71)
ax.text(67.5, 66.5, "<95% matches", fontsize=7.5, color=CLR_TEXT_DARK)
ax.text(59, 66.5, "Re-simulate", fontsize=7.5, color=CLR_TEXT_DARK)

# Exit arrow
ax.plot([56, 51.5, 51.5], [57, 57, 44], color=CLR_BLUE_BORDER, lw=1.6, zorder=2)
draw_arrow(51.5, 45, 51.5, 43, color=CLR_BLUE_BORDER)
ax.text(57.5, 46.5, ">95% matches", fontsize=8, color=CLR_TEXT_DARK)

# 5. MIDDLE-BOTTOM PURPLE CONTAINER
draw_container(34, 4, 18, 40, "0/1 Knapsack ROSI Optimizer", CLR_PURPLE_BG, CLR_PURPLE_BORDER)

pink_boxes = [
    "Control Catalog & Costs",
    "Telemetry Drift Efficacy",
    "ROSI Optimization Solver",
    "Vendor SPoF Surcharge",
    "Optimal Control Mix"
]

py = 34.5
for i, name in enumerate(pink_boxes):
    draw_pill(35.5, py, 15, 5.5, name, bg=CLR_PINK, border=CLR_PINK_BORDER, fontsize=8)
    if i < len(pink_boxes) - 1:
        draw_arrow(43, py, 43, py - 2.8, color="#ba68c8")
    py -= 7.2

# External Pink Pill
draw_pill(56, 22.5, 17, 7.5, "CISA KEV & Zero-Day\nPrioritization Matrix", bg=CLR_PINK, border=CLR_PINK_BORDER, fontsize=8)
draw_arrow(56, 26.25, 50.5, 26.25, color=CLR_PINK_BORDER)

# Loop back to Batch Scans
ax.plot([35.5, 31.5, 31.5], [6.75, 6.75, 49], color=CLR_GRAY_ARROW, lw=1.5, zorder=2)
draw_arrow(31.5, 49, 31.5, 49, color=CLR_GRAY_ARROW)

plt.tight_layout()
out_png = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_flowchart_exact_match.png"
out_svg = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_flowchart_exact_match.svg"
plt.savefig(out_png, dpi=300, bbox_inches='tight', facecolor='white')
plt.savefig(out_svg, format='svg', bbox_inches='tight', facecolor='white')
plt.savefig(r"c:\Users\subha\Downloads\aegisrisk_flowchart_exact_match.png", dpi=300, bbox_inches='tight', facecolor='white')
print("Polished flowchart successfully generated.")
