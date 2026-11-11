import React, { useState } from 'react';
import { KecamatanConfig } from '../types';
import { Building2, X, Save, MapPin } from 'lucide-react';

interface KecamatanConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: KecamatanConfig;
  onSave: (newConfig: KecamatanConfig) => void;
}

export const KecamatanConfigModal: React.FC<KecamatanConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [formData, setFormData] = useState<KecamatanConfig>({ ...config });

  React.useEffect(() => {
    setFormData({ ...config });
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Pengaturan Identitas Wilayah</h3>
              <p className="text-xs text-slate-400">Sesuaikan Nama Kecamatan & Korwil Pendidikan</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Wilayah / Kecamatan
            </label>
            <input
              type="text"
              value={formData.namaKecamatan}
              onChange={e => setFormData({ ...formData, namaKecamatan: e.target.value })}
              placeholder="Contoh: Kecamatan Cibinong / Wilayah Binaan"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Unit Kerja / Korwil
            </label>
            <input
              type="text"
              value={formData.korwilPendidikan}
              onChange={e => setFormData({ ...formData, korwilPendidikan: e.target.value })}
              placeholder="Contoh: Korwil Bidang Pendidikan & Kebudayaan"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Dinas Pendidikan / Kabupaten
            </label>
            <input
              type="text"
              value={formData.kabupaten}
              onChange={e => setFormData({ ...formData, kabupaten: e.target.value })}
              placeholder="Contoh: Dinas Pendidikan Kabupaten"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Alamat Kantor (Untuk Kop Laporan AI & Cetak)
            </label>
            <input
              type="text"
              value={formData.alamatKantor}
              onChange={e => setFormData({ ...formData, alamatKantor: e.target.value })}
              placeholder="Contoh: Jl. Pendidikan No. 12, Kompleks Kantor Kecamatan"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Identitas</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
