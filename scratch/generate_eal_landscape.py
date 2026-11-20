import matplotlib.pyplot as plt
import numpy as np

# Set Segoe UI font
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Segoe UI Variable', 'Arial', 'sans-serif']
plt.rcParams['font.family'] = 'sans-serif'

# WIDE LANDSCAPE RATIO: 10 x 3.2 inches
fig, ax = plt.subplots(figsize=(10.0, 3.2), dpi=300)
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#f8fafc')

stages = ['Unmanaged Exposure', 'MFA + Basic Controls', 'IAM Optimization', 'AegisRisk Automated Mix']
losses = [125.0, 78.5, 42.0, 16.8] # Expected Annual Loss in ₹ Cr

bars = ax.bar(stages, losses, color='#06b6d4', width=0.52, edgecolor='#0891b2', linewidth=1.3, zorder=3)

# Highlight the optimized bar
bars[-1].set_color('#10b981')
bars[-1].set_edgecolor('#059669')

# Title
ax.set_title('Expected Annual Loss (EAL) Reduction via AegisRisk (₹ Crores)', 
             fontsize=11.5, fontweight='bold', color='#0f172a', pad=10)

# Y-axis styling
ax.set_ylabel('Loss Exposure (₹ Cr)', fontsize=9.0, fontweight='bold', color='#475569')
ax.tick_params(axis='both', which='major', labelsize=8.8, colors='#334155')
ax.set_ylim(0, 145)

# Gridlines
ax.grid(axis='y', linestyle='--', alpha=0.6, color='#cbd5e1', zorder=1)
ax.set_axisbelow(True)

# Spines
for spine in ['top', 'right']:
    ax.spines[spine].set_visible(False)
for spine in ['left', 'bottom']:
    ax.spines[spine].set_color('#94a3b8')

# Value labels on top of bars
for bar in bars:
    yval = bar.get_height()
    col = '#047857' if bar == bars[-1] else '#0e7490'
    ax.text(bar.get_x() + bar.get_width()/2, yval + 3.0, f"₹{yval:.1f} Cr", 
            ha='center', va='bottom', fontsize=9.2, fontweight='bold', color=col)

# Annotate reduction
ax.annotate('↓ 86.5% Loss Reduction', 
            xy=(bars[-1].get_x() + bars[-1].get_width()/2, 16.8), 
            xytext=(bars[-1].get_x() - 0.2, 75),
            arrowprops=dict(arrowstyle="->", color="#059669", lw=1.5),
            fontsize=8.5, weight='bold', color='#047857',
            bbox=dict(boxstyle="round,pad=0.25", facecolor="#ecfdf5", edgecolor="#34d399", lw=1))

plt.tight_layout()

out_landscape = r"C:\Users\subha\OneDrive\Desktop\AegisRisk_EAL_Reduction_Landscape.png"
plt.savefig(out_landscape, dpi=300, bbox_inches='tight', facecolor='#ffffff')
plt.close()

print(f"Generated EAL Landscape Chart -> {out_landscape}")
