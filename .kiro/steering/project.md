---
inclusion: always
---

# BudgetViz — Panduan Workspace

## Ringkasan Proyek
BudgetViz adalah aplikasi web pelacak pengeluaran harian berbasis browser.
Dibangun menggunakan HTML, CSS, dan Vanilla JavaScript murni tanpa framework apapun.

## Tech Stack
- **HTML5** — struktur halaman (`index.html`)
- **CSS3** — styling dan tema (`css/style.css`)
- **Vanilla JavaScript ES6+** — logika aplikasi (`js/app.js`)
- **Chart.js 4.4.4** — visualisasi grafik pie (dimuat via CDN)
- **localStorage** — penyimpanan data di browser (tanpa backend)

## Struktur Folder
```
project/
├── .kiro/
│   ├── settings.json       # Konfigurasi workspace
│   ├── steering/
│   │   └── project.md      # File ini
│   └── specs/              # Spesifikasi fitur (opsional)
├── css/
│   └── style.css           # Satu-satunya file CSS
├── js/
│   └── app.js              # Satu-satunya file JavaScript
├── index.html              # Entry point aplikasi
└── README.md
```

## Fitur Utama
1. **Formulir Input** — tambah transaksi (nama, jumlah, kategori)
2. **Daftar Transaksi** — scrollable, dengan tombol hapus per item
3. **Total Pengeluaran** — diperbarui otomatis, tampil di kartu atas
4. **Grafik Pie** — distribusi pengeluaran per kategori (Chart.js)
5. **Batas Pengeluaran** — notifikasi & highlight jika melewati batas
6. **Pengurutan** — urutkan transaksi berdasarkan tanggal/jumlah/kategori
7. **Tema Gelap/Terang** — toggle dengan preferensi tersimpan

## Kategori Transaksi
| Key | Label | Warna |
|-----|-------|-------|
| `Food` | 🍔 Makanan | `#f59e0b` |
| `Transport` | 🚗 Transportasi | `#3b82f6` |
| `Fun` | 🎉 Hiburan | `#a855f7` |

## Aturan Kode
- Gunakan `'use strict'` di semua file JS
- Semua komentar ditulis dalam **Bahasa Indonesia**
- Tidak boleh ada framework (React, Vue, Angular, dll)
- Tidak boleh ada npm / package manager
- Data disimpan hanya via `localStorage`
- Escape semua input pengguna sebelum dirender ke DOM (XSS prevention)

## Warna Tema Utama
- Primary: `#6aa4dd` (biru)
- Hover: `#4d8ecf`
- Danger: `#ef4444`
- Warning: `#fb923c`
