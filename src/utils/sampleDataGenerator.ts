import * as XLSX from 'xlsx';
import { MergedRetailRecord, RawSalesRecord, StoreMasterRecord } from '../types';

export interface SampleStoreDefinition {
  store_id: string;
  store_name: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Central';
  city: string;
  store_format: 'Flagship' | 'Hypermarket' | 'Supermarket' | 'Express Store';
}

export const SAMPLE_20_STORES: SampleStoreDefinition[] = [
  // North
  { store_id: 'STR-101', store_name: 'Metro North Promenade', region: 'North', city: 'Minneapolis', store_format: 'Flagship' },
  { store_id: 'STR-102', store_name: 'Highland Ridge Center', region: 'North', city: 'Chicago', store_format: 'Hypermarket' },
  { store_id: 'STR-103', store_name: 'Grand River Marketplace', region: 'North', city: 'Detroit', store_format: 'Supermarket' },
  { store_id: 'STR-104', store_name: 'Lakeside Express', region: 'North', city: 'Milwaukee', store_format: 'Express Store' },

  // South
  { store_id: 'STR-201', store_name: 'Suncoast Galleria', region: 'South', city: 'Miami', store_format: 'Flagship' },
  { store_id: 'STR-202', store_name: 'Bayfront Plaza', region: 'South', city: 'Tampa', store_format: 'Hypermarket' },
  { store_id: 'STR-203', store_name: 'Southern Cross Pavilion', region: 'South', city: 'Atlanta', store_format: 'Supermarket' },
  { store_id: 'STR-204', store_name: 'Peachtree Express', region: 'South', city: 'Savannah', store_format: 'Express Store' },

  // East
  { store_id: 'STR-301', store_name: 'Coastal Commons', region: 'East', city: 'Boston', store_format: 'Flagship' },
  { store_id: 'STR-302', store_name: 'Liberty Plaza', region: 'East', city: 'Philadelphia', store_format: 'Hypermarket' },
  { store_id: 'STR-303', store_name: 'Atlantic Square', region: 'East', city: 'New York', store_format: 'Supermarket' },
  { store_id: 'STR-304', store_name: 'Harbor Point Express', region: 'East', city: 'Baltimore', store_format: 'Express Store' },

  // West
  { store_id: 'STR-401', store_name: 'Pacific Crest Center', region: 'West', city: 'Seattle', store_format: 'Flagship' },
  { store_id: 'STR-402', store_name: 'Golden Gate Pavilion', region: 'West', city: 'San Francisco', store_format: 'Hypermarket' },
  { store_id: 'STR-403', store_name: 'Sunset Promenade', region: 'West', city: 'Los Angeles', store_format: 'Supermarket' },
  { store_id: 'STR-404', store_name: 'Cascade Express', region: 'West', city: 'Portland', store_format: 'Express Store' },

  // Central
  { store_id: 'STR-501', store_name: 'Heartland Center', region: 'Central', city: 'Dallas', store_format: 'Flagship' },
  { store_id: 'STR-502', store_name: 'Prairie Walk Mall', region: 'Central', city: 'Kansas City', store_format: 'Hypermarket' },
  { store_id: 'STR-503', store_name: 'Capital Square Center', region: 'Central', city: 'Austin', store_format: 'Supermarket' },
  { store_id: 'STR-504', store_name: 'Valley Park Express', region: 'Central', city: 'Denver', store_format: 'Express Store' },
];

export const CATEGORIES = [
  'Apparel',
  'Electronics',
  'Groceries',
  'Home & Living',
  'Beauty & Personal Care',
];

export const WEEKS = [
  '06 Jan 2025',
  '13 Jan 2025',
  '20 Jan 2025',
  '27 Jan 2025',
  '03 Feb 2025',
  '10 Feb 2025',
  '17 Feb 2025',
  '24 Feb 2025',
];

/**
 * Generate 20-store realistic sales data
 */
export function generateSampleDataset(): {
  sales: RawSalesRecord[];
  storeMaster: StoreMasterRecord[];
  merged: MergedRetailRecord[];
} {
  const storeMaster: StoreMasterRecord[] = SAMPLE_20_STORES.map((s) => ({
    store_id: s.store_id,
    store_name: s.store_name,
    region: s.region,
    city: s.city,
    store_format: s.store_format,
  }));

  const sales: RawSalesRecord[] = [];
  const merged: MergedRetailRecord[] = [];

  let recordIdx = 1;

  // Base multiplier per store format
  const formatMultipliers: Record<string, number> = {
    Flagship: 2.2,
    Hypermarket: 1.8,
    Supermarket: 1.1,
    'Express Store': 0.65,
  };

  // Base multiplier per category
  const categoryStats: Record<string, { baseSales: number; atv: number; discRate: number; returnRate: number }> = {
    Apparel: { baseSales: 16000, atv: 78, discRate: 0.12, returnRate: 0.082 },
    Electronics: { baseSales: 28000, atv: 240, discRate: 0.08, returnRate: 0.045 },
    Groceries: { baseSales: 22000, atv: 42, discRate: 0.05, returnRate: 0.018 },
    'Home & Living': { baseSales: 14000, atv: 110, discRate: 0.09, returnRate: 0.055 },
    'Beauty & Personal Care': { baseSales: 12500, atv: 52, discRate: 0.07, returnRate: 0.032 },
  };

  // Preset some store performance tendencies (some star performers, some lagging for insight testing)
  const storeMultipliers: Record<string, number> = {
    'STR-101': 1.18, // Star
    'STR-102': 0.92, // Under target
    'STR-103': 0.88, // Under target
    'STR-104': 1.05,
    'STR-201': 1.25, // Star
    'STR-202': 1.12,
    'STR-203': 0.84, // Under target
    'STR-204': 0.95, // Under target
    'STR-301': 1.15,
    'STR-302': 0.90, // Under target
    'STR-303': 1.04,
    'STR-304': 0.81, // Under target
    'STR-401': 1.30, // Top store
    'STR-402': 1.08,
    'STR-403': 0.97, // Under target
    'STR-404': 0.91, // Under target
    'STR-501': 1.06,
    'STR-502': 0.89, // Under target
    'STR-503': 1.02,
    'STR-504': 0.79, // Struggling store
  };

  for (const week of WEEKS) {
    for (const store of SAMPLE_20_STORES) {
      const fMult = formatMultipliers[store.store_format] || 1;
      const sMult = storeMultipliers[store.store_id] || 1;

      for (const cat of CATEGORIES) {
        const cStat = categoryStats[cat];
        // Target calculation
        const baseTarget = Math.round(cStat.baseSales * fMult * (0.95 + ((recordIdx % 7) * 0.02)));
        // Net sales with store multiplier and slight weekly variation
        const weekVariation = 0.92 + ((recordIdx * 37) % 25) / 100;
        const netSales = Math.round(baseTarget * sMult * weekVariation);

        // Gross sales & discounts
        const discountAmt = Math.round(netSales * (cStat.discRate + ((recordIdx % 5) * 0.008)));
        const grossSales = netSales + discountAmt;

        // Transactions & ATV
        const transactions = Math.max(15, Math.round(netSales / (cStat.atv * (0.9 + ((recordIdx % 11) * 0.02)))));
        const unitsSold = Math.round(transactions * (1.8 + ((recordIdx % 4) * 0.4)));

        // Footfall with realistic conversion rate (20% - 38%)
        const convRate = 0.22 + ((recordIdx % 9) * 0.015);
        const footfall = Math.round(transactions / convRate);

        // Returns amount
        const returnRate = cStat.returnRate + ((recordIdx % 6) * 0.006);
        const returnsAmt = Math.round(netSales * returnRate);

        // Inventory on hand & Stockouts
        // Introduce stockouts on specific high-demand or supply-choked scenarios
        const isStockoutProne = (recordIdx % 11 === 0) || (store.store_id === 'STR-504' && cat === 'Electronics') || (store.store_id === 'STR-103' && cat === 'Apparel');
        const stockouts = isStockoutProne ? Math.round(4 + ((recordIdx % 8) * 3)) : ((recordIdx % 23 === 0) ? 2 : 0);
        
        const inventoryOnHand = stockouts > 0 
          ? Math.round(unitsSold * (0.4 + ((recordIdx % 5) * 0.15))) 
          : Math.round(unitsSold * (3.5 + ((recordIdx % 6) * 0.7)));

        const customerRating = Number((3.8 + ((recordIdx % 12) * 0.1)).toFixed(1));
        const marketingSpend = Math.round(netSales * 0.035 + (recordIdx % 4) * 120);

        const rawSale: RawSalesRecord = {
          week_start_date: week,
          region: store.region,
          store_id: store.store_id,
          store_name: store.store_name,
          city: store.city,
          store_format: store.store_format,
          product_category: cat,
          footfall,
          transactions,
          units_sold: unitsSold,
          gross_sales: grossSales,
          discount_amount: discountAmt,
          net_sales: netSales,
          sales_target: baseTarget,
          inventory_on_hand: inventoryOnHand,
          stockouts,
          returns_amount: returnsAmt,
          customer_rating: customerRating,
          marketing_spend: marketingSpend,
        };

        sales.push(rawSale);

        merged.push({
          id: `rec-${recordIdx}-${store.store_id}`,
          week_start_date: week,
          region: store.region,
          store_id: store.store_id,
          store_name: store.store_name,
          city: store.city,
          store_format: store.store_format,
          product_category: cat,
          footfall,
          transactions,
          units_sold: unitsSold,
          gross_sales: grossSales,
          discount_amount: discountAmt,
          net_sales: netSales,
          sales_target: baseTarget,
          inventory_on_hand: inventoryOnHand,
          stockouts,
          returns_amount: returnsAmt,
          customer_rating: customerRating,
          marketing_spend: marketingSpend,
        });

        recordIdx++;
      }
    }
  }

  return { sales, storeMaster, merged };
}

/**
 * Downloads realistic template / demo Excel files for testing
 */
export function downloadSampleExcelWorkbook(type: 'sales' | 'store_master') {
  const dataset = generateSampleDataset();

  if (type === 'store_master') {
    const ws = XLSX.utils.json_to_sheet(dataset.storeMaster);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'StoreMaster');
    XLSX.writeFile(wb, 'store_master.xlsx');
  } else {
    // Generate sales sheet without store metadata for half the rows to test fallback join,
    // or full rows as specified by prompt
    const salesExport = dataset.sales.map((s) => ({
      week_start_date: s.week_start_date,
      region: s.region,
      store_id: s.store_id,
      store_name: s.store_name,
      city: s.city,
      store_format: s.store_format,
      product_category: s.product_category,
      footfall: s.footfall,
      transactions: s.transactions,
      units_sold: s.units_sold,
      gross_sales: s.gross_sales,
      discount_amount: s.discount_amount,
      net_sales: s.net_sales,
      sales_target: s.sales_target,
      inventory_on_hand: s.inventory_on_hand,
      stockouts: s.stockouts,
      returns_amount: s.returns_amount,
      customer_rating: s.customer_rating,
      marketing_spend: s.marketing_spend,
    }));
    const ws = XLSX.utils.json_to_sheet(salesExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'WeeklySales');
    XLSX.writeFile(wb, 'retail_weekly_sales.xlsx');
  }
}
