# Keep Accounts App

A modern personal finance and bookkeeping application built as an **Nx monorepo**. It includes a beautiful React-based web dashboard, a Swift command-line interface helper, and end-to-end integration tests using Playwright.

This project employs **Spectra Spec-Driven Development (SDD)**, where feature specs and change proposals are modeled before implementation.

---

## Table of Contents

- [Features](#features)
- [Workspace Architecture](#workspace-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development Commands](#development-commands)
- [Spectra SDD Workflow](#spectra-sdd-workflow)
- [License](#license)

---

## Features

### 1. Web Application (`apps/web`)
A responsive, React-based bookkeeping web client featuring:
- **Account Groups (資金組)**: Categorize your money into distinct groups (e.g., Daily Expenses, Investments, Long-term Savings). Customize emojis, group colors, and group descriptions.
- **Transactions Management**: Log income and expenses with descriptions, amounts, custom sub-categories, dates, and account group bindings.
- **Dynamic Dashboard**: View financial summaries, active balances, and recent ledger entries.
- **Advanced History & Stats**: Filter transactions by day, month, or year, with interactive breakdowns.
- **LocalStorage Persistence**: Auto-saves your records locally on the browser.

### 2. Swift CLI Helper (`apps/swift-cli`)
A native Swift-based Command Line Interface tool structure integrated into the monorepo to support command-line integrations or desktop utilities.

### 3. E2E Testing Suite (`apps/web-e2e`)
End-to-end test suite powered by **Playwright** to ensure application flows remain robust and bug-free.

---

## Workspace Architecture

The project is managed as an Nx monorepo workspace:

```text
keep-accounts-app/
├── apps/
│   ├── web/          # React 19 / Vite / TypeScript web application
│   ├── web-e2e/      # Playwright end-to-end testing suite
│   └── swift-cli/    # Swift CLI application and Package setup
├── openspec/         # Spectra Spec-Driven Development (SDD) specifications
│   ├── specs/        # Baseline specifications
│   └── changes/      # Feature change proposals (e.g. budget-limits, stats-charts)
├── nx.json           # Nx workspace configuration
├── package.json      # Node.js dependencies and scripts
└── tsconfig.base.json# TypeScript base configurations
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **npm** or another Node package manager
- **Swift toolchain** (optional, if you plan to build or run the Swift CLI helper)

### Installation

Clone the repository and install all Node dependencies:

```bash
npm install
```

### Development Commands

Nx is used to execute tasks across projects. Below are the primary commands:

#### Running the Web Application
Start the local Vite development server:
```bash
npx nx serve web
```
The application will be accessible at `http://localhost:4200` (or the port specified by Vite/Nx).

#### Building for Production
Create an optimized production bundle for the web app:
```bash
npx nx build web
```
The built assets will be generated in `dist/apps/web`.

#### Running Tests
Run unit tests for the web application:
```bash
npx nx test web
```

#### Running E2E Tests
Execute Playwright end-to-end integration tests:
```bash
npx nx e2e web-e2e
```

#### Visualizing the Workspace Graph
See the relationship between your monorepo apps and libraries:
```bash
npx nx graph
```

---

## Spectra SDD Workflow

This project adheres to **Spec-Driven Development (SDD)**. Specs and proposal changes are located in the `openspec/` directory.

- **Specs** (`openspec/specs/`): Document the baseline functionality.
- **Changes** (`openspec/changes/`): Drafted proposals for upcoming features (such as `add-budget-limits` or `add-stats-charts`).

### How to develop features:
1. **Discuss / Propose**: Use `/spectra-discuss` or `/spectra-propose` to design the spec first.
2. **Apply**: Implement the changes using `/spectra-apply` or `/spectra-ingest`.
3. **Archive**: Once the feature is complete and verified, run `/spectra-archive` to merge the spec modifications into the baseline specs directory.

---

## License

This project is licensed under the [MIT License](LICENSE).

***

# 記帳應用程式 (Keep Accounts App)

這是一個以 **Nx monorepo** 建置的現代化個人理財與記帳應用程式。本專案包含一個基於 React 的美觀網頁控制面板、一個 Swift 命令行界面 (CLI) 工具，以及使用 Playwright 的端到端 (E2E) 整合測試。

本專案採用 **Spectra 規格驅動開發 (SDD)** 流程，在進行實作前，會先針對功能規格與變更提案進行建模與設計。

---

## 目錄

- [功能特色](#功能特色-1)
- [專案架構](#專案架構-1)
- [開始使用](#開始使用-1)
- [Spectra SDD 開發流程](#spectra-sdd-開發流程-1)
- [授權條款](#授權條款-1)

---

## 功能特色

### 1. 網頁應用程式 (`apps/web`)
基於 React 的響應式記帳網頁客戶端，提供以下功能：
- **資金組 / 帳戶群組 (Account Groups)**：將資金歸類於不同的群組（例如：日常開銷、投資理財、長期儲蓄）。可自訂 Emoji 表情符號、群組代表色與描述。
- **交易明細管理 (Transactions)**：記錄收入與支出，支援自訂描述、金額、子分類、交易日期及關聯的資金組。
- **動態儀表板 (Dashboard)**：即時顯示財務加總摘要、可用餘額及最新的交易紀錄。
- **進階歷史紀錄與統計**：支援依「日」、「月」、「年」篩選與分組，並包含互動式的分類明細統計。
- **LocalStorage 持久化**：自動將所有記帳資料儲存在瀏覽器本地，無須註冊登入即可使用。

### 2. Swift CLI 輔助工具 (`apps/swift-cli`)
整合在 monorepo 中的 Swift 原生命令列工具結構，用於後續擴充命令列指令整合或桌面輔助小工具。

### 3. E2E 測試套件 (`apps/web-e2e`)
使用 **Playwright** 驅動的端到端整合測試，確保應用程式的關鍵操作流程穩定無虞。

---

## 專案架構

本專案採用 Nx Monorepo 進行專案管理：

```text
keep-accounts-app/
├── apps/
│   ├── web/          # React 19 / Vite / TypeScript 網頁應用程式
│   ├── web-e2e/      # Playwright 端到端 (E2E) 測試套件
│   └── swift-cli/    # Swift CLI 應用程式與 Package 設定
├── openspec/         # Spectra 規格驅動開發 (SDD) 規格書目錄
│   ├── specs/        # 基線規格書 (Baseline)
│   └── changes/      # 功能變更提案 (例如：預算限制 add-budget-limits、統計圖表 add-stats-charts)
├── nx.json           # Nx 工作區設定檔
├── package.json      # Node.js 依賴套件及腳本指令
└── tsconfig.base.json# TypeScript 基礎編譯設定檔
```

---

## 開始使用

### 先決條件

請確保您的開發環境中已安裝以下工具：
- **Node.js** (建議 v18 或以上版本)
- **npm** (或其他 Node 套件管理工具)
- **Swift 工具鏈** (可選，若您要建置或執行 Swift CLI 工具)

### 安裝步驟

複製專案並安裝所有 Node.js 依賴套件：

```bash
npm install
```

### 開發指令

我們使用 Nx 來執行專案中的任務。以下是主要的開發指令：

#### 啟動網頁開發伺客器
啟動本地 Vite 開發伺服器：
```bash
npx nx serve web
```
啟動後可在瀏覽器開啟 `http://localhost:4200`（或 Vite/Nx 指定的連接埠）。

#### 建立生產版本
為網頁應用程式建立最佳化的生產版本：
```bash
npx nx build web
```
產出的靜態檔案會放置於 `dist/apps/web` 目錄中。

#### 執行單元測試
執行網頁應用程式的單元測試：
```bash
npx nx test web
```

#### 執行 E2E 測試
執行 Playwright 端到端整合測試：
```bash
npx nx e2e web-e2e
```

#### 視覺化工作區圖表
檢視 Monorepo 中各個應用程式與函式庫之間的依賴關係：
```bash
npx nx graph
```

---

## Spectra SDD 開發流程

本專案遵循 **規格驅動開發 (Spec-Driven Development, SDD)**。所有規格與提案皆存放於 `openspec/` 目錄中：

- **Specs** (`openspec/specs/`)：記錄系統當前的基線功能與規格。
- **Changes** (`openspec/changes/`)：記錄即將開發的新功能提案（例如：`add-budget-limits` 或 `add-stats-charts`）。

### 開發功能步驟：
1. **討論 / 提案 (Discuss / Propose)**：使用 `/spectra-discuss` 或 `/spectra-propose` 設計規格與變更提案。
2. **套用 (Apply)**：使用 `/spectra-apply` 或 `/spectra-ingest` 實作功能。
3. **歸檔 (Archive)**：功能實作並測試完成後，執行 `/spectra-archive` 將變更合併至基線規格目錄中。

---

## 授權條款

本專案採用 [MIT 授權條款](LICENSE) 進行授權。
