import {
  BusinessInsights,
  CategoryPerformancePoint,
  FilterState,
  KpiMetrics,
  MergedRetailRecord,
  RegionPerformancePoint,
  StockoutRiskPoint,
  StoreLeaderboardPoint,
  WeeklyTrendPoint,
} from '../types';
import { parseWeekToTimestamp } from './excelParser';

/**
 * Filters dataset based on selected multi-select criteria
 */
export function applyFilters(records: MergedRetailRecord[], filters: FilterState): MergedRetailRecord[] {
  return records.filter((r) => {
    if (filters.weeks.length > 0 && !filters.weeks.includes(r.week_start_date)) {
      return false;
    }
    if (filters.regions.length > 0 && !filters.regions.includes(r.region)) {
      return false;
    }
    if (filters.stores.length > 0 && !filters.stores.includes(r.store_name) && !filters.stores.includes(r.store_id)) {
      return false;
    }
    if (filters.cities.length > 0 && !filters.cities.includes(r.city)) {
      return false;
    }
    if (filters.storeFormats.length > 0 && !filters.storeFormats.includes(r.store_format)) {
      return false;
    }
    if (filters.categories.length > 0 && !filters.categories.includes(r.product_category)) {
      return false;
    }
    return true;
  });
}

/**
 * Computes all core and secondary KPI metrics for the filtered rows
 */
export function computeKpiMetrics(records: MergedRetailRecord[]): KpiMetrics {
  if (records.length === 0) {
    return {
      totalNetSales: 0,
      totalSalesTarget: 0,
      targetAchievementPct: 0,
      averageTransactionValue: 0,
      returnRatePct: 0,
      discountRatePct: 0,
      conversionRatePct: 0,
      totalGrossSales: 0,
      totalDiscountAmount: 0,
      totalReturnsAmount: 0,
      totalTransactions: 0,
      totalFootfall: 0,
      totalUnitsSold: 0,
      totalStockouts: 0,
      stockoutIncidentsCount: 0,
      stockoutLinesCount: 0,
      lowInventoryLinesCount: 0,
      totalInventoryOnHand: 0,
      averageCustomerRating: 0,
      totalMarketingSpend: 0,
      recordCount: 0,
    };
  }

  let totalNetSales = 0;
  let totalSalesTarget = 0;
  let totalGrossSales = 0;
  let totalDiscountAmount = 0;
  let totalReturnsAmount = 0;
  let totalTransactions = 0;
  let totalFootfall = 0;
  let totalUnitsSold = 0;
  let totalStockouts = 0;
  let stockoutLinesCount = 0;
  let lowInventoryLinesCount = 0;
  let totalInventoryOnHand = 0;
  let ratingSum = 0;
  let totalMarketingSpend = 0;

  for (const r of records) {
    // Net sales = SUM(net_sales)
    totalNetSales += r.net_sales;
    totalSalesTarget += r.sales_target;
    totalGrossSales += r.gross_sales;
    totalDiscountAmount += r.discount_amount;
    totalReturnsAmount += r.returns_amount;
    totalTransactions += r.transactions;
    totalFootfall += r.footfall;
    totalUnitsSold += r.units_sold;
    totalStockouts += r.stockouts;

    // Stockout indicator: stockouts > 0 or low inventory_on_hand vs units_sold
    const hasDirectStockout = r.stockouts > 0;
    const hasLowInventory = r.units_sold > 0 && r.inventory_on_hand < r.units_sold;

    if (hasDirectStockout) {
      stockoutLinesCount++;
    }
    if (hasLowInventory) {
      lowInventoryLinesCount++;
    }

    totalInventoryOnHand += r.inventory_on_hand;
    ratingSum += r.customer_rating;
    totalMarketingSpend += r.marketing_spend;
  }

  // Combined stockout indicator incident count: stockouts > 0 or inventory_on_hand < units_sold
  const stockoutIncidentsCount = records.filter(
    (r) => r.stockouts > 0 || (r.units_sold > 0 && r.inventory_on_hand < r.units_sold)
  ).length;

  // Formula: SUM(net_sales) / SUM(sales_target) * 100
  const targetAchievementPct = totalSalesTarget > 0 ? (totalNetSales / totalSalesTarget) * 100 : 0;
  // Formula: SUM(net_sales) / SUM(transactions)
  const averageTransactionValue = totalTransactions > 0 ? totalNetSales / totalTransactions : 0;
  // Formula: SUM(returns_amount) / SUM(net_sales) * 100
  const returnRatePct = totalNetSales > 0 ? (totalReturnsAmount / totalNetSales) * 100 : 0;
  // Formula: SUM(discount_amount) / SUM(gross_sales) * 100
  const discountRatePct = totalGrossSales > 0 ? (totalDiscountAmount / totalGrossSales) * 100 : 0;
  // Formula: SUM(transactions) / SUM(footfall) * 100
  const conversionRatePct = totalFootfall > 0 ? (totalTransactions / totalFootfall) * 100 : 0;
  const averageCustomerRating = records.length > 0 ? ratingSum / records.length : 0;

  return {
    totalNetSales,
    totalSalesTarget,
    targetAchievementPct,
    averageTransactionValue,
    returnRatePct,
    discountRatePct,
    conversionRatePct,
    totalGrossSales,
    totalDiscountAmount,
    totalReturnsAmount,
    totalTransactions,
    totalFootfall,
    totalUnitsSold,
    totalStockouts,
    stockoutIncidentsCount,
    stockoutLinesCount,
    lowInventoryLinesCount,
    totalInventoryOnHand,
    averageCustomerRating,
    totalMarketingSpend,
    recordCount: records.length,
  };
}

/**
 * 1) Weekly trend — net sales and sales target by week
 * Excludes unparseable/Unknown dates from the timeline chart and sorts in strict chronological order
 */
export function computeWeeklyTrend(records: MergedRetailRecord[]): WeeklyTrendPoint[] {
  const map = new Map<string, { netSales: number; salesTarget: number }>();

  for (const r of records) {
    // Exclude 'Unknown' or invalid-date from the chronological timeline chart
    if (!r.week_start_date || r.week_start_date === 'Unknown' || r.week_start_date.toLowerCase().includes('invalid')) {
      continue;
    }

    const existing = map.get(r.week_start_date) || { netSales: 0, salesTarget: 0 };
    existing.netSales += r.net_sales;
    existing.salesTarget += r.sales_target;
    map.set(r.week_start_date, existing);
  }

  // Sort weeks in strict chronological order using UTC timestamps
  const sortedWeeks = Array.from(map.keys()).sort((a, b) => {
    return parseWeekToTimestamp(a) - parseWeekToTimestamp(b);
  });

  return sortedWeeks.map((week) => {
    const data = map.get(week)!;
    const achievementPct = data.salesTarget > 0 ? (data.netSales / data.salesTarget) * 100 : 0;
    return {
      week,
      netSales: Math.round(data.netSales),
      salesTarget: Math.round(data.salesTarget),
      achievementPct: Number(achievementPct.toFixed(1)),
      gap: Math.round(data.netSales - data.salesTarget),
    };
  });
}

/**
 * 2) Sales by region — net sales by region with targets
 */
export function computeSalesByRegion(records: MergedRetailRecord[]): RegionPerformancePoint[] {
  const map = new Map<string, { netSales: number; salesTarget: number; transactions: number; stores: Set<string> }>();

  for (const r of records) {
    const existing = map.get(r.region) || { netSales: 0, salesTarget: 0, transactions: 0, stores: new Set<string>() };
    existing.netSales += r.net_sales;
    existing.salesTarget += r.sales_target;
    existing.transactions += r.transactions;
    existing.stores.add(r.store_id);
    map.set(r.region, existing);
  }

  const points: RegionPerformancePoint[] = [];
  for (const [region, data] of map.entries()) {
    const achievementPct = data.salesTarget > 0 ? (data.netSales / data.salesTarget) * 100 : 0;
    points.push({
      region,
      netSales: Math.round(data.netSales),
      salesTarget: Math.round(data.salesTarget),
      achievementPct: Number(achievementPct.toFixed(1)),
      transactions: data.transactions,
      storesCount: data.stores.size,
    });
  }

  // Sort descending by net sales
  return points.sort((a, b) => b.netSales - a.netSales);
}

/**
 * 3) Category performance — net sales by product_category
 */
export function computeCategoryPerformance(records: MergedRetailRecord[]): CategoryPerformancePoint[] {
  const map = new Map<string, { netSales: number; salesTarget: number; returnsAmount: number }>();
  let grandTotalSales = 0;

  for (const r of records) {
    const existing = map.get(r.product_category) || { netSales: 0, salesTarget: 0, returnsAmount: 0 };
    existing.netSales += r.net_sales;
    existing.salesTarget += r.sales_target;
    existing.returnsAmount += r.returns_amount;
    grandTotalSales += r.net_sales;
    map.set(r.product_category, existing);
  }

  const points: CategoryPerformancePoint[] = [];
  for (const [category, data] of map.entries()) {
    const achievementPct = data.salesTarget > 0 ? (data.netSales / data.salesTarget) * 100 : 0;
    const returnRatePct = data.netSales > 0 ? (data.returnsAmount / data.netSales) * 100 : 0;
    const sharePct = grandTotalSales > 0 ? (data.netSales / grandTotalSales) * 100 : 0;

    points.push({
      category,
      netSales: Math.round(data.netSales),
      salesTarget: Math.round(data.salesTarget),
      achievementPct: Number(achievementPct.toFixed(1)),
      returnsAmount: Math.round(data.returnsAmount),
      returnRatePct: Number(returnRatePct.toFixed(2)),
      sharePct: Number(sharePct.toFixed(1)),
    });
  }

  return points.sort((a, b) => b.netSales - a.netSales);
}

/**
 * 4) Store leaderboard — top/bottom stores by net sales and target achievement
 */
export function computeStoreLeaderboard(records: MergedRetailRecord[]): StoreLeaderboardPoint[] {
  const map = new Map<string, {
    storeName: string;
    region: string;
    city: string;
    format: string;
    netSales: number;
    salesTarget: number;
    transactions: number;
    stockouts: number;
  }>();

  for (const r of records) {
    const existing = map.get(r.store_id) || {
      storeName: r.store_name,
      region: r.region,
      city: r.city,
      format: r.store_format,
      netSales: 0,
      salesTarget: 0,
      transactions: 0,
      stockouts: 0,
    };

    existing.netSales += r.net_sales;
    existing.salesTarget += r.sales_target;
    existing.transactions += r.transactions;
    existing.stockouts += r.stockouts;
    map.set(r.store_id, existing);
  }

  const points: StoreLeaderboardPoint[] = [];
  for (const [storeId, d] of map.entries()) {
    const achievementPct = d.salesTarget > 0 ? (d.netSales / d.salesTarget) * 100 : 0;
    const atv = d.transactions > 0 ? d.netSales / d.transactions : 0;
    points.push({
      storeId,
      storeName: d.storeName,
      region: d.region,
      city: d.city,
      format: d.format,
      netSales: Math.round(d.netSales),
      salesTarget: Math.round(d.salesTarget),
      achievementPct: Number(achievementPct.toFixed(1)),
      targetMet: achievementPct >= 100,
      atv: Math.round(atv),
      stockouts: d.stockouts,
    });
  }

  return points.sort((a, b) => b.netSales - a.netSales);
}

/**
 * 5) Stockout risk — stores or categories with stockouts > 0, plus inventory_on_hand
 */
export function computeStockoutRisks(records: MergedRetailRecord[]): StockoutRiskPoint[] {
  // Aggregate by store_name + product_category
  const map = new Map<string, {
    storeName: string;
    category: string;
    region: string;
    stockouts: number;
    inventoryOnHand: number;
    unitsSold: number;
  }>();

  for (const r of records) {
    const key = `${r.store_name}__${r.product_category}`;
    const existing = map.get(key) || {
      storeName: r.store_name,
      category: r.product_category,
      region: r.region,
      stockouts: 0,
      inventoryOnHand: 0,
      unitsSold: 0,
    };

    existing.stockouts += r.stockouts;
    // take latest or averaged inventory on hand
    existing.inventoryOnHand += r.inventory_on_hand;
    existing.unitsSold += r.units_sold;
    map.set(key, existing);
  }

  const points: StockoutRiskPoint[] = [];

  for (const [key, d] of map.entries()) {
    // Only include if stockouts > 0 or inventory is very low compared to units sold
    const avgInventory = Math.round(d.inventoryOnHand / Math.max(1, records.filter(r => `${r.store_name}__${r.product_category}` === key).length));
    const coverageRatio = d.unitsSold > 0 ? Number((avgInventory / (d.unitsSold / Math.max(1, records.filter(r => `${r.store_name}__${r.product_category}` === key).length))).toFixed(2)) : 99;

    let riskLevel: 'Critical' | 'Warning' | 'Moderate' = 'Moderate';
    if (d.stockouts >= 5 || coverageRatio < 0.8) {
      riskLevel = 'Critical';
    } else if (d.stockouts > 0 || coverageRatio < 1.5) {
      riskLevel = 'Warning';
    }

    if (d.stockouts > 0 || coverageRatio < 2.0) {
      points.push({
        key,
        storeName: d.storeName,
        category: d.category,
        region: d.region,
        stockouts: d.stockouts,
        inventoryOnHand: avgInventory,
        unitsSold: d.unitsSold,
        coverageRatio,
        riskLevel,
      });
    }
  }

  // Sort by stockouts descending, then lowest coverage
  return points.sort((a, b) => b.stockouts - a.stockouts || a.coverageRatio - b.coverageRatio);
}

/**
 * Auto-generated business insights from filtered dataset
 */
export function generateBusinessInsights(
  records: MergedRetailRecord[],
  kpis: KpiMetrics,
  regions: RegionPerformancePoint[],
  categories: CategoryPerformancePoint[],
  stores: StoreLeaderboardPoint[],
  stockoutRisks: StockoutRiskPoint[]
): BusinessInsights {
  if (records.length === 0) {
    return {
      bestRegionBySales: null,
      worstRegionBySales: null,
      bestRegionByTarget: null,
      worstRegionByTarget: null,
      storesMissingTarget: [],
      storesMeetingTarget: [],
      highReturnCategories: [],
      criticalStockoutAlerts: [],
      summaryNarratives: ['No data matches the selected filters.'],
    };
  }

  // Best & worst region by sales
  const sortedBySales = [...regions].sort((a, b) => b.netSales - a.netSales);
  const bestRegionBySales = sortedBySales[0] || null;
  const worstRegionBySales = sortedBySales[sortedBySales.length - 1] || null;

  // Best & worst region by target achievement
  const sortedByAchievement = [...regions].sort((a, b) => b.achievementPct - a.achievementPct);
  const bestRegionByTarget = sortedByAchievement[0] || null;
  const worstRegionByTarget = sortedByAchievement[sortedByAchievement.length - 1] || null;

  // Stores missing target vs meeting target
  const storesMissingTarget = stores.filter((s) => s.achievementPct < 100).sort((a, b) => a.achievementPct - b.achievementPct);
  const storesMeetingTarget = stores.filter((s) => s.achievementPct >= 100).sort((a, b) => b.achievementPct - a.achievementPct);

  // High return categories
  const sortedByReturns = [...categories].sort((a, b) => b.returnRatePct - a.returnRatePct);
  const highReturnCategories = sortedByReturns.slice(0, 3);

  // Critical stockout items
  const criticalStockoutAlerts = stockoutRisks.filter((r) => r.riskLevel === 'Critical' || r.stockouts > 0).slice(0, 5);

  // Narratives for business managers
  const summaryNarratives: string[] = [];

  if (bestRegionBySales) {
    summaryNarratives.push(
      `Leading Region: ${bestRegionBySales.region} leads in gross volume with $${bestRegionBySales.netSales.toLocaleString()} (${bestRegionBySales.achievementPct}% target achievement).`
    );
  }

  if (worstRegionByTarget && worstRegionByTarget.achievementPct < 100) {
    summaryNarratives.push(
      `Region Lagging Target: ${worstRegionByTarget.region} region recorded the lowest target attainment at ${worstRegionByTarget.achievementPct}%, falling short by $${Math.abs(worstRegionByTarget.netSales - worstRegionByTarget.salesTarget).toLocaleString()}.`
    );
  }

  if (storesMissingTarget.length > 0) {
    const pctMissing = Math.round((storesMissingTarget.length / Math.max(1, stores.length)) * 100);
    summaryNarratives.push(
      `Store Attainment: ${storesMissingTarget.length} of ${stores.length} stores (${pctMissing}%) are currently tracking under 100% target achievement. Lowest performer: ${storesMissingTarget[0].storeName} (${storesMissingTarget[0].achievementPct}%).`
    );
  } else {
    summaryNarratives.push(
      `Store Attainment: Excellent performance! All ${stores.length} active stores in view are meeting or exceeding sales targets.`
    );
  }

  if (highReturnCategories.length > 0 && highReturnCategories[0].returnRatePct > 4) {
    summaryNarratives.push(
      `Return Rate Caution: ${highReturnCategories[0].category} has the highest return rate at ${highReturnCategories[0].returnRatePct}% ($${highReturnCategories[0].returnsAmount.toLocaleString()} in returns), requiring inventory quality & sizing reviews.`
    );
  }

  if (kpis.totalStockouts > 0) {
    summaryNarratives.push(
      `Inventory Vulnerability: Detected ${kpis.totalStockouts} total stockout occurrences across filtered lines. Immediate replenishment needed for top impacted items.`
    );
  }

  return {
    bestRegionBySales,
    worstRegionBySales,
    bestRegionByTarget,
    worstRegionByTarget,
    storesMissingTarget,
    storesMeetingTarget,
    highReturnCategories,
    criticalStockoutAlerts,
    summaryNarratives,
  };
}
