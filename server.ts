import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client setup following guidelines
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// API: Generate Executive Summary with Gemini
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const {
      analysisType = 'executive',
      kecamatanName = 'Tingkat Kecamatan',
      korwilName = 'Korwil Bidang Pendidikan & Kebudayaan',
      schools = [],
      period = 'Bulan Ini',
      customNotes = '',
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY_MISSING',
        message: 'API Key Gemini belum terkonfigurasi pada Environment / Secrets.',
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: 'AI_CLIENT_INIT_FAILED', message: 'Gagal menginisialisasi AI client.' });
    }

    // Prepare structured summary for prompt
    const totalSchools = schools.length;
    const tkCount = schools.filter((s: any) => s.jenjang === 'TK/PAUD').length;
    const sdCount = schools.filter((s: any) => s.jenjang === 'SD').length;
    const smpCount = schools.filter((s: any) => s.jenjang === 'SMP').length;
    const completeLinks = schools.filter((s: any) => s.linkWaktu && s.linkHarian && s.linkBulanan).length;

    const schoolsSummary = schools.map((s: any, idx: number) => ({
      no: idx + 1,
      nama: s.name,
      npsn: s.npsn,
      jenjang: s.jenjang,
      desa: s.desa,
      status: s.status || 'Negeri',
      kelengkapanLink: {
        laporanWaktu: Boolean(s.linkWaktu),
        rekapHarian: Boolean(s.linkHarian),
        rekapBulanan: Boolean(s.linkBulanan),
      },
      catatan: s.notes || '-',
    }));

    const systemInstruction = `Anda adalah Staf Ahli Evaluasi dan Analis Data Pendidikan di Dinas Pendidikan / Koordinator Wilayah (Korwil) Pendidikan Kecamatan di Indonesia.
Gunakan Bahasa Indonesia formal kedinasan yang rapi, profesional, santun, dan objektif.
Hasil laporan harus memiliki struktur yang sangat jelas dan mudah dibaca oleh Kepala Dinas, Camat, dan Pengawas Pembina Sekolah:
1. JUDUL LAPORAN RESMI & IDENTITAS WILAYAH
2. RINGKASAN EKSEKUTIF (Executive Summary)
3. METRIK & STATISTIK KEPATUHAN PENGISIAN ABSENSI (TK/PAUD, SD, SMP)
4. TEMUAN UTAMA & EVALUASI KEAKTIFAN SEKOLAH PER DESA/KELURAHAN
5. IDENTIFIKASI SEKOLAH DENGAN PERHATIAN KHUSUS (sekolah yang belum melengkapi 3 link atau catatan keterlambatan)
6. REKOMENDASI STRATEGIS & TINDAK LANJUT KEDINASAN (Langkah konkret untuk Pengawas & Kepala Sekolah)
Format dalam Markdown rapi dengan bullet points, tabel ringkas jika relevan, dan kalimat penutup formal.`;

    let userPrompt = `Buatkan Laporan Analisis Rekapitulasi Absensi Sekolah se-Kecamatan dengan rincian berikut:
- Wilayah: ${kecamatanName}
- Unit Kerja: ${korwilName}
- Periode Rekap: ${period}
- Jenis Analisis: ${analysisType}
- Total Sekolah Terdaftar: ${totalSchools} unit (TK/PAUD: ${tkCount}, SD: ${sdCount}, SMP: ${smpCount})
- Sekolah dengan 3 Link Spreadsheet Lengkap: ${completeLinks} dari ${totalSchools} sekolah (${Math.round((completeLinks / (totalSchools || 1)) * 100)}%)
${customNotes ? `- Catatan Tambahan Dinas: ${customNotes}` : ''}

Daftar Data Sekolah Se-Kecamatan:
${JSON.stringify(schoolsSummary, null, 2)}

Mohon buatkan analisis mendalam, berbasis data, berbobot untuk pimpinan dinas, dan berikan arahan pembinaan yang konstruktif.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    return res.json({
      success: true,
      report: response.text || 'Gagal menghasilkan teks laporan.',
      generatedAt: new Date().toISOString(),
      metadata: {
        kecamatan: kecamatanName,
        totalSchools,
        period,
      },
    });
  } catch (error: any) {
    console.error('Error generating Gemini analysis:', error);
    return res.status(500).json({
      error: 'GEMINI_GENERATION_FAILED',
      message: error?.message || 'Terjadi kesalahan saat memproses analisis dengan Gemini AI.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
