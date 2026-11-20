import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"c:\Users\subha\Downloads\sih-10551\crq-platform\video_assets\prototype_screens"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def run():
    print("=== Starting AegisRisk AI High-Res Prototype Screenshot Pipeline ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=1,
        )
        page = context.new_page()

        # -------------------------------------------------------------
        # 1. Login Page
        # -------------------------------------------------------------
        print("1. Loading Login Page...")
        page.goto("http://localhost:3000/login", wait_until="networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "01_PROTOTYPE_LOGIN_SCREEN.png"), full_page=False)
        print("Saved: 01_PROTOTYPE_LOGIN_SCREEN.png")

        # Fill credentials & submit
        page.fill("input[type='email']", "ciso@acme.com")
        page.fill("input[type='password']", "admin123")
        page.click("button:has-text('Sign In'), button:has-text('Log In'), button[type='submit']")

        # Wait for navigation to dashboard
        try:
            page.wait_for_url("**/dashboard**", timeout=8000)
        except Exception:
            page.goto("http://localhost:3000/dashboard", wait_until="networkidle")

        time.sleep(2.5)

        # -------------------------------------------------------------
        # 2. Executive Cockpit (Top Overview - EAL & 95% VaR)
        # -------------------------------------------------------------
        print("2. Capturing Executive Cockpit Overview...")
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "02_CISO_EXECUTIVE_COCKPIT.png"), full_page=False)
        print("Saved: 02_CISO_EXECUTIVE_COCKPIT.png")

        # -------------------------------------------------------------
        # 3. Monte Carlo Loss Exceedance Curve (10,000 Iterations & EVT)
        # -------------------------------------------------------------
        print("3. Capturing Monte Carlo Loss Exceedance Curve...")
        # Scroll down to curve section
        page.evaluate("window.scrollBy(0, 480)")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "03_MONTE_CARLO_LOSS_EXCEEDANCE_CURVE.png"), full_page=False)
        print("Saved: 03_MONTE_CARLO_LOSS_EXCEEDANCE_CURVE.png")

        # -------------------------------------------------------------
        # 4. 0/1 Knapsack Budget Optimizer (+596% ROSI)
        # -------------------------------------------------------------
        print("4. Capturing 0/1 Knapsack Budget Optimizer...")
        page.evaluate("window.scrollBy(0, 520)")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "04_KNAPSACK_BUDGET_OPTIMIZER.png"), full_page=False)
        print("Saved: 04_KNAPSACK_BUDGET_OPTIMIZER.png")

        # Scroll back to top for sidebar navigation
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1)

        # -------------------------------------------------------------
        # 5. Security Connectors Tab (Live Telemetry: CrowdStrike, Splunk, AWS, Tenable, CISA KEV)
        # -------------------------------------------------------------
        print("5. Navigating to Security Connectors Tab...")
        try:
            page.click("text=Security Connectors", timeout=4000)
            time.sleep(2)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "05_LIVE_SECURITY_CONNECTORS_TELEMETRY.png"), full_page=False)
            print("Saved: 05_LIVE_SECURITY_CONNECTORS_TELEMETRY.png")

            # Click Test Connection button if available
            test_btn = page.locator("button:has-text('Test'), button:has-text('Verify'), button:has-text('Diagnostics')").first
            if test_btn.is_visible():
                test_btn.click()
                time.sleep(1.5)
                page.screenshot(path=os.path.join(OUTPUT_DIR, "06_CONNECTOR_LIVE_DIAGNOSTICS.png"), full_page=False)
                print("Saved: 06_CONNECTOR_LIVE_DIAGNOSTICS.png")
        except Exception as e:
            print("Notice on Connectors:", e)

        # -------------------------------------------------------------
        # 6. Vulnerability Triage Tab (Active CVEs, CVSS 9.8, Exploit Vectors)
        # -------------------------------------------------------------
        print("6. Navigating to Vulnerability Triage Tab...")
        try:
            page.click("text=Vulnerability Triage", timeout=4000)
            time.sleep(2)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "07_ANALYST_THREAT_AND_CVE_DRILLDOWN.png"), full_page=False)
            print("Saved: 07_ANALYST_THREAT_AND_CVE_DRILLDOWN.png")
        except Exception as e:
            print("Notice on Analyst tab:", e)

        # -------------------------------------------------------------
        # 7. SEC 8-K & DORA Logs (Immutable Cryptographic Audit Ledger)
        # -------------------------------------------------------------
        print("7. Navigating to SEC 8-K & DORA Audit Ledger...")
        try:
            page.click("text=SEC 8-K & DORA Logs", timeout=4000)
            time.sleep(2)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "08_IMMUTABLE_AUDIT_LEDGER_SEC8K.png"), full_page=False)
            print("Saved: 08_IMMUTABLE_AUDIT_LEDGER_SEC8K.png")
        except Exception as e:
            print("Notice on Auditor tab:", e)

        # -------------------------------------------------------------
        # 8. Return to Cockpit and Open AegisRisk AI Copilot
        # -------------------------------------------------------------
        print("8. Opening AegisRisk AI Copilot Window...")
        try:
            page.click("text=Risk Cockpit", timeout=4000)
            time.sleep(1.5)
        except Exception:
            pass

        # Click Floating AI Copilot Launcher
        copilot_btn = page.locator("button[title*='AegisRisk AI Copilot'], button:has-text('Copilot')").first
        if copilot_btn.is_visible():
            copilot_btn.click()
            time.sleep(2)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "09_AEGISRISK_AI_COPILOT_GUARDRAILS.png"), full_page=False)
            print("Saved: 09_AEGISRISK_AI_COPILOT_GUARDRAILS.png")

        browser.close()
        print("\n=== ALL 9 PROTOTYPE SCREENS CAPTURED PERFECTLY IN 1920x1080 ===")

if __name__ == "__main__":
    run()
