export type SchoolLevel = 'TK/PAUD' | 'SD' | 'SMP';
export type SchoolStatus = 'Negeri' | 'Swasta';

export interface School {
  id: string;
  name: string;
  npsn: string;
  desa: string;
  jenjang: SchoolLevel;
  status: SchoolStatus;
  totalSiswa?: number;
  totalGuru?: number;
  kepalaSekolah?: string;
  phone?: string;
  linkWaktu: string;    // Hijau: Laporan Waktu (Jam Kehadiran / Kepulangan)
  linkHarian: string;   // Biru: Rekap Absen Harian
  linkBulanan: string;  // Kuning: Rekap Bulanan
  lastUpdated?: string;
  notes?: string;
}

export type SheetTab = 'waktu' | 'harian' | 'bulanan';

export interface SheetTabInfo {
  id: SheetTab;
  title: string;
  subtitle: string;
  colorName: 'green' | 'blue' | 'yellow';
  badgeClass: string;
  buttonClass: string;
  activeTabClass: string;
  borderClass: string;
  iconName: string;
  description: string;
}

export interface FilterState {
  searchQuery: string;
  selectedJenjang: 'Semua' | SchoolLevel;
  selectedDesa: string;
  linkCompleteness: 'semua' | 'lengkap' | 'sebagian' | 'kosong';
}

export interface KecamatanConfig {
  namaKecamatan: string;
  kabupaten: string;
  provinsi: string;
  korwilPendidikan: string;
  alamatKantor: string;
  teleponKantor: string;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  loginTime?: string;
}

export interface PdfExportOptions {
  paperSize: 'a4' | 'folio' | 'legal' | 'letter';
  orientation: 'landscape' | 'portrait';
  fitToWidth: boolean;
  gridlines: boolean;
  repeatFrozenRows: boolean;
}

