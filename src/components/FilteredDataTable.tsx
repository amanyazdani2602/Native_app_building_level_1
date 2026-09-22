import React, { useState } from 'react';
import {
  Table,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { MergedRetailRecord } from '../types';
import { exportFilteredDataToCsv } from '../utils/exporter';
import { parseWeekToTimestamp } from '../utils/excelParser';

interface FilteredDataTableProps {
  records: MergedRetailRecord[];
}

export const FilteredDataTable: React.FC<FilteredDataTableProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<keyof MergedRetailRecord>('week_start_date');
  const [sortAsc, setSortAsc] = useState(false);

  // Search filter
  const filtered = records.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.store_name.toLowerCase().includes(term) ||
      r.store_id.toLowerCase().includes(term) ||
      r.region.toLowerCase().includes(term) ||
      r.city.toLowerCase().includes(term) ||
      r.product_category.toLowerCase().includes(term) ||
      r.week_start_date.toLowerCase().includes(term)
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'week_start_date') {
      const timeA = parseWeekToTimestamp(a.week_start_date);
      const timeB = parseWeekToTimestamp(b.week_start_date);
      return sortAsc ? timeA - timeB : timeB - timeA;
    }
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const pageIndex = Math.min(currentPage, totalPages);
  const paginatedRows = sorted.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

  // Aggregates for filtered rows
  const totals = filtered.reduce(
    (acc, r) => {
      acc.net_sales += r.net_sales;
      acc.sales_target += r.sales_target;
      acc.transactions += r.transactions;
      acc.inventory_on_hand += r.inventory_on_hand;
      acc.stockouts += r.stockouts;
      acc.returns_amount += r.returns_amount;
      return acc;
    },
    {
      net_sales: 0,
      sales_target: 0,
      transactions: 0,
      inventory_on_hand: 0,
      stockouts: 0,
      returns_amount: 0,
    }
  );
  const totalAchievement = totals.sales_target > 0 ? (totals.net_sales / totals.sales_target) * 100 : 0;

  const handleSort = (field: keyof MergedRetailRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div id="filtered-data-table-container" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Table Control Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 text-slate-700 rounded-md">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Filtered Records Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Showing {sorted.length.toLocaleString()} matching row{sorted.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search inside table */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search table rows..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500 w-48 sm:w-60"
            />
          </div>

          <button
            type="button"
            onClick={() => exportFilteredDataToCsv(records)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10">
            <tr>
              <th
                onClick={() => handleSort('week_start_date')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Week</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('region')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Region</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('store_name')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Store</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('product_category')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('net_sales')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Net Sales</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('sales_target')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Target</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Attainment</th>
              <th
                onClick={() => handleSort('transactions')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Txns</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('inventory_on_hand')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Inventory</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('stockouts')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Stockouts</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('returns_amount')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Returns</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-400">
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedRows.map((r) => {
                const ach = r.sales_target > 0 ? (r.net_sales / r.sales_target) * 100 : 0;
                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {r.week_start_date === 'Unknown' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Unknown
                        </span>
                      ) : (
                        r.week_start_date
                      )}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{r.region}</span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{r.store_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {r.store_id} • {r.city} • {r.store_format}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-700 whitespace-nowrap">
                      {r.product_category}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-medium text-slate-900 whitespace-nowrap">
                      ${r.net_sales.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-500 whitespace-nowrap">
                      ${r.sales_target.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          ach >= 100
                            ? 'bg-emerald-50 text-emerald-700'
                            : ach >= 90
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {ach.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                      {r.transactions.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                      {r.inventory_on_hand.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      {r.stockouts > 0 ? (
                        <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                          {r.stockouts}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                      ${r.returns_amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {filtered.length > 0 && (
            <tfoot className="bg-slate-100/90 border-t-2 border-slate-300 font-semibold text-slate-900 text-xs">
              <tr>
                <td colSpan={4} className="py-2.5 px-3">
                  Total in View ({filtered.length} records)
                </td>
                <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                  ${Math.round(totals.net_sales).toLocaleString('en-US')}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                  ${Math.round(totals.sales_target).toLocaleString('en-US')}
                </td>
                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                      totalAchievement >= 100
                        ? 'bg-emerald-100 text-emerald-800'
                        : totalAchievement >= 90
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {totalAchievement.toFixed(1)}%
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                  {Math.round(totals.transactions).toLocaleString('en-US')}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-teal-800 font-bold whitespace-nowrap">
                  {Math.round(totals.inventory_on_hand).toLocaleString('en-US')}
                </td>
                <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                  {Math.round(totals.stockouts).toLocaleString('en-US')}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-700 whitespace-nowrap">
                  ${Math.round(totals.returns_amount).toLocaleString('en-US')}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-slate-400">|</span>
          <span>
            Page <strong>{pageIndex}</strong> of <strong>{totalPages}</strong> ({sorted.length} records)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={pageIndex <= 1}
            className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={pageIndex >= totalPages}
            className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
