from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto('http://localhost:3000/login', wait_until='networkidle')
    page.fill("input[type='email']", 'ciso@acme.com')
    page.fill("input[type='password']", 'admin123')
    page.click("button:has-text('Sign In'), button:has-text('Log In'), button[type='submit']")
    page.wait_for_url('**/dashboard**', timeout=8000)
    print('Logged in successfully to dashboard!')
    
    buttons = page.locator('button').all_inner_texts()
    visible_btns = [b.strip().replace('\n', ' | ') for b in buttons if b.strip()]
    print('Total buttons:', len(visible_btns))
    for b in visible_btns[:25]:
        print('  -', b[:80])
    browser.close()
