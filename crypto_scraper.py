from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
from datetime import datetime
import time

# Setup Chrome Driver
driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install())
)

# Open CoinMarketCap
driver.get("https://coinmarketcap.com/")

# Wait for page load
time.sleep(5)

# Get all table rows
rows = driver.find_elements("xpath", "//tbody/tr")

crypto_data = []
current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

for row in rows:
    try:
        columns = row.find_elements("tag name", "td")

        # Skip invalid rows
        if len(columns) < 8:
            continue

        # Clean coin name
        coin_name = columns[2].text.split("\n")[0]

        # Skip promotional row
        if "CoinMarketCap" in coin_name:
            continue

        price = columns[3].text
        change_24h = columns[4].text
        market_cap = columns[7].text

        crypto_data.append({
    "Timestamp": current_time,
    "Coin Name": coin_name,
    "Price": price,
    "24h Change": change_24h,
    "Market Cap": market_cap
})

        # Top 10 coins only
        if len(crypto_data) == 10:
            break

    except Exception as e:
        print("Error:", e)

# Create DataFrame
df = pd.DataFrame(crypto_data)

# Save CSV
df.to_csv("crypto_data.csv", index=False)

# Display result
print("\nTop 10 Cryptocurrencies\n")
print(df)

driver.quit()