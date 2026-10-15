<div align="center">

<img src="docs/assets/logo.svg" alt="Manzil" width="120" />

# Manzil · منزل

**An offline-first app to manage your home budget and daily expenses**

[![Release](https://img.shields.io/github/v/release/zakidri27/house-management?style=for-the-badge&color=8b5cf6)](https://github.com/zakidri27/house-management/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android-3ddc84?style=for-the-badge&logo=android&logoColor=fff)](#-installation)
[![JavaScript](https://img.shields.io/badge/Vanilla-JavaScript-f7df1e?style=for-the-badge&logo=javascript&logoColor=000)](#-tech-stack)
[![Capacitor](https://img.shields.io/badge/Capacitor-6-119eff?style=for-the-badge&logo=capacitor&logoColor=fff)](https://capacitorjs.com)

[Product page &amp; live demo](https://zakidri27.github.io/house-management/) · [Download](https://github.com/zakidri27/house-management/releases/latest) · [Report an issue](https://github.com/zakidri27/house-management/issues)

</div>

---

## Overview

**Manzil** (Arabic for *home*) is a clean, **offline-first** application that helps you manage your
household money: a monthly budget, groceries, utility bills, debts, price tracking, savings and
goals — all in one place, with charts and a full data backup.

It is built with **plain web technologies** (HTML, CSS, vanilla JavaScript) and packaged as a
**native Android app** with **Capacitor**. There is no account, no server and no tracking — your
data stays on your device. The same web app also runs directly in any browser
(see the [live demo](https://zakidri27.github.io/house-management/app/)).

---

## Key Features

| Module | Description |
|--------|-------------|
| 🏠 **Home** | Dashboard with the month's remainder, available money, debts, goals, a quick-access grid and a live activity feed. |
| 🗓️ **Monthly** | Record monthly income and track the remainder for every month. |
| 📊 **Reports** | Bar, pie and line charts: spending by category and income vs. expenses over time. |
| 🏷️ **Prices** | Save prices of goods (sugar, fuel, …) with a unit to track today's costs. |
| 🛒 **Groceries** | Two modes — quick (amount only) and detailed (itemized with quantity, unit and price, auto total). |
| 🧾 **Bills** | Gas, water, electricity, car fuel, internet, rent and custom categories. |
| 🤝 **Debts** | Track money **lent to others** and money **you owe**, with partial payments and progress bars. |
| 📦 **Other** | Log any uncategorized expense quickly. |
| 🐷 **Savings** | An automatic savings balance derived from income, expenses, debts and funded goals. |
| 🎯 **Goals** | Create savings goals with targets, fund them from your balance and track progress. |

### General

- 🌙 **Dark / light theme**.
- 🌐 **Arabic-first UI** with full **RTL** support.
- 🛡️ **Budget guard** — prevents recording spending that exceeds your available money.
- 💾 **Backup & restore** — export all data to a JSON file and import it back.
- 📴 **Fully offline** — no internet connection required.

---

## Pages & Navigation

The app is organized into three groups, accessible from the sidebar and bottom dock:

```text
Home  ──┬── GROUP A : Overview
        │     ├── Home       ── dashboard & activity
        │     ├── Monthly    ── monthly income
        │     ├── Reports    ── charts & analytics
        │     └── Prices     ── price tracking
        │
        ├── GROUP B : Spending
        │     ├── Groceries  ── quick / detailed
        │     ├── Bills      ── utilities & rent
        │     ├── Debts      ── for us / on us
        │     └── Other      ── misc expenses
        │
        └── GROUP C : Growth
              ├── Savings    ── computed balance
              └── Goals      ── savings targets
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **App** | HTML5 · CSS3 (custom light/dark themes) · Vanilla JavaScript (no framework) |
| **Charts** | Custom `<canvas>` rendering (bar, pie, line) |
| **Storage** | `localStorage` (`manzil_data_v1`) |
| **Mobile** | Capacitor 6 · Android |

---

## Architecture

```text
┌────────────────────────────  Web app (www/)  ───────────────────────────┐
│                                                                         │
│   store.js  ──►  localStorage  (manzil_data_v1) + schema & migrations   │
│   util.js   ──►  analytics: income, expenses, available, savings        │
│   charts.js ──►  bar / pie / line on <canvas>                           │
│   pages.js  ──►  home, monthly, reports, prices, groceries,             │
│                   bills, debts, other, savings, goals                   │
│                                                                         │
│   Capacitor  ──►  packages the same web app as a native Android build    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Web source** lives at the repository root (`index.html`, `css/`, `js/`, `img/`).
- `scripts/copy-web.js` copies those assets into `www/`, which Capacitor bundles into the Android app.
- The generated `www/` folder is not committed (it is produced by the build step).

---

## Installation

### End users (Android)

1. Download the APK from the [Releases](https://github.com/zakidri27/house-management/releases/latest) page.
2. On your phone, allow installation from unknown sources if prompted.
3. Install `Manzil-1.0.0.apk` and open the app.

> The APK is a debug build and is not signed for the Play Store.

### Live demo (browser)

Open the web app directly: **https://zakidri27.github.io/house-management/app/**

### For developers

```bash
# 1) Install dependencies
npm install

# 2) Copy web assets into www/
npm run copy:web

# 3) Sync Capacitor with the Android project
npm run sync

# 4) Open the project in Android Studio
npm run open:android

# 5) Build a debug APK (requires JDK 17 + Android SDK)
npm run apk
```

---

## Project Structure

```text
house-management/
├── index.html              # Web app entry point (source)
├── css/styles.css          # Styles & themes
├── js/
│   ├── store.js            # Data store, schema & migrations (localStorage)
│   ├── util.js             # Helpers & analytics
│   ├── icons.js            # Inline SVG icon set
│   ├── charts.js           # Canvas charts (bar / pie / line)
│   ├── pages.js            # All pages
│   └── app.js              # App shell, navigation, sheets
├── img/logo.svg
├── android/                # Capacitor Android project
├── scripts/
│   ├── copy-web.js         # Copies web assets to www/
│   ├── build-apk.ps1       # Builds the debug APK
│   └── make-icons.ps1      # Generates app icons
├── capacitor.config.json
├── package.json
└── docs/                   # GitHub Pages site + live demo
```

---

## Contributing

Contributions are welcome. Open an *Issue* to discuss a change, or submit a *Pull Request*.

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by **Zaki** · © 2026

⭐ If you like the project, please leave a star!

</div>
