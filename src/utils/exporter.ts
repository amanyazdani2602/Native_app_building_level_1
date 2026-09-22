import { BusinessInsights, MergedRetailRecord } from '../types';

/**
 * Escapes CSV values and wraps in quotes if needed
 */
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Trigger browser file download
 */
export function triggerDownload(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports currently filtered rows as CSV
 */
export function exportFilteredDataToCsv(records: MergedRetailRecord[], filename = 'retail_sales_filtered_export.csv') {
  if (records.length === 0) {
    alert('No data to export.');
    return;
  }

  const headers = [
    'Week Start Date',
    'Region',
    'Store ID',
    'Store Name',
    'City',
    'Store Format',
    'Product Category',
    'Footfall',
    'Transactions',
    'Units Sold',
    'Gross Sales ($)',
    'Discount Amount ($)',
    'Net Sales ($)',
    'Sales Target ($)',
    'Target Achievement (%)',
    'Inventory On Hand',
    'Stockouts',
    'Returns Amount ($)',
    'Customer Rating',
    'Marketing Spend ($)',
  ];

  const rows = records.map((r) => {
    const ach = r.sales_target > 0 ? ((r.net_sales / r.sales_target) * 100).toFixed(1) : '0';
    return [
      escapeCsv(r.week_start_date),
      escapeCsv(r.region),
      escapeCsv(r.store_id),
      escapeCsv(r.store_name),
      escapeCsv(r.city),
      escapeCsv(r.store_format),
      escapeCsv(r.product_category),
      r.footfall,
      r.transactions,
      r.units_sold,
      r.gross_sales,
      r.discount_amount,
      r.net_sales,
      r.sales_target,
      ach,
      r.inventory_on_hand,
      r.stockouts,
      r.returns_amount,
      r.customer_rating,
      r.marketing_spend,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  triggerDownload(csvContent, filename);
}

/**
 * Exports business insights summary as structured text file
 */
export function exportInsightsToText(insights: BusinessInsights, filename = 'retail_intelligence_insights_summary.txt') {
  const lines: string[] = [
    '=================================================================',
    '              RETAIL SALES INTELLIGENCE EXECUTIVE SUMMARY       ',
    '=================================================================',
    `Generated on: ${new Date().toLocaleString()}`,
    '',
    '--- KEY HIGHLIGHTS & NARRATIVES ---',
    ...insights.summaryNarratives.map((s, i) => `${i + 1}. ${s}`),
    '',
    '--- REGIONAL PERFORMANCE SNAPSHOT ---',
    insights.bestRegionBySales
      ? `Top Region (Gross Sales): ${insights.bestRegionBySales.region} - $${insights.bestRegionBySales.netSales.toLocaleString()} (${insights.bestRegionBySales.achievementPct}% target achievement)`
      : 'Top Region: N/A',
    insights.worstRegionBySales
      ? `Lowest Region (Gross Sales): ${insights.worstRegionBySales.region} - $${insights.worstRegionBySales.netSales.toLocaleString()} (${insights.worstRegionBySales.achievementPct}% target achievement)`
      : 'Lowest Region: N/A',
    insights.bestRegionByTarget
      ? `Highest Target Attainment: ${insights.bestRegionByTarget.region} (${insights.bestRegionByTarget.achievementPct}%)`
      : 'Highest Attainment: N/A',
    insights.worstRegionByTarget
      ? `Lowest Target Attainment: ${insights.worstRegionByTarget.region} (${insights.worstRegionByTarget.achievementPct}%)`
      : 'Lowest Attainment: N/A',
    '',
    `--- STORES MISSING SALES TARGET (<100%) [Total: ${insights.storesMissingTarget.length}] ---`,
    ...(insights.storesMissingTarget.length === 0
      ? ['All active stores achieved 100% or greater of their sales target.']
      : insights.storesMissingTarget.map(
          (s) =>
            `- [${s.storeId}] ${s.storeName} (${s.region}, ${s.city}): ${s.achievementPct}% achievement | Net Sales: $${s.netSales.toLocaleString()} vs Target: $${s.salesTarget.toLocaleString()} (Shortfall: $${(s.salesTarget - s.netSales).toLocaleString()})`
        )),
    '',
    '--- HIGH RETURN CATEGORIES ---',
    ...(insights.highReturnCategories.length === 0
      ? ['No return data available.']
      : insights.highReturnCategories.map(
          (c) => `- ${c.category}: ${c.returnRatePct}% return rate ($${c.returnsAmount.toLocaleString()} returned)`
        )),
    '',
    '--- CRITICAL STOCKOUT & REPLENISHMENT ALERTS ---',
    ...(insights.criticalStockoutAlerts.length === 0
      ? ['No critical stockouts or low inventory flags.']
      : insights.criticalStockoutAlerts.map(
          (item) =>
            `- ${item.storeName} [${item.region}] | Category: ${item.category} | Stockouts: ${item.stockouts} | On Hand: ${item.inventoryOnHand} units | Sold: ${item.unitsSold} units (Risk: ${item.riskLevel})`
        )),
    '',
    '=================================================================',
  ];

  triggerDownload(lines.join('\r\n'), filename, 'text/plain;charset=utf-8;');
}

/**
 * Exports insights summary as CSV
 */
export function exportInsightsToCsv(insights: BusinessInsights, filename = 'retail_intelligence_insights.csv') {
  const rows: string[] = [
    'Section,Key Metric / Store / Category,Detail,Value,Status / Target Gap',
  ];

  if (insights.bestRegionBySales) {
    rows.push(`Regional Leader,Best Region By Sales,${insights.bestRegionBySales.region},"$${insights.bestRegionBySales.netSales.toLocaleString()}",${insights.bestRegionBySales.achievementPct}% Target Achievement`);
  }
  if (insights.worstRegionBySales) {
    rows.push(`Regional Laggard,Lowest Region By Sales,${insights.worstRegionBySales.region},"$${insights.worstRegionBySales.netSales.toLocaleString()}",${insights.worstRegionBySales.achievementPct}% Target Achievement`);
  }
  if (insights.worstRegionByTarget) {
    rows.push(`Regional Laggard,Lowest Target Achievement,${insights.worstRegionByTarget.region},${insights.worstRegionByTarget.achievementPct}%,"$${Math.abs(insights.worstRegionByTarget.netSales - insights.worstRegionByTarget.salesTarget).toLocaleString()} shortfall"`);
  }

  for (const s of insights.storesMissingTarget) {
    rows.push(`Store Under Target,"${s.storeName} (${s.storeId})",${s.region} - ${s.city},${s.achievementPct}% Achievement,"Shortfall: $${(s.salesTarget - s.netSales).toLocaleString()}"`);
  }

  for (const c of insights.highReturnCategories) {
    rows.push(`High Return Category,${c.category},Return Rate,${c.returnRatePct}%,"Returns: $${c.returnsAmount.toLocaleString()}"`);
  }

  for (const st of insights.criticalStockoutAlerts) {
    rows.push(`Stockout Alert,"${st.storeName} - ${st.category}",${st.region},"${st.stockouts} stockout incidents","On Hand: ${st.inventoryOnHand} (Risk: ${st.riskLevel})"`);
  }

  triggerDownload(rows.join('\r\n'), filename);
}
