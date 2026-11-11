import React, { useState, useEffect } from 'react';
import { School, SheetTab } from '../types';
import { SHEET_TABS } from '../utils/sheetUtils';
import {
  extractSpreadsheetId,
  fetchSpreadsheetMetadata,
  fetchSheetValues,
  googleSignIn,
  logoutFirebase,
} from '../lib/firebase';
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  Table,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Lock,
  Layers,
  Clock,
  CalendarDays,
  BarChart3,
} from 'lucide-react';

interface GoogleSheetsApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  schools: School[];
  initialSchoolId?: string;
  initialTab?: SheetTab;
  currentUser: any | null;
  cachedToken: string | null;
  onAuthSuccess: (user: any, token: string | null) => void;
}

export const GoogleSheetsApiModal: React.FC<GoogleSheetsApiModalProps> = ({
  isOpen,
  onClose,
  schools,
  initialSchoolId,
  initialTab = 'waktu',
  currentUser,
  cachedToken,
  onAuthSuccess,
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    initialSchoolId || schools[0]?.id || ''
  );
  const [selectedTab, setSelectedTab] = useState<SheetTab>(initialTab);
  const [activeSheetName, setActiveSheetName] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<any | null>(null);
  const [sheetValues, setSheetValues] = useState<string[][] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedSchool =
    schools.find(s => s.id === selectedSchoolId) || schools[0];

  useEffect(() => {
    if (initialSchoolId) setSelectedSchoolId(initialSchoolId);
    if (initialTab) setSelectedTab(initialTab);
  }, [initialSchoolId, initialTab, isOpen]);

  const getUrlForTab = (): string => {
    if (!selectedSchool) return '';
    if (selectedTab === 'waktu') return selectedSchool.linkWaktu;
    if (selectedTab === 'harian') return selectedSchool.linkHarian;
    return selectedSchool.linkBulanan;
  };

  const rawUrl = getUrlForTab();
  const spreadsheetId = extractSpreadsheetId(rawUrl);

  const loadSheetData = async (tokenOverride?: string | null) => {
    if (!spreadsheetId) {
      setErrorMsg('Tautan Google Sheets belum valid atau belum disetel untuk sekolah ini.');
      setMetadata(null);
      setSheetValues(null);
      return;
    }

    const token = tokenOverride || cachedToken;
    if (!token) {
      setErrorMsg('LOGIN_REQUIRED');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // 1. Fetch metadata (tabs & properties)
      const meta = await fetchSpreadsheetMetadata(spreadsheetId, token);
      setMetadata(meta);

      // Determine which sheet title to read
      const sheets = meta.sheets || [];
      const firstSheetTitle = sheets[0]?.properties?.title || 'Sheet1';
      const targetSheet = activeSheetName && sheets.some((s: any) => s.properties?.title === activeSheetName)
        ? activeSheetName
        : firstSheetTitle;

      setActiveSheetName(targetSheet);

      // 2. Fetch cell values (top 40 rows and up to 15 columns)
      const valuesRes = await fetchSheetValues(spreadsheetId, `'${targetSheet}'!A1:O40`, token);
      setSheetValues(valuesRes.values || []);
    } catch (err: any) {
      console.error('Error fetching from Google Sheets API:', err);
      setErrorMsg(err.message || 'Gagal memuat data dari Google Sheets API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && spreadsheetId) {
      loadSheetData();
    }
  }, [isOpen, selectedSchoolId, selectedTab, activeSheetName, cachedToken]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        onAuthSuccess(res.user, res.accessToken);
        await loadSheetData(res.accessToken);
      }
    } catch (err: any) {
      setErrorMsg('Login Google dibatalkan atau gagal: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Google Sheets REST API Live Explorer
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Resmi Google Workspace OAuth v4
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Membaca metadata, tab sheet, dan data sel absensi langsung dari server Google Sheets API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {rawUrl && (
              <a
                href={rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                Buka di Tab Baru
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* School & Tab Selector Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center flex-wrap gap-2">
            {/* School dropdown */}
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-500" />
              <select
                value={selectedSchoolId}
                onChange={e => {
                  setSelectedSchoolId(e.target.value);
                  setActiveSheetName('');
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {schools.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.desa})
                  </option>
                ))}
              </select>
            </div>

            {/* 3 Tab Buttons */}
            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTab('waktu');
                  setActiveSheetName('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedTab === 'waktu'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Waktu</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTab('harian');
                  setActiveSheetName('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedTab === 'harian'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Harian</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTab('bulanan');
                  setActiveSheetName('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedTab === 'bulanan'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Bulanan</span>
              </button>
            </div>
          </div>

          {/* Refresh & Auth Status */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadSheetData()}
              disabled={isLoading || !cachedToken}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Muat Ulang API</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto">
          {/* Needs Authentication Banner */}
          {(!cachedToken || errorMsg === 'LOGIN_REQUIRED') && (
            <div className="bg-white border border-indigo-100 rounded-2xl p-8 text-center max-w-xl mx-auto my-8 shadow-sm">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <Lock className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Otentikasi Akun Google Dibutuhkan
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                Untuk membaca spreadsheet dan mengambil baris data kehadiran melalui{' '}
                <strong>Google Sheets REST API</strong> secara langsung, silakan masuk menggunakan akun Google Anda yang memiliki akses ke dokumen ini.
              </p>
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
              >
                <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 48 48" className="w-4 h-4">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </div>
                <span>{isLoading ? 'Menghubungkan...' : 'Sign in with Google'}</span>
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-semibold text-slate-600 animate-pulse">
                Menghubungi Google Sheets API & memproses struktur data...
              </p>
            </div>
          )}

          {/* Error Message */}
          {!isLoading && errorMsg && errorMsg !== 'LOGIN_REQUIRED' && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-4 flex items-start gap-3 text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Respon Google Sheets API:</p>
                <p className="text-xs text-red-700 mt-1">{errorMsg}</p>
                <p className="text-xs text-slate-600 mt-2">
                  Tips: Pastikan akun Google yang Anda gunakan telah diberi hak akses lihat (View) ke file spreadsheet tersebut, atau buka tautan di Google Drive untuk memastikan izinnya.
                </p>
              </div>
            </div>
          )}

          {/* Spreadsheet Live Details */}
          {!isLoading && metadata && (
            <div className="space-y-4">
              {/* Metadata Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                      {metadata.properties?.title || 'Google Spreadsheet'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Spreadsheet ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">{spreadsheetId}</code>
                  </p>
                </div>

                {/* Sub-sheets Tabs */}
                {metadata.sheets && metadata.sheets.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
                      <Layers className="w-3.5 h-3.5" />
                      Lembar Kerja:
                    </span>
                    {metadata.sheets.map((sheet: any) => {
                      const title = sheet.properties?.title;
                      const isCurrent = (activeSheetName || metadata.sheets[0]?.properties?.title) === title;
                      return (
                        <button
                          key={sheet.properties?.sheetId}
                          type="button"
                          onClick={() => setActiveSheetName(title)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                            isCurrent
                              ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Data Table Preview */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800">
                      Tabel Nilai Sel (Tab: {activeSheetName || 'Aktif'})
                    </span>
                  </div>
                  <span>
                    Menampilkan <strong>{sheetValues?.length || 0}</strong> baris data
                  </span>
                </div>

                {sheetValues && sheetValues.length > 0 ? (
                  <div className="overflow-x-auto max-h-[50vh]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                          <th className="py-2.5 px-3 w-10 text-center bg-slate-100 text-slate-500 border-r border-slate-200">#</th>
                          {sheetValues[0]?.map((col, idx) => (
                            <th key={idx} className="py-2.5 px-3 font-semibold border-r border-slate-200 whitespace-nowrap">
                              {col || `Kolom ${idx + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {sheetValues.slice(1).map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2 px-3 text-center text-slate-400 bg-slate-50/50 border-r border-slate-200">
                              {rowIdx + 2}
                            </td>
                            {sheetValues[0]?.map((_, colIdx) => (
                              <td key={colIdx} className="py-2 px-3 border-r border-slate-100 text-slate-700 whitespace-nowrap max-w-xs truncate">
                                {row[colIdx] || ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Tidak ada baris data pada rentang tab spreadsheet ini.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900 text-slate-400 text-xs px-5 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              Terhubung ke Google Cloud Project: <strong className="text-white">gen-lang-client-0909674294</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
