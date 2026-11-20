import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch

plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Segoe UI Variable', 'Arial', 'sans-serif']
plt.rcParams['font.family'] = 'sans-serif'

fig, ax = plt.subplots(figsize=(9.0, 6.8), dpi=300)
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')
fig.patch.set_facecolor('white')
ax.set_facecolor('white')

# Title
ax.text(50, 96, "36-Hour Hackathon Build Roadmap", 
        ha='center', va='center', fontsize=14, color="#0f172a", weight="bold")

phases = [
    ("0–6h", "Phase 1: Ingestion & Normalization", 
     "• Live Kafka/REST feeds for SIEM, CMDB, EPSS\n• Data Confidence Index & schema normalization", 
     "#EFF6FF", "#2563EB", "#1E40AF"),
    ("6–14h", "Phase 2: OpenFAIR & Monte Carlo Core", 
     "• FAIR Factorization: LEF × PLM with GenAI factor\n• 10,000-trial Monte Carlo with EVT GPD fat-tail", 
     "#ECFDF5", "#059669", "#065F46"),
    ("14–22h", "Phase 3: 0/1 Knapsack & SPoF Solver", 
     "• DP optimizer for maximum ROSI under budget caps\n• SPoF vendor penalty & control friction matrix", 
     "#FAF5FF", "#7C3AED", "#5B21B6"),
    ("22–30h", "Phase 4: CISO Dashboard & Sandbox", 
     "• Executive views: EAL, VaR, Recharts loss curves\n• Real-time What-If simulator & Change Attribution", 
     "#FEF3C7", "#D97706", "#92400E"),
    ("30–36h", "Phase 5: Assurance & Closed-Loop", 
     "• trackRosiOutcome() post-deployment validation\n• 30/30 unit & integration test suite passing (100%)", 
     "#FDF2F8", "#DB2777", "#9D174D")
]

y = 78
for time_str, phase_title, details, bg, border, text_col in phases:
    # Time pill
    time_box = FancyBboxPatch((3, y), 20, 13, boxstyle="round,pad=0.4,rounding_size=1.6",
                              facecolor=border, edgecolor="none", zorder=3)
    ax.add_patch(time_box)
    ax.text(13, y + 6.5, time_str, ha='center', va='center', fontsize=11.5, 
            color="white", weight='bold', zorder=4)
    
    # Detail card
    card = FancyBboxPatch((25.5, y), 71.5, 13, boxstyle="round,pad=0.4,rounding_size=1.6",
                          facecolor=bg, edgecolor=border, linewidth=1.8, zorder=3)
    ax.add_patch(card)
    ax.text(28, y + 9.2, phase_title, ha='left', va='center', fontsize=10.5, 
            color=text_col, weight='bold', zorder=4)
    ax.text(28, y + 4.0, details, ha='left', va='center', fontsize=8.8, 
            color="#334155", weight='semibold', zorder=4, linespacing=1.2)
    
    if y > 20:
        ax.plot([13, 13], [y, y - 4.5], color="#94a3b8", lw=2.2, linestyle=":", zorder=2)
        
    y -= 16.2

plt.tight_layout()
output_png = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_36hr_roadmap.png"
plt.savefig(output_png, dpi=300, bbox_inches='tight', facecolor='white')
plt.close()
print("Clean Roadmap diagram created successfully with Segoe UI!")
