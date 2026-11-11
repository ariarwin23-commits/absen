import React from 'react';
import { School, SchoolLevel } from '../types';
import { School as SchoolIcon, Clock, CalendarDays, BarChart3, CheckCircle2 } from 'lucide-react';

interface StatsCardsProps {
  schools: School[];
  selectedJenjang: 'Semua' | SchoolLevel;
  onSelectJenjang: (jenjang: 'Semua' | SchoolLevel) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  schools,
  selectedJenjang,
  onSelectJenjang,
}) => {
  const total = schools.length;
  const tkCount = schools.filter(s => s.jenjang === 'TK/PAUD').length;
  const sdCount = schools.filter(s => s.jenjang === 'SD').length;
  const smpCount = schools.filter(s => s.jenjang === 'SMP').length;

  const waktuLinks = schools.filter(s => Boolean(s.linkWaktu)).length;
  const harianLinks = schools.filter(s => Boolean(s.linkHarian)).length;
  const bulananLinks = schools.filter(s => Boolean(s.linkBulanan)).length;
  const fullyConnected = schools.filter(s => s.linkWaktu && s.linkHarian && s.linkBulanan).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Sekolah */}
      <div
        onClick={() => onSelectJenjang('Semua')}
        className={`cursor-pointer bg-white p-4 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${
          selectedJenjang === 'Semua'
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Sekolah
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <SchoolIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500 font-medium">Lembaga</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{fullyConnected} dari {total} sekolah lengkap 3 link</span>
        </div>
      </div>

      {/* Tautan Laporan Waktu */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Laporan Waktu (Hijau)
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{waktuLinks}</span>
          <span className="text-xs text-slate-500 font-medium">/{total} Terhubung</span>
        </div>
        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${total ? (waktuLinks / total) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Tautan Rekap Harian */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Rekap Harian (Biru)
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-700">{harianLinks}</span>
          <span className="text-xs text-slate-500 font-medium">/{total} Terhubung</span>
        </div>
        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${total ? (harianLinks / total) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Tautan Rekap Bulanan */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
            Rekap Bulanan (Kuning)
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{bulananLinks}</span>
          <span className="text-xs text-slate-500 font-medium">/{total} Terhubung</span>
        </div>
        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${total ? (bulananLinks / total) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
