import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

# Compact, slide-friendly dimensions (compact ratio, high DPI)
fig, ax = plt.subplots(figsize=(12, 4.8), dpi=300)
ax.set_xlim(0, 120)
ax.set_ylim(0, 52)
ax.axis('off')
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#ffffff')

def draw_compact_node(x, y, w, h, title, formula, bg="#ffffff", border="#0284c7", 
                      title_color="#0f172a", formula_color="#0284c7"):
    # Outer card
    box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.4,rounding_size=1.2",
                         facecolor=bg, edgecolor=border, linewidth=1.6, zorder=3)
    ax.add_patch(box)
    
    # Title
    ax.text(x + w/2, y + h - 3.2, title, ha='center', va='center', fontsize=9.2,
            weight='bold', color=title_color, zorder=4)
    
    # Formula box (White pill inside)
    f_box = FancyBboxPatch((x + 1.8, y + 2.0), w - 3.6, h - 6.5, 
                           boxstyle="round,pad=0.2,rounding_size=0.8",
                           facecolor="#ffffff", edgecolor=border, linewidth=0.8, alpha=0.95, zorder=4)
    ax.add_patch(f_box)
    
    # Formula text
    ax.text(x + w/2, y + 2.0 + (h - 6.5)/2, formula, ha='center', va='center', fontsize=9.0,
            weight='bold', color=formula_color, zorder=5)

def draw_compact_arrow(x1, y1, x2, y2, color="#0284c7", lw=1.8, label=""):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>", color=color, lw=lw, mutation_scale=12), zorder=2)
    if label:
        lx = (x1 + x2) / 2
        ly = (y1 + y2) / 2 + 1.6
        ax.text(lx, ly, label, ha='center', va='center', fontsize=7.2, color="#1e293b",
                weight='bold', style='italic',
                bbox=dict(boxstyle="round,pad=0.15", facecolor="#ffffff", edgecolor="#cbd5e1", lw=0.5, alpha=0.9), zorder=5)

# TITLE / HEADER (Compact)
ax.text(60, 48.5, "AegisRisk: Mathematical Risk Pipeline", 
        ha='center', va='center', fontsize=12, weight='bold', color='#0f172a')

# ---------------- ROW 1 (Inputs to Baseline) ----------------
# Stage 1: Threat Frequency
draw_compact_node(3, 27, 34, 15, 
                  title="Stage 1: Threat Freq (LEF)", 
                  formula=r"$\mathbf{LEF}_i = \mathbf{TEF}_i \cdot \mathbf{V}_i \cdot (1 - \eta)$",
                  bg="#ecfdf5", border="#10b981", title_color="#065f46", formula_color="#047857")

# Stage 2: Loss Magnitude
draw_compact_node(43, 27, 34, 15, 
                  title="Stage 2: Loss Magnitude (PLM)", 
                  formula=r"$\mathbf{PLM}_i = (\mathbf{L}_{dir} + \mathbf{L}_{ind} + \mathbf{L}_{reg}) \cdot \omega_i$",
                  bg="#eff6ff", border="#3b82f6", title_color="#1e40af", formula_color="#1d4ed8")

# Stage 3: Baseline EAL
draw_compact_node(83, 27, 34, 15, 
                  title="Stage 3: Baseline EAL", 
                  formula=r"$\mathbf{EAL}_{\mathrm{base}} = \sum \mathbf{LEF}_i \times \mathbb{E}[\mathbf{PLM}_i]$",
                  bg="#fef3c7", border="#f59e0b", title_color="#92400e", formula_color="#b45309")

# ---------------- ROW 2 (Fat-Tail, Monte Carlo, Knapsack) ----------------
# Stage 4: EVT Tail Shock
draw_compact_node(3, 6, 34, 15, 
                  title="Stage 4: EVT Tail Shock (GPD)", 
                  formula=r"$F_{\xi, \beta}(y) = 1 - (1 + \frac{\xi y}{\beta})^{-1/\xi}$",
                  bg="#fff1f2", border="#f43f5e", title_color="#9f1239", formula_color="#be123c")

# Stage 5: 10,000 Monte Carlo Trials
draw_compact_node(43, 6, 34, 15, 
                  title="Stage 5: 10,000 Monte Carlo", 
                  formula=r"$S^{(k)} = \sum \sum L_{i,j}^{(k)} \rightarrow \mathbf{95\% \, VaR}$",
                  bg="#faf5ff", border="#a855f7", title_color="#6b21a8", formula_color="#7e22ce")

# Stage 6: Knapsack Solver
draw_compact_node(83, 6, 34, 15, 
                  title="Stage 6: Knapsack ROSI Solver", 
                  formula=r"$\max \sum \Delta \mathbf{EAL}_j \cdot x_j \;\; \mathrm{s.t.} \;\; \sum c_j x_j \leq B$",
                  bg="#ecfeff", border="#06b6d4", title_color="#0e7490", formula_color="#0891b2")

# ---------------- CONNECTING ARROWS ----------------
# Row 1 Flow
draw_compact_arrow(37, 34.5, 43, 34.5, color="#10b981", lw=1.8)
draw_compact_arrow(77, 34.5, 83, 34.5, color="#3b82f6", lw=1.8)

# Row 1 to Row 2: Baseline into Monte Carlo
draw_compact_arrow(100, 27, 60, 21, color="#f59e0b", lw=1.8, label="Baseline Prior")

# Stage 4 (EVT) into Stage 5 (Monte Carlo)
draw_compact_arrow(37, 13.5, 43, 13.5, color="#f43f5e", lw=1.8, label="Tail Shocks")

# Stage 5 (Monte Carlo) into Stage 6 (Knapsack)
draw_compact_arrow(77, 13.5, 83, 13.5, color="#a855f7", lw=1.8, label="ΔEAL Deltas")

plt.tight_layout()

# Save outputs
p_desk_png = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_mathematical_flowchart_compact.png"
p_desk_svg = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_mathematical_flowchart_compact.svg"
p_down_png = r"c:\Users\subha\Downloads\aegisrisk_mathematical_flowchart_compact.png"

plt.savefig(p_desk_png, dpi=300, bbox_inches='tight', facecolor='white')
plt.savefig(p_desk_svg, format='svg', bbox_inches='tight', facecolor='white')
plt.savefig(p_down_png, dpi=300, bbox_inches='tight', facecolor='white')

print("Compact Mathematical Flowchart generated successfully!")
