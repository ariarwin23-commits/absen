import React, { useState } from 'react';
import { School, SheetTab } from '../types';
import { SHEET_TABS, getEmbeddableSheetUrl } from '../utils/sheetUtils';
import {
  X,
  ExternalLink,
  RotateCw,
  Maximize2,
  Clock,
  CalendarDays,
  BarChart3,
  Building2,
  Info,
  AlertCircle,
  CheckCircle,
  Printer,
} from 'lucide-react';

interface PreviewModalProps {
  school: School | null;
  initialTab?: SheetTab;
  isOpen: boolean;
  onClose: () => void;
  onOpenFullscreen: (school: School, tab: SheetTab) => void;
  onOpenPrint: (school: School, tab: SheetTab) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  school,
  initialTab = 'waktu',
  isOpen,
  onClose,
  onOpenFullscreen,
  onOpenPrint,
}) => {
  const [activeTab, setActiveTab] = useState<SheetTab>(initialTab);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync initial tab when changed
  React.useEffect(() => {
    setActiveTab(initialTab);
    setIsLoading(true);
    setIframeKey(k => k + 1);
  }, [initialTab, school?.id, isOpen]);

  if (!isOpen || !school) return null;

  const currentTabInfo = SHEET_TABS[activeTab];

  const getLinkForTab = (tab: SheetTab): string => {
    switch (tab) {
      case 'waktu':
        return school.linkWaktu;
      case 'harian':
        return school.linkHarian;
      case 'bulanan':
        return school.linkBulanan;
    }
  };

  const rawUrl = getLinkForTab(activeTab);
  const embedUrl = getEmbeddableSheetUrl(rawUrl);

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleSwitchTab = (tab: SheetTab) => {
    setActiveTab(tab);
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  {school.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  NPSN: {school.npsn}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">
                  Desa {school.desa}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Jenjang {school.jenjang} • Status {school.status} • Kepala Sekolah: {school.kepalaSekolah || '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => onOpenFullscreen(school, activeTab)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Perbesar ke Mode Layar Penuh"
            >
              <Maximize2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Layar Penuh</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3-Tab Navigator */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Tab 1: Waktu */}
            <button
              type="button"
              onClick={() => handleSwitchTab('waktu')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'waktu'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>LAPORAN WAKTU</span>
              {school.linkWaktu ? (
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              ) : (
                <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">Kosong</span>
              )}
            </button>

            {/* Tab 2: Harian */}
            <button
              type="button"
              onClick={() => handleSwitchTab('harian')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'harian'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>REKAP HARIAN</span>
              {school.linkHarian ? (
                <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>
              ) : (
                <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">Kosong</span>
              )}
            </button>

            {/* Tab 3: Bulanan */}
            <button
              type="button"
              onClick={() => handleSwitchTab('bulanan')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'bulanan'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>REKAP BULANAN</span>
              {school.linkBulanan ? (
                <span className="w-2 h-2 rounded-full bg-amber-800 animate-pulse"></span>
              ) : (
                <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">Kosong</span>
              )}
            </button>
          </div>

          {/* Action Tools for current active sheet */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center gap-1 transition-colors"
              title="Muat Ulang Spreadsheet"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Muat Ulang</span>
            </button>

            {rawUrl && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenPrint(school, activeTab)}
                  className="p-1.5 px-2.5 text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Cetak Spreadsheet atau Ekspor ke PDF (Pas Kertas A4/Folio)"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cetak / Ekspor PDF</span>
                </button>
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 px-2.5 text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Buka Spreadsheet di Tab Baru Google Sheets"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Tab Baru</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Subheader Information */}
        <div className="bg-slate-50 px-5 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="font-medium text-slate-800">{currentTabInfo.subtitle}:</span>
            <span className="text-slate-600 hidden md:inline">{currentTabInfo.description}</span>
          </div>
          {rawUrl ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Tautan Terhubung
            </span>
          ) : (
            <span className="text-amber-700 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Belum Ada Tautan
            </span>
          )}
        </div>

        {/* Interactive Iframe Canvas */}
        <div className="flex-1 bg-slate-100 relative min-h-0 overflow-hidden">
          {rawUrl ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 bg-slate-50/90 z-10 flex flex-col items-center justify-center gap-3">
                  <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-semibold text-slate-600 animate-pulse">
                    Memuat tampilan spreadsheet...
                  </p>
                </div>
              )}
              <iframe
                key={iframeKey}
                src={embedUrl}
                title={`${school.name} - ${currentTabInfo.title}`}
                className="w-full h-full border-0 bg-white"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-1">
                Tautan {currentTabInfo.title} Belum Didaftarkan
              </h4>
              <p className="text-xs text-slate-500 max-w-md mb-4">
                Sekolah ini belum memiliki tautan spreadsheet untuk tab {currentTabInfo.title}. Admin dapat menambahkannya melalui menu edit data sekolah.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Note for Google Permissions */}
        <div className="bg-slate-900 text-slate-300 text-xs px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <span>
              <strong>Petunjuk Dinas:</strong> Jika spreadsheet meminta izin akses atau tidak muncul, klik tombol{' '}
              <span className="text-indigo-300 font-semibold">"Buka di Tab Baru"</span> atau pastikan sekolah telah memilih menu{' '}
              <em>File &gt; Bagikan &gt; Siapa saja yang memiliki link</em>.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
