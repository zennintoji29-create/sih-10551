import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch

fig, ax = plt.subplots(figsize=(12, 5.2), dpi=300)
ax.set_xlim(0, 120)
ax.set_ylim(0, 52)
ax.axis('off')
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#ffffff')

def draw_box(x, y, w, h, text, subtext="", bg="#ffffff", border="#0284c7", 
             text_color="#0f172a", radius=1.0, fontsize=8.2, bold=True):
    box = FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0.3,rounding_size={radius}", 
                         facecolor=bg, edgecolor=border, linewidth=1.4, zorder=3)
    ax.add_patch(box)
    full_text = text if not subtext else f"{text}\n{subtext}"
    weight = 'bold' if bold else 'normal'
    ax.text(x + w/2, y + h/2, full_text, ha='center', va='center', fontsize=fontsize, 
            color=text_color, weight=weight, zorder=4, multialignment='center', linespacing=1.15)

def draw_arrow(x1, y1, x2, y2, color="#0284c7", lw=1.6, label="", label_pos=0.5, label_offset=(0, 1.2), fontsize=6.6):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>", color=color, lw=lw, mutation_scale=11), zorder=2)
    if label:
        lx = x1 + (x2 - x1) * label_pos + label_offset[0]
        ly = y1 + (y2 - y1) * label_pos + label_offset[1]
        ax.text(lx, ly, label, ha='center', va='center', fontsize=fontsize, color="#1e293b", 
                style='italic', weight='bold',
                bbox=dict(boxstyle="round,pad=0.15", facecolor="white", edgecolor="#cbd5e1", lw=0.4, alpha=0.95), zorder=5)

# ----------------- TOP-RIGHT SIMULATION CONTAINER (Light Blue) -----------------
sim_bg = FancyBboxPatch((60, 25.5), 58, 25, boxstyle="round,pad=0.4,rounding_size=1.2",
                        facecolor="#e0f2fe", edgecolor="#38bdf8", linewidth=1.2, zorder=1)
ax.add_patch(sim_bg)
ax.text(89, 48.8, "Synthetic Cyber Threat & Breach Simulation Framework", ha='center', va='center', 
        fontsize=7.8, color="#0369a1", weight='bold', zorder=2)

# Inside Simulation Loop (Teal boxes)
draw_box(63, 38.5, 16, 7.5, "Adversary TTP Modeling", "(MITRE ATT&CK)", bg="#2dd4bf", border="#0d9488", text_color="#042f2e", fontsize=7.0)
draw_box(83, 38.5, 16, 7.5, "GenAI Exploit Velocity", "& Zero-Day Multiplier", bg="#2dd4bf", border="#0d9488", text_color="#042f2e", fontsize=7.0)
draw_box(102, 38.5, 13, 7.5, "Attack Vector", "Injection", bg="#2dd4bf", border="#0d9488", text_color="#042f2e", fontsize=7.0)

draw_box(63, 27.5, 17, 7.5, "Compare with Live", "Enterprise Telemetry", bg="#2dd4bf", border="#0d9488", text_color="#042f2e", fontsize=7.0)
draw_box(85, 27.5, 18, 7.5, "Control Drift & Telemetry", "Noise Degradation", bg="#2dd4bf", border="#0d9488", text_color="#042f2e", fontsize=7.0)

# Arrows inside simulation loop
draw_arrow(79, 42.25, 83, 42.25, color="#0284c7")
draw_arrow(99, 42.25, 102, 42.25, color="#0284c7")
# Loop down from Attack Vector
ax.annotate("", xy=(108.5, 31.25), xytext=(108.5, 38.5), arrowprops=dict(arrowstyle="-", color="#0284c7", lw=1.5), zorder=2)
draw_arrow(108.5, 31.25, 103, 31.25, color="#0284c7")
draw_arrow(85, 31.25, 80, 31.25, color="#0284c7")
draw_arrow(71.5, 35, 71.5, 38.5, color="#0284c7", label="<80% match", label_offset=(0, -2.2), fontsize=6.2)

# Feedback loop to OpenFAIR Core
draw_arrow(63, 31.25, 54, 28, color="#0284c7", label=">80% converged", label_pos=0.4, label_offset=(0, 2.0), fontsize=6.4)

# ----------------- MAIN PIPELINE (Left & Center) -----------------
# Central Primary Box (Coral/Pink like ZyraNav's GNSS)
draw_box(24, 35, 17, 12, "Enterprise Telemetry", "(SIEM / Tenable / CMDB)", bg="#fecdd3", border="#f43f5e", text_color="#881337", fontsize=7.8)

# Top Teal Output Pill (like ZyraNav's PNT)
draw_box(44, 43.5, 12, 6, "Normalizer", bg="#2dd4bf", border="#0d9488", text_color="#042f2e", fontsize=7.5)
draw_arrow(41, 41, 44, 46.5, color="#0284c7")
draw_arrow(56, 46.5, 63, 42.25, color="#0284c7", label="Synthetic priors", label_offset=(0, 1.8), fontsize=6.2)

# Secondary Box below Telemetry (Teal, like ZyraNav's LEO SoO)
draw_box(24, 21, 17, 7.5, "OpenFAIR Engine", "LEF x PLM", bg="#2dd4bf", border="#0d9488", text_color="#042f2e", fontsize=7.6)
draw_arrow(32.5, 35, 32.5, 28.5, color="#f43f5e", label="Raw events", label_offset=(5.5, 0), fontsize=6.2)

# Tertiary Box (Mint Green, like ZyraNav's INS with IMU)
draw_box(24, 7.5, 17, 7.5, "Closed-Loop\nRecalibration", bg="#a7f3d0", border="#059669", text_color="#064e3b", fontsize=7.5)
draw_arrow(32.5, 21, 32.5, 15.0, color="#f43f5e", label="Control drift", label_offset=(5.5, 0), fontsize=6.2)

# ----------------- PURPLE CONTAINER: ADAPTIVE STOCHASTIC ENGINE -----------------
quant_bg = FancyBboxPatch((43, 1.5), 22, 26.5, boxstyle="round,pad=0.4,rounding_size=1.2",
                          facecolor="#f3e8ff", edgecolor="#c084fc", linewidth=1.4, zorder=1)
ax.add_patch(quant_bg)
ax.text(54, 26.8, "Stochastic Risk Engine", ha='center', va='center', fontsize=7.2, color="#6b21a8", weight='bold', zorder=2)

p_w, p_h = 18, 3.8
draw_box(45, 21.5, p_w, p_h, "Telemetry Normalization", bg="#fbcfe8", border="#f472b6", text_color="#831843", fontsize=6.8)
draw_box(45, 16.5, p_w, p_h, "Threat Freq & Exploitability", bg="#fbcfe8", border="#f472b6", text_color="#831843", fontsize=6.8)
draw_box(45, 11.5, p_w, p_h, "Loss Magnitude (Lognormal)", bg="#fbcfe8", border="#f472b6", text_color="#831843", fontsize=6.8)
draw_box(45, 6.5, p_w, p_h, "10,000 Monte Carlo + EVT", bg="#fbcfe8", border="#f472b6", text_color="#831843", fontsize=6.8)
draw_box(45, 2.0, p_w, p_h, "Continuous EAL & VaR", bg="#fbcfe8", border="#f472b6", text_color="#831843", fontsize=6.8)

# Vertical arrows between pink pills
draw_arrow(54, 21.5, 54, 20.3, color="#c084fc", lw=1.2)
draw_arrow(54, 16.5, 54, 15.3, color="#c084fc", lw=1.2)
draw_arrow(54, 11.5, 54, 10.3, color="#c084fc", lw=1.2)
draw_arrow(54, 6.5, 54, 5.8, color="#c084fc", lw=1.2)

# Connector from OpenFAIR to Purple Container
draw_arrow(41, 24.75, 43, 24.75, color="#0d9488")

# External Pink Pill (like ZyraNav's "AI Avoids Spoofed and Hacked signals")
draw_box(68, 11.5, 20, 6.2, "AI Threat Intelligence\n(CISA KEV & Zero-Days)", bg="#fbcfe8", border="#f472b6", text_color="#831843", fontsize=6.8)
draw_arrow(68, 14.6, 63, 14.6, color="#f472b6")

# ----------------- FINAL EXECUTIVE OUTPUT PILL (Left) -----------------
draw_box(3, 20.5, 15, 9, "CRQ Metric\n(EAL / VaR / ROSI)", bg="#ffffff", border="#64748b", text_color="#0f172a", fontsize=7.8)

# Orthogonal lines converging to left output box
ax.plot([24, 19, 19, 18], [41, 41, 25.0, 25.0], color="#10b981", lw=1.6, zorder=2)
ax.plot([24, 19], [24.75, 24.75], color="#10b981", lw=1.6, zorder=2)
ax.plot([24, 19, 19], [11.25, 11.25, 25.0], color="#10b981", lw=1.6, zorder=2)
ax.annotate("", xy=(18, 25.0), xytext=(19, 25.0), arrowprops=dict(arrowstyle="-|>", color="#10b981", lw=1.6, mutation_scale=10), zorder=2)

plt.tight_layout()

# Save outputs
p_desk_png = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_system_flowchart_compact.png"
p_desk_svg = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_system_flowchart_compact.svg"
p_down_png = r"c:\Users\subha\Downloads\aegisrisk_system_flowchart_compact.png"

plt.savefig(p_desk_png, dpi=300, bbox_inches='tight', facecolor='white')
plt.savefig(p_desk_svg, format='svg', bbox_inches='tight', facecolor='white')
plt.savefig(p_down_png, dpi=300, bbox_inches='tight', facecolor='white')

print("Refined Compact System Flowchart generated successfully!")
