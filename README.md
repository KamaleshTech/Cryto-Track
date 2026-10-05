# CryptoTrack

CryptoTrack is a polished cryptocurrency market dashboard built with HTML, CSS, JavaScript, and Python. The dashboard loads a curated CSV snapshot of market data and presents it in a clean, professional single-page interface.

## Features

- Responsive market dashboard with top nav, hero section, stats cards, filters, and table
- Client-side search, filtering, sorting, and reset controls
- Dynamic calculations for market cap, gainers/losers, and market insights
- Chart.js visualization for price, market cap, and 24h change
- Coin detail modal with snapshot summary metadata
- Theme toggle with localStorage persistence
- Loading, empty, and failure states for CSV handling
- Selenium-based scraper for saving market data to `crypto_data.csv`

## Project structure

```text
/
├── Templates/
│   └── index.html
├── static/
│   ├── script.js
│   └── style.css
├── crypto_data.csv
├── crypto_scraper.py
├── requirements.txt
├── README.md
```

## Tech stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- Chart.js
- Papa Parse
- Python 3
- Selenium
- WebDriver Manager

## Data source

The dashboard is designed around a local CSV snapshot stored as `crypto_data.csv`. This is not a live API feed. The scraper can refresh the dataset from CoinMarketCap, but the frontend itself does not contain scraper logic and should be treated as a presentation layer over the CSV data.

## How to run locally

1. Open a terminal in the project directory.
2. Create and activate a virtual environment if desired.
3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Start a local web server:

```bash
python -m http.server 8000
```

5. Open the dashboard in a browser:

```text
http://localhost:8000/Templates/index.html
```

## Scraper instructions

To refresh the CSV snapshot from CoinMarketCap:

```bash
python crypto_scraper.py --limit 10
```

Optional arguments:

- `--limit`: maximum number of rows to save
- `--url`: alternate source URL
- `--output`: alternate CSV output path

## Limitations

- The scraper depends on the structure of the source page and can fail if the site changes its DOM layout.
- The data is limited to the local CSV snapshot; it is not true real-time market data.
- Historical price data is intentionally not fabricated.

## Future improvements

- Replace the scraper with a stable API-backed data pipeline
- Add per-coin historical charting with a proper time-series dataset
- Add advanced filtering by rank, volume, and sector
- Add persistent favorites/watchlist features
- Add deployment support for a static hosting or Flask app

## Screenshots

Add screenshots of the dashboard here once you have local renders or project export images.
