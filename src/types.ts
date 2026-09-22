export interface RawSalesRecord {
  week_start_date: string | number | Date;
  region?: string;
  store_id: string | number;
  store_name?: string;
  city?: string;
  store_format?: string;
  product_category: string;
  footfall?: number | string;
  transactions: number | string;
  units_sold: number | string;
  gross_sales: number | string;
  discount_amount: number | string;
  net_sales: number | string;
  sales_target: number | string;
  inventory_on_hand: number | string;
  stockouts: number | string;
  returns_amount: number | string;
  customer_rating?: number | string;
  marketing_spend?: number | string;
}

export interface StoreMasterRecord {
  store_id: string | number;
  store_name: string;
  region: string;
  city: string;
  store_format: string;
}

export interface MergedRetailRecord {
  id: string;
  week_start_date: string; // ISO YYYY-MM-DD
  region: string;
  store_id: string;
  store_name: string;
  city: string;
  store_format: string;
  product_category: string;
  footfall: number;
  transactions: number;
  units_sold: number;
  gross_sales: number;
  discount_amount: number;
  net_sales: number;
  sales_target: number;
  inventory_on_hand: number;
  stockouts: number;
  returns_amount: number;
  customer_rating: number;
  marketing_spend: number;
}

export interface FilterState {
  weeks: string[];
  regions: string[];
  stores: string[];
  cities: string[];
  storeFormats: string[];
  categories: string[];
}

export interface KpiMetrics {
  totalNetSales: number;
  totalSalesTarget: number;
  targetAchievementPct: number;
  averageTransactionValue: number;
  returnRatePct: number;
  discountRatePct: number;
  conversionRatePct: number;
  totalGrossSales: number;
  totalDiscountAmount: number;
  totalReturnsAmount: number;
  totalTransactions: number;
  totalFootfall: number;
  totalUnitsSold: number;
  totalStockouts: number;
  stockoutIncidentsCount: number; // lines where stockouts > 0 or inventory_on_hand < units_sold
  stockoutLinesCount: number; // lines where stockouts > 0
  lowInventoryLinesCount: number; // lines where inventory_on_hand < units_sold
  totalInventoryOnHand: number;
  averageCustomerRating: number;
  totalMarketingSpend: number;
  recordCount: number;
}

export interface WeeklyTrendPoint {
  week: string;
  netSales: number;
  salesTarget: number;
  achievementPct: number;
  gap: number;
}

export interface RegionPerformancePoint {
  region: string;
  netSales: number;
  salesTarget: number;
  achievementPct: number;
  transactions: number;
  storesCount: number;
}

export interface CategoryPerformancePoint {
  category: string;
  netSales: number;
  salesTarget: number;
  achievementPct: number;
  returnsAmount: number;
  returnRatePct: number;
  sharePct: number;
}

export interface StoreLeaderboardPoint {
  storeId: string;
  storeName: string;
  region: string;
  city: string;
  format: string;
  netSales: number;
  salesTarget: number;
  achievementPct: number;
  targetMet: boolean;
  atv: number;
  stockouts: number;
}

export interface StockoutRiskPoint {
  key: string;
  storeName: string;
  category: string;
  region: string;
  stockouts: number;
  inventoryOnHand: number;
  unitsSold: number;
  coverageRatio: number; // inventory / unitsSold
  riskLevel: 'Critical' | 'Warning' | 'Moderate';
}

export interface BusinessInsights {
  bestRegionBySales: RegionPerformancePoint | null;
  worstRegionBySales: RegionPerformancePoint | null;
  bestRegionByTarget: RegionPerformancePoint | null;
  worstRegionByTarget: RegionPerformancePoint | null;
  storesMissingTarget: StoreLeaderboardPoint[];
  storesMeetingTarget: StoreLeaderboardPoint[];
  highReturnCategories: { category: string; returnRatePct: number; returnsAmount: number }[];
  criticalStockoutAlerts: StockoutRiskPoint[];
  summaryNarratives: string[];
}
