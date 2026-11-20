import os
import math
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = r"c:\Users\subha\Downloads\sih-10551\crq-platform\video_assets\prototype_screens"
OUT_DIR = r"c:\Users\subha\Downloads\sih-10551\crq-platform\video_assets\prototype_gifs"
os.makedirs(OUT_DIR, exist_ok=True)

def get_font(size, bold=False):
    font_paths = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def load_base(filename):
    path = os.path.join(BASE_DIR, filename)
    if os.path.exists(path):
        return Image.open(path).convert("RGB")
    return Image.new("RGB", (1920, 1080), (12, 38, 45))

# -------------------------------------------------------------------------
# GIF 1: 02:05 - 02:15: AEGISRISK AI MISSION CONTROL & LIVE CONNECTORS
# -------------------------------------------------------------------------
def create_gif_1_mission_control():
    print("Rendering GIF 1: Mission Control & Connectors...")
    base = load_base("02_CISO_EXECUTIVE_COCKPIT.png")
    frames = []
    num_frames = 20

    font_banner = get_font(22, bold=True)
    font_pill = get_font(18, bold=True)
    font_badge = get_font(20, bold=True)

    for f in range(num_frames):
        img = base.copy()
        draw = ImageDraw.Draw(img)

        # Pulsing radar top banner
        t = f / num_frames
        pulse = 0.5 + 0.5 * math.sin(t * 2 * math.pi)
        
        # Mission control top banner
        draw.rectangle([400, 24, 1150, 68], fill=(4, 47, 46), outline=(113, 201, 206), width=2)
        draw.text((420, 34), "AEGISRISK AI MISSION CONTROL", fill=(113, 201, 206), font=font_banner)
        draw.text((800, 36), "SOC 2 TYPE II • LIVE STREAMING", fill=(255, 255, 255), font=font_pill)

        # Pulsing Green LED
        led_alpha = int(180 + 75 * pulse)
        draw.ellipse([1110, 36, 1130, 56], fill=(16, led_alpha, 129))

        # Connector Health Indicators in top right
        c_x = 1200
        connectors = [("Splunk", (16, 185, 129)), ("CrowdStrike", (16, 185, 129)), ("AWS CloudTrail", (16, 185, 129))]
        for name, col in connectors:
            draw.rectangle([c_x, 26, c_x + 160, 66], fill=(14, 35, 45), outline=(50, 80, 95), width=1)
            draw.ellipse([c_x + 12, 40, c_x + 22, 50], fill=col)
            draw.text((c_x + 30, 35), name, fill=(220, 240, 245), font=font_pill)
            c_x += 175

        # Copilot Active Pulsing Beacon (bottom right)
        bot_x, bot_y = 1750, 950
        ring_r = int(24 + 12 * pulse)
        draw.ellipse([bot_x - ring_r, bot_y - ring_r, bot_x + ring_r, bot_y + ring_r], outline=(113, 201, 206), width=2)

        frames.append(img)

    out_path = os.path.join(OUT_DIR, "01_MISSION_CONTROL_LIVE_TELEMETRY.gif")
    frames[0].save(out_path, save_all=True, append_images=frames[1:], duration=120, loop=0)
    print(f"Saved: {out_path}")

# -------------------------------------------------------------------------
# GIF 2: 02:16 - 02:27: INGEST ZERO-DAY (CVE-2026-1055) & EAL SPIKE
# -------------------------------------------------------------------------
def create_gif_2_zero_day_injection():
    print("Rendering GIF 2: Ingest Zero-Day & EAL Spike...")
    base = load_base("02_CISO_EXECUTIVE_COCKPIT.png")
    frames = []
    num_frames = 24

    font_alert = get_font(32, bold=True)
    font_sub = get_font(22, bold=True)
    font_val = get_font(52, bold=True)
    font_btn = get_font(20, bold=True)

    for f in range(num_frames):
        img = base.copy()
        draw = ImageDraw.Draw(img)

        # Simulation phase
        # Frames 0-6: Cursor moving to click Ingest Zero-Day
        # Frames 7-14: Red Flash "CRITICAL EXPOSURE"
        # Frames 15-24: EAL ramping from $420,000 to $1,250,000 (₹10.37 Cr)

        if f < 7:
            # Show live injection button
            btn_col = (225, 29, 72) if (f % 2 == 0) else (190, 18, 60)
            draw.rectangle([500, 380, 1100, 450], fill=btn_col, outline=(255, 255, 255), width=2)
            draw.text((530, 396), "LIVE TEST: INGEST CRITICAL ZERO-DAY (CVE-2026-1055)", fill=(255, 255, 255), font=font_btn)
            
            # Cursor
            cx = 400 + f * 50
            cy = 300 + f * 18
            draw.polygon([(cx, cy), (cx, cy + 24), (cx + 6, cy + 18), (cx + 14, cy + 24), (cx + 18, cy + 20), (cx + 10, cy + 14), (cx + 18, cy + 14)], fill=(255, 255, 255), outline=(0, 0, 0))

        elif f < 14:
            # Screen Red Flash Banner
            draw.rectangle([0, 0, 1920, 100], fill=(225, 29, 72))
            draw.text((450, 18), "CRITICAL EXPOSURE DETECTED: TELEMETRY DRIFT", fill=(255, 255, 255), font=font_alert)
            draw.text((450, 60), "CVE-2026-1055 (CVSS 9.8 Remote Code Execution) on Core Financial DB", fill=(255, 240, 240), font=font_sub)

            # Red vignette borders
            draw.rectangle([0, 0, 1920, 1080], outline=(225, 29, 72), width=12)

        else:
            # EAL Spike Ramping
            progress = (f - 14) / 10.0
            current_val = int(420000 + progress * (1250000 - 420000))
            inr_val = 3.48 + progress * (10.37 - 3.48)

            # Draw Alert banner
            draw.rectangle([0, 0, 1920, 80], fill=(159, 18, 57))
            draw.text((480, 22), "CRITICAL EXPOSURE ACTIVE: EAL SPIKING", fill=(255, 255, 255), font=font_alert)

            # Cover EAL card with spiked value
            draw.rectangle([250, 200, 560, 350], fill=(255, 241, 242), outline=(225, 29, 72), width=3)
            draw.text((270, 220), "EXPECTED ANNUAL LOSS (EAL)", fill=(159, 18, 57), font=font_sub)
            draw.text((270, 260), f"${current_val:,.0f}", fill=(225, 29, 72), font=font_val)
            draw.text((270, 320), f"Equivalent: Rs. {inr_val:.2f} Crores", fill=(190, 18, 60), font=font_sub)

        frames.append(img)

    out_path = os.path.join(OUT_DIR, "02_ZERO_DAY_INGEST_EAL_SPIKE.gif")
    frames[0].save(out_path, save_all=True, append_images=frames[1:], duration=150, loop=0)
    print(f"Saved: {out_path}")

# -------------------------------------------------------------------------
# GIF 3: 02:28 - 02:40: 10,000 MONTE CARLO ITERATIONS (182ms) & TAIL SURGE
# -------------------------------------------------------------------------
def create_gif_3_monte_carlo_surge():
    print("Rendering GIF 3: Monte Carlo 10,000 Iterations & Tail Surge...")
    base = load_base("03_MONTE_CARLO_LOSS_EXCEEDANCE_CURVE.png")
    frames = []
    num_frames = 24

    font_badge = get_font(26, bold=True)
    font_metric = get_font(38, bold=True)
    font_sub = get_font(20, bold=True)

    for f in range(num_frames):
        img = base.copy()
        draw = ImageDraw.Draw(img)

        # Computation Progress Bar
        t = f / num_frames
        draw.rectangle([450, 120, 1450, 220], fill=(15, 23, 42), outline=(16, 185, 129), width=3)
        draw.text((480, 140), "RE-QUANTIFICATION: 10,000 MONTE CARLO ITERATIONS", fill=(255, 255, 255), font=font_badge)
        
        # Execution badge
        ms_time = min(182, int(40 + t * 142))
        draw.text((1220, 140), f"Elapsed: {ms_time}ms", fill=(16, 185, 129), font=font_badge)

        # Progress fill
        bar_w = int(940 * min(1.0, (f + 2) / num_frames))
        draw.rectangle([480, 180, 480 + bar_w, 205], fill=(16, 185, 129))

        # Tail Surge Callout Card
        tail_val = int(1200000 + t * (2800000 - 1200000))
        draw.rectangle([1150, 270, 1750, 430], fill=(254, 242, 242), outline=(239, 68, 68), width=3)
        draw.text((1180, 290), "FAT-TAIL VALUE-AT-RISK SURGE (EVT)", fill=(153, 27, 27), font=font_sub)
        draw.text((1180, 330), f"95% VaR: ${tail_val:,.0f}", fill=(220, 38, 38), font=font_metric)
        draw.text((1180, 385), "Extreme Loss Shift via Generalized Pareto Fit", fill=(185, 28, 28), font=font_sub)

        frames.append(img)

    out_path = os.path.join(OUT_DIR, "03_MONTE_CARLO_REQUANT_SURGE.gif")
    frames[0].save(out_path, save_all=True, append_images=frames[1:], duration=140, loop=0)
    print(f"Saved: {out_path}")

# -------------------------------------------------------------------------
# GIF 4: 02:41 - 02:49: 0/1 KNAPSACK OPTIMIZER HIGHLIGHT (+428% ROSI)
# -------------------------------------------------------------------------
def create_gif_4_knapsack_optimizer():
    print("Rendering GIF 4: Knapsack Optimizer (+428% ROSI)...")
    base = load_base("04_KNAPSACK_BUDGET_OPTIMIZER.png")
    frames = []
    num_frames = 20

    font_title = get_font(30, bold=True)
    font_bold = get_font(22, bold=True)
    font_item = get_font(20, bold=True)

    for f in range(num_frames):
        img = base.copy()
        draw = ImageDraw.Draw(img)

        t = f / num_frames
        pulse = 0.5 + 0.5 * math.sin(t * 2 * math.pi)

        # Highlight Knapsack selection card
        draw.rectangle([450, 100, 1500, 520], fill=(15, 23, 42), outline=(16, 185, 129), width=4)
        draw.rectangle([450, 100, 1500, 160], fill=(24, 36, 56))
        draw.text((480, 115), "0/1 KNAPSACK OPTIMAL SECURITY CONTROL PORTFOLIO", fill=(16, 185, 129), font=font_title)

        # Selected controls
        draw.rectangle([480, 180, 1470, 245], fill=(20, 45, 35), outline=(16, 185, 129), width=2)
        draw.text((500, 198), "1. Privileged Access Management (PAM)", fill=(255, 255, 255), font=font_item)
        draw.text((1050, 198), "Cost: $40,000", fill=(220, 235, 245), font=font_item)
        draw.text((1250, 198), "[ SELECTED ]", fill=(16, 185, 129), font=font_item)

        draw.rectangle([480, 260, 1470, 325], fill=(20, 45, 35), outline=(16, 185, 129), width=2)
        draw.text((500, 278), "2. Immutable Air-Gapped Cloud Backups", fill=(255, 255, 255), font=font_item)
        draw.text((1050, 278), "Cost: $25,000", fill=(220, 235, 245), font=font_item)
        draw.text((1250, 278), "[ SELECTED ]", fill=(16, 185, 129), font=font_item)

        # Status callout banner
        stat_col = (16, int(185 + 40 * pulse), 129)
        draw.rectangle([480, 355, 1470, 480], fill=(12, 30, 24), outline=stat_col, width=3)
        draw.text((510, 380), "STATUS: ROSI OPTIMAL ALLOCATION", fill=(245, 200, 30), font=font_bold)
        draw.text((510, 425), "TOTAL QUANTIFIED RISK REDUCTION: $780,000  |  PORTFOLIO ROSI: +428%", fill=(0, 230, 100), font=font_title)

        frames.append(img)

    out_path = os.path.join(OUT_DIR, "04_KNAPSACK_PORTFOLIO_428_ROSI.gif")
    frames[0].save(out_path, save_all=True, append_images=frames[1:], duration=150, loop=0)
    print(f"Saved: {out_path}")

# -------------------------------------------------------------------------
# GIF 5: 02:49 - 02:58: APPLY REMEDIATION & EXECUTIVE BOARD REPORT
# -------------------------------------------------------------------------
def create_gif_5_remediation_and_report():
    print("Rendering GIF 5: Apply Remediation & Executive Board Report...")
    base1 = load_base("02_CISO_EXECUTIVE_COCKPIT.png")
    frames = []
    num_frames = 24

    font_btn = get_font(26, bold=True)
    font_eal = get_font(52, bold=True)
    font_sub = get_font(22, bold=True)
    font_memo = get_font(24, bold=True)

    for f in range(num_frames):
        img = base1.copy()
        draw = ImageDraw.Draw(img)

        # Phase 1: Click Apply Remediation (Frames 0-10)
        # Phase 2: EAL drops to $185,000 (Frames 11-18)
        # Phase 3: Board Report Modal generated by Groq 120B (Frames 19-24)

        if f < 10:
            draw.rectangle([700, 400, 1250, 480], fill=(16, 185, 129), outline=(255, 255, 255), width=3)
            draw.text((740, 425), "CLICK: APPLY REMEDIATION", fill=(255, 255, 255), font=font_btn)
            
            # Cursor clicking
            draw.ellipse([980, 450, 1000, 470], fill=(255, 255, 0))

        elif f < 18:
            # EAL Dropped Card
            draw.rectangle([250, 200, 560, 350], fill=(240, 253, 244), outline=(16, 185, 129), width=3)
            draw.text((270, 220), "RESIDUAL EXPECTED ANNUAL LOSS", fill=(21, 128, 61), font=font_sub)
            draw.text((270, 260), "$185,000", fill=(16, 185, 129), font=font_eal)
            draw.text((270, 320), "85.2% Total Loss Exposure Reduced", fill=(5, 150, 105), font=font_sub)

            # Success Banner
            draw.rectangle([600, 50, 1320, 120], fill=(16, 185, 129))
            draw.text((640, 70), "REMEDIATION APPLIED: RISK RE-QUANTIFIED", fill=(255, 255, 255), font=font_btn)

        else:
            # Executive AI Report Tab modal generated by Groq 120B
            draw.rectangle([350, 150, 1570, 750], fill=(15, 23, 42), outline=(16, 185, 129), width=3)
            draw.rectangle([350, 150, 1570, 210], fill=(24, 36, 56))
            draw.text((380, 168), "EXECUTIVE AI BOARD REPORT — GENERATED BY GROQ 120B", fill=(0, 230, 100), font=font_memo)

            sections = [
                "1. Executive Financial Risk Summary (SEC 8-K / DORA Materiality Assessed)",
                "2. Attack Vector Dissection: CVE-2026-1055 Mitigated via PAM",
                "3. Net Capital Exposure: EAL Reduced from $1.25M to $185k (-85.2%)",
                "4. 0/1 Knapsack Portfolio Defensibility: +428% Net ROSI Validated",
                "5. Regulatory Sign-Off: Certified Audit Hash [SHA-256: 7f8a92...]"
            ]
            sy = 240
            for sec in sections:
                draw.text((390, sy), sec, fill=(220, 235, 250), font=font_sub)
                sy += 65

            draw.rectangle([1150, 640, 1520, 710], fill=(16, 185, 129))
            draw.text((1180, 662), "DOWNLOAD VECTOR PDF", fill=(255, 255, 255), font=font_sub)

        frames.append(img)

    out_path = os.path.join(OUT_DIR, "05_APPLY_REMEDIATION_BOARD_MEMO.gif")
    frames[0].save(out_path, save_all=True, append_images=frames[1:], duration=150, loop=0)
    print(f"Saved: {out_path}")

# -------------------------------------------------------------------------
# GIF 6: 02:59 - 03:07: COPILOT GUARDRAIL VIOLATION & ZERO-TRUST LOCK
# -------------------------------------------------------------------------
def create_gif_6_guardrail_violation():
    print("Rendering GIF 6: Copilot Guardrail Violation & Lock...")
    base = load_base("09_AEGISRISK_AI_COPILOT_GUARDRAILS.png")
    frames = []
    num_frames = 22

    font_title = get_font(28, bold=True)
    font_warn = get_font(24, bold=True)
    font_body = get_font(20, bold=False)
    font_lock = get_font(34, bold=True)

    for f in range(num_frames):
        img = base.copy()
        draw = ImageDraw.Draw(img)

        # Phase 1: Click 'Test Guardrail: Ask Password' (Frames 0-7)
        # Phase 2: Red Alert 'SECURITY POLICY VIOLATION' (Frames 8-16)
        # Phase 3: 'AEGISRISK LOCKED & SECURE' (Frames 17-22)

        if f < 8:
            # Highlight pill button
            draw.rectangle([1650, 500, 1880, 540], fill=(239, 68, 68), outline=(255, 255, 255), width=2)
            draw.text((1665, 510), "Test Guardrail: Ask Password", fill=(255, 255, 255), font=get_font(16, bold=True))
            # Cursor
            draw.ellipse([1760, 520, 1780, 540], fill=(255, 255, 0))

        elif f < 17:
            # Red Alert Violation Card over Copilot
            draw.rectangle([1350, 540, 1880, 850], fill=(254, 242, 242), outline=(220, 38, 38), width=3)
            draw.rectangle([1350, 540, 1880, 600], fill=(220, 38, 38))
            draw.text((1370, 558), "SECURITY POLICY VIOLATION", fill=(255, 255, 255), font=font_warn)
            draw.text((1370, 620), "Zero-Trust Guardrail Enforced", fill=(153, 27, 27), font=font_warn)
            draw.text((1370, 665), "Request flagged: Attempted credential extraction.", fill=(185, 28, 28), font=font_body)
            draw.text((1370, 705), "Tenant: Acme CyberFin Corp", fill=(185, 28, 28), font=font_body)
            draw.text((1370, 745), "Action: Logged to SHA-256 Immutable Ledger.", fill=(153, 27, 27), font=get_font(18, bold=True))
            draw.text((1370, 785), "Status: 403 Forbidden - Zero-Trust Active.", fill=(220, 38, 38), font=get_font(18, bold=True))

        else:
            # Final Screen: AEGISRISK LOCKED & SECURE
            draw.rectangle([400, 350, 1520, 650], fill=(4, 47, 46), outline=(113, 201, 206), width=4)
            draw.text((480, 420), "AEGISRISK AI: LOCKED & SECURE", fill=(113, 201, 206), font=font_lock)
            draw.text((480, 490), "Immutable Zero-Trust Guardrails Verified Across All Workspaces", fill=(255, 255, 255), font=font_title)
            draw.text((480, 550), "Audit Hash Digitally Signed • SIH 2026 Jury Ready", fill=(245, 200, 30), font=font_title)

        frames.append(img)

    out_path = os.path.join(OUT_DIR, "06_COPILOT_GUARDRAIL_VIOLATION.gif")
    frames[0].save(out_path, save_all=True, append_images=frames[1:], duration=150, loop=0)
    print(f"Saved: {out_path}")

if __name__ == "__main__":
    print("=== Generating High-Quality Prototype Video GIFs ===")
    create_gif_1_mission_control()
    create_gif_2_zero_day_injection()
    create_gif_3_monte_carlo_surge()
    create_gif_4_knapsack_optimizer()
    create_gif_5_remediation_and_report()
    create_gif_6_guardrail_violation()
    print("\nALL 6 HIGH-QUALITY PROTOTYPE GIFS GENERATED SUCCESSFULLY!")
