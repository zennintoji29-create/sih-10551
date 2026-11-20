import os
from PIL import Image, ImageDraw, ImageFont

def get_font(size, bold=False):
    # Try standard Windows fonts
    font_paths = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_sih_badge(draw, width=1920):
    # Draw simple clean SIH text in top right
    font_badge = get_font(28, bold=True)
    draw.text((width - 200, 60), "SIH 2026", fill=(255, 153, 51), font=font_badge) # Indian saffron

def create_scene_1(out_path):
    # 00:00 - 00:02: Pure black background, bold red PROBLEM
    img = Image.new("RGB", (1920, 1080), (0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_sih_badge(draw)
    
    font_main = get_font(120, bold=True)
    text = "PROBLEM"
    bbox = draw.textbbox((0, 0), text, font=font_main)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    draw.text(((1920 - w) // 2, (1080 - h) // 2), text, fill=(230, 25, 25), font=font_main)
    img.save(out_path)

def create_scene_2(out_path):
    # 00:02 - 00:10: LEGACY CYBER RISK, Warning triangle, CRITICAL ERROR
    img = Image.new("RGB", (1920, 1080), (0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_sih_badge(draw)
    
    font_title = get_font(72, bold=True)
    font_sub = get_font(40, bold=True)
    font_small = get_font(32, bold=True)

    # Title
    t1 = "LEGACY CYBER RISK"
    b1 = draw.textbbox((0, 0), t1, font=font_title)
    draw.text(((1920 - (b1[2]-b1[0])) // 2, 220), t1, fill=(255, 255, 255), font=font_title)

    # Triangle
    cx, cy = 960, 480
    size = 120
    p1 = (cx, cy - size)
    p2 = (cx - size, cy + size - 20)
    p3 = (cx + size, cy + size - 20)
    draw.polygon([p1, p2, p3], outline=(220, 20, 20), width=8)
    
    # Exclamation point in triangle
    f_excl = get_font(110, bold=True)
    draw.text((cx - 15, cy - 70), "!", fill=(220, 20, 20), font=f_excl)

    # Critical Error text
    t2 = "CRITICAL ERROR"
    b2 = draw.textbbox((0, 0), t2, font=font_sub)
    draw.text(((1920 - (b2[2]-b2[0])) // 2, 630), t2, fill=(220, 20, 20), font=font_sub)

    # Subtitle
    t3 = "THESE AUDITS ARE STATIC AND EASY TO BYPASS"
    b3 = draw.textbbox((0, 0), t3, font=font_small)
    draw.text(((1920 - (b3[2]-b3[0])) // 2, 800), t3, fill=(255, 255, 255), font=font_small)
    img.save(out_path)

def create_scene_3_table(out_path):
    # 00:11 - 00:18: Clean table matching the video screenshot 3!
    img = Image.new("RGB", (1920, 1080), (0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_sih_badge(draw)

    # White box in center
    box_w = 1300
    box_h = 760
    bx0 = (1920 - box_w) // 2
    by0 = (1080 - box_h) // 2

    draw.rectangle([bx0, by0, bx0 + box_w, by0 + box_h], fill=(255, 255, 255), outline=(100, 100, 100), width=3)

    font_header = get_font(28, bold=True)
    font_text = get_font(21, bold=False)
    font_bold = get_font(21, bold=True)

    rows = [
        ("Metric", "Details", True),
        ("Reported Cyber Attacks in India (2024–2026)", "More than 1,450 major incidents", False),
        ("Average Enterprise Breach Cost", "₹37.5 Crores ($4.45M) per incident", False),
        ("Primary Target Corridors", "Power Grids, AIIMS Delhi, Core Banking", False),
        ("Active In-The-Wild Exploits (CISA KEV)", "Over 1,200 actively exploited zero-days", False),
        ("Regulatory Compliance Mandates", "RBI CSITE, SEBI Master Circular, SEC 8-K", False),
        ("CISO Capital Defensibility Gap", "82% cannot prove Security ROI (ROSI)", False)
    ]

    row_h = box_h // len(rows)
    col_split = bx0 + 580

    for i, (col1, col2, is_head) in enumerate(rows):
        ry0 = by0 + i * row_h
        ry1 = ry0 + row_h
        
        # Row line
        draw.line([bx0, ry1, bx0 + box_w, ry1], fill=(180, 180, 180), width=2)
        
        # Header background
        if is_head:
            draw.rectangle([bx0, ry0, bx0 + box_w, ry1], fill=(240, 240, 245))

        f1 = font_header if is_head else font_bold
        f2 = font_header if is_head else font_text

        draw.text((bx0 + 25, ry0 + (row_h - 26) // 2), col1, fill=(20, 20, 20), font=f1)
        draw.text((col_split + 25, ry0 + (row_h - 26) // 2), col2, fill=(20, 20, 20), font=f2)

    # Vertical split line
    draw.line([col_split, by0, col_split, by0 + box_h], fill=(180, 180, 180), width=2)
    img.save(out_path)

def create_scene_9_competitor_table(out_path):
    # Master Competitor Comparison Table matching exact screenshot 3 style
    img = Image.new("RGB", (1920, 1080), (0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_sih_badge(draw)

    box_w = 1600
    box_h = 780
    bx0 = (1920 - box_w) // 2
    by0 = (1080 - box_h) // 2

    draw.rectangle([bx0, by0, bx0 + box_w, by0 + box_h], fill=(255, 255, 255), outline=(100, 100, 100), width=3)

    font_header = get_font(22, bold=True)
    font_bold = get_font(18, bold=True)
    font_text = get_font(17, bold=False)

    cols = ["Evaluation Dimension", "AegisRisk AI (Ours)", "Safe Security", "BitSight", "RiskLens / Axio", "Kovrr"]
    rows = [
        ("Quantification Model", "OpenFAIR + 10k MC + EVT", "Proprietary Bayesian", "Heuristic IP Rating", "Classical FAIR Surveys", "Actuarial Tables"),
        ("Telemetry Ingestion", "Real-Time Sub-Second", "Daily Batch Sync", "External DNS/Port", "Manual (Quarterly)", "Periodic Surveys"),
        ("Fat-Tail Risk (EVT)", "Yes (Generalized Pareto)", "No (Normal Approx)", "None", "No (Underestimates)", "Actuarial Fit"),
        ("Budget Optimization", "0/1 Knapsack Solver", "Priority Checklist", "None", "Manual What-If", "Insurance Limits"),
        ("Board Memo & PDF", "Automated Groq 120B", "Static PPT Templates", "Static Rating PDF", "Manual Word Export", "Static Reports"),
        ("AI Guardrail Security", "Zero-Trust + Audit Log", "Basic Chatbot", "None", "None", "None"),
        ("Currency Support", "Dual: ₹ INR & $ USD", "USD Only", "USD Only", "USD Only", "USD / EUR"),
    ]

    col_widths = [300, 290, 250, 240, 260, 260]
    total_h = box_h
    row_h = total_h // (len(rows) + 1)

    # Header
    draw.rectangle([bx0, by0, bx0 + box_w, by0 + row_h], fill=(235, 240, 248))
    cx = bx0
    for idx, cname in enumerate(cols):
        draw.text((cx + 12, by0 + (row_h - 22) // 2), cname, fill=(10, 25, 47), font=font_header)
        cx += col_widths[idx]
        if idx < len(cols) - 1:
            draw.line([cx, by0, cx, by0 + box_h], fill=(180, 180, 180), width=2)

    draw.line([bx0, by0 + row_h, bx0 + box_w, by0 + row_h], fill=(180, 180, 180), width=2)

    # Data Rows
    for r_idx, r_data in enumerate(rows):
        ry0 = by0 + (r_idx + 1) * row_h
        ry1 = ry0 + row_h
        draw.line([bx0, ry1, bx0 + box_w, ry1], fill=(200, 200, 200), width=1)
        
        # Highlight our column (col index 1)
        col1_x0 = bx0 + col_widths[0]
        col1_x1 = col1_x0 + col_widths[1]
        draw.rectangle([col1_x0, ry0, col1_x1, ry1], fill=(240, 253, 244))

        cx = bx0
        for c_idx, val in enumerate(r_data):
            f = font_bold if c_idx <= 1 else font_text
            colr = (5, 150, 105) if c_idx == 1 else (20, 20, 20)
            draw.text((cx + 12, ry0 + (row_h - 20) // 2), val, fill=colr, font=f)
            cx += col_widths[c_idx]

    img.save(out_path)

def create_scene_4(out_path):
    # 00:19 - 00:22: THIS PUTS LIVES / CAPITAL IN DANGER
    img = Image.new("RGB", (1920, 1080), (0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_sih_badge(draw)

    font_main = get_font(54, bold=True)
    t1 = "THIS PUTS"
    t2 = "ENTERPRISE CAPITAL AND OPERATIONS"
    t3 = "IN DANGER"

    b1 = draw.textbbox((0, 0), t1, font=font_main)
    b2 = draw.textbbox((0, 0), t2, font=font_main)
    b3 = draw.textbbox((0, 0), t3, font=font_main)

    draw.text(((1920 - (b1[2]-b1[0])) // 2, 360), t1, fill=(255, 255, 255), font=font_main)
    draw.text(((1920 - (b2[2]-b2[0])) // 2, 460), t2, fill=(255, 255, 255), font=font_main)
    draw.text(((1920 - (b3[2]-b3[0])) // 2, 560), t3, fill=(230, 25, 25), font=font_main)
    img.save(out_path)

def create_scene_5(out_path):
    # 00:22 - 00:29: TODAY THERE IS NO SYSTEM...
    img = Image.new("RGB", (1920, 1080), (0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_sih_badge(draw)

    font_main = get_font(42, bold=True)
    lines = [
        ("TODAY THERE IS NO SYSTEM", (255, 255, 255)),
        ("IN INDIA", (255, 255, 255)),
        ("THAT CAN GUARANTEE", (255, 255, 255)),
        ("CONTINUOUS AND DEFENSIBLE", (255, 255, 255)),
        ("CYBER RISK QUANTIFICATION IN FINANCIAL TERMS", (255, 255, 255)),
        ("UNDER ANY CONDITION", (255, 255, 255))
    ]
    start_y = 280
    for text, color in lines:
        b = draw.textbbox((0, 0), text, font=font_main)
        draw.text(((1920 - (b[2]-b[0])) // 2, start_y), text, fill=color, font=font_main)
        start_y += 75
    img.save(out_path)

def create_scene_6(out_path):
    # 00:29 - 00:30: Bold green SOLUTION
    img = Image.new("RGB", (1920, 1080), (0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_sih_badge(draw)

    font_main = get_font(120, bold=True)
    text = "SOLUTION"
    bbox = draw.textbbox((0, 0), text, font=font_main)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    draw.text(((1920 - w) // 2, (1080 - h) // 2), text, fill=(16, 185, 129), font=font_main)
    img.save(out_path)

def create_scene_7_extraction(out_path):
    # 00:44 - 00:50: Matches Screenshot 4 (PNT extraction -> FINANCIAL RISK EXTRACTION)
    img = Image.new("RGB", (1920, 1080), (0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_sih_badge(draw)

    # Title: Bold Green
    font_title = get_font(64, bold=True)
    t_title = "FINANCIAL RISK EXTRACTION"
    bt = draw.textbbox((0, 0), t_title, font=font_title)
    draw.text(((1920 - (bt[2]-bt[0])) // 2, 100), t_title, fill=(0, 230, 100), font=font_title)

    # Left: Telemetry Server Icon (White)
    sx, sy = 340, 520
    draw.rectangle([sx - 90, sy - 80, sx + 90, sy + 80], outline=(255, 255, 255), width=6)
    draw.line([sx - 90, sy - 25, sx + 90, sy - 25], fill=(255, 255, 255), width=4)
    draw.line([sx - 90, sy + 30, sx + 90, sy + 30], fill=(255, 255, 255), width=4)
    draw.ellipse([sx + 50, sy - 55, sx + 65, sy - 40], fill=(255, 255, 255))
    draw.ellipse([sx + 50, sy, sx + 65, sy + 15], fill=(255, 255, 255))
    draw.ellipse([sx + 50, sy + 50, sx + 65, sy + 65], fill=(255, 255, 255))

    font_lbl = get_font(36, bold=True)
    t_srv = "SECURITY TELEMETRY"
    bsrv = draw.textbbox((0, 0), t_srv, font=font_lbl)
    draw.text((sx - (bsrv[2]-bsrv[0]) // 2, sy + 130), t_srv, fill=(255, 255, 255), font=font_lbl)

    # Center Waveform (Bright Neon Green)
    import math
    wave_x_start = 540
    wave_x_end = 1260
    for x in range(wave_x_start, wave_x_end, 3):
        # Generate spiky acoustic/RF waveform
        progress = (x - wave_x_start) / (wave_x_end - wave_x_start)
        envelope = math.sin(progress * math.pi)
        amplitude = envelope * (140 * math.sin(x * 0.15) * math.cos(x * 0.04) + 40 * math.sin(x * 0.4))
        draw.line([x, sy - int(abs(amplitude)), x, sy + int(abs(amplitude))], fill=(0, 240, 80), width=3)

    # Right: Output text PNT -> EAL (₹ / $)
    font_out = get_font(84, bold=True)
    draw.text((1340, sy - 55), "EAL", fill=(255, 255, 255), font=font_out)

    # Yellow outputs below
    font_sub = get_font(38, bold=True)
    draw.text((1340, sy + 90), "OPENFAIR", fill=(245, 200, 30), font=font_sub)
    draw.text((1340, sy + 145), "MONTE CARLO", fill=(245, 200, 30), font=font_sub)
    draw.text((1340, sy + 200), "0/1 KNAPSACK", fill=(245, 200, 30), font=font_sub)
    img.save(out_path)

def create_scene_8_simulation(out_path):
    # 01:20 - 01:34: Matches Screenshot 5 (GNSS -> LEO SATELLITE SIGNALS)
    img = Image.new("RGB", (1920, 1080), (0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_sih_badge(draw)

    # Top title: Yellow
    font_title = get_font(52, bold=True)
    t_top = "SMART ADAPTIVE LOSS SIMULATION"
    bt = draw.textbbox((0, 0), t_top, font=font_title)
    draw.text(((1920 - (bt[2]-bt[0])) // 2, 100), t_top, fill=(245, 200, 30), font=font_title)

    # Left: White Header "RAW TELEMETRY"
    font_head = get_font(72, bold=True)
    draw.text((320, 300), "RAW TELEMETRY", fill=(255, 255, 255), font=font_head)

    # Red parameters below
    font_params = get_font(38, bold=True)
    p_lines = [
        "CVSS EXPLOITABILITY: 9.8",
        "THREAT FREQUENCY: 14.2 / YR",
        "ASSET VALUE: ₹120 CRORES",
        "ESTIMATED LOSS: $1.25M / YR"
    ]
    py = 420
    for line in p_lines:
        draw.text((320, py), line, fill=(230, 25, 25), font=font_params)
        py += 60

    # Center Arrow: White
    ax0, ay0 = 1080, 520
    draw.line([ax0 - 100, ay0, ax0 + 80, ay0], fill=(255, 255, 255), width=8)
    draw.polygon([(ax0 + 110, ay0), (ax0 + 60, ay0 - 30), (ax0 + 60, ay0 + 30)], fill=(255, 255, 255))

    # Right: White Text "QUANTIFIED EAL & VaR"
    draw.text((1240, 480), "QUANTIFIED EAL", fill=(255, 255, 255), font=font_head)
    draw.text((1240, 570), "& 95% VaR", fill=(255, 255, 255), font=font_head)
    img.save(out_path)

if __name__ == "__main__":
    out_dir = r"c:\Users\subha\Downloads\sih-10551\crq-platform\video_assets"
    os.makedirs(out_dir, exist_ok=True)
    
    create_scene_1(os.path.join(out_dir, "01_PROBLEM.png"))
    create_scene_2(os.path.join(out_dir, "02_LEGACY_CYBER_RISK.png"))
    create_scene_3_table(os.path.join(out_dir, "03_DATA_TABLE.png"))
    create_scene_4(os.path.join(out_dir, "04_PUTS_IN_DANGER.png"))
    create_scene_5(os.path.join(out_dir, "05_NO_SYSTEM_IN_INDIA.png"))
    create_scene_6(os.path.join(out_dir, "06_SOLUTION.png"))
    create_scene_7_extraction(os.path.join(out_dir, "07_FINANCIAL_RISK_EXTRACTION.png"))
    create_scene_8_simulation(os.path.join(out_dir, "08_ADAPTIVE_LOSS_SIMULATION.png"))
    create_scene_9_competitor_table(os.path.join(out_dir, "09_COMPETITOR_TABLE.png"))
    print("All 9 pristine video assets generated successfully in video_assets/")
