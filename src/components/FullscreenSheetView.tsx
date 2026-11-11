import React, { useState, useEffect } from 'react';
import { School, SheetTab } from '../types';
import { SHEET_TABS, getEmbeddableSheetUrl } from '../utils/sheetUtils';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RotateCw,
  Maximize2,
  Clock,
  CalendarDays,
  BarChart3,
  Building2,
  AlertCircle,
  HelpCircle,
  Minimize2,
  CheckCircle,
  Printer,
} from 'lucide-react';

interface FullscreenSheetViewProps {
  schools: School[];
  currentSchoolId: string;
  onChangeSchool: (schoolId: string) => void;
  activeTab: SheetTab;
  onChangeTab: (tab: SheetTab) => void;
  onBackToTable: () => void;
  onOpenPrint: (school: School, tab: SheetTab) => void;
}

export const FullscreenSheetView: React.FC<FullscreenSheetViewProps> = ({
  schools,
  currentSchoolId,
  onChangeSchool,
  activeTab,
  onChangeTab,
  onBackToTable,
  onOpenPrint,
}) => {
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTrueFullscreen, setIsTrueFullscreen] = useState<boolean>(false);

  const currentSchool =
    schools.find(s => s.id === currentSchoolId) || schools[0];

  const currentIndex = schools.findIndex(s => s.id === currentSchool?.id);

  // Sync loader on changes
  useEffect(() => {
    setIsLoading(true);
    setIframeKey(k => k + 1);
  }, [currentSchool?.id, activeTab]);

  const currentTabInfo = SHEET_TABS[activeTab];

  const getLinkForTab = (tab: SheetTab): string => {
    if (!currentSchool) return '';
    switch (tab) {
      case 'waktu':
        return currentSchool.linkWaktu;
      case 'harian':
        return currentSchool.linkHarian;
      case 'bulanan':
        return currentSchool.linkBulanan;
    }
  };

  const rawUrl = getLinkForTab(activeTab);
  const embedUrl = getEmbeddableSheetUrl(rawUrl);

  const handlePrevSchool = () => {
    if (currentIndex > 0) {
      onChangeSchool(schools[currentIndex - 1].id);
    }
  };

  const handleNextSchool = () => {
    if (currentIndex < schools.length - 1) {
      onChangeSchool(schools[currentIndex + 1].id);
    }
  };

  const handleToggleTrueFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsTrueFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsTrueFullscreen(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[85vh]">
      {/* Top Controller Bar */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
        {/* Left: School Selector & Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onBackToTable}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke Daftar</span>
          </button>

          {/* Prev/Next buttons */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              type="button"
              disabled={currentIndex <= 0}
              onClick={handlePrevSchool}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 rounded transition-colors"
              title="Sekolah Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono text-slate-400">
              {currentIndex + 1}/{schools.length}
            </span>
            <button
              type="button"
              disabled={currentIndex >= schools.length - 1}
              onClick={handleNextSchool}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 rounded transition-colors"
              title="Sekolah Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* School Dropdown */}
          <div className="relative min-w-[260px] sm:min-w-[320px]">
            <select
              value={currentSchool?.id || ''}
              onChange={e => onChangeSchool(e.target.value)}
              className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg py-2 pl-3 pr-8 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name} ({school.jenjang} - Desa {school.desa})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: 3 Tab Switchers (Waktu, Harian, Bulanan) */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 self-start md:self-center overflow-x-auto">
          {/* WAKTU */}
          <button
            type="button"
            onClick={() => onChangeTab('waktu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'waktu'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Laporan Waktu</span>
          </button>

          {/* HARIAN */}
          <button
            type="button"
            onClick={() => onChangeTab('harian')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'harian'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Rekap Harian</span>
          </button>

          {/* BULANAN */}
          <button
            type="button"
            onClick={() => onChangeTab('bulanan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'bulanan'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Rekap Bulanan</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setIframeKey(k => k + 1);
            }}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition-colors flex items-center gap-1"
            title="Muat Ulang Iframe"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reload</span>
          </button>

          {rawUrl && (
            <>
              <button
                type="button"
                onClick={() => onOpenPrint(currentSchool, activeTab)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                title="Cetak Spreadsheet atau Ekspor ke PDF (Pas Kertas A4/Folio)"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / PDF</span>
              </button>
              <a
                href={rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                title="Buka Spreadsheet di Tab Baru"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Asli</span>
              </a>
            </>
          )}

          <button
            type="button"
            onClick={handleToggleTrueFullscreen}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition-colors"
            title="Toggle Layar Penuh Browser"
          >
            {isTrueFullscreen ? (
              <Minimize2 className="w-4 h-4 text-amber-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Info Status Sub-bar */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{currentSchool?.name}</span>
          <span className="text-slate-400">|</span>
          <span>NPSN: {currentSchool?.npsn}</span>
          <span className="text-slate-400">|</span>
          <span>Desa: {currentSchool?.desa}</span>
          <span className="text-slate-400">|</span>
          <span>Mode: <strong>{currentTabInfo.title}</strong> ({currentTabInfo.subtitle})</span>
        </div>
        {rawUrl ? (
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Tautan Aktif & Siap Ditampilkan
          </span>
        ) : (
          <span className="text-amber-700 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Tautan Belum Diisi
          </span>
        )}
      </div>

      {/* Iframe Viewport */}
      <div className="flex-1 bg-slate-100 relative min-h-0 overflow-hidden">
        {rawUrl ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-slate-50/90 z-10 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-slate-700 animate-pulse">
                  Memuat data spreadsheet {currentSchool?.name}...
                </p>
              </div>
            )}
            <iframe
              key={iframeKey}
              src={embedUrl}
              title={`Fullscreen ${currentSchool?.name} - ${currentTabInfo.title}`}
              className="w-full h-full border-0 bg-white"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {currentTabInfo.title} Belum Tersedia
            </h3>
            <p className="text-xs text-slate-500 max-w-md mb-4">
              Sekolah "{currentSchool?.name}" belum mengisi tautan spreadsheet untuk {currentTabInfo.subtitle}.
            </p>
            <button
              type="button"
              onClick={onBackToTable}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              Kembali ke Daftar Sekolah
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
