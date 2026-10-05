<div align="center">

# ₿ CryptoTrack

### Cryptocurrency Market Analytics Dashboard

A modern, responsive cryptocurrency market dashboard built with Flask, JavaScript, Chart.js, and Selenium to visualize and analyze cryptocurrency market data through a clean and interactive interface.

<br>

<a href="https://cryptotrack-kamalesh.vercel.app">
  <img src="https://img.shields.io/badge/Live%20Demo-CryptoTrack-00C853?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo">
</a>
<a href="https://github.com/KamaleshTech/Cryto-Track">
  <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub">
</a>

<br><br>

<img src="https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python">
<img src="https://img.shields.io/badge/Flask-3.x-000000?style=flat-square&logo=flask&logoColor=white" alt="Flask">
<img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/Chart.js-Visualization-FF6384?style=flat-square&logo=chartdotjs&logoColor=white" alt="Chart.js">
<img src="https://img.shields.io/badge/Selenium-Web%20Scraping-43B02A?style=flat-square&logo=selenium&logoColor=white" alt="Selenium">
<img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel">

</div>

---

## 📌 About

**CryptoTrack** is a cryptocurrency market analytics dashboard designed to make cryptocurrency data easier to explore and understand.

The application combines a Flask backend with a responsive HTML, CSS, and JavaScript frontend. Market data is stored as a CSV snapshot and processed dynamically in the browser to generate statistics, market tables, charts, top movers, and analytical insights.

The project also includes a Selenium-based scraper that can collect cryptocurrency market information and update the local dataset.

> **Current version:** CryptoTrack uses a local CSV market snapshot. It is not a real-time trading platform or financial-advisory system.

---

## ✨ Features

- 📊 Cryptocurrency market overview
- 💰 Cryptocurrency price tracking
- 📈 24-hour percentage change
- 💹 Market capitalization analysis
- 🔎 Search by cryptocurrency name or symbol
- 🎯 Filter all assets, gainers, or losers
- ↕️ Sort by:
  - Market Cap
  - Price
  - 24h Change
  - Name
- 📉 Interactive market charts
- 🏆 Top gainers
- 📉 Top losers
- 💡 Automatic market insights
- 🔍 Individual cryptocurrency detail modal
- 🌙 Dark and light themes
- 💾 Theme persistence using Local Storage
- 🔄 Market snapshot refresh
- 📱 Fully responsive interface
- ⚡ Loading states
- ❌ Error and empty states
- 🩺 Health-check endpoint
- ☁️ Vercel deployment support

---

## 🖥️ Dashboard

CryptoTrack provides a complete market dashboard containing:

### Market Statistics

The application calculates:

- Total tracked assets
- Highest market-cap asset
- Top gainer
- Top loser
- Most expensive asset

### Market Overview Table

Each asset can display:

- Rank
- Cryptocurrency name
- Symbol
- Current price
- 24-hour change
- Market capitalization
- Trend
- View details action

### Market Analytics

Interactive Chart.js visualizations are available for:

- Price
- Market Capitalization
- 24h Change

### Top Movers

The dashboard automatically identifies:

- Highest gaining assets
- Biggest losing assets

### Market Insights

The application generates data-driven observations from the loaded market snapshot.

---

## 🧠 How It Works

<pre>
                 ┌──────────────────────┐
                 │   Market Data Source │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │  Selenium Scraper    │
                 │  crypto_scraper.py   │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │   crypto_data.csv    │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │    Flask Backend     │
                 │       app.py         │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ HTML + CSS + JS      │
                 │      Dashboard       │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │   CryptoTrack UI     │
                 └──────────────────────┘
</pre>

---

## 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js
- Papa Parse

### Backend

- Python
- Flask

### Data Collection

- Selenium
- WebDriver Manager

### Data Storage

- CSV

### Deployment

- Vercel

---

## 📂 Project Structure

<pre>
Cryto-Track/
│
├── app.py
├── crypto_scraper.py
├── crypto_data.csv
├── requirements.txt
├── vercel.json
├── README.md
│
├── Templates/
│   └── index.html
│
└── static/
    ├── script.js
    └── style.css
</pre>

---

## ⚙️ Installation

### 1. Clone the Repository

<pre>
git clone https://github.com/KamaleshTech/Cryto-Track.git
cd Cryto-Track
</pre>

### 2. Create a Virtual Environment

<pre>
python -m venv .venv
</pre>

### 3. Activate the Virtual Environment

<strong>Windows:</strong>

<pre>
.venv\Scripts\activate
</pre>

<strong>Linux / macOS:</strong>

<pre>
source .venv/bin/activate
</pre>

### 4. Install Dependencies

<pre>
pip install -r requirements.txt
</pre>

### 5. Run the Flask Application

<pre>
python app.py
</pre>

### 6. Open the Application

<pre>
http://127.0.0.1:5000
</pre>

---

## 📊 Updating Market Data

CryptoTrack includes a Selenium-based scraper for collecting cryptocurrency market information.

Run:

<pre>
python crypto_scraper.py --limit 10
</pre>

To collect more assets:

<pre>
python crypto_scraper.py --limit 20
</pre>

### Available Arguments

<pre>
--limit
--url
--output
</pre>

Example:

<pre>
python crypto_scraper.py --limit 20 --output crypto_data.csv
</pre>

The generated market snapshot is stored in:

<pre>
crypto_data.csv
</pre>

---

## 🔌 Application Routes

| Route | Description |
|---|---|
| `/` | Main CryptoTrack dashboard |
| `/crypto_data.csv` | Cryptocurrency market data |
| `/health` | Application health check |

### Health Check

The `/health` route returns:

<pre>
{
  "status": "ok",
  "service": "CryptoTrack"
}
</pre>

---

## 📈 Data Processing

CryptoTrack performs several data-processing operations on the client side.

### Price Processing

Cryptocurrency prices are normalized and converted into numeric values for sorting and analysis.

### Percentage Processing

24-hour percentage changes are converted into numeric values for:

- Gainer detection
- Loser detection
- Sorting
- Market insights
- Chart visualization

### Market Capitalization

Market-cap values support:

- K → Thousand
- M → Million
- B → Billion
- T → Trillion

### Dynamic Analysis

The dashboard automatically calculates:

- Highest market cap
- Top gainer
- Top loser
- Highest price
- Market trends

---

## 🎨 UI / UX

CryptoTrack follows a modern analytics dashboard design focused on clarity and usability.

### Design Principles

- Clean visual hierarchy
- Minimal interface
- Responsive layout
- Dark-first experience
- Light theme support
- Consistent card system
- Clear market indicators
- Interactive controls
- Mobile-friendly layout
- Accessible states and controls

The theme preference is stored locally so the selected theme remains after refreshing the page.

---

## 📱 Responsive Design

The interface adapts to:

- Desktop
- Laptop
- Tablet
- Mobile

The dashboard reorganizes navigation, statistics, controls, charts, and tables based on screen size.

---

## 🔐 Backend Architecture

The Flask backend is intentionally lightweight.

### Main Backend Responsibilities

- Serve the main dashboard
- Serve static assets
- Serve cryptocurrency CSV data
- Provide application health status

### Main Backend File

<pre>
app.py
</pre>

The application is configured with:

- Flask
- Templates directory
- Static directory
- CSV data route
- Health-check route

---

## ☁️ Deployment

CryptoTrack is configured for deployment on **Vercel**.

The deployment configuration includes:

<pre>
app.py
vercel.json
requirements.txt
</pre>

The Flask application is exposed through the Python entrypoint:

<pre>
app.py
</pre>

---

## ⚠️ Current Limitations

The current version intentionally has some limitations:

- Market data is stored as a CSV snapshot.
- The frontend does not directly consume a real-time cryptocurrency API.
- Historical market data is not currently stored.
- Continuous live price updates are not available.
- Selenium scraping depends on the source website structure.
- The scraper may require maintenance when the source website changes its DOM.

These limitations are documented because the application should not be presented as a real-time financial trading system.

---

## 🔮 Future Improvements

- [ ] Real-time cryptocurrency API integration
- [ ] Historical price tracking
- [ ] Individual coin analytics pages
- [ ] Live market updates
- [ ] Cryptocurrency watchlist
- [ ] Favorite assets
- [ ] Portfolio tracking
- [ ] Trading volume analytics
- [ ] Market dominance tracking
- [ ] Fear & Greed Index
- [ ] Advanced market filters
- [ ] Price alerts
- [ ] Database integration
- [ ] Scheduled data collection
- [ ] User authentication
- [ ] Personalized dashboards
- [ ] REST API for market data

---

## 🎯 Project Objectives

The main objectives of CryptoTrack are:

- Build a practical cryptocurrency analytics dashboard
- Learn Flask-based web application development
- Practice web scraping using Selenium
- Process and visualize structured data
- Build responsive frontend interfaces
- Implement interactive charts
- Understand client-side data analysis
- Deploy a Python application to the cloud
- Follow a clean project structure

---

## 📚 Learning Outcomes

This project provided practical experience with:

- Python programming
- Flask
- HTML5
- CSS3
- JavaScript
- Chart.js
- Papa Parse
- Selenium
- Web scraping
- CSV data processing
- Data visualization
- Responsive UI/UX
- Git and GitHub
- Cloud deployment
- Vercel
- REST-style application routes

---

## 🌐 Links

<div align="center">

### 🚀 Live Application

<a href="https://cryptotrack-kamalesh.vercel.app">
https://cryptotrack-kamalesh.vercel.app
</a>

### 💻 GitHub Repository

<a href="https://github.com/KamaleshTech/Cryto-Track">
https://github.com/KamaleshTech/Cryto-Track
</a>

### 👨‍💻 Developer Portfolio

<a href="https://kamaleshtech.github.io/My-Portfolio/">
https://kamaleshtech.github.io/My-Portfolio/
</a>

</div>

---

## 👨‍💻 Author

<div align="center">

### Kamalesh

B.E. Computer Science and Engineering

<a href="https://github.com/KamaleshTech">
GitHub
</a>

&nbsp; • &nbsp;

<a href="https://kamaleshtech.github.io/My-Portfolio/">
Portfolio
</a>

</div>

---

## ⭐ Support

If you found CryptoTrack useful or interesting, consider giving the repository a ⭐ on GitHub.

---

## 📄 License

This project is created for educational, demonstration, and portfolio purposes.

---

<div align="center">

### ₿ CryptoTrack

<strong>Track the market. Understand the data.</strong>

Built with Python, Flask, JavaScript, Chart.js & Selenium.

</div>
