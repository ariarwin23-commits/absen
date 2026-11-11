import React, { useState, useEffect } from 'react';
import { School, SchoolLevel, SheetTab, KecamatanConfig } from './types';
import { INITIAL_SCHOOLS, DEFAULT_KECAMATAN_CONFIG } from './data/initialSchools';
import { exportSchoolsToCSV } from './utils/csvUtils';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { SchoolTable } from './components/SchoolTable';
import { PreviewModal } from './components/PreviewModal';
import { FullscreenSheetView } from './components/FullscreenSheetView';
import { GeminiAnalysisView } from './components/GeminiAnalysisView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { SchoolFormModal } from './components/SchoolFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SheetPrintModal } from './components/SheetPrintModal';
import { KecamatanConfigModal } from './components/KecamatanConfigModal';
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Building,
} from 'lucide-react';

const STORAGE_KEY_SCHOOLS = 'portal_absensi_schools_v4';
const STORAGE_KEY_ADMIN = 'portal_absensi_is_admin';
const STORAGE_KEY_CONFIG = 'portal_absensi_kecamatan_config_v4';

export default function App() {
  // Load schools from localStorage or fallback to exactly the 3 target schools with real URLs
  const [schools, setSchools] = useState<School[]>(() => {
    try {
      // Remove any legacy dummy data from earlier versions
      localStorage.removeItem('portal_absensi_schools_v1');
      localStorage.removeItem('portal_absensi_schools_v2');
      localStorage.removeItem('portal_absensi_schools_v3');
      const saved = localStorage.getItem(STORAGE_KEY_SCHOOLS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Verify that stored data matches the official 3 schools
          const hasPandanDuri = parsed.some(s => s.npsn === '50203039');
          const hasRarangTengah = parsed.some(s => s.npsn === '50203030');
          const hasSelagik = parsed.some(s => s.npsn === '50202643');
          if (hasPandanDuri && hasRarangTengah && hasSelagik && parsed.length === 3) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load schools from localStorage:', e);
    }
    // Set permanently to INITIAL_SCHOOLS
    try {
      localStorage.setItem(STORAGE_KEY_SCHOOLS, JSON.stringify(INITIAL_SCHOOLS));
    } catch {
      // ignore
    }
    return INITIAL_SCHOOLS;
  });

  // Save schools to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCHOOLS, JSON.stringify(schools));
    } catch (e) {
      console.warn('Failed to persist schools:', e);
    }
  }, [schools]);

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ADMIN) === 'true';
    } catch {
      return false;
    }
  });

  // Kecamatan configuration (editable & persistent, default clean without Sukamakmur)
  const [kecamatanConfig, setKecamatanConfig] = useState<KecamatanConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.namaKecamatan) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load kecamatan config:', e);
    }
    return DEFAULT_KECAMATAN_CONFIG;
  });

  const [selectedJenjang, setSelectedJenjang] = useState<'Semua' | SchoolLevel>('Semua');
  const [currentTab, setCurrentTab] = useState<'table' | 'fullscreen' | 'ai'>('table');

  // Fullscreen view state
  const [fullscreenSchoolId, setFullscreenSchoolId] = useState<string>(
    schools[0]?.id || 'sch-01'
  );
  const [fullscreenTab, setFullscreenTab] = useState<SheetTab>('waktu');

  // Modals state
  const [previewState, setPreviewState] = useState<{
    isOpen: boolean;
    school: School | null;
    tab: SheetTab;
  }>({
    isOpen: false,
    school: null,
    tab: 'waktu',
  });

  const [printModalState, setPrintModalState] = useState<{
    isOpen: boolean;
    school: School | null;
    tab: SheetTab;
  }>({
    isOpen: false,
    school: null,
    tab: 'waktu',
  });

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  const [schoolFormState, setSchoolFormState] = useState<{
    isOpen: boolean;
    initialData: School | null;
  }>({
    isOpen: false,
    initialData: null,
  });

  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    school: School | null;
  }>({
    isOpen: false,
    school: null,
  });

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Admin Login & Logout
  const handleLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem(STORAGE_KEY_ADMIN, 'true');
    setIsAdminLoginOpen(false);
    showToast('Berhasil login sebagai Pengelola Kecamatan. Akses CRUD aktif.');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem(STORAGE_KEY_ADMIN);
    showToast('Telah keluar dari mode admin.');
  };

  // Save Kecamatan Configuration
  const handleSaveKecamatanConfig = (newConfig: KecamatanConfig) => {
    setKecamatanConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Failed to persist config:', e);
    }
    showToast('Identitas wilayah kecamatan berhasil diperbarui.');
  };

  // Preview Modal Handlers
  const handleOpenPreview = (school: School, tab: SheetTab) => {
    setPreviewState({
      isOpen: true,
      school,
      tab,
    });
  };

  const handleClosePreview = () => {
    setPreviewState(prev => ({ ...prev, isOpen: false }));
  };

  // Open Print / PDF Modal
  const handleOpenPrint = (school: School, tab: SheetTab = 'waktu') => {
    setPrintModalState({
      isOpen: true,
      school,
      tab,
    });
  };

  // Transition from Preview Modal to Fullscreen View
  const handleTransitionToFullscreen = (school: School, tab: SheetTab) => {
    setFullscreenSchoolId(school.id);
    setFullscreenTab(tab);
    setPreviewState(prev => ({ ...prev, isOpen: false }));
    setCurrentTab('fullscreen');
  };

  // Save school (Create or Update)
  const handleSaveSchool = (schoolData: Partial<School>) => {
    if (schoolFormState.initialData) {
      // Edit mode
      setSchools(prev =>
        prev.map(s =>
          s.id === schoolFormState.initialData?.id
            ? {
                ...s,
                ...schoolData,
                lastUpdated: new Date().toISOString().split('T')[0],
              }
            : s
        )
      );
      showToast(`Data sekolah "${schoolData.name}" berhasil diperbarui.`);
    } else {
      // Create mode
      const newSchool: School = {
        id: `sch-${Date.now()}`,
        name: schoolData.name || 'Sekolah Baru',
        npsn: schoolData.npsn || '20200000',
        desa: schoolData.desa || 'Pusat',
        jenjang: schoolData.jenjang || 'SD',
        status: schoolData.status || 'Negeri',
        kepalaSekolah: schoolData.kepalaSekolah || '',
        phone: schoolData.phone || '',
        linkWaktu: schoolData.linkWaktu || '',
        linkHarian: schoolData.linkHarian || '',
        linkBulanan: schoolData.linkBulanan || '',
        notes: schoolData.notes || '',
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      setSchools(prev => [newSchool, ...prev]);
      showToast(`Sekolah baru "${newSchool.name}" berhasil ditambahkan.`);
    }
    setSchoolFormState({ isOpen: false, initialData: null });
  };

  // Delete School
  const handleConfirmDelete = (schoolId: string) => {
    const target = schools.find(s => s.id === schoolId);
    setSchools(prev => prev.filter(s => s.id !== schoolId));
    setDeleteConfirmState({ isOpen: false, school: null });
    showToast(`Sekolah "${target?.name || ''}" telah dihapus dari daftar kecamatan.`);
  };

  // Export CSV
  const handleExportCSV = () => {
    exportSchoolsToCSV(schools, kecamatanConfig.namaKecamatan);
    showToast('File CSV rekapitulasi absensi sekolah berhasil diunduh.');
  };

  // Reset to default data
  const handleResetData = () => {
    if (
      window.confirm(
        'Kembalikan daftar ke data awal permanen (SDN 1 Pandan Duri, SDN 1 Rarang Tengah, SDN 3 Selagik)?'
      )
    ) {
      setSchools(INITIAL_SCHOOLS);
      localStorage.setItem(STORAGE_KEY_SCHOOLS, JSON.stringify(INITIAL_SCHOOLS));
      showToast('Data berhasil dikembalikan ke 3 sekolah resmi awal.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs sm:text-sm animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onLogoutAdmin={handleLogout}
        onAddNewSchool={() => setSchoolFormState({ isOpen: true, initialData: null })}
        onExportCSV={handleExportCSV}
        onEditKecamatan={() => setIsConfigModalOpen(true)}
        kecamatanConfig={kecamatanConfig}
      />

      {/* Main Applet Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* TAB 1: Tabel Utama & Rekap */}
        {currentTab === 'table' && (
          <div className="animate-in fade-in duration-150">
            {/* KPI Summary Cards */}
            <StatsCards
              schools={schools}
              selectedJenjang={selectedJenjang}
              onSelectJenjang={setSelectedJenjang}
            />

            {/* Main Table with 3 Spreadsheet Buttons & Print/PDF */}
            <SchoolTable
              schools={schools}
              onOpenPreview={handleOpenPreview}
              onOpenFullscreen={handleTransitionToFullscreen}
              onOpenPrint={handleOpenPrint}
              isAdmin={isAdmin}
              onEditSchool={school => setSchoolFormState({ isOpen: true, initialData: school })}
              onDeleteSchool={school => setDeleteConfirmState({ isOpen: true, school })}
              selectedJenjang={selectedJenjang}
              onSelectJenjang={setSelectedJenjang}
            />
          </div>
        )}

        {/* TAB 2: Spreadsheet Asli (Fullscreen View) */}
        {currentTab === 'fullscreen' && (
          <div className="animate-in fade-in duration-150">
            <FullscreenSheetView
              schools={schools}
              currentSchoolId={fullscreenSchoolId}
              onChangeSchool={setFullscreenSchoolId}
              activeTab={fullscreenTab}
              onChangeTab={setFullscreenTab}
              onBackToTable={() => setCurrentTab('table')}
              onOpenPrint={handleOpenPrint}
            />
          </div>
        )}

        {/* TAB 3: Analisis Eksekutif AI Gemini */}
        {currentTab === 'ai' && (
          <div className="animate-in fade-in duration-150">
            <GeminiAnalysisView schools={schools} kecamatanConfig={kecamatanConfig} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-400" />
            <span>
              {kecamatanConfig.korwilPendidikan} • {kecamatanConfig.namaKecamatan}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              type="button"
              onClick={handleResetData}
              className="hover:text-slate-300 flex items-center gap-1 transition-colors"
              title="Reset ke data awal jika terjadi kesalahan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Awal</span>
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Sistem Terintegrasi Google Sheets
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Pratinjau Interaktif Modal 3-Tab */}
      <PreviewModal
        isOpen={previewState.isOpen}
        school={previewState.school}
        initialTab={previewState.tab}
        onClose={handleClosePreview}
        onOpenFullscreen={handleTransitionToFullscreen}
        onOpenPrint={handleOpenPrint}
      />

      {/* 2. Cetak & Ekspor PDF Spreadsheet (Pas Ukuran Kertas A4/Folio/Landscape) */}
      <SheetPrintModal
        isOpen={printModalState.isOpen}
        school={printModalState.school}
        initialTab={printModalState.tab}
        onClose={() => setPrintModalState(prev => ({ ...prev, isOpen: false }))}
      />

      {/* 3. Hidden Password Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 4. Edit Identitas Wilayah / Kecamatan */}
      <KecamatanConfigModal
        isOpen={isConfigModalOpen}
        config={kecamatanConfig}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSaveKecamatanConfig}
      />

      {/* 5. Add / Edit School Form Modal */}
      <SchoolFormModal
        isOpen={schoolFormState.isOpen}
        initialData={schoolFormState.initialData}
        onClose={() => setSchoolFormState({ isOpen: false, initialData: null })}
        onSave={handleSaveSchool}
      />

      {/* 6. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmState.isOpen}
        school={deleteConfirmState.school}
        onClose={() => setDeleteConfirmState({ isOpen: false, school: null })}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
