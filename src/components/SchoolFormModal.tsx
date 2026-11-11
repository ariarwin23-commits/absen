import React, { useState, useEffect } from 'react';
import { School, SchoolLevel, SchoolStatus } from '../types';
import {
  X,
  Building,
  Clock,
  CalendarDays,
  BarChart3,
  Link as LinkIcon,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface SchoolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schoolData: Partial<School>) => void;
  initialData?: School | null;
}

export const SchoolFormModal: React.FC<SchoolFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState<Partial<School>>({
    name: '',
    npsn: '',
    desa: '',
    jenjang: 'SD',
    status: 'Negeri',
    kepalaSekolah: '',
    phone: '',
    linkWaktu: '',
    linkHarian: '',
    linkBulanan: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
      });
    } else {
      setFormData({
        name: '',
        npsn: '',
        desa: '',
        jenjang: 'SD',
        status: 'Negeri',
        kepalaSekolah: '',
        phone: '',
        linkWaktu: '',
        linkHarian: '',
        linkBulanan: '',
        notes: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Nama sekolah wajib diisi';
    if (!formData.npsn?.trim()) newErrors.npsn = 'NPSN wajib diisi (8 digit)';
    if (!formData.desa?.trim()) newErrors.desa = 'Nama desa/kelurahan wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isEditing ? 'Edit Data & 3 Link Spreadsheet Sekolah' : 'Tambah Sekolah Baru se-Kecamatan'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing
                  ? 'Perbarui nama sekolah, wilayah, dan tautan Google Sheets absensi'
                  : 'Daftarkan sekolah baru ke dalam rekapitulasi absensi kecamatan'}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Section 1: Data Identitas Sekolah */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              Identitas Sekolah
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Sekolah */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Sekolah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: SD Negeri 01 Sukamaju"
                  className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* NPSN */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NPSN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.npsn || ''}
                  onChange={e => setFormData({ ...formData, npsn: e.target.value })}
                  placeholder="Contoh: 20231001"
                  className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.npsn ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'
                  }`}
                />
                {errors.npsn && <p className="text-xs text-red-500 mt-1">{errors.npsn}</p>}
              </div>

              {/* Desa */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Desa / Kelurahan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.desa || ''}
                  onChange={e => setFormData({ ...formData, desa: e.target.value })}
                  placeholder="Contoh: Desa Karangtengah / Desa Pusat"
                  className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.desa ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'
                  }`}
                />
                {errors.desa && <p className="text-xs text-red-500 mt-1">{errors.desa}</p>}
              </div>

              {/* Jenjang */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenjang</label>
                <select
                  value={formData.jenjang || 'SD'}
                  onChange={e => setFormData({ ...formData, jenjang: e.target.value as SchoolLevel })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="TK/PAUD">TK/PAUD</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Lembaga</label>
                <select
                  value={formData.status || 'Negeri'}
                  onChange={e => setFormData({ ...formData, status: e.target.value as SchoolStatus })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Negeri">Negeri</option>
                  <option value="Swasta">Swasta</option>
                </select>
              </div>

              {/* Kepala Sekolah */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kepala Sekolah</label>
                <input
                  type="text"
                  value={formData.kepalaSekolah || ''}
                  onChange={e => setFormData({ ...formData, kepalaSekolah: e.target.value })}
                  placeholder="Nama Lengkap & Gelar"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                </input>
              </div>

              {/* Nomor Telepon */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. Kontak / WA</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Tiga Tautan Spreadsheet Khusus */}
          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                3 Tautan Spreadsheet Khusus (Google Sheets / AppSheet)
              </span>
              <span className="text-[11px] font-normal text-slate-500">Dapat berupa link /edit atau /pubhtml</span>
            </h4>

            <div className="space-y-3.5">
              {/* 1. Link Waktu (Hijau) */}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  1. Tautan LAPORAN WAKTU (Jam Kehadiran & Kepulangan) - Hijau
                </label>
                <input
                  type="url"
                  value={formData.linkWaktu || ''}
                  onChange={e => setFormData({ ...formData, linkWaktu: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-emerald-700 mt-1">
                  Digunakan untuk mengecek catatan waktu finger scan atau check-in kedatangan guru/siswa.
                </p>
              </div>

              {/* 2. Link Harian (Biru) */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                <label className="block text-xs font-bold text-blue-800 mb-1 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                  2. Tautan REKAP ABSEN HARIAN - Biru
                </label>
                <input
                  type="url"
                  value={formData.linkHarian || ''}
                  onChange={e => setFormData({ ...formData, linkHarian: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-blue-700 mt-1">
                  Digunakan untuk rekapitulasi harian (Hadir, Izin, Sakit, Alpa).
                </p>
              </div>

              {/* 3. Link Bulanan (Kuning) */}
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-amber-700" />
                  3. Tautan REKAP BULANAN - Kuning
                </label>
                <input
                  type="url"
                  value={formData.linkBulanan || ''}
                  onChange={e => setFormData({ ...formData, linkBulanan: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-amber-800 mt-1">
                  Digunakan untuk akumulasi persentase kehadiran bulanan ke Dinas Pendidikan.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Catatan Khusus */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Khusus / Keterangan Lembaga
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Contoh: Absensi manual, sinkronisasi setiap Jumat sore..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Tambahkan Sekolah'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
