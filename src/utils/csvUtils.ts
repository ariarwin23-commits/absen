import { School } from '../types';

/**
 * Exports school list to CSV including all 3 spreadsheet links per row
 */
export function exportSchoolsToCSV(schools: School[], kecamatanName: string = 'Kecamatan'): void {
  const headers = [
    'No',
    'ID',
    'Nama Sekolah',
    'NPSN',
    'Desa / Kelurahan',
    'Jenjang',
    'Status',
    'Kepala Sekolah',
    'No Telepon',
    'Tautan Laporan Waktu (Jam Kehadiran)',
    'Tautan Rekap Absen Harian',
    'Tautan Rekap Bulanan',
    'Catatan',
    'Terakhir Diperbarui',
  ];

  const escapeCSV = (value: string | number | undefined) => {
    if (value === undefined || value === null) return '""';
    const stringValue = String(value);
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = schools.map((school, index) => [
    index + 1,
    escapeCSV(school.id),
    escapeCSV(school.name),
    escapeCSV(school.npsn),
    escapeCSV(school.desa),
    escapeCSV(school.jenjang),
    escapeCSV(school.status),
    escapeCSV(school.kepalaSekolah || '-'),
    escapeCSV(school.phone || '-'),
    escapeCSV(school.linkWaktu),
    escapeCSV(school.linkHarian),
    escapeCSV(school.linkBulanan),
    escapeCSV(school.notes || '-'),
    escapeCSV(school.lastUpdated || new Date().toISOString().split('T')[0]),
  ]);

  const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `Rekap_Absensi_${kecamatanName.replace(/\s+/g, '_')}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses simple CSV content to School array
 */
export function parseSchoolsFromCSV(csvText: string): Partial<School>[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuote && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (char === ',' && !inQuote) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  // Find column indexes
  const headerCols = parseRow(lines[0]).map(h => h.toLowerCase());

  const getColIdx = (patterns: string[]): number => {
    return headerCols.findIndex(h => patterns.some(p => h.includes(p)));
  };

  const nameIdx = getColIdx(['nama sekolah', 'nama', 'sekolah']);
  const npsnIdx = getColIdx(['npsn']);
  const desaIdx = getColIdx(['desa', 'kelurahan']);
  const jenjangIdx = getColIdx(['jenjang']);
  const statusIdx = getColIdx(['status']);
  const waktuIdx = getColIdx(['waktu', 'laporan waktu', 'jam kehadiran']);
  const harianIdx = getColIdx(['harian', 'rekap absen harian']);
  const bulananIdx = getColIdx(['bulanan', 'rekap bulanan']);

  const schools: Partial<School>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseRow(lines[i]);
    if (cols.length < 3) continue;

    const name = nameIdx !== -1 ? cols[nameIdx] : cols[1];
    if (!name) continue;

    const jenjangRaw = jenjangIdx !== -1 ? cols[jenjangIdx].toUpperCase() : 'SD';
    let jenjang: 'TK/PAUD' | 'SD' | 'SMP' = 'SD';
    if (jenjangRaw.includes('TK') || jenjangRaw.includes('PAUD')) jenjang = 'TK/PAUD';
    else if (jenjangRaw.includes('SMP')) jenjang = 'SMP';

    schools.push({
      id: `sch-${Date.now()}-${i}`,
      name: name.replace(/^["']|["']$/g, ''),
      npsn: npsnIdx !== -1 ? cols[npsnIdx] : `202${Math.floor(10000 + Math.random() * 90000)}`,
      desa: desaIdx !== -1 ? cols[desaIdx] : 'Desa Pusat',
      jenjang,
      status: (statusIdx !== -1 && cols[statusIdx].toLowerCase().includes('swasta')) ? 'Swasta' : 'Negeri',
      linkWaktu: waktuIdx !== -1 ? cols[waktuIdx] : '',
      linkHarian: harianIdx !== -1 ? cols[harianIdx] : '',
      linkBulanan: bulananIdx !== -1 ? cols[bulananIdx] : '',
      lastUpdated: new Date().toISOString().split('T')[0],
    });
  }

  return schools;
}
