import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Cell,
} from 'recharts';
import {
  CategoryPerformancePoint,
  RegionPerformancePoint,
  StockoutRiskPoint,
  StoreLeaderboardPoint,
  WeeklyTrendPoint,
} from '../types';
import {
  TrendingUp,
  MapPin,
  Layers,
  Award,
  AlertTriangle,
  ChevronRight,
  Info,
} from 'lucide-react';

interface ChartsSectionProps {
  weeklyTrend: WeeklyTrendPoint[];
  regions: RegionPerformancePoint[];
  categories: CategoryPerformancePoint[];
  storeLeaderboard: StoreLeaderboardPoint[];
  stockoutRisks: StockoutRiskPoint[];
  unknownWeekCount?: number;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  weeklyTrend,
  regions,
  categories,
  storeLeaderboard,
  stockoutRisks,
  unknownWeekCount = 0,
}) => {
  const [storeViewMode, setStoreViewMode] = useState<'top5' | 'bottom5' | 'all'>('top5');
  const [stockoutLimit, setStockoutLimit] = useState<number>(8);

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
    return `$${val}`;
  };

  // Prepare Store Leaderboard data based on toggle
  const getFilteredStores = () => {
    if (storeViewMode === 'top5') {
      return storeLeaderboard.slice(0, 5);
    }
    if (storeViewMode === 'bottom5') {
      return [...storeLeaderboard].reverse().slice(0, 5).reverse();
    }
    return storeLeaderboard;
  };

  const displayedStores = getFilteredStores();
  const displayedStockouts = stockoutRisks.slice(0, stockoutLimit);

  // Region colors
  const regionColors: Record<string, string> = {
    North: '#3b82f6',
    South: '#10b981',
    East: '#6366f1',
    West: '#f59e0b',
    Central: '#8b5cf6',
  };

  return (
    <div id="charts-section" className="space-y-6">
      {/* Row 1: Weekly Trend (Full Width or 2/3 + 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Weekly Trend */}
        <div id="chart-weekly-trend" className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  1. Weekly Trend — Net Sales vs. Sales Target
                </h3>
                <p className="text-xs text-slate-500">
                  Weekly chain-wide sales trajectory against planned budget
                </p>
              </div>
            </div>
            <div className="text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              {weeklyTrend.length} Weeks Recorded
            </div>
          </div>

          <div className="h-72 w-full">
            {weeklyTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No weekly data matching the current filter.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={weeklyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="week"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as WeeklyTrendPoint;
                        const variance = data.netSales - data.salesTarget;
                        return (
                          <div className="bg-slate-900 text-white rounded-lg p-3 text-xs shadow-xl border border-slate-800 space-y-1">
                            <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
                              Week of {data.week}
                            </div>
                            <div className="flex justify-between gap-4 pt-1">
                              <span className="text-blue-300">Net Sales:</span>
                              <span className="font-mono font-medium">${data.netSales.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Target:</span>
                              <span className="font-mono font-medium">${data.salesTarget.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-4 pt-1 border-t border-slate-700 font-semibold">
                              <span>Attainment:</span>
                              <span className={data.achievementPct >= 100 ? 'text-emerald-400' : 'text-rose-400'}>
                                {data.achievementPct}% ({variance >= 0 ? `+$${variance.toLocaleString()}` : `-$${Math.abs(variance).toLocaleString()}`})
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
                  />
                  <Bar
                    dataKey="netSales"
                    name="Net Sales ($)"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                  <Line
                    type="monotone"
                    dataKey="salesTarget"
                    name="Sales Target ($)"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={{ r: 4, fill: '#f97316' }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
          {unknownWeekCount > 0 && (
            <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/90 border border-amber-200/80 text-amber-800 text-[11px] leading-snug">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                <strong>Note:</strong> {unknownWeekCount} record with unparseable date (Unknown week) is excluded from the chronological trend chart, but remains fully accounted for in KPIs, regional totals, and the data ledger.
              </span>
            </div>
          )}
        </div>

        {/* Chart 2: Sales by Region */}
        <div id="chart-sales-region" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  2. Sales by Region
                </h3>
                <p className="text-xs text-slate-500">
                  Regional revenue & target achievement
                </p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            {regions.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No regional data in view.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regions}
                  layout="vertical"
                  margin={{ top: 10, right: 25, left: 15, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={formatCurrency}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="region"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload as RegionPerformancePoint;
                        return (
                          <div className="bg-slate-900 text-white rounded-lg p-3 text-xs shadow-xl border border-slate-800 space-y-1">
                            <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
                              {d.region} Region ({d.storesCount} Stores)
                            </div>
                            <div className="flex justify-between gap-4 pt-1">
                              <span className="text-emerald-400">Net Sales:</span>
                              <span className="font-mono">${d.netSales.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Target:</span>
                              <span className="font-mono">${d.salesTarget.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-4 pt-1 border-t border-slate-700 font-semibold">
                              <span>Attainment:</span>
                              <span className={d.achievementPct >= 100 ? 'text-emerald-400' : 'text-amber-400'}>
                                {d.achievementPct}%
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="netSales"
                    name="Net Sales"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={22}
                  >
                    {regions.map((entry) => (
                      <Cell
                        key={`cell-${entry.region}`}
                        fill={regionColors[entry.region] || '#3b82f6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Category Performance & Store Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Category Performance */}
        <div id="chart-category-performance" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-md">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  3. Category Performance & Share
                </h3>
                <p className="text-xs text-slate-500">
                  Net sales by product category with return rate context
                </p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            {categories.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No category data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categories}
                  margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="category"
                    stroke="#94a3b8"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload as CategoryPerformancePoint;
                        return (
                          <div className="bg-slate-900 text-white rounded-lg p-3 text-xs shadow-xl border border-slate-800 space-y-1">
                            <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
                              {d.category}
                            </div>
                            <div className="flex justify-between gap-4 pt-1">
                              <span className="text-blue-300">Net Sales:</span>
                              <span className="font-mono font-medium">${d.netSales.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Share of Total:</span>
                              <span className="font-mono font-medium">{d.sharePct}%</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Target Attainment:</span>
                              <span className="font-mono font-medium">{d.achievementPct}%</span>
                            </div>
                            <div className="flex justify-between gap-4 pt-1 border-t border-slate-700">
                              <span className="text-rose-400">Return Rate:</span>
                              <span className="font-mono text-rose-300 font-semibold">{d.returnRatePct}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="netSales"
                    name="Net Sales ($)"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Store Leaderboard */}
        <div id="chart-store-leaderboard" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  4. Store Leaderboard & Target Achievement
                </h3>
                <p className="text-xs text-slate-500">
                  Ranked revenue and goal accomplishment across stores
                </p>
              </div>
            </div>

            {/* Toggle Controls */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium text-slate-600">
              <button
                type="button"
                onClick={() => setStoreViewMode('top5')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  storeViewMode === 'top5'
                    ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                Top 5
              </button>
              <button
                type="button"
                onClick={() => setStoreViewMode('bottom5')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  storeViewMode === 'bottom5'
                    ? 'bg-white text-rose-700 shadow-xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                Bottom 5
              </button>
              <button
                type="button"
                onClick={() => setStoreViewMode('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  storeViewMode === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                All ({storeLeaderboard.length})
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            {displayedStores.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No stores matching filter.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayedStores}
                  layout="vertical"
                  margin={{ top: 5, right: 35, left: 45, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={formatCurrency}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="storeName"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: '#334155' }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                    tickFormatter={(val) => (val.length > 14 ? `${val.substring(0, 13)}…` : val)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload as StoreLeaderboardPoint;
                        return (
                          <div className="bg-slate-900 text-white rounded-lg p-3 text-xs shadow-xl border border-slate-800 space-y-1">
                            <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
                              {d.storeName} ({d.storeId})
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {d.region} Region • {d.city} • {d.format}
                            </div>
                            <div className="flex justify-between gap-4 pt-1">
                              <span className="text-blue-300">Net Sales:</span>
                              <span className="font-mono font-medium">${d.netSales.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Sales Target:</span>
                              <span className="font-mono font-medium">${d.salesTarget.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-4 pt-1 border-t border-slate-700 font-semibold">
                              <span>Target Attainment:</span>
                              <span className={d.achievementPct >= 100 ? 'text-emerald-400' : 'text-rose-400'}>
                                {d.achievementPct}%
                              </span>
                            </div>
                            <div className="flex justify-between gap-4 text-[11px] text-slate-300">
                              <span>ATV: ${d.atv}</span>
                              <span>Stockouts: {d.stockouts}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="netSales"
                    name="Net Sales"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={20}
                  >
                    {displayedStores.map((entry) => (
                      <Cell
                        key={`store-cell-${entry.storeId}`}
                        fill={entry.achievementPct >= 100 ? '#10b981' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Stockout Risk (Required Chart 5) */}
      <div id="chart-stockout-risk" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-md">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                5. Stockout Risk & Replenishment Urgency
              </h3>
              <p className="text-xs text-slate-500">
                Stores and product categories where stockouts &gt; 0 or inventory is low relative to sales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Displaying:</span>
            <select
              aria-label="Stockout rows limit"
              value={stockoutLimit}
              onChange={(e) => setStockoutLimit(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-medium"
            >
              <option value={5}>Top 5 Incidents</option>
              <option value={8}>Top 8 Incidents</option>
              <option value={15}>Top 15 Incidents</option>
              <option value={50}>All Incidents ({stockoutRisks.length})</option>
            </select>
          </div>
        </div>

        {displayedStockouts.length === 0 ? (
          <div className="py-12 bg-emerald-50/50 rounded-lg border border-emerald-200 text-center space-y-1">
            <div className="font-semibold text-emerald-800 text-sm">Optimal Inventory Health</div>
            <p className="text-xs text-emerald-600">
              No stockouts or critical inventory depletion detected across currently filtered records.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Chart Column */}
            <div className="lg:col-span-2 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={displayedStockouts}
                  margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="key"
                    stroke="#94a3b8"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    tickFormatter={(val) => {
                      const parts = val.split('__');
                      return `${parts[0].slice(0, 10)}.. (${parts[1]})`;
                    }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#f43f5e"
                    tick={{ fontSize: 10, fill: '#f43f5e' }}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Stockout Incidents', angle: -90, position: 'insideLeft', fill: '#f43f5e', fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#0284c7"
                    tick={{ fontSize: 10, fill: '#0284c7' }}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Inventory on Hand', angle: 90, position: 'insideRight', fill: '#0284c7', fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload as StockoutRiskPoint;
                        return (
                          <div className="bg-slate-900 text-white rounded-lg p-3 text-xs shadow-xl border border-slate-800 space-y-1">
                            <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
                              {d.storeName} — {d.category}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Region: {d.region}
                            </div>
                            <div className="flex justify-between gap-4 pt-1">
                              <span className="text-rose-400 font-medium">Stockout Count:</span>
                              <span className="font-mono font-bold text-rose-300">{d.stockouts}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-sky-300">Inventory on Hand:</span>
                              <span className="font-mono font-medium">{d.inventoryOnHand.toLocaleString('en-US')} units</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Total Units Sold:</span>
                              <span className="font-mono font-medium">{d.unitsSold.toLocaleString('en-US')} units</span>
                            </div>
                            <div className="pt-1 border-t border-slate-700 flex justify-between font-semibold">
                              <span>Risk Status:</span>
                              <span
                                className={
                                  d.riskLevel === 'Critical'
                                    ? 'text-rose-400'
                                    : d.riskLevel === 'Warning'
                                    ? 'text-amber-400'
                                    : 'text-slate-300'
                                }
                              >
                                {d.riskLevel}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} />
                  <Bar
                    yAxisId="left"
                    dataKey="stockouts"
                    name="Stockouts"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="inventoryOnHand"
                    name="Inventory On Hand"
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#0284c7' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Urgent Action List */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2.5">
              <div className="font-semibold text-slate-800 flex items-center justify-between pb-2 border-b border-slate-200">
                <span>Immediate Restock Checklist</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {stockoutRisks.length} Total flagged
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {displayedStockouts.slice(0, 5).map((item) => (
                  <div
                    key={`risk-alert-${item.key}`}
                    className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 truncate max-w-[170px]">
                        {item.storeName}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {item.category} • {item.region}
                      </div>
                      <div className="text-slate-600 mt-1 flex items-center gap-2">
                        <span>Inv: <strong>{item.inventoryOnHand.toLocaleString('en-US')}</strong></span>
                        <span>•</span>
                        <span>Sold: <strong>{item.unitsSold.toLocaleString('en-US')}</strong></span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.riskLevel === 'Critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {item.stockouts} Stockouts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
