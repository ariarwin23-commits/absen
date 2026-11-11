import React, { useState } from 'react';
import { School, SheetTab } from '../types';
import { SHEET_TABS, getGoogleSheetPdfExportUrl, isGoogleSheetsUrl } from '../utils/sheetUtils';
import {
  Printer,
  FileDown,
  X,
  FileSpreadsheet,
  Check,
  Copy,
  ExternalLink,
  Sliders,
  Settings2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface SheetPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School | null;
  initialTab?: SheetTab;
}

export const SheetPrintModal: React.FC<SheetPrintModalProps> = ({
  isOpen,
  onClose,
  school,
  initialTab = 'waktu',
}) => {
  const [selectedTab, setSelectedTab] = useState<SheetTab>(initialTab);
  const [paperSize, setPaperSize] = useState<'a4' | 'folio' | 'legal' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [fitToWidth, setFitToWidth] = useState<boolean>(true);
  const [gridlines, setGridlines] = useState<boolean>(true);
  const [repeatFrozenRows, setRepeatFrozenRows] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  React.useEffect(() => {
    setSelectedTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen || !school) return null;

  const currentTabInfo = SHEET_TABS[selectedTab];

  const getUrlForTab = (tab: SheetTab): string => {
    switch (tab) {
      case 'waktu':
        return school.linkWaktu;
      case 'harian':
        return school.linkHarian;
      case 'bulanan':
        return school.linkBulanan;
    }
  };

  const rawUrl = getUrlForTab(selectedTab);
  const isGSheet = isGoogleSheetsUrl(rawUrl);

  const pdfUrl = getGoogleSheetPdfExportUrl(rawUrl, {
    paperSize,
    orientation,
    fitToWidth,
    gridlines,
    repeatFrozenRows,
  });

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else if (rawUrl) {
      window.open(rawUrl, '_blank');
    }
  };

  const handleDirectPrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
      }
    } else {
      window.print();
    }
  };

  const handleCopyPdfLink = () => {
    if (pdfUrl) {
      navigator.clipboard.writeText(pdfUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Cetak & Ekspor PDF Spreadsheet
              </h3>
              <p className="text-xs text-slate-300">
                {school.name} • Pas Ukuran Kertas & Siap Cetak
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* 1. Pilih Tab Spreadsheet yang Ingin Dicetak */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pilih Spreadsheet yang Dicetak:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTab('waktu')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  selectedTab === 'waktu'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Laporan Waktu</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTab('harian')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  selectedTab === 'harian'
                    ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>Rekap Harian</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTab('bulanan')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  selectedTab === 'bulanan'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Rekap Bulanan</span>
              </button>
            </div>
          </div>

          {/* 2. Pengaturan Kertas & Orientasi */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Settings2 className="w-4 h-4 text-indigo-600" />
              <span>Pengaturan Format Kertas (Agar Pas & Tidak Terpotong)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Paper Size */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Ukuran Kertas:</label>
                <select
                  value={paperSize}
                  onChange={e => setPaperSize(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="a4">A4 (210 x 297 mm) - Standar Sekolah</option>
                  <option value="folio">F4 / Folio (215 x 330 mm) - Standar Dinas</option>
                  <option value="legal">Legal (216 x 356 mm)</option>
                  <option value="letter">Letter (216 x 279 mm)</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Orientasi Kertas:</label>
                <select
                  value={orientation}
                  onChange={e => setOrientation(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="landscape">Landscape (Mendatar - Rekomendasi)</option>
                  <option value="portrait">Portrait (Tegak)</option>
                </select>
              </div>
            </div>

            {/* Checkboxes: Fit to Width & Gridlines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={fitToWidth}
                  onChange={e => setFitToWidth(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Pas ke Lebar Kertas (Fit to Width)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={gridlines}
                  onChange={e => setGridlines(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Cetak Garis Tabel (Gridlines)</span>
              </label>
            </div>
          </div>

          {/* Status URL Info */}
          {rawUrl ? (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Tautan {currentTabInfo.title} aktif ({isGSheet ? 'Google Sheets' : 'Web Sheet'}).
                </span>
              </div>
              {isGSheet && (
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                  Format Presisi PDF Google
                </span>
              )}
            </div>
          ) : (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Sekolah belum memiliki tautan untuk spreadsheet {currentTabInfo.title}.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
            {pdfUrl && (
              <button
                type="button"
                onClick={handleCopyPdfLink}
                className="w-full sm:w-auto px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                title="Salin tautan download PDF langsung"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin!' : 'Salin Tautan PDF'}</span>
              </button>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Tutup
              </button>

              <button
                type="button"
                disabled={!rawUrl}
                onClick={handleDownloadPdf}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <FileDown className="w-4 h-4" />
                <span>Ekspor & Unduh PDF</span>
              </button>

              <button
                type="button"
                disabled={!rawUrl}
                onClick={handleDirectPrint}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
