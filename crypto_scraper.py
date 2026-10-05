import argparse
import csv
from datetime import datetime

from selenium import webdriver
from selenium.common.exceptions import StaleElementReferenceException, TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager


DEFAULT_URL = "https://coinmarketcap.com/"
DEFAULT_LIMIT = 10


def setup_driver():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1400,1200")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)


def normalize_text(value):
    if value is None:
        return ""
    return " ".join(str(value).replace("\n", " ").split()).strip()


def parse_market_cap(value):
    if not value:
        return ""
    cleaned = value.replace("$", "").replace(",", "").replace("%", "").strip()
    if not cleaned:
        return ""
    return cleaned


def scrape_rows(driver, limit, url):
    driver.get(url)
    wait = WebDriverWait(driver, 20)

    try:
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))
    except TimeoutException:
        raise RuntimeError("Unable to find the market table on the requested page.")

    rows = []
    seen_names = set()

    for _ in range(12):
        try:
            table_rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
            if not table_rows:
                break

            for row in table_rows:
                if len(rows) >= limit:
                    return rows

                try:
                    cells = row.find_elements(By.TAG_NAME, "td")
                except StaleElementReferenceException:
                    continue

                if len(cells) < 8:
                    continue

                name = normalize_text(cells[2].text)
                if not name or "CoinMarketCap" in name:
                    continue

                price = normalize_text(cells[3].text)
                change_24h = normalize_text(cells[4].text)
                market_cap = normalize_text(cells[7].text)

                if not price or not market_cap:
                    continue

                clean_name = name.split("\n")[0].strip()
                if not clean_name or clean_name in seen_names:
                    continue

                seen_names.add(clean_name)
                rows.append({
                    "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "Coin Name": clean_name,
                    "Price": price,
                    "24h Change": change_24h,
                    "Market Cap": parse_market_cap(market_cap)
                })

                if len(rows) >= limit:
                    return rows

            break
        except Exception:
            break

    return rows


def save_csv(rows, output_path):
    fieldnames = ["Timestamp", "Coin Name", "Price", "24h Change", "Market Cap"]

    with open(output_path, "w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser(description="Scrape top crypto market rows from CoinMarketCap into a CSV snapshot.")
    parser.add_argument("--limit", type=int, default=DEFAULT_LIMIT, help="Number of rows to save to the CSV file.")
    parser.add_argument("--url", default=DEFAULT_URL, help="Market page to scrape.")
    parser.add_argument("--output", default="crypto_data.csv", help="Path to the output CSV file.")
    args = parser.parse_args()

    driver = None
    try:
        driver = setup_driver()
        rows = scrape_rows(driver, max(1, args.limit), args.url)
        save_csv(rows, args.output)
        print(f"Saved {len(rows)} valid rows to {args.output}")
    except Exception as exc:
        print(f"Scraping failed: {exc}")
        raise
    finally:
        if driver is not None:
            driver.quit()


if __name__ == "__main__":
    main()
