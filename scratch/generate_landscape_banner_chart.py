import matplotlib.pyplot as plt
import numpy as np

# Ensure crisp typography
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Segoe UI Variable', 'Arial', 'sans-serif']
plt.rcParams['font.family'] = 'sans-serif'

# 12 x 3.2 landscape aspect ratio - perfect for horizontal slide slots
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 3.2), dpi=300, gridspec_kw={'width_ratios': [1.1, 1]})
fig.patch.set_facecolor('#ffffff')

# ----------------- SUBPLOT 1: ROSI Marginal Efficiency & Buy-Stop Curve -----------------
ax1.set_facecolor('#f8fafc')
spend = np.array([0, 15, 30, 45, 60, 75])  # Lakhs ₹
eal_reduction = np.array([0, 48, 85, 115, 122, 125]) # Lakhs ₹ saved

# Plot curve
ax1.plot(spend, eal_reduction, color='#0284c7', linewidth=2.5, marker='o', markersize=6, label='EAL Reduction (₹ Lakhs)')
ax1.fill_between(spend, eal_reduction, color='#0284c7', alpha=0.12)

# Mark the Optimal Buy-Stop Point (₹45 Lakhs cap)
ax1.scatter([45], [115], color='#16a34a', s=120, zorder=5, edgecolors='#ffffff', linewidth=2)
ax1.annotate('Optimal Buy-Stop\n₹45L spend → ₹1.15 Cr saved\n(Inflection Point)', 
             xy=(45, 115), xytext=(22, 92),
             arrowprops=dict(arrowstyle="->", color="#16a34a", lw=1.5),
             fontsize=7.8, weight='bold', color='#15803d',
             bbox=dict(boxstyle="round,pad=0.25", facecolor="#f0fdf4", edgecolor="#86efac", lw=1))

# Diminishing returns zone
ax1.axvspan(45, 75, color='#fef2f2', alpha=0.6, label='Diminishing Returns Zone')
ax1.text(60, 45, 'Capital Waste\n(Over-investment)', fontsize=7.2, color='#b91c1c', ha='center', weight='bold')

ax1.set_title('AegisRisk Marginal Investment Efficiency Curve', fontsize=9.5, weight='bold', color='#0f172a', pad=8)
ax1.set_xlabel('Security Control Spend (₹ Lakhs)', fontsize=8, weight='bold', color='#475569')
ax1.set_ylabel('Annual Loss Reduction (₹ Lakhs)', fontsize=8, weight='bold', color='#475569')
ax1.set_xlim(-2, 78)
ax1.set_ylim(-5, 140)
ax1.grid(True, linestyle='--', alpha=0.4, color='#cbd5e1')
ax1.spines['top'].set_visible(False)
ax1.spines['right'].set_visible(False)
ax1.spines['left'].set_color('#cbd5e1')
ax1.spines['bottom'].set_color('#cbd5e1')
ax1.legend(loc='upper left', fontsize=7.2, framealpha=0.9)

# ----------------- SUBPLOT 2: 95% Tail Risk (EVT VaR) Reduction -----------------
ax2.set_facecolor('#f8fafc')
stages = ['Unmanaged\nBaseline', 'MFA + EDR\n(Basic)', 'Segmented\nIAM', 'AegisRisk\nOptimized']
var_values = [125.0, 78.4, 42.1, 16.8]  # ₹ Crores Tail Loss Exposure

bars = ax2.bar(stages, var_values, width=0.48, color=['#ef4444', '#f97316', '#0ea5e9', '#10b981'],
               edgecolor=['#b91c1c', '#c2410c', '#0284c7', '#047857'], linewidth=1.2)

for bar, val in zip(bars, var_values):
    ax2.text(bar.get_x() + bar.get_width()/2, val + 3, f'₹{val:.1f} Cr', 
             ha='center', va='bottom', fontsize=7.6, weight='bold', color='#0f172a')

ax2.set_title('95% Value at Risk (VaR) Tail Loss Reduction', fontsize=9.5, weight='bold', color='#0f172a', pad=8)
ax2.set_ylabel('95% Tail Exposure (₹ Crores)', fontsize=8, weight='bold', color='#475569')
ax2.set_ylim(0, 148)
ax2.grid(axis='y', linestyle='--', alpha=0.4, color='#cbd5e1')
ax2.spines['top'].set_visible(False)
ax2.spines['right'].set_visible(False)
ax2.spines['left'].set_color('#cbd5e1')
ax2.spines['bottom'].set_color('#cbd5e1')

# Badge highlighting reduction
ax2.text(1.5, 125, '↓ 86.5% Net Tail Risk Reduction', 
         ha='center', va='center', fontsize=7.8, weight='bold', color='#065f46',
         bbox=dict(boxstyle="round,pad=0.35", facecolor="#ecfdf5", edgecolor="#34d399", lw=1.2))

plt.tight_layout()

# Save paths
p1 = r"C:\Users\subha\OneDrive\Desktop\AegisRisk_Landscape_Impact_Graph.png"
p2 = r"c:\Users\subha\Downloads\sih-10551\scratch\AegisRisk_Landscape_Impact_Graph.png"
fig.savefig(p1, bbox_inches='tight', dpi=300)
fig.savefig(p2, bbox_inches='tight', dpi=300)
print(f"Successfully generated landscape banner graph to:\n- {p1}\n- {p2}")
