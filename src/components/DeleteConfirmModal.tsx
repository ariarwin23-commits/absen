import React from 'react';
import { School } from '../types';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  school: School | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (schoolId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  school,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !school) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base">Hapus Sekolah dari Rekap</h3>
              <p className="text-xs text-red-100">Konfirmasi Penghapusan Data</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-red-200 hover:text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-slate-700 mb-3">
            Apakah Anda yakin ingin menghapus sekolah berikut dari portal rekapitulasi kecamatan?
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-xs space-y-1">
            <p className="font-bold text-slate-900 text-sm">{school.name}</p>
            <p className="text-slate-600">NPSN: <span className="font-mono font-semibold">{school.npsn}</span></p>
            <p className="text-slate-600">Desa: {school.desa} • Jenjang: {school.jenjang}</p>
          </div>

          <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
            Perhatian: Tindakan ini akan menghapus tautan ketiga spreadsheet sekolah ini dari tabel rekap kecamatan.
          </p>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => onConfirm(school.id)}
              className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Ya, Hapus Sekolah</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
