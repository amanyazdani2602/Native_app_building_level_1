import React, { useState, useMemo } from 'react';
import {
  Store,
  Upload,
  BarChart3,
  Table as TableIcon,
  Sparkles,
  Download,
  AlertCircle,
  FileSpreadsheet,
  Building2,
  CheckCircle2,
  RefreshCw,
  Trash2,
  FileCheck,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { FilterState, MergedRetailRecord, RawSalesRecord, StoreMasterRecord } from './types';
import { joinSalesAndStoreMaster } from './utils/excelParser';
import { generateSampleDataset } from './utils/sampleDataGenerator';
import {
  applyFilters,
  computeCategoryPerformance,
  computeKpiMetrics,
  computeSalesByRegion,
  computeStockoutRisks,
  computeStoreLeaderboard,
  computeWeeklyTrend,
  generateBusinessInsights,
} from './utils/calculations';
import { FileUploader } from './components/FileUploader';
import { FilterBar } from './components/FilterBar';
import { KpiSection } from './components/KpiSection';
import { ChartsSection } from './components/ChartsSection';
import { InsightSummary } from './components/InsightSummary';
import { FilteredDataTable } from './components/FilteredDataTable';
import { exportFilteredDataToCsv } from './utils/exporter';

export default function App() {
  // Empty on launch - user uploads their Excel files or clicks sample load
  const [rawSales, setRawSales] = useState<RawSalesRecord[]>([]);
  const [storeMaster, setStoreMaster] = useState<StoreMasterRecord[]>([]);
  const [mergedRecords, setMergedRecords] = useState<MergedRetailRecord[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    weeks: [],
    regions: [],
    stores: [],
    cities: [],
    storeFormats: [],
    categories: [],
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'table'>('dashboard');
  const [showUploaderModal, setShowUploaderModal] = useState<boolean>(false);
  const [isDemoDataLoaded, setIsDemoDataLoaded] = useState<boolean>(false);

  // Handle uploaded Excel files
  const handleDataLoaded = (sales: RawSalesRecord[], master: StoreMasterRecord[]) => {
    const merged = joinSalesAndStoreMaster(sales, master);
    setRawSales(sales);
    setStoreMaster(master);
    setMergedRecords(merged);
    setIsDemoDataLoaded(false);
    setShowUploaderModal(false);
    // Reset filters
    setFilters({
      weeks: [],
      regions: [],
      stores: [],
      cities: [],
      storeFormats: [],
      categories: [],
    });
  };

  // Optional: load 20-store sample dataset
  const handleLoadSampleDataset = () => {
    const sample = generateSampleDataset();
    setRawSales(sample.sales);
    setStoreMaster(sample.storeMaster);
    setMergedRecords(sample.merged);
    setIsDemoDataLoaded(true);
    setShowUploaderModal(false);
    setFilters({
      weeks: [],
      regions: [],
      stores: [],
      cities: [],
      storeFormats: [],
      categories: [],
    });
  };

  // Clear data back to empty launch state
  const handleClearData = () => {
    setRawSales([]);
    setStoreMaster([]);
    setMergedRecords([]);
    setIsDemoDataLoaded(false);
    setFilters({
      weeks: [],
      regions: [],
      stores: [],
      cities: [],
      storeFormats: [],
      categories: [],
    });
  };

  // 1. Filtered subset
  const filteredRecords = useMemo(() => {
    return applyFilters(mergedRecords, filters);
  }, [mergedRecords, filters]);

  // 2. Computed KPIs
  const kpis = useMemo(() => {
    return computeKpiMetrics(filteredRecords);
  }, [filteredRecords]);

  // 3. Computed Charts data
  const weeklyTrend = useMemo(() => {
    return computeWeeklyTrend(filteredRecords);
  }, [filteredRecords]);

  const regionPerformance = useMemo(() => {
    return computeSalesByRegion(filteredRecords);
  }, [filteredRecords]);

  const categoryPerformance = useMemo(() => {
    return computeCategoryPerformance(filteredRecords);
  }, [filteredRecords]);

  const storeLeaderboard = useMemo(() => {
    return computeStoreLeaderboard(filteredRecords);
  }, [filteredRecords]);

  const stockoutRisks = useMemo(() => {
    return computeStockoutRisks(filteredRecords);
  }, [filteredRecords]);

  const unknownWeekCount = useMemo(() => {
    return filteredRecords.filter((r) => r.week_start_date === 'Unknown').length;
  }, [filteredRecords]);

  // 4. Auto-generated Business Insights
  const businessInsights = useMemo(() => {
    return generateBusinessInsights(
      filteredRecords,
      kpis,
      regionPerformance,
      categoryPerformance,
      storeLeaderboard,
      stockoutRisks
    );
  }, [
    filteredRecords,
    kpis,
    regionPerformance,
    categoryPerformance,
    storeLeaderboard,
    stockoutRisks,
  ]);

  const hasData = mergedRecords.length > 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Brand / Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-white tracking-tight">
                    Retail Sales Intelligence
                  </h1>
                  {hasData && isDemoDataLoaded && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      Demo Mode (20 Stores)
                    </span>
                  )}
                  {hasData && !isDemoDataLoaded && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                      <FileCheck className="w-3 h-3" />
                      Live Custom Files
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  {hasData ? (
                    <>
                      <span>{mergedRecords.length.toLocaleString()} weekly records loaded</span>
                      <span>•</span>
                      <span>{new Set(mergedRecords.map((r) => r.region)).size} Regions</span>
                      <span>•</span>
                      <span>{new Set(mergedRecords.map((r) => r.store_id)).size} Stores</span>
                    </>
                  ) : (
                    <span>Awaiting Excel Data Ingestion • Client-Side Only</span>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation & Action Buttons */}
            <div className="flex items-center gap-2">
              {hasData ? (
                <>
                  {/* View Tabs */}
                  <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setActiveTab('dashboard')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                        activeTab === 'dashboard'
                          ? 'bg-blue-600 text-white shadow-xs font-semibold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('table')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                        activeTab === 'table'
                          ? 'bg-blue-600 text-white shadow-xs font-semibold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                      <span>Data Ledger</span>
                    </button>
                  </div>

                  {/* Upload New Files */}
                  <button
                    id="header-upload-btn"
                    type="button"
                    onClick={() => setShowUploaderModal(!showUploaderModal)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden md:inline">Change / Upload Files</span>
                    <span className="md:hidden">Upload</span>
                  </button>

                  {/* Clear Data */}
                  <button
                    id="header-clear-btn"
                    type="button"
                    onClick={handleClearData}
                    className="inline-flex items-center gap-1 px-2.5 py-2 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
                    title="Clear uploaded data"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick CSV Export */}
                  <button
                    id="header-export-btn"
                    type="button"
                    onClick={() => exportFilteredDataToCsv(filteredRecords)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    title="Export Filtered CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Export CSV</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleLoadSampleDataset}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Sample Demo Data</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {!hasData ? (
          /* Clean Empty State on Initial Launch */
          <div id="initial-empty-state" className="space-y-6">
            <FileUploader
              onDataLoaded={handleDataLoaded}
              hasLoadedData={false}
            />

            {/* Ingestion & Join Explanation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1.5">
                  1. Weekly Sales File
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Upload <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono text-[11px]">retail_weekly_sales.xlsx</code> with sales targets, transactions, footfall, gross and net sales, returns, and inventory counts.
                </p>
                <div className="text-[11px] text-slate-500">
                  Key column: <strong className="text-slate-700">store_id</strong>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1.5">
                  2. Store Master File
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Upload <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-[11px]">store_master.xlsx</code> containing store names, regions (North, South, East, West, Central), city, and format.
                </p>
                <div className="text-[11px] text-slate-500">
                  Joined on: <strong className="text-slate-700">store_id</strong>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1.5">
                  3. In-Browser Privacy
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Zero external server or cloud uploads. All parsing, calculations, date conversions, and chart visualizations run 100% client-side inside your browser session.
                </p>
                <div className="text-[11px] text-emerald-700 font-medium">
                  Instant processing • Safe & Private
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Data Loaded View */
          <>
            {/* Upload Modal Drawer if toggled */}
            {showUploaderModal && (
              <div className="mb-6">
                <FileUploader
                  onDataLoaded={handleDataLoaded}
                  hasLoadedData={true}
                  onClose={() => setShowUploaderModal(false)}
                />
              </div>
            )}

            {/* Operational Filter Bar */}
            <FilterBar
              records={mergedRecords}
              filters={filters}
              onFilterChange={setFilters}
              filteredCount={filteredRecords.length}
              totalCount={mergedRecords.length}
            />

            {/* Empty state if filter yields zero rows */}
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  No matching retail records found
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  The selected combination of filters returned 0 records. Try resetting one or more filter selections.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      weeks: [],
                      regions: [],
                      stores: [],
                      cities: [],
                      storeFormats: [],
                      categories: [],
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <>
                {/* View Switcher: Dashboard or Table */}
                {activeTab === 'dashboard' ? (
                  <div className="space-y-6">
                    {/* 1. KPI Cards */}
                    <KpiSection kpis={kpis} />

                    {/* 2. Business Insights Summary (Auto-Generated from Filtered Data) */}
                    <InsightSummary
                      insights={businessInsights}
                      filteredRecords={filteredRecords}
                    />

                    {/* 3. The 5 Core Charts */}
                    <ChartsSection
                      weeklyTrend={weeklyTrend}
                      regions={regionPerformance}
                      categories={categoryPerformance}
                      storeLeaderboard={storeLeaderboard}
                      stockoutRisks={stockoutRisks}
                      unknownWeekCount={unknownWeekCount}
                    />
                  </div>
                ) : (
                  /* Data Table View */
                  <FilteredDataTable records={filteredRecords} />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Retail Sales Intelligence</strong> • Built for Store & Regional Leadership
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Client-side parsing & analytical engine</span>
            {hasData && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleClearData}
                  className="text-rose-600 hover:underline cursor-pointer"
                >
                  Clear Data & Reset
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
