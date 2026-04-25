from playwright.sync_api import sync_playwright
import time

def verify_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the locally running app
        page.goto('http://localhost:5173')

        # Wait a bit for React to mount and initial errors to trigger
        page.wait_for_load_state('networkidle')
        time.sleep(2)

        # Extract console errors
        print("Page title:", page.title())

        browser.close()

if __name__ == '__main__':
    verify_dashboard()
