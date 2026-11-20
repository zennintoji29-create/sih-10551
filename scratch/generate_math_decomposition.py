import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Segoe UI Variable', 'Arial', 'sans-serif']
plt.rcParams['font.family'] = 'sans-serif'

# Canvas setup - high resolution, clean aspect ratio for PPT slide
fig, ax = plt.subplots(figsize=(11.0, 6.2), dpi=300)
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')
fig.patch.set_facecolor('white')
ax.set_facecolor('white')

def draw_tab(x, y, w, h, title, pills=[], bg_color="#ffffff", border_color="#0284c7", 
             tab_color="#0284c7", text_color="#ffffff", radius=1.4, title_size=11.5, pill_size=9.2):
    # Main Card Background
    card = FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0.0,rounding_size={radius}",
                          facecolor=bg_color, edgecolor=border_color, linewidth=2.0, zorder=3)
    ax.add_patch(card)
    
    # Top Tab / Header Bar
    tab_h = h * 0.38
    tab_y = y + h - tab_h
    tab_bar = FancyBboxPatch((x, tab_y), w, tab_h, boxstyle=f"round,pad=0.0,rounding_size={radius}",
                             facecolor=tab_color, edgecolor=tab_color, linewidth=1.0, zorder=4)
    ax.add_patch(tab_bar)
    # Square bottom corners of tab bar to merge with card
    ax.fill([x, x + w, x + w, x], [tab_y, tab_y, tab_y + 0.5, tab_y + 0.5], color=tab_color, zorder=4)
    
    # Tab Title
    ax.text(x + w/2, tab_y + tab_h/2, title, ha='center', va='center',
            fontsize=title_size, color=text_color, weight='bold', zorder=5)
    
    # Pills / Topic Tags inside Tab
    if pills:
        n_pills = len(pills)
        pill_w = (w - 2.0 - (n_pills - 1) * 1.5) / n_pills
        pill_h = h * 0.42
        pill_y = y + (h - tab_h - pill_h) / 2 + 0.2
        
        for i, (pill_txt, pill_col) in enumerate(pills):
            px = x + 1.0 + i * (pill_w + 1.5)
            p_box = FancyBboxPatch((px, pill_y), pill_w, pill_h,
                                   boxstyle=f"round,pad=0.0,rounding_size={radius*0.7}",
                                   facecolor="#ffffff", edgecolor=pill_col, linewidth=1.4, zorder=5)
            ax.add_patch(p_box)
            ax.text(px + pill_w/2, pill_y + pill_h/2, pill_txt, ha='center', va='center',
                    fontsize=pill_size, color=pill_col, weight='bold', zorder=6)

def draw_arrow(x1, y1, x2, y2, color="#64748b", lw=2.4, label=""):
    arrow = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle='-|>', mutation_scale=16,
                            color=color, linewidth=lw, zorder=2)
    ax.add_patch(arrow)
    if label:
        mx = (x1 + x2) / 2
        my = (y1 + y2) / 2
        ax.text(mx, my, label, ha='center', va='center', fontsize=8.8, color="#0f172a",
                weight='bold', bbox=dict(boxstyle="round,pad=0.2", facecolor="white", edgecolor="#cbd5e1", lw=1.0),
                zorder=6)

# Title
ax.text(50, 96, "Mathematical Risk Decomposition Model", 
        ha='center', va='center', fontsize=14.5, color="#0f172a", weight="bold")

# ==============================================================================
# LEVEL 1: PRIMARY FACTOR TABS (LEF & PLM)
# ==============================================================================
draw_tab(2, 75, 46, 17, 
         "Loss Event Frequency (LEF)", 
         pills=[("Threat Frequency", "#065f46"), 
                ("Vulnerability Score", "#065f46"), 
                ("GenAI Multiplier", "#047857")],
         bg_color="#ECFDF5", border_color="#059669", tab_color="#059669", 
         title_size=11.8, pill_size=9.0)

draw_tab(52, 75, 46, 17, 
         "Probable Loss Magnitude (PLM)", 
         pills=[("Direct Response", "#1E40AF"), 
                ("Business Downtime", "#1E40AF"), 
                ("Regulatory Fines", "#2563EB")],
         bg_color="#EFF6FF", border_color="#2563EB", tab_color="#2563EB", 
         title_size=11.8, pill_size=9.0)

# Connectors to Level 2
draw_arrow(25, 75, 42, 64, color="#059669")
draw_arrow(75, 75, 58, 64, color="#2563EB")

# ==============================================================================
# LEVEL 2: EXPECTED ANNUAL LOSS TAB
# ==============================================================================
draw_tab(20, 50, 60, 14, 
         "Expected Annual Loss (EAL = LEF × PLM)", 
         pills=[("OpenFAIR Baseline", "#92400E"), 
                ("Monetary Risk Metric (₹ / $)", "#B45309"), 
                ("Asset Criticality Weight", "#92400E")],
         bg_color="#FEF3C7", border_color="#D97706", tab_color="#D97706", 
         title_size=12.2, pill_size=9.4)

# Connector to Level 3
draw_arrow(50, 50, 50, 39, color="#D97706", label="10,000 Iterations")

# ==============================================================================
# LEVEL 3: STOCHASTIC SIMULATION TAB
# ==============================================================================
draw_tab(10, 25, 80, 14, 
         "Stochastic Simulation Engine (Monte Carlo + EVT)", 
         pills=[("Box-Muller Sampling", "#5B21B6"), 
                ("Pareto Fat-Tail (GPD)", "#6D28D9"), 
                ("Catastrophic Breach Models", "#5B21B6")],
         bg_color="#FAF5FF", border_color="#7C3AED", tab_color="#7C3AED", 
         title_size=12.2, pill_size=9.5)

# Connectors to Level 4
draw_arrow(25, 25, 16, 15, color="#7C3AED")
draw_arrow(50, 25, 50, 15, color="#7C3AED")
draw_arrow(75, 25, 84, 15, color="#7C3AED")

# ==============================================================================
# LEVEL 4: OUTPUT METRICS & CAPITAL DECISION TABS
# ==============================================================================
draw_tab(2, 2, 30, 13, 
         "Mean EAL", 
         pills=[("Baseline Budget", "#334155"), ("Expected Loss", "#1E293B")],
         bg_color="#F1F5F9", border_color="#475569", tab_color="#475569", 
         title_size=11.2, pill_size=8.8)

draw_tab(35, 2, 30, 13, 
         "95% & 99% VaR", 
         pills=[("Tail Risk Ceiling", "#991B1B"), ("Board Threshold", "#B91C1C")],
         bg_color="#FEE2E2", border_color="#DC2626", tab_color="#DC2626", 
         title_size=11.2, pill_size=8.8)

draw_tab(68, 2, 30, 13, 
         "ROSI Knapsack Solver", 
         pills=[("Optimal Controls", "#14532D"), ("Max Risk Reduction", "#15803D")],
         bg_color="#DCFCE7", border_color="#16A34A", tab_color="#16A34A", 
         title_size=11.2, pill_size=8.8)

plt.tight_layout()
output_png = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_math_decomposition.png"
plt.savefig(output_png, dpi=300, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Tabs and Topics Math decomposition diagram generated -> {output_png}")
