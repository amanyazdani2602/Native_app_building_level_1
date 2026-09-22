import React, { useState } from 'react';
import {
  DollarSign,
  Target,
  ShoppingBag,
  RotateCcw,
  Percent,
  TrendingUp,
  AlertOctagon,
  Users,
  Package,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { KpiMetrics } from '../types';

interface KpiSectionProps {
  kpis: KpiMetrics;
}

export const KpiSection: React.FC<KpiSectionProps> = ({ kpis }) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k`;
    return `$${Math.round(val).toLocaleString()}`;
  };

  const formatNumber = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}k`;
    return Math.round(val).toLocaleString();
  };

  const achievement = kpis.targetAchievementPct;
  const isTargetAchieved = achievement >= 100;
  const targetVariance = kpis.totalNetSales - kpis.totalSalesTarget;

  return (
    <div id="kpi-section" className="space-y-4">
      {/* Formula Transparency Toggle Bar */}
      <div className="flex items-center justify-between bg-white px-4 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-50 text-blue-600 rounded">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-800">Operational Formulas Active</span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className="hidden sm:inline text-slate-500">
            Strict adherence to chain retail accounting definitions
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowFormulaDetails(!showFormulaDetails)}
          className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
        >
          <span>{showFormulaDetails ? 'Hide Formulas' : 'View Formula Ledger'}</span>
          {showFormulaDetails ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Expanded Formula Ledger */}
      {showFormulaDetails && (
        <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800 text-xs grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 shadow-md animate-in fade-in duration-200">
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <span className="text-blue-400 font-semibold block mb-0.5">Net Sales</span>
            <code className="text-[11px] font-mono text-emerald-400">SUM(net_sales)</code>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <span className="text-blue-400 font-semibold block mb-0.5">Target Achievement %</span>
            <code className="text-[11px] font-mono text-emerald-400">SUM(net_sales) / SUM(sales_target) * 100</code>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <span className="text-blue-400 font-semibold block mb-0.5">Average Transaction Value (ATV)</span>
            <code className="text-[11px] font-mono text-emerald-400">SUM(net_sales) / SUM(transactions)</code>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <span className="text-blue-400 font-semibold block mb-0.5">Return Rate %</span>
            <code className="text-[11px] font-mono text-emerald-400">SUM(returns_amount) / SUM(net_sales) * 100</code>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <span className="text-blue-400 font-semibold block mb-0.5">Discount Rate %</span>
            <code className="text-[11px] font-mono text-emerald-400">SUM(discount_amount) / SUM(gross_sales) * 100</code>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <span className="text-blue-400 font-semibold block mb-0.5">Conversion Rate %</span>
            <code className="text-[11px] font-mono text-emerald-400">SUM(transactions) / SUM(footfall) * 100</code>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <span className="text-blue-400 font-semibold block mb-0.5">Inventory On Hand</span>
            <code className="text-[11px] font-mono text-emerald-400">SUM(inventory_on_hand)</code>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 lg:col-span-2">
            <span className="text-blue-400 font-semibold block mb-0.5">Stockout Indicator</span>
            <code className="text-[11px] font-mono text-amber-300">
              stockouts &gt; 0 OR (inventory_on_hand &lt; units_sold)
            </code>
          </div>
        </div>
      )}

      {/* Primary KPI Grid (5 Core Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Net Sales */}
        <div id="kpi-net-sales" className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Net Sales
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  SUM(net_sales)
                </span>
              </div>
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              ${kpis.totalNetSales.toLocaleString()}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Target: {formatCurrency(kpis.totalSalesTarget)}</span>
            <span
              className={`font-semibold inline-flex items-center ${
                targetVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {targetVariance >= 0 ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  +${Math.round(targetVariance).toLocaleString()}
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                  -${Math.abs(Math.round(targetVariance)).toLocaleString()}
                </>
              )}
            </span>
          </div>
        </div>

        {/* 2. Target Achievement % */}
        <div id="kpi-target-achievement" className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Target Achievement
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  SUM(net) / SUM(target) * 100
                </span>
              </div>
              <div
                className={`p-1.5 rounded-lg ${
                  isTargetAchieved
                    ? 'bg-emerald-50 text-emerald-600'
                    : achievement >= 90
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <div
                className={`text-2xl font-bold tracking-tight ${
                  isTargetAchieved
                    ? 'text-emerald-700'
                    : achievement >= 90
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {achievement.toFixed(1)}%
              </div>
              <span className="text-xs font-medium text-slate-500">
                {isTargetAchieved ? 'On Pace' : 'Lagging'}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100">
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isTargetAchieved
                    ? 'bg-emerald-500'
                    : achievement >= 90
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, achievement))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>0%</span>
              <span className="font-semibold text-slate-700">100% Goal</span>
              <span>120%+</span>
            </div>
          </div>
        </div>

        {/* 3. Average Transaction Value (ATV) */}
        <div id="kpi-atv" className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Avg Transaction (ATV)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  SUM(net) / SUM(txns)
                </span>
              </div>
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              ${kpis.averageTransactionValue.toFixed(2)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Orders:</span>
            <span className="font-semibold text-slate-800">
              {kpis.totalTransactions.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 4. Return Rate % */}
        <div id="kpi-return-rate" className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Return Rate
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  SUM(returns) / SUM(net) * 100
                </span>
              </div>
              <div
                className={`p-1.5 rounded-lg ${
                  kpis.returnRatePct > 5
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <div
                className={`text-2xl font-bold tracking-tight ${
                  kpis.returnRatePct > 5 ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {kpis.returnRatePct.toFixed(2)}%
              </div>
              {kpis.returnRatePct > 5 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded">
                  High
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Returns:</span>
            <span className="font-semibold text-slate-800">
              ${Math.round(kpis.totalReturnsAmount).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 5. Discount Rate % */}
        <div id="kpi-discount-rate" className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Discount Rate
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  SUM(discount) / SUM(gross) * 100
                </span>
              </div>
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {kpis.discountRatePct.toFixed(2)}%
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Discount Given:</span>
            <span className="font-semibold text-slate-800">
              ${Math.round(kpis.totalDiscountAmount).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {/* Footfall & Conversion */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-500 font-medium flex items-center gap-1">
              <span>Conversion Rate</span>
              <span className="text-[9px] font-mono text-slate-400">txns/footfall</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              {kpis.conversionRatePct.toFixed(1)}%
              <span className="text-slate-400 font-normal text-xs ml-1">
                ({Math.round(kpis.totalFootfall).toLocaleString('en-US')} visits)
              </span>
            </div>
          </div>
        </div>

        {/* Stockout Incidents */}
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-lg ${
              kpis.totalStockouts > 0
                ? 'bg-rose-100 text-rose-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-500 font-medium flex items-center gap-1">
              <span>Stockouts</span>
              <span className="text-[9px] font-mono text-slate-400">&gt;0 / low inv</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              {kpis.totalStockouts.toLocaleString('en-US')}
              <span className="text-slate-400 font-normal text-xs ml-1">
                ({kpis.stockoutIncidentsCount} lines at risk)
              </span>
            </div>
          </div>
        </div>

        {/* Units Sold */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-500 font-medium">Units Sold</div>
            <div className="text-sm font-bold text-slate-900">
              {Math.round(kpis.totalUnitsSold).toLocaleString('en-US')}
            </div>
          </div>
        </div>

        {/* Inventory On Hand */}
        <div id="kpi-inventory-on-hand" className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-500 font-medium">Inventory On Hand</div>
            <div className="text-sm font-bold text-slate-900">
              {Math.round(kpis.totalInventoryOnHand).toLocaleString('en-US')} units
            </div>
          </div>
        </div>

        {/* Gross Sales */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-500 font-medium">Gross Sales</div>
            <div className="text-sm font-bold text-slate-900">
              {formatCurrency(kpis.totalGrossSales)}
            </div>
          </div>
        </div>

        {/* Customer Rating */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="text-slate-500 font-medium">Customer Rating</div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
              <span>{kpis.averageCustomerRating.toFixed(2)}</span>
              <span className="text-slate-400 font-normal text-xs">/ 5.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
