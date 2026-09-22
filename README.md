# Retail Sales Intelligence

> Action-oriented sales analytics and store performance intelligence dashboard engineered for retail store managers, regional directors, and commercial leadership.

![React 19](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.x-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-3.x-22c55e)

---

## 📋 Overview

**Retail Sales Intelligence** provides real-time visibility into multi-store retail operations. It ingests complex Excel workbooks containing weekly store transactions and master metadata, performs deterministic client-side joins on `store_id`, and transforms disparate operational data into executive KPIs, interactive charts, auto-generated business insights, and an actionable data ledger.

All data parsing and analytics execute **100% client-side in the browser**—no sensitive retail metrics or store records leave your machine.

---

## ✨ Key Features

### 1. Robust Excel Parsing & Join Engine
- **Multi-File & Multi-Sheet Flexibility**: Supports either a single `.xlsx` workbook containing two sheets (`Sales` and `Store Master`) or two separate uploaded workbooks.
- **Intelligent Header Aliasing**: Auto-maps diverse column naming conventions (e.g., `store_id`, `Store ID`, `storeId`, `week_start_date`, `Week`, `Sales Target`, `inventory_on_hand`, `Stockouts`, etc.).
- **Dual Date Normalization**: Seamlessly parses both Excel numeric date serials (e.g., `46125`) and formatted text strings (`dd-MM-yyyy`, `dd/MM/yyyy`, `yyyy-MM-dd`), standardizing all valid weeks to `DD MMM YYYY` (e.g., `13 Apr 2026`).
- **Graceful Error Handling**: Unparseable rows (such as literal `"invalid-date"`) are bucketed as `"Unknown"`, preserved in the ledger, and safely excluded from timeline charts without breaking the analytics engine.

### 2. Executive KPI Metrics Strip
- **Net Sales**: Total revenue generated (`SUM(net_sales)`).
- **Target Achievement %**: Overall achievement rate (`SUM(net_sales) / SUM(sales_target) * 100`) with visual threshold indicators.
- **Conversion Rate %**: Shopper-to-buyer conversion (`SUM(transactions) / SUM(footfall) * 100`).
- **Average Transaction Value (ATV)**: Average basket spend (`SUM(net_sales) / SUM(transactions)`).
- **Inventory On Hand**: Accurate unit volume (`SUM(inventory_on_hand)`) formatted with thousands separators (`879,700 units`).
- **Stockout Risk Indicator**: Incident count where `stockouts > 0` or `inventory_on_hand < units_sold`.
- **Return Rate %**: Return drag on sales (`SUM(returns_amount) / SUM(net_sales) * 100`).
- **Discount Depth %**: Promotional markdown impact (`SUM(discount_amount) / SUM(gross_sales) * 100`).

### 3. Interactive Visual Analytics (Recharts)
- **Weekly Sales vs. Target Trend**: Dual-axis line and bar chart plotted in strict chronological order with achievement badges.
- **Regional Performance & Target Variance**: Comparative bar chart visualizing sales vs. target across operational regions.
- **Category Sales Mix & Discount Penetration**: Category breakdown analyzing volume against promotional discounting.
- **Top & Bottom Store Leaderboard**: Ranking top-performing locations and highlighting stores requiring targeted intervention.
- **Stockout vs. Inventory Risk Matrix**: Scatter matrix mapping inventory levels against stockout frequency to flag replenishment emergencies.

### 4. Multi-Dimensional Filter Bar
- Filter simultaneously across **Weeks** (with quick presets for "Latest Week" and "Last 4 Weeks"), **Regions**, **Stores**, **Cities**, **Store Formats**, and **Product Categories**.
- Active filter tags with single-click dismissal and full filter reset.
- Live record counter reflecting the filtered subset vs. total dataset.

### 5. Automated Operational Insights
- Auto-generates narrative bullet points summarizing performance highs, underperforming units, critical stockout alerts, and promotional margin leakage based on the active filtered slice.

### 6. Filtered Data Ledger & Export
- Searchable, sortable tabular view with pagination (25, 50, 100, 250 rows).
- Formatted status badges for target achievement and stockout flags.
- Comprehensive summary footer displaying column totals for the filtered view.
- **One-click CSV Export** of the exact filtered dataset.

---

## 📐 Data Contracts & Spreadsheet Schema

The application expects data across two primary schemas (either on separate sheets or separate Excel files):

### 1. Weekly Sales Performance Table
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `store_id` | String | Unique store identifier (foreign key to Store Master) |
| `week_start_date` | Date / Serial / String | Week starting date (Excel serial number or `dd-MM-yyyy`) |
| `product_category` | String | Merchandise category (e.g., Electronics, Apparel, Grocery) |
| `footfall` | Number | Store visitor count |
| `transactions` | Number | Total completed checkout transactions |
| `units_sold` | Number | Total physical units purchased |
| `gross_sales` | Number | Pre-discount sales total ($) |
| `discount_amount` | Number | Markdown or promotional discount value ($) |
| `net_sales` | Number | Net revenue realized ($) |
| `sales_target` | Number | Target revenue budget ($) |
| `inventory_on_hand` | Number | Physical stock units available at week start |
| `stockouts` | Number | Count of zero-stock incidents / stockout events |
| `returns_amount` | Number | Value of customer merchandise returns ($) |
| `customer_rating` | Number | Average customer satisfaction score (1.0 – 5.0) |
| `marketing_spend` | Number | Store-level marketing expenditure ($) |

### 2. Store Master Table
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `store_id` | String | Unique store identifier (primary key) |
| `store_name` | String | Commercial store display name |
| `region` | String | Geographic operating region (e.g., North, West, South, East) |
| `city` | String | Municipal city location |
| `store_format` | String | Store format classification (e.g., Flagship, Express, Hypermarket) |
| `manager_name` | String | Store general manager name (optional) |

---

## 🧮 Mathematical KPI Formulas

To ensure absolute auditability and analytical consistency, all dashboard metrics adhere strictly to verified retail formulas:

$$
\text{Target Achievement \%} = \frac{\sum \text{net\_sales}}{\sum \text{sales\_target}} \times 100
$$

$$
\text{Conversion Rate \%} = \frac{\sum \text{transactions}}{\sum \text{footfall}} \times 100
$$

$$
\text{Average Transaction Value (ATV)} = \frac{\sum \text{net\_sales}}{\sum \text{transactions}}
$$

$$
\text{Discount Depth \%} = \frac{\sum \text{discount\_amount}}{\sum \text{gross\_sales}} \times 100
$$

$$
\text{Return Rate \%} = \frac{\sum \text{returns\_amount}}{\sum \text{net\_sales}} \times 100
$$

$$
\text{Inventory On Hand} = \sum \text{inventory\_on\_hand}
$$

$$
\text{Stockout Risk Event} = (\text{stockouts} > 0) \lor (\text{inventory\_on\_hand} < \text{units\_sold})
$$

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` (v9+) or `bun` / `yarn` / `pnpm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/retail-sales-intelligence.git
   cd retail-sales-intelligence
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Launch the development server:**
   ```bash
   npm run dev
   ```
   The application will boot at `http://localhost:3000`.

### Production Build & Verification

- **Lint codebase for type safety:**
  ```bash
  npm run lint
  ```

- **Build optimized production bundle:**
  ```bash
  npm run build
  ```

- **Preview the production build locally:**
  ```bash
  npm run preview
  ```

---

## 🗂️ Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── components/         # Modular React UI components
│   │   ├── ChartsSection.tsx       # 5 core analytical Recharts visualizations
│   │   ├── FileUploader.tsx        # Drag-and-drop Excel file parser & validator
│   │   ├── FilterBar.tsx           # Multi-dimensional operational filter bar
│   │   ├── FilteredDataTable.tsx   # Searchable, paginated data ledger with summary footer
│   │   ├── InsightSummary.tsx      # Automated narrative business insights
│   │   └── KpiSection.tsx          # Executive KPI cards & formula transparency drawer
│   ├── utils/              # Pure business logic and calculation helpers
│   │   ├── calculations.ts         # Deterministic KPI & chart aggregation functions
│   │   ├── excelParser.ts          # SheetJS workbook parser, date normalizer, and joiner
│   │   ├── exporter.ts             # CSV generation and text summary export
│   │   └── sampleDataGenerator.ts  # 20-store sample realistic retail dataset
│   ├── types.ts            # TypeScript interfaces, schemas, and filter definitions
│   ├── App.tsx             # Main dashboard orchestration and state container
│   ├── main.tsx            # React application entry point
│   └── index.css           # Global stylesheet and Tailwind CSS v4 setup
├── index.html              # HTML5 entry shell and metadata
├── metadata.json           # Application identity configuration
├── package.json            # Dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build and plugin configuration
```

---

## 🔒 Security & Privacy

- **Client-Side Processing**: Excel files uploaded via drag-and-drop are evaluated purely in memory within the client browser session using SheetJS.
- **Zero Data Ingestion**: No sales records, financial figures, or store identifiers are persisted to external databases or relayed over unencrypted endpoints.
- **Air-Gapped Ready**: Operates seamlessly without external internet connectivity once static assets are cached.

---

## 📄 License

This project is licensed under the MIT License.
