# Keep Accounts App

[English](#keep-accounts-app) | [繁體中文](#記帳應用程式-keep-accounts-app)

A modern personal finance, budgeting, and bookkeeping application built as a modular **Nx monorepo**. It includes a feature-rich React-based web dashboard (adaptable to mobile devices via Capacitor), a Swift command-line helper, and a robust end-to-end integration test suite using Playwright.

This project employs **Spectra Spec-Driven Development (SDD)**, a methodology where features and architecture changes are fully spec'd and reviewed before coding begins.

---

## Table of Contents

- [Core Features](#core-features)
- [Workspace Architecture](#workspace-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development & Build Commands](#development--build-commands)
- [Spectra SDD Workflow](#spectra-sdd-workflow)
- [License](#license)

---

## Core Features

### 1. Web Application & Hybrid Mobile App (`apps/web`)
A highly responsive React 19 web application built on Vite, TypeScript, and Ionic. It can be compiled into native mobile apps (iOS & Android) via Capacitor.
- **Account Groups (資金帳戶分組)**: Define different financial buckets (e.g., Daily Expenses, Investments, Long-term Savings) with custom emojis, description texts, and theme colors.
- **Allocation Rule Support (333 分配法則)**: Allocate income across your account groups with target ratios (such as the default 333 rule or custom percentages) that must sum to exactly 100%.
- **Budget Limit & Real-time Alerts**: Set custom monthly budgets per account group. The system flags over-budget states dynamically in the UI and displays alerts when log entries exceed the threshold.
- **Detailed Transactions & Time Tracking**: Log transactions with descriptions, amounts, sub-categories, dates, and times. Supports editing and deletion.
- **Lucide Icons**: Integrates modern, clean Lucide iconography (`lucide-react`) for a streamlined visual design.
- **Dynamic Stats & Pie Charts**: Interactive expense/income breakdowns using **Recharts**. Categories are automatically assigned unique, visually distinct colors that match both the chart slices and category progress bars.
- **Comprehensive Backup & Recovery System**:
  - Compresses bookkeeping data to a zip file using `fflate`.
  - Supports exporting, downloading, and native sharing (via `@capacitor/share`).
  - Implements **Auto-Backup** to native Documents storage (`keep_accounts_backup.zip`) and allows restoring from auto-backups.
  - Maintains a detailed import history log with file details, record counts, and status checks.

### 2. Swift CLI Helper (`apps/swift-cli`)
A Swift command-line helper structure used to package the iOS application (creating the IPA artifact) and automatically generate testing files/build artifacts in the CI/CD pipeline.

### 3. E2E Testing Suite (`apps/web-e2e`)
End-to-end integration testing suite using **Playwright** to simulate user behavior, check state integrity, and ensure zero-regression on UI layouts.

---

## Workspace Architecture

The workspace is structured as an Nx monorepo, cleanly dividing applications and shared business/state logic libraries:

```text
keep-accounts-app/
├── apps/
│   ├── web/                     # React 19 / Vite / TypeScript web app (Capacitor enabled)
│   ├── web-e2e/                 # Playwright end-to-end integration tests
│   └── swift-cli/               # Swift CLI tool to package iOS app & generate CI artifacts
├── libs/
│   └── shared/
│       ├── domain/              # Shared models, entities, defaults, and helper functions
│       └── state/               # Shared business logic and custom React state hooks
├── openspec/                    # Spectra Spec-Driven Development (SDD) spec directory
│   ├── specs/                   # Baseline feature specifications (e.g. dynamic-header, distinct-chart-colors)
│   └── changes/                 # Active / archived feature changes and proposal tasks
├── nx.json                      # Nx workspace config
├── package.json                 # Node dependencies and workspace configurations
├── tsconfig.base.json           # TypeScript base path configurations
└── vitest.workspace.ts          # Vitest workspace definition for tests
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** (bundled with Node.js)
- **Swift CLI** (optional, if you plan to compile or run the Swift CLI helper)

### Installation

Clone the repository and install all Node.js and workspace dependencies:

```bash
npm install
```

### Development & Build Commands

Task execution in this workspace is powered by Nx:

#### Running the Web Application
Start the local Vite development server:
```bash
npx nx serve web
```
The server usually opens at `http://localhost:4200` (or another port designated by Vite).

#### Running Unit & Integration Tests
Run Vitest tests on the web app or libraries:
```bash
npx nx test web
```

#### Running End-to-End Tests
Execute the Playwright E2E suite:
```bash
npx nx e2e web-e2e
```

#### Building the Web App for Production
Compile and bundle the production assets:
```bash
npx nx build web
```
Built assets will be available at `dist/apps/web`.

#### Graph Visualization
Generate an interactive dependency graph of your workspace components:
```bash
npx nx graph
```

---

## Spectra SDD Workflow

Spec-Driven Development (SDD) governs how we design and implement features. Baseline specifications are version-controlled in `openspec/specs/`, and active changes are tracked in `openspec/changes/`.

### Development Pipeline:
1. **Discuss / Propose**: Create a design proposal using the `/spectra-discuss` or `/spectra-propose` assistant workflow.
2. **Apply / Ingest**: Implement specifications with `/spectra-apply` or `/spectra-ingest`.
3. **Archive**: Once verified, execute `/spectra-archive` to merge changes back into baseline specs and clean up the active changes directory.

---

## License

This project is licensed under the [MIT License](LICENSE).

***

# 記帳應用程式 (Keep Accounts App)

[English](#keep-accounts-app) | [繁體中文](#記帳應用程式-keep-accounts-app)

這是一個以 **Nx monorepo** 建置的現代化個人理財、預算規劃與記帳應用程式。本專案包含一個基於 React 的美觀網頁控制面板（亦可透過 Capacitor 包裝為行動端 App）、一個 Swift 命令行界面 (CLI) 工具，以及使用 Playwright 的端到端 (E2E) 整合測試。

本專案採用 **Spectra 規格驅動開發 (SDD)** 流程，在進行實作前，會先針對功能規格與變更提案進行建模與設計。

---

## 目錄

- [核心功能特色](#核心功能特色)
- [專案架構](#專案架構)
- [開始使用](#開始使用)
  - [先決條件](#先決條件)
  - [安裝步驟](#安裝步驟)
  - [開發與建置指令](#開發與建置指令)
- [Spectra SDD 開發流程](#spectra-sdd-開發流程)
- [授權條款](#授權條款)

---

## 核心功能特色

### 1. 網頁與混合行動應用程式 (`apps/web`)
基於 React 19、Vite、TypeScript 與 Ionic 開發的響應式網頁，可透過 Capacitor 輕鬆編譯為 Android 與 iOS 的原生 App。
- **資金帳戶分組 (Account Groups)**：將資金歸類於不同的帳戶群組（例如：日常開銷、投資理財、長期儲蓄）。可自訂 Emoji 表情符號、代表色與描述。
- **支援比例分配法則 (333 分配法則)**：支援在各資金帳戶間設定目標分配比例（如預設的 333 法則或自訂比例），所有帳戶比例相加必須剛好等於 100%。
- **預算上限與即時提醒**：可為各資金群組設定每月預算上限。當超支或當次記帳將導致超支時，系統會在介面中動態顯示超支警告，並彈出提醒訊息。
- **詳細交易管理與時間追蹤**：記錄收支的描述、金額、子類別、日期與具體時間，支援編輯與刪除。
- **Lucide 圖標整合**：使用 `lucide-react` 替代舊式圖樣，提供更加乾淨、現代化的 UI 圖標。
- **動態統計與圓餅圖**：使用 **Recharts** 提供互動式的收支分類統計。所有分類均自動分配唯一且色彩鮮明的顏色，且圓餅圖區塊與下方進度條的代表色保持一致。
- **完善的本地備份與還原系統**：
  - 使用 `fflate` 壓縮技術將記帳資料打包為 ZIP 格式備份檔。
  - 支援備份檔匯出、下載與原生分享（利用 `@capacitor/share`）。
  - 提供**自動備份**機制，可將資料備份至原生 Documents 目錄（`keep_accounts_backup.zip`），並支援從自動備份中一鍵還原。
  - 提供備份匯入歷史紀錄日誌，詳細記錄匯入時間、檔案大小、群組與交易數量，並進行成功與否的狀態校驗。

### 2. Swift CLI 輔助工具 (`apps/swift-cli`)
基於 Swift 的命令列工具，主要用於打包 iOS 應用程式（產生 IPA 安裝包），並透過 CI/CD 流程自動產出相關測試檔案與建置成品。

### 3. E2E 測試套件 (`apps/web-e2e`)
使用 **Playwright** 驅動的端到端整合測試套件，用以模擬使用者操作流程、驗證狀態一致性，確保 UI 與核心邏輯無迴歸 (zero-regression)。

---

## 專案架構

本專案採用 Nx Monorepo 進行模組化管理，將應用程式與共用的業務/狀態邏輯函式庫乾淨分離：

```text
keep-accounts-app/
├── apps/
│   ├── web/                     # React 19 / Vite / TypeScript 網頁與混合 App
│   ├── web-e2e/                 # Playwright 端到端 (E2E) 測試套件
│   └── swift-cli/               # Swift CLI 用於打包 iOS 應用程式與產生 CI/CD 測試檔案
├── libs/
│   └── shared/
│       ├── domain/              # 共用實體模型、預設常數及工具函式
│       └── state/               # 共用業務邏輯及自訂 React State Hook (useKeepAccounts)
├── openspec/                    # Spectra 規格驅動開發 (SDD) 規格書目錄
│   ├── specs/                   # 基線規格書 (如：動態標頭 dynamic-header、圖表配色 distinct-chart-colors)
│   └── changes/                 # 當前開發中 / 已封存的變更提案與任務清單
├── nx.json                      # Nx 工作區設定檔
├── package.json                 # Node.js 依賴套件與指令配置
├── tsconfig.base.json           # TypeScript 基礎路徑對照設定檔
└── vitest.workspace.ts          # Vitest 測試工作區定義檔
```

---

## 開始使用

### 先決條件

請確保您的開發環境中已安裝以下工具：
- **Node.js** (建議 v18 或以上版本)
- **npm** (隨 Node.js 一併安裝)
- **Swift 開發工具** (可選，若您需要編譯或執行 Swift CLI 工具)

### 安裝步驟

複製專案並安裝所有 Node.js 依賴套件：

```bash
npm install
```

### 開發與建置指令

我們使用 Nx 來管理與執行工作區任務：

#### 啟動網頁開發伺服器
啟動本地 Vite 開發伺服器：
```bash
npx nx serve web
```
啟動後可於瀏覽器開啟 `http://localhost:4200`（或 Vite/Nx 指定的連接埠）。

#### 執行單元與整合測試
執行網頁應用或共用庫的 Vitest 測試：
```bash
npx nx test web
```

#### 執行 E2E 測試
執行 Playwright 端到端整合測試：
```bash
npx nx e2e web-e2e
```

#### 建立生產版本
建立網頁應用程式的最佳化生產版本：
```bash
npx nx build web
```
產出的靜態檔案會放置於 `dist/apps/web` 目錄中。

#### 視覺化工作區圖表
檢視整個 Monorepo 中各個應用程式與函式庫之間的依賴關係圖：
```bash
npx nx graph
```

---

## Spectra SDD 開發流程

本專案遵循**規格驅動開發 (Spec-Driven Development, SDD)** 模式。基線功能規格書存放於 `openspec/specs/` 目錄，而變更中的提案與開發任務則存放在 `openspec/changes/` 中。

### 開發流程階段：
1. **討論 / 提案 (Discuss / Propose)**：使用 `/spectra-discuss` 或 `/spectra-propose` 設計規格與變更提案。
2. **套用 / 調整 (Apply / Ingest)**：使用 `/spectra-apply` 或 `/spectra-ingest` 實作變更並同步程式碼。
3. **封存歸檔 (Archive)**：功能實作並測試完成後，執行 `/spectra-archive` 將變更合併至基線規格目錄，並清理進行中的變更暫存。

---

## 授權條款

本專案採用 [MIT 授權條款](LICENSE) 進行授權。
