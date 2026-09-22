import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Download,
  Sparkles,
  ArrowRight,
  Database,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { RawSalesRecord, StoreMasterRecord } from '../types';
import {
  parseStoreMasterFile,
  parseWeeklySalesFile,
} from '../utils/excelParser';
import {
  downloadSampleExcelWorkbook,
  generateSampleDataset,
} from '../utils/sampleDataGenerator';

interface FileUploaderProps {
  onDataLoaded: (sales: RawSalesRecord[], master: StoreMasterRecord[]) => void;
  hasLoadedData: boolean;
  onClose?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onDataLoaded,
  hasLoadedData,
  onClose,
}) => {
  const [salesFile, setSalesFile] = useState<File | null>(null);
  const [masterFile, setMasterFile] = useState<File | null>(null);

  const [salesData, setSalesData] = useState<RawSalesRecord[] | null>(null);
  const [masterData, setMasterData] = useState<StoreMasterRecord[] | null>(null);

  const [salesError, setSalesError] = useState<string | null>(null);
  const [masterError, setMasterError] = useState<string | null>(null);

  const [salesMissing, setSalesMissing] = useState<string[]>([]);
  const [masterMissing, setMasterMissing] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dragActiveSales, setDragActiveSales] = useState<boolean>(false);
  const [dragActiveMaster, setDragActiveMaster] = useState<boolean>(false);

  const handleSalesUpload = async (file: File) => {
    setSalesFile(file);
    setSalesError(null);
    setSalesMissing([]);
    setIsLoading(true);

    try {
      const result = await parseWeeklySalesFile(file);
      if (result.success && result.data) {
        setSalesData(result.data);
      } else {
        setSalesError(result.error || 'Failed to parse weekly sales file.');
        setSalesMissing(result.missingColumns || []);
        setSalesData(null);
      }
    } catch (err: any) {
      setSalesError(err?.message || 'Error processing sales file.');
      setSalesData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMasterUpload = async (file: File) => {
    setMasterFile(file);
    setMasterError(null);
    setMasterMissing([]);
    setIsLoading(true);

    try {
      const result = await parseStoreMasterFile(file);
      if (result.success && result.data) {
        setMasterData(result.data);
      } else {
        setMasterError(result.error || 'Failed to parse store master file.');
        setMasterMissing(result.missingColumns || []);
        setMasterData(null);
      }
    } catch (err: any) {
      setMasterError(err?.message || 'Error processing store master file.');
      setMasterData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyUpload = () => {
    if (salesData && masterData) {
      onDataLoaded(salesData, masterData);
      if (onClose) onClose();
    }
  };

  const handleLoadSampleDataset = () => {
    setIsLoading(true);
    setTimeout(() => {
      const sample = generateSampleDataset();
      onDataLoaded(sample.sales, sample.storeMaster);
      setIsLoading(false);
      if (onClose) onClose();
    }, 250);
  };

  return (
    <div id="file-uploader-container" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white px-6 py-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center justify-center p-1.5 bg-blue-600/30 text-blue-400 rounded-md border border-blue-500/30">
                <Database className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Retail Intelligence Data Ingestion
              </h2>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Upload your retail chain’s sales logs and store master reference files. Both spreadsheets are parsed entirely in your browser with automatic <span className="text-white font-medium">store_id</span> joining and zero external cloud latency.
            </p>
          </div>

          {/* Quick Demo Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="load-sample-btn"
              type="button"
              onClick={handleLoadSampleDataset}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Load 20-Store Demo Data</span>
            </button>
            {hasLoadedData && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Upload Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1) Retail Weekly Sales Card */}
          <div
            id="sales-upload-dropzone"
            className={`border-2 border-dashed rounded-xl p-5 transition-all flex flex-col justify-between ${
              salesData
                ? 'border-emerald-400 bg-emerald-50/40'
                : salesError
                ? 'border-rose-400 bg-rose-50/40'
                : dragActiveSales
                ? 'border-blue-500 bg-blue-50/60'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActiveSales(true);
            }}
            onDragLeave={() => setDragActiveSales(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActiveSales(false);
              const file = e.dataTransfer.files[0];
              if (file) handleSalesUpload(file);
            }}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${salesData ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base">
                      1. Weekly Sales File
                    </h3>
                    <p className="text-xs text-slate-500">
                      retail_weekly_sales.xlsx
                    </p>
                  </div>
                </div>

                {salesData && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {salesData.length} records
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 mb-4 leading-normal">
                Weekly metrics: footfall, transactions, units, gross & net sales, targets, stockouts, returns.
              </p>

              {/* Status or Upload Trigger */}
              {salesData ? (
                <div className="bg-white border border-emerald-200 rounded-lg p-3 text-xs space-y-1 mb-3">
                  <div className="font-medium text-emerald-900 flex items-center justify-between">
                    <span className="truncate max-w-[200px]">{salesFile?.name}</span>
                    <span className="text-emerald-700">Ready</span>
                  </div>
                  <div className="text-slate-500 flex justify-between">
                    <span>Parsed rows:</span>
                    <span className="font-mono font-medium">{salesData.length.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 mb-3">
                  <label
                    htmlFor="sales-file-input"
                    className="flex flex-col items-center justify-center p-6 border border-slate-200 bg-white rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-xs font-medium text-slate-800">
                      Click to browse or drop <span className="text-blue-600 font-semibold">retail_weekly_sales.xlsx</span>
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Supports .xlsx, .xls
                    </span>
                    <input
                      id="sales-file-input"
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSalesUpload(file);
                      }}
                    />
                  </label>
                </div>
              )}

              {/* Errors */}
              {salesError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1 mb-3">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-900">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Upload Error</span>
                  </div>
                  <p>{salesError}</p>
                  {salesMissing.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-rose-200">
                      <span className="font-medium">Missing:</span> {salesMissing.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Template Download */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Need template?</span>
              <button
                type="button"
                onClick={() => downloadSampleExcelWorkbook('sales')}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Sales .xlsx</span>
              </button>
            </div>
          </div>

          {/* 2) Store Master Card */}
          <div
            id="master-upload-dropzone"
            className={`border-2 border-dashed rounded-xl p-5 transition-all flex flex-col justify-between ${
              masterData
                ? 'border-emerald-400 bg-emerald-50/40'
                : masterError
                ? 'border-rose-400 bg-rose-50/40'
                : dragActiveMaster
                ? 'border-blue-500 bg-blue-50/60'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActiveMaster(true);
            }}
            onDragLeave={() => setDragActiveMaster(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActiveMaster(false);
              const file = e.dataTransfer.files[0];
              if (file) handleMasterUpload(file);
            }}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${masterData ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base">
                      2. Store Master File
                    </h3>
                    <p className="text-xs text-slate-500">
                      store_master.xlsx
                    </p>
                  </div>
                </div>

                {masterData && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {masterData.length} stores
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 mb-4 leading-normal">
                Store reference data: store_id, store_name, region (North, South, East, West, Central), city, store_format.
              </p>

              {/* Status or Upload Trigger */}
              {masterData ? (
                <div className="bg-white border border-emerald-200 rounded-lg p-3 text-xs space-y-1 mb-3">
                  <div className="font-medium text-emerald-900 flex items-center justify-between">
                    <span className="truncate max-w-[200px]">{masterFile?.name}</span>
                    <span className="text-emerald-700">Ready</span>
                  </div>
                  <div className="text-slate-500 flex justify-between">
                    <span>Active stores mapped:</span>
                    <span className="font-mono font-medium">{masterData.length}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 mb-3">
                  <label
                    htmlFor="master-file-input"
                    className="flex flex-col items-center justify-center p-6 border border-slate-200 bg-white rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-xs font-medium text-slate-800">
                      Click to browse or drop <span className="text-indigo-600 font-semibold">store_master.xlsx</span>
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Supports .xlsx, .xls
                    </span>
                    <input
                      id="master-file-input"
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleMasterUpload(file);
                      }}
                    />
                  </label>
                </div>
              )}

              {/* Errors */}
              {masterError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1 mb-3">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-900">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Upload Error</span>
                  </div>
                  <p>{masterError}</p>
                  {masterMissing.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-rose-200">
                      <span className="font-medium">Missing:</span> {masterMissing.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Template Download */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Need template?</span>
              <button
                type="button"
                onClick={() => downloadSampleExcelWorkbook('store_master')}
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Master .xlsx</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="font-medium text-slate-800">Merge Rule:</span>
            <span>Files match on <code className="px-1.5 py-0.5 bg-slate-200 rounded font-mono text-[11px] text-slate-800">store_id</code>. Fields present in both default to weekly sales values.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="apply-upload-btn"
              type="button"
              onClick={handleApplyUpload}
              disabled={!salesData || !masterData || isLoading}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                salesData && masterData
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Process & Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
