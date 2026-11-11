import React, { useState, useEffect } from 'react';
import {
  School,
  Lock,
  Unlock,
  PlusCircle,
  FileSpreadsheet,
  Maximize2,
  ListOrdered,
  Bot,
  LogOut,
  Building2,
  Calendar,
} from 'lucide-react';
import { KecamatanConfig } from '../types';

interface HeaderProps {
  currentTab: 'table' | 'fullscreen' | 'ai';
  onSelectTab: (tab: 'table' | 'fullscreen' | 'ai') => void;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
  onAddNewSchool: () => void;
  onExportCSV: () => void;
  onEditKecamatan?: () => void;
  kecamatanConfig: KecamatanConfig;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isAdmin,
  onOpenAdminLogin,
  onLogoutAdmin,
  onAddNewSchool,
  onExportCSV,
  onEditKecamatan,
  kecamatanConfig,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }) +
          ' • ' +
          now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
          ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border-b border-slate-800 sticky top-0 z-30">
      {/* Top Banner Ribbon */}
      <div className="bg-indigo-950/80 px-4 py-1.5 border-b border-indigo-800/40 text-xs flex flex-wrap justify-between items-center gap-2 text-indigo-200">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Sistem Aktif & Terhubung
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="hidden sm:inline">
            {kecamatanConfig.korwilPendidikan} - {kecamatanConfig.kabupaten}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            {currentTime}
          </span>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 p-0.5 shadow-lg shadow-indigo-500/20 flex-shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  PORTAL REKAP ABSENSI KECAMATAN
                </h1>
                <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded text-xs font-semibold uppercase">
                  <span>{kecamatanConfig.namaKecamatan}</span>
                  {isAdmin && onEditKecamatan && (
                    <button
                      type="button"
                      onClick={onEditKecamatan}
                      className="text-amber-400 hover:text-amber-300 ml-1 text-xs"
                      title="Ubah Nama Wilayah / Kecamatan"
                    >
                      ✎
                    </button>
                  )}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Pusat Integrasi Google Sheets & AppSheet Kehadiran Sekolah Jenjang TK/PAUD, SD, & SMP
              </p>
            </div>
          </div>

          {/* Action Bar & Admin Status */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Admin Controls */}
            {isAdmin ? (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-xs shadow-sm">
                  <Unlock className="w-3.5 h-3.5" />
                  Mode Admin
                </span>
                <button
                  type="button"
                  onClick={onAddNewSchool}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow transition-colors"
                  title="Tambah data sekolah baru ke rekap kecamatan"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Tambah Sekolah
                </button>
                <button
                  type="button"
                  onClick={onExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-medium transition-colors"
                  title="Ekspor CSV berisi rincian 3 tautan spreadsheet sekolah"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  Ekspor CSV
                </button>
                <button
                  type="button"
                  onClick={onLogoutAdmin}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  title="Keluar dari mode admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-medium transition-colors"
                  title="Unduh rekap data kecamatan format CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  Ekspor CSV
                </button>
                {/* Discreet Admin Lock Button */}
                <button
                  type="button"
                  onClick={onOpenAdminLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-slate-700/80 rounded-lg text-xs font-medium transition-all"
                  title="Akses Pengelola / Admin Kecamatan"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Akses Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => onSelectTab('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'table'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            Daftar Sekolah & Rekap Absensi
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('fullscreen')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'fullscreen'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <Maximize2 className="w-4 h-4 text-emerald-400" />
            Spreadsheet Asli (Fullscreen View)
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'ai'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-purple-300 hover:bg-purple-900/30 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-300 animate-pulse" />
            Analisis Eksekutif AI Gemini
          </button>
        </div>
      </div>
    </header>
  );
};
