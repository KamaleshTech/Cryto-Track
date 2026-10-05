const state = {
  allData: [],
  filteredData: [],
  lastUpdated: null,
  chartMetric: 'price',
  isLoading: false,
  refreshInFlight: false,
  chart: null,
  activeCoin: null,
  filter: 'all',
  sortField: 'marketCap',
  sortOrder: 'desc',
  searchTerm: ''
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
});

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2
});

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  initializeTheme();
  renderStatsSkeleton();
  renderTableSkeleton();
  loadData();
});

function bindEvents() {
  const searchInput = document.getElementById('searchInput');
  const filterSelect = document.getElementById('filterSelect');
  const sortField = document.getElementById('sortField');
  const sortOrder = document.getElementById('sortOrder');
  const resetButton = document.getElementById('resetFilters');
  const refreshButton = document.getElementById('refreshButton');
  const heroRefreshButton = document.getElementById('heroRefreshButton');
  const themeToggle = document.getElementById('themeToggle');
  const retryButton = document.getElementById('retryButton');
  const searchButton = document.getElementById('searchButton');
  const closeModalButton = document.getElementById('closeModalButton');
  const modalOverlay = document.querySelector('[data-close-modal="true"]');
  const segments = document.querySelectorAll('[data-metric]');

  searchInput.addEventListener('input', handleControlsChange);
  filterSelect.addEventListener('change', handleControlsChange);
  sortField.addEventListener('change', handleControlsChange);
  sortOrder.addEventListener('change', handleControlsChange);
  resetButton.addEventListener('click', resetFilters);
  refreshButton.addEventListener('click', triggerRefresh);
  heroRefreshButton.addEventListener('click', triggerRefresh);
  retryButton.addEventListener('click', () => loadData(true));
  searchButton.addEventListener('click', () => searchInput.focus());
  themeToggle.addEventListener('click', toggleTheme);
  closeModalButton.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);
  segments.forEach((segment) => {
    segment.addEventListener('click', () => {
      state.chartMetric = segment.dataset.metric;
      document.querySelectorAll('.segment').forEach((button) => {
        button.classList.toggle('active', button === segment);
      });
      renderChart();
    });
  });

  document.getElementById('cryptoTableBody').addEventListener('click', handleTableClick);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}

async function loadData(forceRefresh = false) {
  if (state.isLoading && !forceRefresh) {
    return;
  }

  state.isLoading = true;
  setDataState('Loading market data…', false);
  updateRefreshState(true);

  try {
    const response = await fetch('../crypto_data.csv', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Unable to load market data.');
    }

    const csvText = await response.text();
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });

    const rows = parsed.data
      .map((row, index) => normalizeCoinRow(row, index))
      .filter(Boolean);

    if (!rows.length) {
      throw new Error('No valid rows were found in the CSV snapshot.');
    }

    state.allData = rows;
    state.lastUpdated = rows[0]?.timestamp || new Date();
    hideDataState();
    renderDashboard();
  } catch (error) {
    const message = error?.message || 'Unable to load market data.';
    setDataState(message, true);
    renderEmptyStates();
    state.allData = [];
    state.filteredData = [];
    document.getElementById('statsGrid').innerHTML = '';
    document.getElementById('topGainers').innerHTML = '';
    document.getElementById('topLosers').innerHTML = '';
    document.getElementById('insightsContent').innerHTML = '';
    clearChart();
  } finally {
    state.isLoading = false;
    updateRefreshState(false);
  }
}

function normalizeCoinRow(row, index) {
  const rawName = row['Coin Name'] || row['coin name'] || row['Name'] || '';
  const name = String(rawName).trim();

  if (!name) {
    return null;
  }

  const priceValue = parsePrice(row['Price'] || row['price'] || row['Price USD'] || '');
  const changeValue = parsePercentage(row['24h Change'] || row['24h %'] || row['24h change'] || '');
  const marketCapValue = parseMarketCap(row['Market Cap'] || row['market cap'] || row['Market Cap ($)'] || '');

  if (!Number.isFinite(priceValue) || Number.isNaN(priceValue)) {
    return null;
  }

  const symbolValue = (row['Symbol'] || row['symbol'] || '').trim();
  const symbol = symbolValue || deriveSymbol(name);
  const timestampText = row['Timestamp'] || row['timestamp'] || row['Date'] || row['time'] || new Date().toISOString();
  const timestamp = parseTimestamp(timestampText);

  return {
    id: `${slugify(name)}-${index}`,
    name,
    symbol,
    price: priceValue,
    changePercent: Number.isFinite(changeValue) ? changeValue : 0,
    marketCap: Number.isFinite(marketCapValue) ? marketCapValue : 0,
    timestamp,
    rawPrice: row['Price'] || row['price'] || 'N/A',
    rawChange: row['24h Change'] || row['24h %'] || 'N/A',
    rawMarketCap: row['Market Cap'] || row['market cap'] || 'N/A'
  };
}

function parsePrice(value) {
  if (value === null || value === undefined || value === '') {
    return Number.NaN;
  }

  const cleaned = String(value).trim().replace(/[$,\s]/g, '');
  const number = Number.parseFloat(cleaned);

  return Number.isFinite(number) ? number : Number.NaN;
}

function parsePercentage(value) {
  if (value === null || value === undefined || value === '') {
    return Number.NaN;
  }

  const cleaned = String(value).trim().replace('%', '');
  const hasSign = cleaned.includes('+') || cleaned.includes('-');
  const normalized = cleaned.replace(/[^0-9.\-]/g, '');
  const parsed = Number.parseFloat(normalized);

  if (!Number.isFinite(parsed)) {
    return Number.NaN;
  }

  return hasSign ? parsed : parsed;
}

function parseMarketCap(value) {
  if (value === null || value === undefined || value === '') {
    return Number.NaN;
  }

  const cleaned = String(value).trim().toUpperCase().replace(/[$,\s]/g, '');

  if (!cleaned) {
    return Number.NaN;
  }

  const match = cleaned.match(/^(-?\d*\.?\d+)([KMBT]?)$/);

  if (!match) {
    return Number.NaN;
  }

  const amount = Number.parseFloat(match[1]);
  const suffix = match[2] || '';
  const scaleMap = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 };

  return amount * (scaleMap[suffix] || 1);
}

function formatPrice(value) {
  if (!Number.isFinite(Number(value)) || Number(value) === 0) {
    return '$0';
  }

  return currencyFormatter.format(Number(value));
}

function formatMarketCap(value) {
  if (!Number.isFinite(Number(value))) {
    return 'N/A';
  }

  const numeric = Number(value);

  if (numeric >= 1e12) {
    return `$${(numeric / 1e12).toFixed(2)}T`;
  }

  if (numeric >= 1e9) {
    return `$${(numeric / 1e9).toFixed(2)}B`;
  }

  if (numeric >= 1e6) {
    return `$${(numeric / 1e6).toFixed(2)}M`;
  }

  if (numeric >= 1e3) {
    return `$${(numeric / 1e3).toFixed(2)}K`;
  }

  return `$${numeric.toFixed(2)}`;
}

function formatSignedPercent(value) {
  if (!Number.isFinite(Number(value))) {
    return 'N/A';
  }

  const sign = Number(value) > 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(2)}%`;
}

function parseTimestamp(value) {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function formatTimestamp(date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'asset';
}

function deriveSymbol(name) {
  const parts = name.split(/[\s\-]+/).filter(Boolean);
  const token = parts[0] || name.slice(0, 3);
  return token.slice(0, 4).toUpperCase();
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterSelect').value = 'all';
  document.getElementById('sortField').value = 'marketCap';
  document.getElementById('sortOrder').value = 'desc';
  state.searchTerm = '';
  state.filter = 'all';
  state.sortField = 'marketCap';
  state.sortOrder = 'desc';
  renderDashboard();
}

function handleControlsChange() {
  state.searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
  state.filter = document.getElementById('filterSelect').value;
  state.sortField = document.getElementById('sortField').value;
  state.sortOrder = document.getElementById('sortOrder').value;
  renderDashboard();
}

function getFilteredData() {
  const baseData = [...state.allData];

  const filtered = baseData.filter((coin) => {
    const matchesSearch = !state.searchTerm ||
      coin.name.toLowerCase().includes(state.searchTerm) ||
      coin.symbol.toLowerCase().includes(state.searchTerm);

    const matchesFilter =
      state.filter === 'all' ||
      (state.filter === 'gainers' && coin.changePercent > 0) ||
      (state.filter === 'losers' && coin.changePercent < 0);

    return matchesSearch && matchesFilter;
  });

  filtered.sort((a, b) => {
    let comparison = 0;

    if (state.sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (state.sortField === 'price') {
      comparison = a.price - b.price;
    } else if (state.sortField === 'changePercent') {
      comparison = a.changePercent - b.changePercent;
    } else {
      comparison = a.marketCap - b.marketCap;
    }

    return state.sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
}

function renderDashboard() {
  state.filteredData = getFilteredData();
  renderStats();
  renderTable();
  renderTopMovers();
  renderInsights();
  renderChart();
}

function renderStats() {
  const statsGrid = document.getElementById('statsGrid');

  if (!state.allData.length) {
    statsGrid.innerHTML = '';
    return;
  }

  const totalAssets = state.allData.length;
  const highestCapCoin = [...state.allData].sort((a, b) => b.marketCap - a.marketCap)[0];
  const topGainer = [...state.allData].sort((a, b) => b.changePercent - a.changePercent)[0];
  const topLoser = [...state.allData].sort((a, b) => a.changePercent - b.changePercent)[0];
  const mostExpensive = [...state.allData].sort((a, b) => b.price - a.price)[0];

  const stats = [
    {
      label: 'Total Assets',
      value: totalAssets,
      meta: 'Loaded dataset'
    },
    {
      label: 'Highest Market Cap',
      value: highestCapCoin ? `${highestCapCoin.name}` : '—',
      meta: highestCapCoin ? formatMarketCap(highestCapCoin.marketCap) : 'No data'
    },
    {
      label: 'Top Gainer',
      value: topGainer ? `${topGainer.name}` : '—',
      meta: topGainer ? formatSignedPercent(topGainer.changePercent) : 'No data'
    },
    {
      label: 'Top Loser',
      value: topLoser ? `${topLoser.name}` : '—',
      meta: topLoser ? formatSignedPercent(topLoser.changePercent) : 'No data'
    },
    {
      label: 'Most Expensive Asset',
      value: mostExpensive ? `${mostExpensive.name}` : '—',
      meta: mostExpensive ? formatPrice(mostExpensive.price) : 'No data'
    }
  ];

  statsGrid.innerHTML = stats
    .map((stat) => `
      <article class="stat-card" aria-label="${stat.label}">
        <span class="label">${stat.label}</span>
        <div class="value">${stat.value}</div>
        <span class="meta">${stat.meta}</span>
      </article>
    `)
    .join('');
}

function renderTable() {
  const tableBody = document.getElementById('cryptoTableBody');
  const emptyState = document.getElementById('tableEmptyState');

  if (!state.filteredData.length) {
    tableBody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  tableBody.innerHTML = state.filteredData
    .map((coin, index) => {
      const changeClass = coin.changePercent >= 0 ? 'positive' : 'negative';
      const arrow = coin.changePercent >= 0 ? '↗' : '↘';
      const trendSymbol = coin.changePercent >= 0 ? '+' : '';

      return `
        <tr tabindex="0" data-coin-id="${coin.id}" aria-label="View ${coin.name} details">
          <td>${index + 1}</td>
          <td>
            <div class="asset-cell">
              <span class="coin-badge" aria-hidden="true">${coin.symbol.slice(0, 2)}</span>
              <div class="asset-meta">
                <strong>${coin.name}</strong>
                <span>${coin.symbol}</span>
              </div>
            </div>
          </td>
          <td class="price-cell">${formatPrice(coin.price)}</td>
          <td><span class="trend-tag ${changeClass}">${arrow} ${trendSymbol}${coin.changePercent.toFixed(2)}%</span></td>
          <td class="market-cap-cell">${formatMarketCap(coin.marketCap)}</td>
          <td><span class="trend-tag ${changeClass}">${arrow}</span></td>
          <td><button class="view-button" type="button" data-coin-id="${coin.id}">View</button></td>
        </tr>
      `;
    })
    .join('');

  tableBody.querySelectorAll('tr[data-coin-id]').forEach((row) => {
    row.addEventListener('click', (event) => {
      if (event.target.closest('button')) {
        return;
      }
      const coinId = row.dataset.coinId;
      const coin = state.allData.find((entry) => entry.id === coinId);
      if (coin) {
        openCoinModal(coin);
      }
    });

    row.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const coinId = row.dataset.coinId;
        const coin = state.allData.find((entry) => entry.id === coinId);
        if (coin) {
          openCoinModal(coin);
        }
      }
    });
  });

  tableBody.querySelectorAll('.view-button').forEach((button) => {
    button.addEventListener('click', () => {
      const coinId = button.dataset.coinId;
      const coin = state.allData.find((entry) => entry.id === coinId);
      if (coin) {
        openCoinModal(coin);
      }
    });
  });
}

function renderTopMovers() {
  const gainers = [...state.allData].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  const losers = [...state.allData].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);

  document.getElementById('topGainers').innerHTML = gainers
    .map((coin) => `
      <div class="mover-item">
        <div class="meta">
          <span class="coin-badge" aria-hidden="true">${coin.symbol.slice(0, 2)}</span>
          <div>
            <strong>${coin.name}</strong>
            <span>${coin.symbol}</span>
          </div>
        </div>
        <span class="trend-tag positive">${formatSignedPercent(coin.changePercent)}</span>
      </div>
    `)
    .join('');

  document.getElementById('topLosers').innerHTML = losers
    .map((coin) => `
      <div class="mover-item">
        <div class="meta">
          <span class="coin-badge" aria-hidden="true">${coin.symbol.slice(0, 2)}</span>
          <div>
            <strong>${coin.name}</strong>
            <span>${coin.symbol}</span>
          </div>
        </div>
        <span class="trend-tag negative">${formatSignedPercent(coin.changePercent)}</span>
      </div>
    `)
    .join('');
}

function renderInsights() {
  if (!state.allData.length) {
    document.getElementById('insightsContent').innerHTML = '';
    return;
  }

  const leader = [...state.allData].sort((a, b) => b.marketCap - a.marketCap)[0];
  const positiveAssets = state.allData.filter((coin) => coin.changePercent > 0).length;
  const averageChange = state.allData.reduce((sum, coin) => sum + coin.changePercent, 0) / state.allData.length;

  const insightData = [
    `${leader.name} currently has the highest market capitalization in the loaded dataset.`,
    `${positiveAssets} assets are currently showing positive 24h movement.`,
    `Average 24h change: ${formatSignedPercent(averageChange)}.`
  ];

  document.getElementById('insightsContent').innerHTML = insightData
    .map((entry) => `<div class="insight-item">${entry}</div>`)
    .join('');
}

function renderChart() {
  const canvas = document.getElementById('marketChart');
  const emptyState = document.getElementById('chartEmptyState');

  if (!state.filteredData.length || typeof Chart === 'undefined') {
    emptyState.classList.remove('hidden');
    if (state.chart) {
      state.chart.destroy();
      state.chart = null;
    }
    return;
  }

  emptyState.classList.add('hidden');
  const chartData = state.filteredData.slice(0, 12).map((coin) => ({ ...coin }));
  const labels = chartData.map((coin) => coin.symbol);

  const chartMetrics = {
    price: {
      label: 'Price (USD)',
      value: (coin) => coin.price,
      formatter: (value) => formatPrice(value)
    },
    marketCap: {
      label: 'Market Cap (USD)',
      value: (coin) => coin.marketCap,
      formatter: (value) => formatMarketCap(value)
    },
    changePercent: {
      label: '24h Change (%)',
      value: (coin) => coin.changePercent,
      formatter: (value) => `${Number(value).toFixed(2)}%`
    }
  };

  const selectedMetric = chartMetrics[state.chartMetric] || chartMetrics.price;
  const values = chartData.map((coin) => selectedMetric.value(coin));
  const borderColor = state.chartMetric === 'changePercent' ? '#21c77d' : '#4da3ff';

  if (state.chart) {
    state.chart.destroy();
  }

  state.chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: selectedMetric.label,
          data: values,
          borderColor,
          backgroundColor: 'rgba(77, 163, 255, 0.2)',
          borderWidth: 2,
          tension: 0.35,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim()
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => `${selectedMetric.label}: ${selectedMetric.formatter(context.parsed.y || context.parsed)}`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--muted').trim(),
            maxRotation: 0
          },
          grid: {
            display: false
          }
        },
        y: {
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--muted').trim(),
            callback: (value) => selectedMetric.formatter(value)
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.12)'
          }
        }
      }
    }
  });
}

function clearChart() {
  const canvas = document.getElementById('marketChart');
  const emptyState = document.getElementById('chartEmptyState');
  emptyState.classList.remove('hidden');
  if (state.chart) {
    state.chart.destroy();
    state.chart = null;
  }
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function openCoinModal(coin) {
  const modal = document.getElementById('coinModal');
  const content = document.getElementById('coinModalContent');

  content.innerHTML = `
    <div class="modal-header">
      <div class="asset-cell">
        <span class="coin-badge" aria-hidden="true">${coin.symbol.slice(0, 2)}</span>
        <div class="asset-meta">
          <h3 id="modalTitle">${coin.name}</h3>
          <span>${coin.symbol}</span>
        </div>
      </div>
      <span class="trend-tag ${coin.changePercent >= 0 ? 'positive' : 'negative'}">${formatSignedPercent(coin.changePercent)}</span>
    </div>

    <div class="detail-grid">
      <div class="detail-item">
        <span>Current price</span>
        <strong>${formatPrice(coin.price)}</strong>
      </div>
      <div class="detail-item">
        <span>24h change</span>
        <strong>${formatSignedPercent(coin.changePercent)}</strong>
      </div>
      <div class="detail-item">
        <span>Market cap</span>
        <strong>${formatMarketCap(coin.marketCap)}</strong>
      </div>
      <div class="detail-item">
        <span>Timestamp</span>
        <strong>${formatTimestamp(coin.timestamp)}</strong>
      </div>
    </div>

    <div class="detail-note">
      Historical data is not available for this snapshot.
    </div>
  `;

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  const modal = document.getElementById('coinModal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function handleTableClick(event) {
  const button = event.target.closest('.view-button');
  if (!button) {
    return;
  }

  const coinId = button.dataset.coinId;
  const coin = state.allData.find((entry) => entry.id === coinId);
  if (coin) {
    openCoinModal(coin);
  }
}

function renderStatsSkeleton() {
  document.getElementById('statsGrid').innerHTML = Array.from({ length: 5 }, () => `
    <article class="stat-card" aria-label="loading">
      <span class="label">Loading…</span>
      <div class="value">—</div>
      <span class="meta">Please wait</span>
    </article>
  `).join('');
}

function renderTableSkeleton() {
  const tableBody = document.getElementById('cryptoTableBody');
  tableBody.innerHTML = Array.from({ length: 5 }, (_, index) => `
    <tr aria-label="Loading row ${index + 1}">
      <td>—</td>
      <td>Loading…</td>
      <td>—</td>
      <td>—</td>
      <td>—</td>
      <td>—</td>
      <td>—</td>
    </tr>
  `).join('');
}

function renderEmptyStates() {
  document.getElementById('tableEmptyState').classList.remove('hidden');
  document.getElementById('chartEmptyState').classList.remove('hidden');
  document.getElementById('cryptoTableBody').innerHTML = '';
}

function setDataState(message, showRetry) {
  const dataState = document.getElementById('dataState');
  const dataStateMessage = document.getElementById('dataStateMessage');
  const retryButton = document.getElementById('retryButton');

  dataStateMessage.textContent = message;
  retryButton.classList.toggle('hidden', !showRetry);
  dataState.classList.remove('hidden');
}

function hideDataState() {
  document.getElementById('dataState').classList.add('hidden');
}

function updateRefreshState(isRefreshing) {
  const buttons = [
    document.getElementById('refreshButton'),
    document.getElementById('heroRefreshButton')
  ];

  buttons.forEach((button) => {
    if (!button) return;
    button.disabled = isRefreshing;
    button.style.opacity = isRefreshing ? '0.7' : '1';
    button.textContent = isRefreshing ? 'Refreshing…' : button.id === 'heroRefreshButton' ? 'Refresh market' : 'Refresh';
  });
}

async function triggerRefresh() {
  if (state.refreshInFlight) {
    return;
  }

  state.refreshInFlight = true;
  updateRefreshState(true);

  try {
    await loadData(true);
  } finally {
    state.refreshInFlight = false;
    updateRefreshState(false);
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('cryptotrack-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.getElementById('themeToggleLabel').textContent = savedTheme === 'dark' ? '☀' : '☾';
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('cryptotrack-theme', currentTheme);
  document.getElementById('themeToggleLabel').textContent = currentTheme === 'dark' ? '☀' : '☾';
}

window.addEventListener('beforeunload', () => {
  if (state.chart) {
    state.chart.destroy();
  }
});
