import { SheetTab, SheetTabInfo } from '../types';

export const SHEET_TABS: Record<SheetTab, SheetTabInfo> = {
  waktu: {
    id: 'waktu',
    title: 'LAPORAN WAKTU',
    subtitle: 'Jam Kehadiran & Kepulangan (Check-in/Check-out)',
    colorName: 'green',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
    activeTabClass: 'bg-emerald-600 text-white shadow-md border-emerald-600',
    borderClass: 'border-emerald-500',
    iconName: 'Clock',
    description: 'Catatan waktu real-time kedatangan dan kepulangan guru/tenaga pendidik per hari.',
  },
  harian: {
    id: 'harian',
    title: 'REKAP ABSEN HARIAN',
    subtitle: 'Kehadiran, Sakit, Izin, & Alpa Harian',
    colorName: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20',
    activeTabClass: 'bg-blue-600 text-white shadow-md border-blue-600',
    borderClass: 'border-blue-500',
    iconName: 'CalendarDays',
    description: 'Rekapitulasi presensi harian per kelas dan rekap kehadiran personil sekolah.',
  },
  bulanan: {
    id: 'bulanan',
    title: 'REKAP BULANAN',
    subtitle: 'Persentase & Akumulasi Kehadiran Bulanan',
    colorName: 'yellow',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20',
    buttonClass: 'bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold shadow-amber-500/20',
    activeTabClass: 'bg-amber-500 text-slate-900 font-semibold shadow-md border-amber-500',
    borderClass: 'border-amber-500',
    iconName: 'BarChart3',
    description: 'Akumulasi persentase kehadiran bulanan untuk laporan Korwil & Dinas Pendidikan.',
  },
};

/**
 * Transforms a standard Google Sheets URL into an embed-friendly URL.
 * If user pastes:
 * - https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
 * Transforms to:
 * - https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview?embedded=true
 */
export function getEmbeddableSheetUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  try {
    // Check if it's a Google Sheets link
    if (trimmed.includes('docs.google.com/spreadsheets/d/')) {
      const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const sheetId = match[1];

        // Extract gid if exists
        let gidParam = '';
        const gidMatch = trimmed.match(/gid=([0-9]+)/);
        if (gidMatch && gidMatch[1]) {
          gidParam = `&gid=${gidMatch[1]}`;
        }

        // If it's already a pubhtml or preview, ensure embedded flag
        if (trimmed.includes('/pubhtml')) {
          return trimmed.includes('widget=true') ? trimmed : `${trimmed}${trimmed.includes('?') ? '&' : '?'}widget=true&headers=false`;
        }

        return `https://docs.google.com/spreadsheets/d/${sheetId}/preview?embedded=true${gidParam}`;
      }
    }

    // AppSheet or Google Forms / Data Studio embed
    if (trimmed.includes('appsheet.com')) {
      return trimmed;
    }

    return trimmed;
  } catch (err) {
    console.warn('Error parsing sheet URL:', err);
    return trimmed;
  }
}

/**
 * Extracts human-readable sheet ID or domain for display
 */
export function getShortLinkDisplay(url: string): string {
  if (!url) return 'Belum diatur';
  try {
    if (url.includes('docs.google.com/spreadsheets/d/')) {
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]{6})[a-zA-Z0-9-_]+([a-zA-Z0-9-_]{4})/);
      if (match) {
        return `Google Sheet (${match[1]}...${match[2]})`;
      }
      return 'Google Spreadsheet';
    }
    if (url.includes('appsheet.com')) {
      return 'AppSheet Portal';
    }
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return 'Tautan Eksternal';
  }
}

/**
 * Checks if a URL is a Google Sheets document
 */
export function isGoogleSheetsUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('docs.google.com/spreadsheets/d/');
}

/**
 * Builds Google Sheets official direct PDF export URL with exact paper sizing,
 * landscape orientation, fit-to-width scaling, and gridlines.
 */
export function getGoogleSheetPdfExportUrl(
  rawUrl: string,
  options?: {
    paperSize?: 'a4' | 'folio' | 'legal' | 'letter';
    orientation?: 'landscape' | 'portrait';
    fitToWidth?: boolean;
    gridlines?: boolean;
    repeatFrozenRows?: boolean;
  }
): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const match = rawUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match || !match[1]) return null;

  const sheetId = match[1];

  let gid = '';
  const gidMatch = rawUrl.match(/gid=([0-9]+)/);
  if (gidMatch && gidMatch[1]) {
    gid = gidMatch[1];
  }

  const paperSize = options?.paperSize || 'a4';
  const orientation = options?.orientation || 'landscape';
  const fitToWidth = options?.fitToWidth ?? true;
  const gridlines = options?.gridlines ?? true;
  const repeatFrozenRows = options?.repeatFrozenRows ?? true;

  // Google Sheets PDF export size mapping
  let sizeParam = 'a4';
  if (paperSize === 'letter') sizeParam = 'letter';
  else if (paperSize === 'legal') sizeParam = 'legal';
  else if (paperSize === 'folio') sizeParam = 'folio';

  const params = new URLSearchParams({
    exportFormat: 'pdf',
    format: 'pdf',
    size: sizeParam,
    portrait: orientation === 'portrait' ? 'true' : 'false',
    fitw: fitToWidth ? 'true' : 'false',
    gridlines: gridlines ? 'true' : 'false',
    printtitle: 'true',
    sheetnames: 'false',
    fzr: repeatFrozenRows ? 'true' : 'false',
    top_margin: '0.3',
    bottom_margin: '0.3',
    left_margin: '0.3',
    right_margin: '0.3',
  });

  if (gid) {
    params.append('gid', gid);
  }

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?${params.toString()}`;
}

