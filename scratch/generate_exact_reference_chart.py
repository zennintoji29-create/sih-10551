import matplotlib.pyplot as plt
import numpy as np

# Set Segoe UI font
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Segoe UI Variable', 'Arial', 'sans-serif']
plt.rcParams['font.family'] = 'sans-serif'

# ==============================================================================
# CHART 1: EXACT MATCH TO REFERENCE (Reported Cyber Security Incidents in India)
# ==============================================================================
fig, ax = plt.subplots(figsize=(6.5, 4.0), dpi=300)
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#f8fafc')

years = ['2021', '2022', '2023', '2024', '2025 (Proj.)']
# CERT-In reported cyber security incidents in India (Lakhs)
incidents = [14.02, 13.91, 15.92, 21.34, 28.50]

bars = ax.bar(years, incidents, color='#06b6d4', width=0.62, edgecolor='#0891b2', linewidth=1.2, zorder=3)

# Title
ax.set_title('Reported Cyber Security Incidents in India (CERT-In / Lakhs)', 
             fontsize=11.0, fontweight='bold', color='#0f172a', pad=12)

# Y-axis styling
ax.set_ylabel('Incidents (in Lakhs)', fontsize=9.0, fontweight='bold', color='#475569')
ax.tick_params(axis='both', which='major', labelsize=8.5, colors='#334155')
ax.set_ylim(0, 32)

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
    ax.text(bar.get_x() + bar.get_width()/2, yval + 0.8, f"{yval:.1f}L", 
            ha='center', va='bottom', fontsize=8.8, fontweight='bold', color='#0e7490')

plt.tight_layout()
out_ref_match = r"C:\Users\subha\OneDrive\Desktop\Cyber_Incidents_India_Reference_Chart.png"
plt.savefig(out_ref_match, dpi=300, bbox_inches='tight', facecolor='#ffffff')
plt.savefig(r"c:\Users\subha\Downloads\Cyber_Incidents_India_Reference_Chart.png", dpi=300, bbox_inches='tight', facecolor='#ffffff')
plt.close()
print(f"Generated Reference Match Chart -> {out_ref_match}")

# ==============================================================================
# CHART 2: COMPACT EAL RISK REDUCTION CHART (Fits in small space)
# ==============================================================================
fig, ax = plt.subplots(figsize=(6.5, 4.0), dpi=300)
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#f8fafc')

years = ['2022', '2023', '2024', '2025', '2026 (P)']
x = np.arange(len(years))
width = 0.35

unmanaged = [48.0, 62.0, 79.0, 94.0, 118.0]
managed = [48.5, 34.2, 28.5, 22.1, 16.8]

rects1 = ax.bar(x - width/2, unmanaged, width, label='Unmanaged Loss (₹ Cr)', 
                color='#f43f5e', edgecolor='#e11d48', linewidth=1.0, zorder=3)
rects2 = ax.bar(x + width/2, managed, width, label='With AegisRisk (₹ Cr)', 
                color='#0ea5e9', edgecolor='#0284c7', linewidth=1.0, zorder=3)

ax.set_title('Enterprise Loss Exposure vs. AegisRisk Optimization', 
             fontsize=11.0, fontweight='bold', color='#0f172a', pad=12)
ax.set_ylabel('Annual Loss (₹ Crores)', fontsize=9.0, fontweight='bold', color='#475569')
ax.set_xticks(x)
ax.set_xticklabels(years, fontsize=8.5, fontweight='bold', color='#334155')
ax.set_ylim(0, 135)
ax.tick_params(axis='y', labelsize=8.5, colors='#334155')

ax.grid(axis='y', linestyle='--', alpha=0.6, color='#cbd5e1', zorder=1)
ax.set_axisbelow(True)

for spine in ['top', 'right']:
    ax.spines[spine].set_visible(False)
for spine in ['left', 'bottom']:
    ax.spines[spine].set_color('#94a3b8')

ax.legend(frameon=True, facecolor='#ffffff', edgecolor='#cbd5e1', fontsize=8.0, loc='upper left')

# Tail reduction badge
ax.text(x[-1] + width/2, 122, "↓ 85.7% Tail Loss\nReduction via CRQ", 
        ha='center', va='center', fontsize=7.8, fontweight='bold', color='#059669',
        bbox=dict(boxstyle="round,pad=0.3", facecolor="#ecfdf5", edgecolor="#10b981", lw=1.2))

plt.tight_layout()
out_compact_crq = r"C:\Users\subha\OneDrive\Desktop\AegisRisk_Compact_Impact_Chart.png"
plt.savefig(out_compact_crq, dpi=300, bbox_inches='tight', facecolor='#ffffff')
plt.savefig(r"c:\Users\subha\Downloads\AegisRisk_Compact_Impact_Chart.png", dpi=300, bbox_inches='tight', facecolor='#ffffff')
plt.close()
print(f"Generated Compact Impact Chart -> {out_compact_crq}")
