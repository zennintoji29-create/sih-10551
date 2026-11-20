import matplotlib.pyplot as plt
import numpy as np

plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Segoe UI Variable', 'Arial', 'sans-serif']
plt.rcParams['font.family'] = 'sans-serif'

fig, ax = plt.subplots(figsize=(6.8, 4.0), dpi=300)
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#f8fafc')

years = ['2022', '2023', '2024', '2025', '2026 (Proj.)']
x = np.arange(len(years))
width = 0.35

# Monetary losses in Crores (₹)
unmanaged_loss = [48.5, 62.0, 79.4, 94.2, 118.0]
aegisrisk_loss = [48.5, 34.2, 28.5, 22.1, 16.8]

rects1 = ax.bar(x - width/2, unmanaged_loss, width, label='Unmanaged Loss Exposure (₹ Cr)', 
                color='#f43f5e', edgecolor='#e11d48', linewidth=1.2, alpha=0.85)
rects2 = ax.bar(x + width/2, aegisrisk_loss, width, label='With AegisRisk Optimization (₹ Cr)', 
                color='#06b6d4', edgecolor='#0891b2', linewidth=1.2, alpha=0.9)

ax.set_title('Enterprise Cyber Loss Exposure vs. AegisRisk Optimization', 
             fontsize=10.5, weight='bold', color='#0f172a', pad=12)
ax.set_ylabel('Annual Financial Loss (₹ Crores)', fontsize=8.5, weight='bold', color='#334155')
ax.set_xticks(x)
ax.set_xticklabels(years, fontsize=8.2, weight='bold', color='#1e293b')
ax.set_ylim(0, 135)
ax.grid(axis='y', linestyle='--', alpha=0.4, color='#94a3b8')
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_color('#cbd5e1')
ax.spines['bottom'].set_color('#cbd5e1')

for rect in rects1:
    height = rect.get_height()
    ax.annotate(f'₹{height:.0f}Cr',
                xy=(rect.get_x() + rect.get_width() / 2, height),
                xytext=(0, 3), textcoords="offset points",
                ha='center', va='bottom', fontsize=7.0, weight='bold', color='#9f1239')

for rect in rects2:
    height = rect.get_height()
    ax.annotate(f'₹{height:.1f}Cr',
                xy=(rect.get_x() + rect.get_width() / 2, height),
                xytext=(0, 3), textcoords="offset points",
                ha='center', va='bottom', fontsize=7.0, weight='bold', color='#0e7490')

ax.legend(frameon=True, facecolor='white', edgecolor='#cbd5e1', fontsize=7.8, loc='upper left')

ax.text(3.8, 122, '↓ 85.7% Tail Loss\nReduction via CRQ', 
        ha='center', va='center', fontsize=7.2, weight='bold', color='#047857',
        bbox=dict(boxstyle="round,pad=0.3", facecolor="#ecfdf5", edgecolor="#10b981", lw=1))

plt.tight_layout()

p_desk = r"C:\Users\subha\OneDrive\Desktop\aegisrisk_impact_chart.png"
p_down = r"c:\Users\subha\Downloads\aegisrisk_impact_chart.png"

plt.savefig(p_desk, dpi=300, bbox_inches='tight', facecolor='white')
plt.savefig(p_down, dpi=300, bbox_inches='tight', facecolor='white')

print("Impact chart generated successfully with Segoe UI!")
