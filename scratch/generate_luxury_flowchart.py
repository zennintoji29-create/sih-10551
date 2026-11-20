import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle

# Configure modern Windows Fluent / Segoe UI typography
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Segoe UI Variable', 'Arial', 'sans-serif']
plt.rcParams['font.family'] = 'sans-serif'

fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#ffffff')

# --- MODERN DESIGN SYSTEM UTILITIES ---

def draw_shadowed_card(x, y, w, h, bg="#ffffff", border="#e2e8f0", radius=1.6, shadow_blur=3):
    """Draws a card with a realistic modern multi-layer soft drop shadow."""
    for i in range(shadow_blur, 0, -1):
        offset = i * 0.32
        alpha = 0.022 * (4 - i)
        shadow = FancyBboxPatch((x + 0.12, y - offset), w, h,
                                boxstyle=f"round,pad=0.2,rounding_size={radius}",
                                facecolor="#0f172a", edgecolor="none", alpha=alpha, zorder=2)
        ax.add_patch(shadow)
    
    card = FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0.2,rounding_size={radius}",
                          facecolor=bg, edgecolor=border, linewidth=1.2, zorder=3)
    ax.add_patch(card)
    return card

def draw_container(x, y, w, h, title, subtitle="", bg="#f8fafc", border="#e2e8f0", badge_bg="#e2e8f0", badge_fg="#334155", badge_w=None):
    """Frosted aesthetic grouped region with an elegant header badge."""
    container = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.4,rounding_size=2.2",
                               facecolor=bg, edgecolor=border, linewidth=1.4, zorder=1)
    ax.add_patch(container)
    
    bw = badge_w if badge_w else (len(title) * 0.68 + 3.2)
    badge = FancyBboxPatch((x + 2.5, y + h - 3.2), bw, 4.0, boxstyle="round,pad=0.2,rounding_size=1.2",
                           facecolor=badge_bg, edgecolor="none", zorder=2)
    ax.add_patch(badge)
    ax.text(x + 2.5 + bw/2, y + h - 1.2, title, ha='center', va='center',
            fontsize=8.8, color=badge_fg, weight='bold', zorder=3)
    
    if subtitle:
        ax.text(x + 3.8 + bw, y + h - 1.2, subtitle, ha='left', va='center',
                fontsize=8, color="#64748b", style='italic', zorder=3)

def draw_modern_arrow(x1, y1, x2, y2, color="#64748b", lw=1.6, label="", label_pos=0.5, label_offset=(0, 1.4), rad=0):
    """Clean directional connector with sleek typography badge."""
    conn = f"arc3,rad={rad}" if rad != 0 else "arc3,rad=0"
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>", color=color, lw=lw, 
                                connectionstyle=conn, mutation_scale=13), zorder=4)
    if label:
        lx = x1 + (x2 - x1) * label_pos + label_offset[0]
        ly = y1 + (y2 - y1) * label_pos + label_offset[1]
        ax.text(lx, ly, f" {label} ", ha='center', va='center', fontsize=7.5, color="#334155",
                weight='semibold',
                bbox=dict(boxstyle="round,pad=0.3,rounding_size=0.8", facecolor="#ffffff", 
                          edgecolor="#e2e8f0", lw=0.9, alpha=0.96), zorder=6)

# ==================== HEADER ====================
ax.text(3.5, 95.2, "SYSTEM FLOWCHART", fontsize=18, color="#0f172a", weight="heavy")
ax.text(3.5, 92.5, "AegisRisk • Continuous Multi-Tier Cyber Risk Quantification & ROSI Optimization", 
        fontsize=9.5, color="#64748b", weight="medium")
ax.plot([3.5, 30], [90.8, 90.8], color="#3b82f6", lw=2.5)

# ==================== 1. LEFT OUTPUT METRIC CARD (Board-Defensible Metric) ====================
draw_shadowed_card(3.5, 38, 9.5, 18, bg="#0f172a", border="#1e293b", radius=2.0)
ax.text(8.25, 52.5, "QUANTIFIED\nLOSS METRIC", ha='center', va='center', fontsize=7.5, color="#94a3b8", weight='bold', linespacing=1.2)
ax.text(8.25, 46.5, "EAL\n& VaR", ha='center', va='center', fontsize=12.5, color="#38bdf8", weight='heavy', linespacing=1.1)
ax.text(8.25, 41, "(₹ / $ Output)", ha='center', va='center', fontsize=7.8, color="#34d399", weight='bold')

# ==================== 2. THREE-TIER INGESTION COLUMN (GNSS -> LEO -> INS equivalent) ====================

# Tier 1: LIVE TELEMETRY
draw_shadowed_card(17.5, 64, 16.5, 18, bg="#ffffff", border="#fecdd3", radius=2.0)
stripe1 = FancyBboxPatch((17.5, 79.5), 16.5, 2.5, boxstyle="round,pad=0.0,rounding_size=1.0", 
                         facecolor="#f43f5e", edgecolor="none", zorder=4)
ax.add_patch(stripe1)
dot1 = Circle((19.2, 80.75), 0.45, facecolor="#ffffff", edgecolor="none", zorder=5)
ax.add_patch(dot1)
ax.text(20.3, 80.75, "PRIMARY TELEMETRY", fontsize=7.2, color="#ffffff", weight='bold', va='center', zorder=5)
ax.text(25.75, 74.5, "Live 6-Pillar Telemetry", ha='center', va='center', fontsize=9.8, color="#0f172a", weight='bold')
ax.text(25.75, 68.5, "• SIEM & CrowdStrike EDR\n• Active CMDB Inventory\n• CVSS 3.1 & EPSS Live Feeds", 
        ha='center', va='center', fontsize=7.6, color="#475569", linespacing=1.25)

# Tier 2: BATCH SCANS
draw_shadowed_card(18.5, 43, 14.5, 11, bg="#ffffff", border="#bbf7d0", radius=1.8)
stripe2 = FancyBboxPatch((18.5, 52), 14.5, 2.0, boxstyle="round,pad=0.0,rounding_size=0.8", 
                         facecolor="#10b981", edgecolor="none", zorder=4)
ax.add_patch(stripe2)
ax.text(25.75, 53, "FALLBACK 1 • BATCH", fontsize=6.8, color="#ffffff", weight='bold', ha='center', va='center', zorder=5)
ax.text(25.75, 48.5, "Batch Scans & CMDB", ha='center', va='center', fontsize=8.8, color="#0f172a", weight='bold')
ax.text(25.75, 45, "Nessus / Qualys CSV Exports", ha='center', va='center', fontsize=7.2, color="#475569")

# Tier 3: INDUSTRY BENCHMARKS
draw_shadowed_card(18.5, 22, 14.5, 12, bg="#ffffff", border="#bae6fd", radius=1.8)
stripe3 = FancyBboxPatch((18.5, 32), 14.5, 2.0, boxstyle="round,pad=0.0,rounding_size=0.8", 
                         facecolor="#0284c7", edgecolor="none", zorder=4)
ax.add_patch(stripe3)
ax.text(25.75, 33, "FALLBACK 2 • SYNTHETIC", fontsize=6.8, color="#ffffff", weight='bold', ha='center', va='center', zorder=5)
ax.text(25.75, 28.5, "Statistical Benchmarks", ha='center', va='center', fontsize=8.8, color="#0f172a", weight='bold')
ax.text(25.75, 24.5, "MITRE ATT&CK & CISA KEV\nFAIR Loss Distribution Priors", ha='center', va='center', fontsize=7.2, color="#475569", linespacing=1.2)

# FAIR Factorization Pill
draw_shadowed_card(36.5, 75.5, 12.5, 7, bg="#f0fdf4", border="#86efac", radius=1.4)
ax.text(42.75, 80, "FAIR Factorization", ha='center', va='center', fontsize=8.2, color="#166534", weight='bold')
ax.text(42.75, 77.2, "TEF × Vuln × (1 − CE)", ha='center', va='center', fontsize=7.2, color="#15803d")

# Arrows on Left Spine
draw_modern_arrow(34, 73, 36.5, 78, color="#64748b", label="For Simulation", label_offset=(0, 2))
draw_modern_arrow(25.75, 64, 25.75, 54, color="#e11d48", label="No Live Feed", label_offset=(3.8, 0))
draw_modern_arrow(25.75, 43, 25.75, 34, color="#e11d48", label="No Scan Data", label_offset=(3.8, 0))

# Green converging lines feeding into EAL & VaR output card
ax.plot([17.5, 15, 15], [73, 73, 47], color="#10b981", lw=2.0, zorder=3)
ax.plot([18.5, 15], [48.5, 48.5], color="#10b981", lw=2.0, zorder=3)
ax.plot([18.5, 15, 15], [28, 28, 47], color="#10b981", lw=2.0, zorder=3)
draw_modern_arrow(15, 47, 13, 47, color="#10b981", lw=2.0, label="Dynamic Loss Curve", label_offset=(0, 2.5))

# ==================== 3. TOP-RIGHT CONTAINER: CONTINUOUS SIMULATION ====================
draw_container(54, 48, 43, 39, "MONTE CARLO & EVT SIMULATION", 
               subtitle="10,000 Iterations • Fat-Tail Risk", 
               bg="#f8fafc", border="#cbd5e1", badge_bg="#0284c7", badge_fg="#ffffff")

# Connector into Simulation container
draw_modern_arrow(49, 79, 56, 75, color="#64748b", label="Avoiding Static Bias", label_offset=(-1, 2.2))

# Step 1: Threat Modeling
draw_shadowed_card(56, 70, 16.5, 8.5, bg="#ffffff", border="#e2e8f0", radius=1.4)
ax.text(64.25, 75.5, "Threat Modeling (TEF)", ha='center', va='center', fontsize=8.2, color="#0f172a", weight='bold')
ax.text(64.25, 72.5, "Base Frequency per Asset Class", ha='center', va='center', fontsize=6.8, color="#64748b")

# Step 2: GenAI Multiplier
draw_shadowed_card(75.5, 70, 9.5, 8.5, bg="#ffffff", border="#e2e8f0", radius=1.4)
ax.text(80.25, 75.5, "GenAI Threat", ha='center', va='center', fontsize=8.0, color="#6366f1", weight='bold')
ax.text(80.25, 72.5, "Amplifier (1.0–2.5×)", ha='center', va='center', fontsize=6.8, color="#4f46e5")

# Step 3: Loss Magnitude
draw_shadowed_card(87.5, 70, 8.0, 8.5, bg="#ffffff", border="#e2e8f0", radius=1.4)
ax.text(91.5, 75.5, "PLM Magnitude", ha='center', va='center', fontsize=7.8, color="#0f172a", weight='bold')
ax.text(91.5, 72.5, "Direct+Indirect+Reg", ha='center', va='center', fontsize=6.6, color="#64748b")

# Step 4: EVT GPD Tail
draw_shadowed_card(73.5, 52, 14.5, 8.5, bg="#ffffff", border="#fbcfe8", radius=1.4)
ax.text(80.75, 57.5, "GPD Fat-Tail Injection", ha='center', va='center', fontsize=8.0, color="#be185d", weight='bold')
ax.text(80.75, 54.5, "Catastrophic Breach Jumps (2%)", ha='center', va='center', fontsize=6.8, color="#9d174d")

# Step 5: 10,000 Runs
draw_shadowed_card(56, 52, 14.5, 8.5, bg="#ffffff", border="#bbf7d0", radius=1.4)
ax.text(63.25, 57.5, "Simulate 10k Trials", ha='center', va='center', fontsize=8.2, color="#15803d", weight='bold')
ax.text(63.25, 54.5, "Compute 95% / 99% VaR", ha='center', va='center', fontsize=7.0, color="#166534")

# Arrows inside Simulation container
draw_modern_arrow(72.5, 74.25, 75.5, 74.25, color="#64748b")
draw_modern_arrow(85, 74.25, 87.5, 74.25, color="#64748b")
ax.plot([95.5, 95.5, 88], [74.25, 56.25, 56.25], color="#64748b", lw=1.5, zorder=3)
draw_modern_arrow(88, 56.25, 88, 56.25, color="#64748b")
draw_modern_arrow(73.5, 56.25, 70.5, 56.25, color="#64748b")

# Re-simulation loop if <95% CI
draw_modern_arrow(63.25, 60.5, 63.25, 70, color="#f59e0b", label="<95% CI • Re-simulate", label_offset=(4.8, 0))

# Exit down to Knapsack container
ax.plot([56, 49.5, 49.5], [56.25, 56.25, 43], color="#0284c7", lw=1.8, zorder=3)
draw_modern_arrow(49.5, 44, 49.5, 42, color="#0284c7", label="≥95% Converged", label_offset=(4.0, 0))

# ==================== 4. MIDDLE-BOTTOM PURPLE CONTAINER ====================
draw_container(33.5, 3.5, 18.5, 41, "0/1 KNAPSACK OPTIMIZER", 
               subtitle="Budget Plan", 
               bg="#faf5ff", border="#d8b4fe", badge_bg="#8b5cf6", badge_fg="#ffffff", badge_w=15.0)

knapsack_steps = [
    ("Controls & Cost Catalog", "CapEx & OpEx Estimates", "#ffffff", "#e2e8f0", "#0f172a"),
    ("Dynamic Control Friction", "Real-Time Telemetry Drift Efficacy", "#ffffff", "#e2e8f0", "#0f172a"),
    ("ROSI Solver Algorithm", "ROSI = (ΔEAL − Cost) / Cost", "#fdf4ff", "#f0abfc", "#86198f"),
    ("Vendor SPoF Surcharge", "CrowdStrike Dependency Penalty", "#ffffff", "#e2e8f0", "#0f172a"),
    ("Optimal Portfolio Mix", "Max Risk Reduction per ₹ Budget", "#ecfdf5", "#a7f3d0", "#065f46")
]

py = 34.5
for i, (title_s, sub_s, bg_s, border_s, fg_s) in enumerate(knapsack_steps):
    draw_shadowed_card(34.8, py, 15.9, 5.8, bg=bg_s, border=border_s, radius=1.2)
    ax.text(42.75, py + 3.8, title_s, ha='center', va='center', fontsize=7.8, color=fg_s, weight='bold')
    ax.text(42.75, py + 1.8, sub_s, ha='center', va='center', fontsize=6.5, color="#64748b")
    if i < len(knapsack_steps) - 1:
        draw_modern_arrow(42.75, py, 42.75, py - 2.5, color="#a855f7", lw=1.4)
    py -= 7.4

# External Callout Badge (Zero-Day / KEV Priority)
draw_shadowed_card(55.5, 23.5, 16.5, 7.5, bg="#fff1f2", border="#fda4af", radius=1.4)
ax.text(63.75, 28.5, "Zero-Day & CISA KEV", ha='center', va='center', fontsize=8.0, color="#be123c", weight='bold')
ax.text(63.75, 25.5, "Active Exploit Priority Override", ha='center', va='center', fontsize=6.8, color="#e11d48")
draw_modern_arrow(55.5, 27.25, 50.8, 27.25, color="#e11d48", lw=1.6)

# Loopback from bottom of Knapsack to Tier 2 (Batch Scans)
ax.annotate("", xy=(33, 48.5), xytext=(34.8, 6.4),
            arrowprops=dict(arrowstyle="-|>", color="#8b5cf6", lw=1.6,
                            connectionstyle="angle,angleA=180,angleB=90,rad=4", mutation_scale=12), zorder=3)
ax.text(27.5, 10.5, "Closed-Loop\nRecalibration", ha='center', va='center', fontsize=7.2, color="#7c3aed", weight='bold')

plt.tight_layout()
output_png = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_reference_style_flowchart.png"
output_svg = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_reference_style_flowchart.svg"
plt.savefig(output_png, dpi=300, bbox_inches='tight', facecolor='white')
plt.savefig(output_svg, format='svg', bbox_inches='tight', facecolor='white')
plt.savefig(r"c:\Users\subha\Downloads\aegisrisk_reference_style_flowchart.png", dpi=300, bbox_inches='tight', facecolor='white')
print(f"Polished luxury flowchart saved to {output_png}")
