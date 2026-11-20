import os
import time
import io
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
    draw.rectangle([60, 20, 980, 75], fill=(4, 47, 46), outline=(113, 201, 206), width=2)
    draw.text((80, 28), f"FEATURE: {feature_title.upper()}", fill=(113, 201, 206), font=font_title)
    draw.text((80, 52), "AEGISRISK AI PROTOTYPE — SOC 2 TYPE II • LIVE PIPELINE", fill=(200, 220, 230), font=font_sub)

    # Bottom "What It Does" Explainer Ribbon
    draw.rectangle([60, 990, 1860, 1055], fill=(12, 28, 36), outline=(16, 185, 129), width=2)
    draw.rectangle([60, 990, 240, 1055], fill=(16, 185, 129))
    draw.text((75, 1010), "WHAT IT DOES", fill=(255, 255, 255), font=font_title)
    draw.text((260, 1012), what_it_does, fill=(240, 250, 255), font=font_desc)
    return img

def main():
    print("Capturing Landing Page & Login GIFs...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        # -------------------------------------------------------------
        # 0. LANDING PAGE & PRODUCT OVERVIEW
        # -------------------------------------------------------------
        f0_path = os.path.join(OUT_DIR, "FEATURE_00_LANDING_PORTAL.gif")
        if not os.path.exists(f0_path):
            print("Recording Feature 0: Landing Portal...")
            page.goto("http://localhost:3000/", wait_until="networkidle")
            time.sleep(1)
            frames_landing = []
            scroll_positions = [0, 250, 500, 800, 1200, 1600, 1200, 600, 0]
            for y in scroll_positions:
                page.evaluate(f"window.scrollTo({{ top: {y}, behavior: 'smooth' }})")
                time.sleep(0.3)
                shot = page.screenshot()
                im = Image.open(io.BytesIO(shot)).convert("RGB")
                stamped = stamp_explainer(
                    im,
                    "Enterprise Landing & Architecture Portal",
                    "Presents high-level C-suite risk quantification overview, live architecture telemetry, and value metrics."
                )
                frames_landing.append(stamped.quantize(colors=128, method=Image.Quantize.MEDIANCUT))
            frames_landing[0].save(f0_path, save_all=True, append_images=frames_landing[1:], duration=350, loop=0, optimize=True)
            print("Saved FEATURE_00_LANDING_PORTAL.gif")

        # -------------------------------------------------------------
        # 10. MULTI-TENANT AUTHENTICATION & LOGIN
        # -------------------------------------------------------------
        f10_path = os.path.join(OUT_DIR, "FEATURE_10_LOGIN_AUTHENTICATION.gif")
        if not os.path.exists(f10_path):
            print("Recording Feature 10: Multi-Tenant Login...")
            page.goto("http://localhost:3000/login", wait_until="networkidle")
            time.sleep(1)
            frames_login = []
            for i in range(8):
                if i == 2:
                    page.fill("input[type='email']", "ciso@acme.com")
                elif i == 4:
                    page.fill("input[type='password']", "admin123")
                time.sleep(0.25)
                shot = page.screenshot()
                im = Image.open(io.BytesIO(shot)).convert("RGB")
                stamped = stamp_explainer(
                    im,
                    "Multi-Tenant Zero-Trust Authentication",
                    "Provides role-based login (CISO, SecOps, Auditor) with cryptographically signed session tokens and tenant isolation."
                )
                frames_login.append(stamped.quantize(colors=128, method=Image.Quantize.MEDIANCUT))
            frames_login[0].save(f10_path, save_all=True, append_images=frames_login[1:], duration=350, loop=0, optimize=True)
            print("Saved FEATURE_10_LOGIN_AUTHENTICATION.gif")

        browser.close()
        print("Done capturing additional GIFs.")

if __name__ == "__main__":
    main()
