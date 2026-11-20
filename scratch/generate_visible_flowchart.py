import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import os

# Set global font to Segoe UI
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Segoe UI Variable', 'Arial', 'sans-serif']
plt.rcParams['axes.edgecolor'] = '#cbd5e1'

fig, ax = plt.subplots(figsize=(15.8, 5.3), dpi=300)
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#ffffff')
ax.set_xlim(0, 15.8)
ax.set_ylim(0, 5.3)
ax.axis('off')

# Title Banner
ax.text(0.4, 4.95, "AegisRisk End-to-End System Flow", 
        fontsize=16, fontweight='bold', color='#0f172a', ha='left', va='center')
ax.text(5.6, 4.95, "• Continuous Event-Driven Risk Quantification & Capital Allocation Pipeline", 
        fontsize=11.5, fontweight='normal', color='#64748b', ha='left', va='center')

# Define 5 Pipeline Cards
cards = [
    {
        "step": "STAGE 1",
        "title": "Telemetry Ingestion",
        "badge": "6-Pillar Streaming",
        "color": "#EA580C",       # Orange
        "bg": "#FFF7ED",          # Soft warm
        "bullets": [
            "SIEM & EDR live alerts",
            "CMDB asset criticality",
            "CVSS & CISA KEV feeds",
            "Continuous Kafka stream"
        ]
    },
    {
        "step": "STAGE 2",
        "title": "FAIR Factorization",
        "badge": "Standard Ontology",
        "color": "#0D9488",       # Teal
        "bg": "#F0FDFA",          # Soft teal
        "bullets": [
            "Threat Frequency (TEF)",
            "Loss Magnitude (PLM)",
            "GenAI Threat Multiplier",
            "Vulnerability scoring"
        ]
    },
    {
        "step": "STAGE 3",
        "title": "Monte Carlo + EVT",
        "badge": "10,000 Iterations",
        "color": "#2563EB",       # Blue
        "bg": "#EFF6FF",          # Soft blue
        "bullets": [
            "10k trials per asset",
            "Box-Muller lognormal",
            "Pareto fat-tail (GPD)",
            "VaR (95% / 99%) ceiling"
        ]
    },
    {
        "step": "STAGE 4",
        "title": "Knapsack Optimizer",
        "badge": "ROSI Maximizer",
        "color": "#7C3AED",       # Purple
        "bg": "#FAF5FF",          # Soft purple
        "bullets": [
            "0/1 Knapsack DP solver",
            "Budget constraint cap",
            "Control friction matrix",
            "Vendor SPoF penalty"
        ]
    },
    {
        "step": "STAGE 5",
        "title": "Executive Output",
        "badge": "Decision Support",
        "color": "#059669",       # Emerald Green
        "bg": "#F0FDF4",          # Soft green
        "bullets": [
            "Real-time EAL & VaR (₹/$)",
            "Optimal control mix",
            "CISO & Boardroom views",
            "Automated containment"
        ]
    }
]

card_w = 2.70
card_h = 3.50
start_x = 0.40
gap_x = 0.40
y_pos = 1.15

for i, c in enumerate(cards):
    cx = start_x + i * (card_w + gap_x)
    
    # Outer Card with gentle shadow/border
    card_bg = FancyBboxPatch((cx, y_pos), card_w, card_h,
                             boxstyle="round,pad=0.0,rounding_size=0.14",
                             facecolor=c["bg"], edgecolor=c["color"], linewidth=2.2)
    ax.add_patch(card_bg)
    
    # Header Pill / Banner
    header_h = 0.75
    header_y = y_pos + card_h - header_h
    header_bg = FancyBboxPatch((cx, header_y), card_w, header_h,
                               boxstyle="round,pad=0.0,rounding_size=0.14",
                               facecolor=c["color"], edgecolor=c["color"], linewidth=1.0)
    ax.add_patch(header_bg)
    
    # Cover bottom corners of header
    ax.fill([cx, cx + card_w, cx + card_w, cx], 
            [header_y, header_y, header_y + 0.18, header_y + 0.18], 
            color=c["color"])
    
    # Step Badge Text
    ax.text(cx + card_w/2, header_y + 0.50, c["step"], 
            fontsize=10.0, fontweight='bold', color='#FFFFFF', ha='center', va='center', alpha=0.95)
    
    # Card Title Text
    ax.text(cx + card_w/2, header_y + 0.22, c["title"], 
            fontsize=12.5, fontweight='bold', color='#FFFFFF', ha='center', va='center')
    
    # Badge Subtitle pill
    badge_y = header_y - 0.38
    badge_bg = FancyBboxPatch((cx + 0.22, badge_y), card_w - 0.44, 0.28,
                              boxstyle="round,pad=0.0,rounding_size=0.08",
                              facecolor='#FFFFFF', edgecolor=c["color"], linewidth=1.2)
    ax.add_patch(badge_bg)
    ax.text(cx + card_w/2, badge_y + 0.14, c["badge"], 
            fontsize=9.2, fontweight='bold', color=c["color"], ha='center', va='center')
    
    # Bullet points inside card
    bullet_start_y = badge_y - 0.35
    for j, b in enumerate(c["bullets"]):
        by = bullet_start_y - j * 0.45
        # Bullet dot
        ax.plot(cx + 0.28, by, marker='o', markersize=5.0, color=c["color"])
        # Bullet text
        ax.text(cx + 0.44, by, b, 
                fontsize=10.2, fontweight='bold', color='#1e293b', ha='left', va='center')

    # Forward Arrow between cards
    if i < len(cards) - 1:
        arrow_x_start = cx + card_w + 0.05
        arrow_x_end = arrow_x_start + gap_x - 0.10
        arrow_y = y_pos + card_h / 2 + 0.10
        
        arrow = FancyArrowPatch((arrow_x_start, arrow_y), (arrow_x_end, arrow_y),
                                arrowstyle='-|>', mutation_scale=20,
                                color='#64748b', linewidth=3.2)
        ax.add_patch(arrow)

# Closed-Loop Feedback Arrow at Bottom
loop_box = FancyBboxPatch((0.4, 0.12), 15.0, 0.68,
                          boxstyle="round,pad=0.0,rounding_size=0.10",
                          facecolor='#F8FAFC', edgecolor='#94A3B8', linewidth=1.5)
ax.add_patch(loop_box)

ax.text(0.7, 0.46, "CLOSED-LOOP MODEL RECALIBRATION", 
        fontsize=11.0, fontweight='bold', color='#0f172a', ha='left', va='center')
ax.text(4.8, 0.46, "Backtests predicted loss distributions against real incidents to dynamically auto-tune parameters", 
        fontsize=10.2, fontweight='semibold', color='#475569', ha='left', va='center')

# Small pulse badge on loop
ax.text(15.1, 0.46, "Continuous Auto-Tuning", 
        fontsize=9.5, fontweight='bold', color='#1D4ED8', ha='right', va='center',
        bbox=dict(boxstyle='round,pad=0.3', facecolor='#DBEAFE', edgecolor='#3B82F6', linewidth=1.2))

plt.tight_layout()
out_path = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_reference_style_flowchart.png"
plt.savefig(out_path, dpi=300, bbox_inches='tight', facecolor='#ffffff')
plt.close()
print(f"Generated clean visible flowchart -> {out_path}")
