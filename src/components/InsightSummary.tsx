import React from 'react';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileText,
  Download,
  CheckCircle,
  PackageX,
  Store,
  Compass,
} from 'lucide-react';
import { BusinessInsights, MergedRetailRecord } from '../types';
import {
  exportFilteredDataToCsv,
  exportInsightsToCsv,
  exportInsightsToText,
} from '../utils/exporter';

interface InsightSummaryProps {
  insights: BusinessInsights;
  filteredRecords: MergedRetailRecord[];
}

export const InsightSummary: React.FC<InsightSummaryProps> = ({
  insights,
  filteredRecords,
}) => {
  return (
    <div id="business-insights-summary" className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Header with Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Executive Business Intelligence & Strategic Insights
            </h2>
            <p className="text-xs text-slate-500">
              Auto-generated diagnosis for store and regional managers from currently filtered data
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="export-filtered-csv-btn"
            type="button"
            onClick={() => exportFilteredDataToCsv(filteredRecords)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Filtered Data (CSV)</span>
          </button>

          <button
            id="export-insights-txt-btn"
            type="button"
            onClick={() => exportInsightsToText(insights)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Insights (.TXT)</span>
          </button>

          <button
            id="export-insights-csv-btn"
            type="button"
            onClick={() => exportInsightsToCsv(insights)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Insights (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Auto-Generated High-Level Takeaways */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          <Compass className="w-4 h-4 text-blue-600" />
          <span>Operational Takeaways for Leadership</span>
        </div>
        <ul className="space-y-2 text-xs text-slate-700">
          {insights.summaryNarratives.map((item, idx) => (
            <li key={`narrative-${idx}`} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 3 Pillars of Actionable Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1: Regional Benchmarks */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
              Regional Benchmarks
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Best Region by Sales */}
            <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg">
              <div className="text-[11px] font-medium text-emerald-800">
                Top Region by Net Sales
              </div>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="font-bold text-slate-900 text-sm">
                  {insights.bestRegionBySales?.region || 'N/A'}
                </span>
                <span className="font-mono font-semibold text-emerald-700">
                  ${insights.bestRegionBySales?.netSales.toLocaleString() || '0'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Target Attainment: <strong>{insights.bestRegionBySales?.achievementPct}%</strong>
              </div>
            </div>

            {/* Worst Region by Sales */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[11px] font-medium text-slate-500">
                Lowest Volume Region
              </div>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="font-bold text-slate-900 text-sm">
                  {insights.worstRegionBySales?.region || 'N/A'}
                </span>
                <span className="font-mono font-semibold text-slate-700">
                  ${insights.worstRegionBySales?.netSales.toLocaleString() || '0'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Target Attainment: <strong>{insights.worstRegionBySales?.achievementPct}%</strong>
              </div>
            </div>

            {/* Worst Region by Target */}
            {insights.worstRegionByTarget && (
              <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg">
                <div className="text-[11px] font-medium text-amber-800">
                  Lowest Target Attainment
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="font-bold text-slate-900 text-sm">
                    {insights.worstRegionByTarget.region}
                  </span>
                  <span className="font-semibold text-amber-700">
                    {insights.worstRegionByTarget.achievementPct}%
                  </span>
                </div>
                <div className="text-[11px] text-amber-900/80 mt-1">
                  Budget Shortfall: ${Math.abs(insights.worstRegionByTarget.netSales - insights.worstRegionByTarget.salesTarget).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pillar 2: Stores Missing Target (<100%) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                Stores Missing Target (&lt;100%)
              </h3>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                insights.storesMissingTarget.length > 0
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {insights.storesMissingTarget.length} Stores
            </span>
          </div>

          <div className="space-y-2 text-xs max-h-56 overflow-y-auto pr-1">
            {insights.storesMissingTarget.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-center text-emerald-800">
                <CheckCircle className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <div className="font-semibold text-xs">All Targets Achieved!</div>
                <div className="text-[11px] text-emerald-600">Every store in view hit &gt;=100% of sales budget.</div>
              </div>
            ) : (
              insights.storesMissingTarget.map((store) => {
                const shortfall = store.salesTarget - store.netSales;
                return (
                  <div
                    key={`missing-store-${store.storeId}`}
                    className="p-2.5 bg-rose-50/40 border border-rose-200 rounded-lg flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 truncate max-w-[150px]">
                        {store.storeName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {store.region} • {store.format}
                      </div>
                      <div className="text-[11px] text-rose-700 mt-1 font-medium">
                        Shortfall: -${shortfall.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-rose-600">
                        {store.achievementPct}%
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Target: ${(store.salesTarget / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pillar 3: High Return Categories & Inventory Alerts */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <PackageX className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
              High Return Categories & Margin Risk
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            {insights.highReturnCategories.map((cat, i) => (
              <div
                key={`cat-return-${cat.category}`}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span>{cat.category}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Returns: ${cat.returnsAmount.toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                      cat.returnRatePct > 5
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cat.returnRatePct}%
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">Return Rate</div>
                </div>
              </div>
            ))}

            {/* Quick guidance note */}
            <div className="p-2.5 bg-indigo-50/60 border border-indigo-200 rounded-lg text-indigo-950 text-[11px] leading-relaxed">
              <strong>Manager Action:</strong> Investigate categories exceeding 5.0% return rate for supplier defects, fit issues, or misleading online tags.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
