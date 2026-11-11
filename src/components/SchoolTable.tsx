import React, { useState, useMemo } from 'react';
import { School, SchoolLevel, SheetTab } from '../types';
import {
  Search,
  Filter,
  Clock,
  CalendarDays,
  BarChart3,
  ExternalLink,
  Eye,
  Maximize2,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building,
  MapPin,
  Printer,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SchoolTableProps {
  schools: School[];
  onOpenPreview: (school: School, tab: SheetTab) => void;
  onOpenFullscreen: (school: School, tab: SheetTab) => void;
  onOpenPrint: (school: School, tab?: SheetTab) => void;
  isAdmin: boolean;
  onEditSchool: (school: School) => void;
  onDeleteSchool: (school: School) => void;
  selectedJenjang: 'Semua' | SchoolLevel;
  onSelectJenjang: (jenjang: 'Semua' | SchoolLevel) => void;
}

export const SchoolTable: React.FC<SchoolTableProps> = ({
  schools,
  onOpenPreview,
  onOpenFullscreen,
  onOpenPrint,
  isAdmin,
  onEditSchool,
  onDeleteSchool,
  selectedJenjang,
  onSelectJenjang,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDesa, setSelectedDesa] = useState<string>('Semua');
  const [linkFilter, setLinkFilter] = useState<'Semua' | 'Lengkap' | 'BelumLengkap'>('Semua');

  // Unique villages for filter dropdown
  const desaList = useMemo(() => {
    const set = new Set<string>();
    schools.forEach(s => {
      if (s.desa) set.add(s.desa);
    });
    return Array.from(set).sort();
  }, [schools]);

  // Filtered schools
  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      // Search query in Name, NPSN, Desa, or Kepala Sekolah
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchName = school.name.toLowerCase().includes(query);
        const matchNpsn = school.npsn.toLowerCase().includes(query);
        const matchDesa = school.desa.toLowerCase().includes(query);
        const matchKepsek = (school.kepalaSekolah || '').toLowerCase().includes(query);
        if (!matchName && !matchNpsn && !matchDesa && !matchKepsek) {
          return false;
        }
      }

      // Filter Jenjang
      if (selectedJenjang !== 'Semua' && school.jenjang !== selectedJenjang) {
        return false;
      }

      // Filter Desa
      if (selectedDesa !== 'Semua' && school.desa !== selectedDesa) {
        return false;
      }

      // Filter Kelengkapan Link
      const isComplete = Boolean(school.linkWaktu && school.linkHarian && school.linkBulanan);
      if (linkFilter === 'Lengkap' && !isComplete) return false;
      if (linkFilter === 'BelumLengkap' && isComplete) return false;

      return true;
    });
  }, [schools, searchQuery, selectedJenjang, selectedDesa, linkFilter]);

  const getJenjangBadge = (jenjang: SchoolLevel) => {
    switch (jenjang) {
      case 'TK/PAUD':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'SD':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SMP':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top Filter & Search Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama sekolah, NPSN, atau desa..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

            {/* Jenjang Filter Buttons */}
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Jenjang:
              </span>
              {(['Semua', 'SD', 'SMP', 'TK/PAUD'] as const)
                .filter(lvl => lvl === 'Semua' || lvl === 'SD' || schools.some(s => s.jenjang === lvl))
                .map(j => {
                  const count =
                    j === 'Semua' ? schools.length : schools.filter(s => s.jenjang === j).length;
              const isActive = selectedJenjang === j;
              return (
                <button
                  key={j}
                  type="button"
                  onClick={() => onSelectJenjang(j)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span>{j}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desa Filter & Link Status */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Desa Select */}
            <select
              value={selectedDesa}
              onChange={e => setSelectedDesa(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Semua">Semua Desa/Kelurahan ({desaList.length})</option>
              {desaList.map(desa => (
                <option key={desa} value={desa}>
                  Desa {desa}
                </option>
              ))}
            </select>

            {/* Link Status Select */}
            <select
              value={linkFilter}
              onChange={e => setLinkFilter(e.target.value as any)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Semua">Status Link (Semua)</option>
              <option value="Lengkap">3 Link Lengkap</option>
              <option value="BelumLengkap">Belum Lengkap</option>
            </select>
          </div>
        </div>

        {/* Legend for 3 Buttons */}
        <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center flex-wrap gap-4">
            <span className="font-semibold text-slate-700">Petunjuk 3 Tautan Spreadsheet:</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block"></span>
              <strong className="text-emerald-800">Tombol Hijau (Waktu):</strong> Laporan Jam Masuk/Pulang
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-blue-600 inline-block"></span>
              <strong className="text-blue-800">Tombol Biru (Harian):</strong> Rekap Absen Harian
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-500 inline-block"></span>
              <strong className="text-amber-800">Tombol Kuning (Bulanan):</strong> Rekap Bulanan
            </span>
          </div>
          <span className="text-slate-500 font-medium">
            Menampilkan <strong>{filteredSchools.length}</strong> dari <strong>{schools.length}</strong> sekolah
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4 min-w-[240px]">Sekolah & NPSN</th>
              <th className="py-3 px-4 min-w-[140px]">Desa / Kelurahan</th>
              <th className="py-3 px-4 min-w-[320px] text-center">
                3 Tautan Spreadsheet Khusus
              </th>
              <th className="py-3 px-4 min-w-[160px] text-center">Pratinjau & Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {filteredSchools.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <AlertCircle className="w-10 h-10 text-slate-400 mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada sekolah yang cocok</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Coba ganti kata kunci pencarian atau ubah filter jenjang/desa.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSchools.map((school, index) => {
                const isAllConnected =
                  Boolean(school.linkWaktu) &&
                  Boolean(school.linkHarian) &&
                  Boolean(school.linkBulanan);

                return (
                  <tr
                    key={school.id}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    {/* No */}
                    <td className="py-3.5 px-4 text-center font-medium text-slate-500 text-xs">
                      {index + 1}
                    </td>

                    {/* Sekolah & NPSN */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 mt-0.5">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                              {school.name}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getJenjangBadge(
                                school.jenjang
                              )}`}
                            >
                              {school.jenjang}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                              {school.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span>NPSN: <strong>{school.npsn}</strong></span>
                            {school.kepalaSekolah && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[200px]" title={school.kepalaSekolah}>
                                  Kepsek: {school.kepalaSekolah}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Desa */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        <span>Desa {school.desa}</span>
                      </div>
                      {school.notes && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1" title={school.notes}>
                          {school.notes}
                        </p>
                      )}
                    </td>

                    {/* 3 Tautan Spreadsheet Khusus (Waktu, Harian, Bulanan) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {/* 1. Tombol Waktu (Hijau) */}
                        <button
                          type="button"
                          onClick={() => onOpenPreview(school, 'waktu')}
                          className={`group/btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                            school.linkWaktu
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 active:scale-95'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title={
                            school.linkWaktu
                              ? 'Klik untuk membuka LAPORAN WAKTU (Jam kehadiran & kepulangan)'
                              : 'Link Laporan Waktu belum diatur'
                          }
                        >
                          <Clock className="w-3.5 h-3.5 text-emerald-200 group-hover/btn:text-white" />
                          <span>WAKTU</span>
                        </button>

                        {/* 2. Tombol Harian (Biru) */}
                        <button
                          type="button"
                          onClick={() => onOpenPreview(school, 'harian')}
                          className={`group/btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                            school.linkHarian
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 active:scale-95'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title={
                            school.linkHarian
                              ? 'Klik untuk membuka REKAP ABSEN HARIAN'
                              : 'Link Rekap Absen Harian belum diatur'
                          }
                        >
                          <CalendarDays className="w-3.5 h-3.5 text-blue-200 group-hover/btn:text-white" />
                          <span>HARIAN</span>
                        </button>

                        {/* 3. Tombol Bulanan (Kuning) */}
                        <button
                          type="button"
                          onClick={() => onOpenPreview(school, 'bulanan')}
                          className={`group/btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                            school.linkBulanan
                              ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-400/25 active:scale-95'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title={
                            school.linkBulanan
                              ? 'Klik untuk membuka REKAP BULANAN'
                              : 'Link Rekap Bulanan belum diatur'
                          }
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-slate-900 group-hover/btn:text-slate-950" />
                          <span>BULANAN</span>
                        </button>
                      </div>

                      {/* Small connection indicator */}
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {isAllConnected ? (
                          <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> 3 Link Tersambung
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Sebagian Belum Diatur
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Pratinjau & Aksi */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Pratinjau 3-Tab Modal Button */}
                        <button
                          type="button"
                          onClick={() => onOpenPreview(school, 'waktu')}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-indigo-200"
                          title="Buka Pratinjau Modal Interaktif 3-Tab"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Pratinjau</span>
                        </button>

                        {/* Cetak / Ekspor PDF Button */}
                        <button
                          type="button"
                          onClick={() => onOpenPrint(school, 'waktu')}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-emerald-200"
                          title="Cetak & Ekspor Spreadsheet ke PDF (Pas Ukuran Kertas A4/Folio)"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden md:inline">Cetak/PDF</span>
                        </button>

                        {/* Fullscreen Button */}
                        <button
                          type="button"
                          onClick={() => onOpenFullscreen(school, 'waktu')}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors"
                          title="Buka di Menu Spreadsheet Layar Penuh"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Admin Edit & Delete */}
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => onEditSchool(school)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs transition-colors border border-amber-200"
                              title="Edit Data & 3 Link Spreadsheet Sekolah"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteSchool(school)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs transition-colors border border-red-200"
                              title="Hapus Sekolah dari Daftar Rekap"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
