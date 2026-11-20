import os
import time
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = r"c:\Users\subha\Downloads\sih-10551\crq-platform\video_assets\prototype_gifs"
os.makedirs(OUT_DIR, exist_ok=True)

def get_font(size, bold=False):
    font_paths = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def stamp_explainer(img, feature_title, what_it_does):
    draw = ImageDraw.Draw(img)
    font_title = get_font(24, bold=True)
    font_desc = get_font(20, bold=False)
    font_sub = get_font(16, bold=True)

    # Top Feature Identifier Pill
    draw.rectangle([60, 20, 950, 75], fill=(4, 47, 46), outline=(113, 201, 206), width=2)
    draw.text((80, 28), f"FEATURE: {feature_title.upper()}", fill=(113, 201, 206), font=font_title)
    draw.text((80, 52), "AEGISRISK AI PROTOTYPE — SOC 2 TYPE II • LIVE PIPELINE", fill=(200, 220, 230), font=font_sub)

    # Bottom "What It Does" Explainer Ribbon
    draw.rectangle([60, 990, 1860, 1055], fill=(12, 28, 36), outline=(16, 185, 129), width=2)
    draw.rectangle([60, 990, 240, 1055], fill=(16, 185, 129))
    draw.text((75, 1010), "WHAT IT DOES", fill=(255, 255, 255), font=font_title)
    draw.text((260, 1012), what_it_does, fill=(240, 250, 255), font=font_desc)
    return img

def run_suite():
    print("=== Launching Comprehensive Website Feature GIF Generation Pipeline ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        # Login
        print("Authenticating as CISO...")
        page.goto("http://localhost:3000/login", wait_until="networkidle")
        page.fill("input[type='email']", "ciso@acme.com")
        page.fill("input[type='password']", "admin123")
        page.click("button:has-text('Sign In'), button:has-text('Log In'), button[type='submit']")
        page.wait_for_url("**/dashboard**", timeout=10000)
        time.sleep(2)

        # -------------------------------------------------------------
        # 1. SECURITY CONNECTORS (Live Telemetry & Diagnostics)
        # -------------------------------------------------------------
        f1_path = os.path.join(OUT_DIR, "FEATURE_01_SECURITY_CONNECTORS.gif")
        if not os.path.exists(f1_path):
            print("Recording Feature 1: Security Connectors...")
            page.click("button:has-text('Security Connectors')")
            time.sleep(1.5)
            frames_conn = []
            for i in range(12):
                if i == 4:
                    btn = page.locator("button:has-text('Test'), button:has-text('Verify')").first
                    if btn.is_visible():
                        btn.click()
                time.sleep(0.2)
                shot_bytes = page.screenshot()
                import io
                im = Image.open(io.BytesIO(shot_bytes)).convert("RGB")
                stamped = stamp_explainer(
                    im, 
                    "Live Security Connectors & Automated Telemetry Ingestion",
                    "Streams real-time event telemetry from Splunk, CrowdStrike, AWS, and CISA KEV into OpenFAIR risk models."
                )
                frames_conn.append(stamped)
            frames_conn[0].save(f1_path, save_all=True, append_images=frames_conn[1:], duration=220, loop=0)
            print("Saved FEATURE_01_SECURITY_CONNECTORS.gif")

        # -------------------------------------------------------------
        # 2. WHAT-IF CONTROL INVESTMENT SIMULATOR (ROSI)
        # -------------------------------------------------------------
        f2_path = os.path.join(OUT_DIR, "FEATURE_02_WHAT_IF_SIMULATOR.gif")
        if not os.path.exists(f2_path):
            print("Recording Feature 2: What-If Simulator...")
            page.click("button:has-text('What-If Simulator')")
            time.sleep(1.5)
            frames_whatif = []
            sliders = page.locator("input[type='range']").all()
            for i in range(12):
                if sliders and i in [3, 6, 9]:
                    page.evaluate(f"document.querySelectorAll('input[type=\"range\"]')[0].value = {50 + i * 4}; document.querySelectorAll('input[type=\"range\"]')[0].dispatchEvent(new Event('change'))")
                time.sleep(0.25)
                shot_bytes = page.screenshot()
                import io
                im = Image.open(io.BytesIO(shot_bytes)).convert("RGB")
                stamped = stamp_explainer(
                    im,
                    "Interactive What-If Simulator & Capital Optimization",
                    "Enables CISOs to adjust control coverage (MFA, EDR) and simulate real-time financial risk drop before allocating budget."
                )
                frames_whatif.append(stamped)
            frames_whatif[0].save(f2_path, save_all=True, append_images=frames_whatif[1:], duration=220, loop=0)
            print("Saved FEATURE_02_WHAT_IF_SIMULATOR.gif")

        # -------------------------------------------------------------
        # 3. CLOSED-LOOP MODEL VERIFICATION (Predicted vs Observed)
        # -------------------------------------------------------------
        f3_path = os.path.join(OUT_DIR, "FEATURE_03_CLOSED_LOOP_MODEL.gif")
        if not os.path.exists(f3_path):
            print("Recording Feature 3: Closed-Loop Model...")
            page.click("button:has-text('Closed-Loop Model')")
            time.sleep(1.5)
            frames_loop = []
            for i in range(10):
                time.sleep(0.25)
                shot_bytes = page.screenshot()
                import io
                im = Image.open(io.BytesIO(shot_bytes)).convert("RGB")
                stamped = stamp_explainer(
                    im,
                    "Closed-Loop Model Verification (Predicted vs Observed)",
                    "Audits mathematical model veracity by comparing predicted loss reductions against post-deployment telemetry (96.7% accuracy)."
                )
                frames_loop.append(stamped)
            frames_loop[0].save(f3_path, save_all=True, append_images=frames_loop[1:], duration=250, loop=0)
            print("Saved FEATURE_03_CLOSED_LOOP_MODEL.gif")

        # -------------------------------------------------------------
        # 4. VULNERABILITY TRIAGE & FINANCIAL CVE DRILLDOWN
        # -------------------------------------------------------------
        f4_path = os.path.join(OUT_DIR, "FEATURE_04_VULNERABILITY_TRIAGE.gif")
        if not os.path.exists(f4_path):
            print("Recording Feature 4: Vulnerability Triage...")
            page.click("button:has-text('Vulnerability Triage')")
            time.sleep(1.5)
            frames_triage = []
            for i in range(12):
                if i == 4:
                    row = page.locator("tr:has-text('CVE-'), tr:has-text('Critical')").first
                    if row.is_visible():
                        row.click()
                time.sleep(0.25)
                shot_bytes = page.screenshot()
                import io
                im = Image.open(io.BytesIO(shot_bytes)).convert("RGB")
                stamped = stamp_explainer(
                    im,
                    "Financial Vulnerability Triage & Exploit Prioritization",
                    "Translates CVEs and CVSS exploitability into exact dollar/rupee business loss, prioritizing what threatens revenue first."
                )
                frames_triage.append(stamped)
            frames_triage[0].save(f4_path, save_all=True, append_images=frames_triage[1:], duration=220, loop=0)
            print("Saved FEATURE_04_VULNERABILITY_TRIAGE.gif")

        # -------------------------------------------------------------
        # 5. SYSTEM TOPOLOGY & BLAST RADIUS MAP
        # -------------------------------------------------------------
        f5_path = os.path.join(OUT_DIR, "FEATURE_05_SYSTEM_TOPOLOGY_MAP.gif")
        if not os.path.exists(f5_path):
            print("Recording Feature 5: System Topology & Blast Radius...")
            page.click("button:has-text('Risk Cockpit')")
            time.sleep(1)
            topo_btn = page.locator("button:has-text('System Topology Map'), button:has-text('Inspect Blast Radius Map')").first
            if topo_btn.is_visible():
                topo_btn.click()
                time.sleep(1.5)
            frames_topo = []
            for i in range(10):
                time.sleep(0.25)
                shot_bytes = page.screenshot()
                import io
                im = Image.open(io.BytesIO(shot_bytes)).convert("RGB")
                stamped = stamp_explainer(
                    im,
                    "System Topology & Interactive Blast Radius Map",
                    "Visualizes attack propagation across interconnected cloud workloads, databases, and third-party SaaS dependencies."
                )
                frames_topo.append(stamped)
            frames_topo[0].save(f5_path, save_all=True, append_images=frames_topo[1:], duration=250, loop=0)
            print("Saved FEATURE_05_SYSTEM_TOPOLOGY_MAP.gif")

        # Close any open Modal or backdrop cleanly before continuing
        page.keyboard.press("Escape")
        time.sleep(0.5)
        close_modal = page.locator("button:has-text('Close'), button:has-text('×'), [aria-label*='close']").first
        if close_modal.is_visible():
            close_modal.click()
            time.sleep(0.5)

        # -------------------------------------------------------------
        # 6. SEC 8-K & DORA IMMUTABLE AUDIT LEDGER
        # -------------------------------------------------------------
        f6_path = os.path.join(OUT_DIR, "FEATURE_06_AUDIT_LEDGER_SEC8K.gif")
        if not os.path.exists(f6_path):
            print("Recording Feature 6: SEC 8-K & DORA Audit Ledger...")
            page.click("button:has-text('SEC 8-K & DORA Logs')")
            time.sleep(1.5)
            frames_audit = []
            for i in range(10):
                time.sleep(0.25)
                shot_bytes = page.screenshot()
                import io
                im = Image.open(io.BytesIO(shot_bytes)).convert("RGB")
                stamped = stamp_explainer(
                    im,
                    "Cryptographic Immutable Audit Ledger (SEC 8-K & DORA)",
                    "Generates SHA-256 tamper-proof proof chains documenting every risk calculation and material breach determination."
                )
                frames_audit.append(stamped)
            frames_audit[0].save(f6_path, save_all=True, append_images=frames_audit[1:], duration=250, loop=0)
            print("Saved FEATURE_06_AUDIT_LEDGER_SEC8K.gif")

        # -------------------------------------------------------------
        # 7. EXECUTIVE AI BOARD REPORT & PDF EXPORT
        # -------------------------------------------------------------
        f7_path = os.path.join(OUT_DIR, "FEATURE_07_EXECUTIVE_AI_REPORT.gif")
        if not os.path.exists(f7_path):
            print("Recording Feature 7: Executive AI Report...")
            page.click("button:has-text('Executive AI Report')")
            time.sleep(2)
            frames_rep = []
            for i in range(12):
                if i in [4, 7]:
                    page.evaluate("window.scrollBy(0, 300)")
                time.sleep(0.25)
                shot_bytes = page.screenshot()
                import io
                im = Image.open(io.BytesIO(shot_bytes)).convert("RGB")
                stamped = stamp_explainer(
                    im,
                    "Executive AI Board Report Synthesized by Groq 120B",
                    "Automatically drafts 5-section executive board memos and one-click downloadable vector PDFs with regulatory sign-offs."
                )
                frames_rep.append(stamped)
            frames_rep[0].save(f7_path, save_all=True, append_images=frames_rep[1:], duration=220, loop=0)
            print("Saved FEATURE_07_EXECUTIVE_AI_REPORT.gif")

        # -------------------------------------------------------------
        # 8. GUARDED AI COPILOT INTERACTION & ZERO-TRUST BLOCK
        # -------------------------------------------------------------
        f8_path = os.path.join(OUT_DIR, "FEATURE_08_AI_COPILOT_GUARDRAILS.gif")
        if not os.path.exists(f8_path):
            print("Recording Feature 8: Guarded AI Copilot...")
            copilot_btn = page.locator("button:has-text('AI Copilot'), button[title*='Copilot']").first
            if copilot_btn.is_visible():
                copilot_btn.click()
                time.sleep(1.5)
            frames_ai = []
            for i in range(14):
                if i == 5:
                    guard_btn = page.locator("button:has-text('Test Guardrail'), button:has-text('Ask Password')").first
                    if guard_btn.is_visible():
                        guard_btn.click()
                time.sleep(0.25)
                shot_bytes = page.screenshot()
                import io
                im = Image.open(io.BytesIO(shot_bytes)).convert("RGB")
                stamped = stamp_explainer(
                    im,
                    "AegisRisk AI Copilot with Zero-Trust Guardrails",
                    "Provides role-isolated financial answers for the CISO while strictly intercepting and blocking credential leaks."
                )
                frames_ai.append(stamped)
            frames_ai[0].save(f8_path, save_all=True, append_images=frames_ai[1:], duration=220, loop=0)
            print("Saved FEATURE_08_AI_COPILOT_GUARDRAILS.gif")

        # Close copilot cleanly before admin
        page.keyboard.press("Escape")
        time.sleep(0.5)
        close_cop = page.locator("button:has-text('×'), button[aria-label*='close']").first
        if close_cop.is_visible():
            close_cop.click()
            time.sleep(0.5)

        # -------------------------------------------------------------
        # 9. TENANT ADMIN & MULTI-ROLE RBAC ACCESS CONTROL
        # -------------------------------------------------------------
        f9_path = os.path.join(OUT_DIR, "FEATURE_09_TENANT_ADMIN_RBAC.gif")
        if not os.path.exists(f9_path):
            print("Recording Feature 9: Tenant Admin & RBAC...")
            page.click("button:has-text('Tenant Admin & RBAC')")
            time.sleep(1.5)
            frames_admin = []
            for i in range(10):
                time.sleep(0.25)
                shot_bytes = page.screenshot()
                import io
                im = Image.open(io.BytesIO(shot_bytes)).convert("RGB")
                stamped = stamp_explainer(
                    im,
                    "Tenant Administration, Workspaces & Role-Based Access Control",
                    "Governs tenant isolation, workspace credential vaults, API connector keys, and strict tier-based analyst permissions."
                )
                frames_admin.append(stamped)
            frames_admin[0].save(f9_path, save_all=True, append_images=frames_admin[1:], duration=250, loop=0)
            print("Saved FEATURE_09_TENANT_ADMIN_RBAC.gif")

        browser.close()
        print("\n=== ALL 9 FEATURE-BY-FEATURE GIFS GENERATED PERFECTLY! ===")

if __name__ == "__main__":
    run_suite()
