import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

# Create a sleek 3-layer stacked architecture matching ZyraNav's Slide 3 bottom-left
fig, ax = plt.subplots(figsize=(6.5, 3.8), dpi=300)
ax.set_xlim(0, 100)
ax.set_ylim(0, 60)
ax.axis('off')
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#ffffff')

# Three offset stacked cards (Isometric / layered style like ZyraNav)
# Layer 1: Dark Slate / Green (Bottom - Telemetry)
layer1 = FancyBboxPatch((8, 12), 48, 22, boxstyle="round,pad=0.5,rounding_size=1.2",
                        facecolor="#334155", edgecolor="#1e293b", linewidth=1.5, zorder=1)
ax.add_patch(layer1)

# Layer 2: Deep Crimson / Brown (Middle - OpenFAIR Core)
layer2 = FancyBboxPatch((12, 18), 48, 22, boxstyle="round,pad=0.5,rounding_size=1.2",
                        facecolor="#881337", edgecolor="#4c0519", linewidth=1.5, zorder=2)
ax.add_patch(layer2)

# Layer 3: Deep Navy / Blue (Top - Knapsack Optimization)
layer3 = FancyBboxPatch((16, 24), 48, 22, boxstyle="round,pad=0.5,rounding_size=1.2",
                        facecolor="#1e3a8a", edgecolor="#172554", linewidth=1.5, zorder=3)
ax.add_patch(layer3)

# White callout boxes with arrows on the right (matching ZyraNav's callout boxes: INS, LEO-PNT, GNSS)
def draw_callout(box_x, box_y, text, target_x, target_y, border_color="#334155"):
    # Callout pill
    pill = FancyBboxPatch((box_x, box_y), 26, 8.5, boxstyle="round,pad=0.3,rounding_size=0.8",
                          facecolor="#ffffff", edgecolor="#475569", linewidth=1.2, zorder=5)
    ax.add_patch(pill)
    ax.text(box_x + 13, box_y + 4.25, text, ha='center', va='center', fontsize=7.8,
            weight='bold', color="#0f172a", zorder=6)
    
    # Stepped orthogonal arrow
    ax.annotate("", xy=(target_x, target_y), xytext=(box_x, box_y + 4.25),
                arrowprops=dict(arrowstyle="->", color="#334155", lw=1.6), zorder=4)

# Callout 1 (Top Layer): Knapsack ROSI Optimizer
draw_callout(70, 38, "ROSI Optimization", 64, 35)

# Callout 2 (Middle Layer): OpenFAIR + Monte Carlo Core
draw_callout(70, 24, "Stochastic Risk Core", 60, 27)

# Callout 3 (Bottom Layer): Live Telemetry Ingestion
draw_callout(70, 10, "Telemetry Ingestion", 56, 17)

# Title above the stack
ax.text(32, 54, "3-LAYER ARCHITECTURE", ha='center', va='center', 
        fontsize=9.5, weight='bold', color="#0369a1")
# Underline title
ax.plot([10, 54], [50.5, 50.5], color="#0284c7", lw=1.4)

plt.tight_layout()

# Save
p_desk = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_3_layer_architecture.png"
p_down = r"c:\Users\subha\Downloads\aegisrisk_3_layer_architecture.png"

plt.savefig(p_desk, dpi=300, bbox_inches='tight', facecolor='white')
plt.savefig(p_down, dpi=300, bbox_inches='tight', facecolor='white')

print("3-Layer Architecture diagram generated successfully!")
