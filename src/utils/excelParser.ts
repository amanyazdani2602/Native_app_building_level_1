import * as XLSX from 'xlsx';
import { MergedRetailRecord, RawSalesRecord, StoreMasterRecord } from '../types';

/**
 * Normalizes an object's keys to lowercase snake_case for robust column matching
 */
function normalizeRowKeys(row: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  for (const key of Object.keys(row)) {
    const cleanKey = key
      .toLowerCase()
      .trim()
      .replace(/[\s\-_]+/g, '_')
      .replace(/[^\w]/g, '');
    normalized[cleanKey] = row[key];
  }
  return normalized;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Formats day, month (1-12), year into standard "DD MMM YYYY" (e.g., "13 Apr 2026")
 */
export function formatToDDMMMYYYY(day: number, month: number, year: number): string {
  if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12) {
    return 'Unknown';
  }
  const dStr = day < 10 ? `0${day}` : `${day}`;
  const mStr = MONTH_NAMES[month - 1] || 'Jan';
  return `${dStr} ${mStr} ${year}`;
}

/**
 * Converts a week date string (e.g. "13 Apr 2026", "2026-04-13", "13-04-2026") into a UTC millisecond timestamp for chronological sorting.
 * Returns Number.MAX_SAFE_INTEGER for 'Unknown' so it sorts cleanly to the end.
 */
export function parseWeekToTimestamp(weekStr: string): number {
  if (!weekStr || weekStr === 'Unknown' || weekStr.toLowerCase().includes('invalid')) {
    return Number.MAX_SAFE_INTEGER;
  }

  // Format: "13 Apr 2026" or "06 Jan 2025"
  const dMmmY = weekStr.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (dMmmY) {
    const day = parseInt(dMmmY[1], 10);
    const mStr = dMmmY[2].toLowerCase();
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const mIdx = months.indexOf(mStr);
    const year = parseInt(dMmmY[3], 10);
    if (mIdx !== -1) {
      return Date.UTC(year, mIdx, day);
    }
  }

  // Format: "dd-MM-yyyy" or "dd/MM/yyyy"
  const dmy = weekStr.trim().match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10);
    const year = parseInt(dmy[3], 10);
    return Date.UTC(year, month - 1, day);
  }

  // Format: "yyyy-MM-dd"
  const ymd = weekStr.trim().match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymd) {
    const year = parseInt(ymd[1], 10);
    const month = parseInt(ymd[2], 10);
    const day = parseInt(ymd[3], 10);
    return Date.UTC(year, month - 1, day);
  }

  const parsed = Date.parse(weekStr);
  return isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
}

/**
 * Parses mixed Excel date inputs into normalized "DD MMM YYYY" strings (example: "13 Apr 2026"):
 * - Excel numeric serial numbers (e.g. 46125)
 * - Text in dd-MM-yyyy (e.g. "13-04-2026")
 * - Text in yyyy-MM-dd (e.g. "2026-04-13")
 * - Date objects
 * - Literal "invalid-date" or unparseable text -> "Unknown"
 */
export function formatExcelDate(value: any): string {
  if (value === null || value === undefined) {
    return 'Unknown';
  }

  const strVal = String(value).trim();
  if (!strVal || strVal.toLowerCase().includes('invalid')) {
    return 'Unknown';
  }

  // 1. If it's a JavaScript Date object
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return 'Unknown';
    const year = value.getUTCFullYear();
    const month = value.getUTCMonth() + 1;
    const day = value.getUTCDate();
    return formatToDDMMMYYYY(day, month, year);
  }

  // 2. If it's a numeric Excel serial date (e.g. 46125 or "46125")
  if (typeof value === 'number' || /^\d{4,5}(\.\d+)?$/.test(strVal)) {
    const num = typeof value === 'number' ? value : parseFloat(strVal);
    if (!isNaN(num) && num > 0) {
      // Excel serial date formula: (serial - 25569) * 86400 * 1000 UTC ms
      const wholeDays = Math.floor(num);
      const utcMs = Math.round((wholeDays - 25569) * 86400 * 1000);
      const dateObj = new Date(utcMs);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getUTCFullYear();
        const month = dateObj.getUTCMonth() + 1;
        const day = dateObj.getUTCDate();
        if (year >= 1970 && year <= 2100) {
          return formatToDDMMMYYYY(day, month, year);
        }
      }
    }
  }

  // 3. Text in dd-MM-yyyy (e.g. "13-04-2026", "13/04/2026", "13.04.2026")
  const dmyMatch = strVal.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1970 && year <= 2100) {
      return formatToDDMMMYYYY(day, month, year);
    }
  }

  // 4. Text in yyyy-MM-dd (e.g. "2026-04-13", "2025-01-06")
  const ymdMatch = strVal.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1970 && year <= 2100) {
      return formatToDDMMMYYYY(day, month, year);
    }
  }

  // 5. Already formatted as DD MMM YYYY (e.g. "13 Apr 2026")
  const dMmmYMatch = strVal.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (dMmmYMatch) {
    const day = parseInt(dMmmYMatch[1], 10);
    const mStr = dMmmYMatch[2].toLowerCase();
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const mIdx = months.indexOf(mStr);
    const year = parseInt(dMmmYMatch[3], 10);
    if (mIdx !== -1 && day >= 1 && day <= 31 && year >= 1970 && year <= 2100) {
      return formatToDDMMMYYYY(day, mIdx + 1, year);
    }
  }

  // 6. Generic JS date fallback
  const fallbackDate = new Date(strVal);
  if (!isNaN(fallbackDate.getTime())) {
    const year = fallbackDate.getFullYear();
    const month = fallbackDate.getMonth() + 1;
    const day = fallbackDate.getDate();
    if (year >= 1970 && year <= 2100) {
      return formatToDDMMMYYYY(day, month, year);
    }
  }

  return 'Unknown';
}

const REQUIRED_SALES_COLUMNS = [
  'week_start_date',
  'store_id',
  'product_category',
  'transactions',
  'units_sold',
  'gross_sales',
  'discount_amount',
  'net_sales',
  'sales_target',
  'inventory_on_hand',
  'stockouts',
  'returns_amount',
];

const REQUIRED_STORE_MASTER_COLUMNS = [
  'store_id',
  'store_name',
  'region',
  'city',
  'store_format',
];

export interface ParseResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
  missingColumns?: string[];
  totalRows?: number;
}

/**
 * Parses store_master.xlsx file
 */
export async function parseStoreMasterFile(file: File): Promise<ParseResult<StoreMasterRecord>> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { success: false, error: 'The store master file does not contain any sheets.' };
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

    if (rawRows.length === 0) {
      return { success: false, error: 'The store master sheet contains no data rows.' };
    }

    // Inspect first row keys
    const firstRowNormalized = normalizeRowKeys(rawRows[0]);
    const firstRowKeys = Object.keys(firstRowNormalized);

    const missingColumns = REQUIRED_STORE_MASTER_COLUMNS.filter(
      (col) => !firstRowKeys.includes(col)
    );

    if (missingColumns.length > 0) {
      return {
        success: false,
        error: `Store master file is missing required columns: ${missingColumns.join(', ')}`,
        missingColumns,
      };
    }

    const records: StoreMasterRecord[] = rawRows.map((row) => {
      const norm = normalizeRowKeys(row);
      return {
        store_id: String(norm.store_id || '').trim(),
        store_name: String(norm.store_name || '').trim(),
        region: String(norm.region || '').trim(),
        city: String(norm.city || '').trim(),
        store_format: String(norm.store_format || '').trim(),
      };
    }).filter((r) => r.store_id !== '');

    return {
      success: true,
      data: records,
      totalRows: records.length,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to parse Store Master file: ${err?.message || 'Invalid Excel format'}`,
    };
  }
}

/**
 * Parses retail_weekly_sales.xlsx file
 */
export async function parseWeeklySalesFile(file: File): Promise<ParseResult<RawSalesRecord>> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { success: false, error: 'The weekly sales file does not contain any sheets.' };
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

    if (rawRows.length === 0) {
      return { success: false, error: 'The weekly sales sheet contains no data rows.' };
    }

    const firstRowNormalized = normalizeRowKeys(rawRows[0]);
    const firstRowKeys = Object.keys(firstRowNormalized);

    const missingColumns = REQUIRED_SALES_COLUMNS.filter(
      (col) => !firstRowKeys.includes(col)
    );

    if (missingColumns.length > 0) {
      return {
        success: false,
        error: `Weekly sales file is missing required columns: ${missingColumns.join(', ')}`,
        missingColumns,
      };
    }

    const records: RawSalesRecord[] = rawRows.map((row) => {
      const norm = normalizeRowKeys(row);
      return {
        week_start_date: norm.week_start_date,
        region: norm.region ? String(norm.region).trim() : undefined,
        store_id: String(norm.store_id || '').trim(),
        store_name: norm.store_name ? String(norm.store_name).trim() : undefined,
        city: norm.city ? String(norm.city).trim() : undefined,
        store_format: norm.store_format ? String(norm.store_format).trim() : undefined,
        product_category: String(norm.product_category || 'General').trim(),
        footfall: norm.footfall,
        transactions: norm.transactions,
        units_sold: norm.units_sold,
        gross_sales: norm.gross_sales,
        discount_amount: norm.discount_amount,
        net_sales: norm.net_sales,
        sales_target: norm.sales_target,
        inventory_on_hand: norm.inventory_on_hand,
        stockouts: norm.stockouts,
        returns_amount: norm.returns_amount,
        customer_rating: norm.customer_rating,
        marketing_spend: norm.marketing_spend,
      };
    }).filter((r) => r.store_id !== '');

    return {
      success: true,
      data: records,
      totalRows: records.length,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to parse Weekly Sales file: ${err?.message || 'Invalid Excel format'}`,
    };
  }
}

/**
 * Joins sales to store master on store_id.
 * If a field exists in both, prefers sales, falls back to store master.
 */
export function joinSalesAndStoreMaster(
  sales: RawSalesRecord[],
  storeMaster: StoreMasterRecord[]
): MergedRetailRecord[] {
  const masterMap = new Map<string, StoreMasterRecord>();
  for (const master of storeMaster) {
    masterMap.set(String(master.store_id).trim().toUpperCase(), master);
  }

  return sales.map((sale, index) => {
    const storeIdNormalized = String(sale.store_id).trim().toUpperCase();
    const master = masterMap.get(storeIdNormalized);

    // Prefer sales, fallback to store master, then default fallback
    const region = sale.region || master?.region || 'Unknown Region';
    const store_name = sale.store_name || master?.store_name || `Store ${sale.store_id}`;
    const city = sale.city || master?.city || 'Unknown City';
    const store_format = sale.store_format || master?.store_format || 'Standard Store';

    const num = (v: any, def = 0): number => {
      if (v === null || v === undefined || v === '') return def;
      const n = Number(v);
      return isNaN(n) ? def : n;
    };

    const parsedDate = formatExcelDate(sale.week_start_date);

    return {
      id: `rec-${index + 1}-${sale.store_id}`,
      week_start_date: parsedDate,
      region,
      store_id: String(sale.store_id).trim(),
      store_name,
      city,
      store_format,
      product_category: sale.product_category || 'General',
      footfall: Math.max(0, num(sale.footfall, Math.round(num(sale.transactions) * 3.5))),
      transactions: Math.max(0, num(sale.transactions)),
      units_sold: Math.max(0, num(sale.units_sold)),
      gross_sales: Math.max(0, num(sale.gross_sales)),
      discount_amount: Math.max(0, num(sale.discount_amount)),
      net_sales: Math.max(0, num(sale.net_sales)),
      sales_target: Math.max(0, num(sale.sales_target)),
      inventory_on_hand: Math.max(0, num(sale.inventory_on_hand)),
      stockouts: Math.max(0, num(sale.stockouts)),
      returns_amount: Math.max(0, num(sale.returns_amount)),
      customer_rating: Math.min(5, Math.max(1, num(sale.customer_rating, 4.2))),
      marketing_spend: Math.max(0, num(sale.marketing_spend)),
    };
  });
}
