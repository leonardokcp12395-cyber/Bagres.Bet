from playwright.sync_api import sync_playwright
import time

def check_errors():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Monitor console errors
        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        # Navigate to the ranking page
        page.goto('http://localhost:5173/ranking')

        # Wait a bit for React to mount and initial errors to trigger
        page.wait_for_load_state('networkidle')
        time.sleep(2)

        browser.close()

if __name__ == '__main__':
    check_errors()
