/**
 * BudgetViz — app.js
 * Aplikasi Pelacak Pengeluaran & Anggaran
 * Vanilla JS | localStorage | Chart.js
 */

'use strict';

/* ============================================================
   KONSTANTA & STATE
   ============================================================ */

const STORAGE_KEY   = 'budgetviz_transactions';
const LIMIT_KEY     = 'budgetviz_limit';
const THEME_KEY     = 'budgetviz_theme';

const CATEGORY_COLORS = {
  Food:      '#f59e0b',
  Transport: '#3b82f6',
  Fun:       '#a855f7',
};

const CATEGORY_LABELS = {
  Food:      '🍔 Makanan',
  Transport: '🚗 Transportasi',
  Fun:       '🎉 Hiburan',
};

// State aplikasi
let transactions = [];   // Array berisi { id, name, amount, category, timestamp }
let spendLimit   = null; // Number | null
let sortMode     = 'date-desc';
let chartInstance = null;

/* ============================================================
   REFERENSI ELEMEN DOM
   ============================================================ */

const form            = document.getElementById('transactionForm');
const itemNameInput   = document.getElementById('itemName');
const itemAmountInput = document.getElementById('itemAmount');
const itemCategorySelect = document.getElementById('itemCategory');

const nameError     = document.getElementById('nameError');
const amountError   = document.getElementById('amountError');
const categoryError = document.getElementById('categoryError');

const totalBalanceEl  = document.getElementById('totalBalance');
const transactionList = document.getElementById('transactionList');
const emptyMsg        = document.getElementById('emptyMsg');
const limitBanner     = document.getElementById('limitBanner');

const spendLimitInput = document.getElementById('spendLimit');
const setLimitBtn     = document.getElementById('setLimitBtn');
const clearLimitBtn   = document.getElementById('clearLimitBtn');
const limitDisplay    = document.getElementById('limitDisplay');

const sortSelect  = document.getElementById('sortSelect');
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const chartCanvas = document.getElementById('spendingChart');
const chartEmpty  = document.getElementById('chartEmptyMsg');

/* ============================================================
   HELPER PENYIMPANAN (localStorage)
   ============================================================ */

/** Muat daftar transaksi dari localStorage */
function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    transactions = raw ? JSON.parse(raw) : [];
  } catch {
    transactions = [];
  }
}

/** Simpan transaksi saat ini ke localStorage */
function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

/** Muat batas pengeluaran dari localStorage */
function loadLimit() {
  const raw = localStorage.getItem(LIMIT_KEY);
  spendLimit = raw !== null ? parseFloat(raw) : null;
}

/** Simpan batas pengeluaran ke localStorage */
function saveLimit() {
  if (spendLimit !== null) {
    localStorage.setItem(LIMIT_KEY, String(spendLimit));
  } else {
    localStorage.removeItem(LIMIT_KEY);
  }
}

/** Muat preferensi tema dari localStorage */
function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved);
}

/* ============================================================
   TEMA (GELAP / TERANG)
   ============================================================ */

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
  // Render ulang grafik agar warnanya sesuai tema baru
  renderChart();
}

/* ============================================================
   FORMAT TAMPILAN
   ============================================================ */

function formatCurrency(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/* ============================================================
   TRANSAKSI — CRUD (Tambah, Baca, Hapus)
   ============================================================ */

/** Buat ID unik sederhana */
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Tambah transaksi baru */
function addTransaction(name, amount, category) {
  const tx = {
    id:        genId(),
    name:      name.trim(),
    amount:    parseFloat(amount),
    category,
    timestamp: Date.now(),
  };
  transactions.push(tx);
  saveTransactions();
  renderAll();
}

/** Hapus transaksi berdasarkan id */
function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveTransactions();
  renderAll();
}

/* ============================================================
   PENGURUTAN
   ============================================================ */

function getSortedTransactions() {
  const arr = [...transactions];
  switch (sortMode) {
    case 'date-desc':    return arr.sort((a, b) => b.timestamp - a.timestamp);
    case 'date-asc':     return arr.sort((a, b) => a.timestamp - b.timestamp);
    case 'amount-desc':  return arr.sort((a, b) => b.amount - a.amount);
    case 'amount-asc':   return arr.sort((a, b) => a.amount - b.amount);
    case 'category':     return arr.sort((a, b) => a.category.localeCompare(b.category));
    default:             return arr;
  }
}

/* ============================================================
   PERHITUNGAN TOTAL
   ============================================================ */

function computeTotal() {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

function computeCategoryTotals() {
  return transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});
}

/* ============================================================
   RENDER — SALDO
   ============================================================ */

function renderBalance() {
  const total = computeTotal();
  totalBalanceEl.textContent = formatCurrency(total);

  // Animasi bump (pembesaran sebentar)
  totalBalanceEl.classList.remove('bump');
  // Paksa reflow agar animasi bisa diputar ulang
  void totalBalanceEl.offsetWidth;
  totalBalanceEl.classList.add('bump');
  setTimeout(() => totalBalanceEl.classList.remove('bump'), 300);
}

/* ============================================================
   RENDER — BANNER & HIGHLIGHT BATAS PENGELUARAN
   ============================================================ */

function renderLimitUI() {
  if (spendLimit !== null) {
    limitDisplay.textContent = `Batas: ${formatCurrency(spendLimit)}`;
    spendLimitInput.value = spendLimit;
  } else {
    limitDisplay.textContent = 'Belum ada batas yang ditetapkan.';
    spendLimitInput.value = '';
  }

  const total = computeTotal();
  if (spendLimit !== null && total > spendLimit) {
    limitBanner.classList.remove('hidden');
  } else {
    limitBanner.classList.add('hidden');
  }
}

/* ============================================================
   RENDER — DAFTAR TRANSAKSI
   ============================================================ */

function renderTransactionList() {
  const sorted = getSortedTransactions();

  if (sorted.length === 0) {
    transactionList.innerHTML = '';
    emptyMsg.classList.remove('hidden');
    return;
  }

  emptyMsg.classList.add('hidden');

  transactionList.innerHTML = sorted.map(tx => {
    const isOverLimit = spendLimit !== null && computeTotal() > spendLimit;
    // Tandai semua item dengan warna peringatan ketika total melampaui batas
    const overClass = isOverLimit ? 'over-limit' : '';

    return `
      <li class="transaction-item ${overClass}" data-id="${tx.id}">
        <span class="cat-dot ${tx.category}" aria-hidden="true"></span>
        <div class="item-info">
          <div class="item-name" title="${escapeHtml(tx.name)}">${escapeHtml(tx.name)}</div>
          <div class="item-meta">${CATEGORY_LABELS[tx.category] || tx.category} &middot; ${formatDate(tx.timestamp)}</div>
        </div>
        <span class="item-amount">${formatCurrency(tx.amount)}</span>
        <button
          class="delete-btn"
          data-id="${tx.id}"
          aria-label="Hapus transaksi ${escapeHtml(tx.name)}"
          title="Hapus"
        >🗑</button>
      </li>
    `;
  }).join('');
}

/* ============================================================
   RENDER — GRAFIK PIE
   ============================================================ */

function renderChart() {
  const totals = computeCategoryTotals();
  const categories = Object.keys(totals);

  if (categories.length === 0) {
    chartEmpty.classList.remove('hidden');
    chartCanvas.classList.add('hidden');
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  chartEmpty.classList.add('hidden');
  chartCanvas.classList.remove('hidden');

  const labels     = categories.map(c => CATEGORY_LABELS[c] || c);
  const data       = categories.map(c => totals[c]);
  const bgColors   = categories.map(c => CATEGORY_COLORS[c] || '#94a3b8');

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const legendColor = isDark ? '#94a3b8' : '#718096';

  if (chartInstance) {
    // Perbarui grafik yang sudah ada
    chartInstance.data.labels           = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = bgColors;
    chartInstance.options.plugins.legend.labels.color = legendColor;
    chartInstance.update();
    return;
  }

  // Buat grafik baru
  chartInstance = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: bgColors,
        borderColor:      isDark ? '#1e293b' : '#ffffff',
        borderWidth:      3,
        hoverOffset:      8,
      }],
    },
    options: {
      responsive:       true,
      maintainAspectRatio: true,
      animation: { duration: 400, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding:   16,
            boxWidth:  14,
            boxHeight: 14,
            color:     legendColor,
            font: { size: 13, family: "'Segoe UI', system-ui, sans-serif" },
          },
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              const val   = ctx.parsed;
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct   = ((val / total) * 100).toFixed(1);
              return ` ${formatCurrency(val)}  (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

/* ============================================================
   RENDER — SEMUA KOMPONEN
   ============================================================ */

function renderAll() {
  renderBalance();
  renderLimitUI();
  renderTransactionList();
  renderChart();
}

/* ============================================================
   VALIDASI FORMULIR
   ============================================================ */

function validateForm() {
  let valid = true;

  // Nama item
  const name = itemNameInput.value.trim();
  if (!name) {
    setFieldError(itemNameInput, nameError, true);
    valid = false;
  } else {
    setFieldError(itemNameInput, nameError, false);
  }

  // Jumlah pengeluaran
  const amount = parseFloat(itemAmountInput.value);
  if (!itemAmountInput.value || isNaN(amount) || amount <= 0) {
    setFieldError(itemAmountInput, amountError, true);
    valid = false;
  } else {
    setFieldError(itemAmountInput, amountError, false);
  }

  // Kategori
  const category = itemCategorySelect.value;
  if (!category) {
    setFieldError(itemCategorySelect, categoryError, true);
    valid = false;
  } else {
    setFieldError(itemCategorySelect, categoryError, false);
  }

  return valid;
}

function setFieldError(input, errorEl, show) {
  if (show) {
    input.classList.add('invalid');
    errorEl.classList.add('visible');
  } else {
    input.classList.remove('invalid');
    errorEl.classList.remove('visible');
  }
}

/* ============================================================
   HANDLER BATAS PENGELUARAN
   ============================================================ */

function handleSetLimit() {
  const val = parseFloat(spendLimitInput.value);
  if (!spendLimitInput.value || isNaN(val) || val <= 0) {
    spendLimitInput.classList.add('invalid');
    spendLimitInput.focus();
    return;
  }
  spendLimitInput.classList.remove('invalid');
  spendLimit = val;
  saveLimit();
  renderLimitUI();
  renderTransactionList(); // render ulang agar kelas highlight diperbarui
}

function handleClearLimit() {
  spendLimit = null;
  spendLimitInput.value = '';
  spendLimitInput.classList.remove('invalid');
  saveLimit();
  renderLimitUI();
  renderTransactionList();
}

/* ============================================================
   HELPER KEAMANAN (XSS)
   ============================================================ */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ============================================================
   EVENT LISTENER
   ============================================================ */

// Submit formulir tambah transaksi
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  addTransaction(
    itemNameInput.value,
    itemAmountInput.value,
    itemCategorySelect.value
  );

  // Reset formulir setelah berhasil ditambahkan
  form.reset();
  setFieldError(itemNameInput,      nameError,     false);
  setFieldError(itemAmountInput,    amountError,   false);
  setFieldError(itemCategorySelect, categoryError, false);

  itemNameInput.focus();
});

// Hapus pesan error saat pengguna mulai mengetik/memilih
itemNameInput.addEventListener('input',    () => setFieldError(itemNameInput,      nameError,     false));
itemAmountInput.addEventListener('input',  () => setFieldError(itemAmountInput,    amountError,   false));
itemCategorySelect.addEventListener('change', () => setFieldError(itemCategorySelect, categoryError, false));

// Hapus transaksi via event delegation (satu listener untuk semua tombol hapus)
transactionList.addEventListener('click', (e) => {
  const btn = e.target.closest('.delete-btn');
  if (!btn) return;
  const id = btn.dataset.id;
  if (id) deleteTransaction(id);
});

// Ubah mode pengurutan
sortSelect.addEventListener('change', () => {
  sortMode = sortSelect.value;
  renderTransactionList();
});

// Batas pengeluaran
setLimitBtn.addEventListener('click',   handleSetLimit);
clearLimitBtn.addEventListener('click', handleClearLimit);
spendLimitInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSetLimit();
});

// Toggle tema gelap/terang
themeToggle.addEventListener('click', toggleTheme);

/* ============================================================
   INISIALISASI APLIKASI
   ============================================================ */

function init() {
  loadTransactions();
  loadLimit();
  loadTheme();
  renderAll();
}

init();
