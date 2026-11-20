import matplotlib.pyplot as plt
import numpy as np

# Set Segoe UI font
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Segoe UI Variable', 'Arial', 'sans-serif']
plt.rcParams['font.family'] = 'sans-serif'

# WIDE LANDSCAPE RATIO: 10 x 3.0 inches (Perfect for wide / low height slots)
fig, ax = plt.subplots(figsize=(10.0, 3.2), dpi=300)
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#f8fafc')

years = ['2021', '2022', '2023', '2024', '2025 (Proj.)']
# CERT-In reported cyber security incidents in India (Lakhs)
incidents = [14.02, 13.91, 15.92, 21.34, 28.50]

bars = ax.bar(years, incidents, color='#06b6d4', width=0.52, edgecolor='#0891b2', linewidth=1.3, zorder=3)

# Title
ax.set_title('Reported Cyber Security Incidents in India (CERT-In / Lakhs)', 
             fontsize=11.5, fontweight='bold', color='#0f172a', pad=10)

# Y-axis styling
ax.set_ylabel('Incidents (in Lakhs)', fontsize=9.0, fontweight='bold', color='#475569')
ax.tick_params(axis='both', which='major', labelsize=8.8, colors='#334155')
ax.set_ylim(0, 33)

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
            ha='center', va='bottom', fontsize=9.2, fontweight='bold', color='#0e7490')

plt.tight_layout()

out_landscape = r"C:\Users\subha\OneDrive\Desktop\CERT_In_Cyber_Incidents_Landscape.png"
out_downloads = r"c:\Users\subha\Downloads\sih-10551\scratch\CERT_In_Cyber_Incidents_Landscape.png"

plt.savefig(out_landscape, dpi=300, bbox_inches='tight', facecolor='#ffffff')
plt.savefig(out_downloads, dpi=300, bbox_inches='tight', facecolor='#ffffff')
plt.close()

print(f"Generated Landscape Reference Chart -> {out_landscape}")
