import React from 'react'
import type {
  EvaluasiPakarResult,
  MeaslesPredictResponse,
  ReconciliationResponse,
} from '@/api/types'

export interface PatientInfo {
  name: string
  nik: string
  birthDate: string
  gender: string
  source?: string
}

export interface SymptomItem {
  key: string
  title: string
  answer: 'yes' | 'no' | ''
  danger?: boolean
}

export interface ScreeningReportProps {
  patient: PatientInfo
  idGejala: string | null
  temperature: string
  photo: string | null
  symptomsList: SymptomItem[]
  pakarResult: EvaluasiPakarResult | null
  measlesResult: MeaslesPredictResponse | null
  reconciliationResult: ReconciliationResponse | null
  currentDateTimeStr?: string
}

export const ScreeningReport: React.FC<ScreeningReportProps> = ({
  patient,
  idGejala,
  temperature,
  photo,
  symptomsList,
  pakarResult,
  measlesResult,
  reconciliationResult,
  currentDateTimeStr,
}) => {
  const printDate =
    currentDateTimeStr ||
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  // Status Skrining Utama
  let statusTitle = 'Pemeriksaan Selesai'
  let statusBadgeClass = 'border-slate-300 text-slate-800 bg-slate-50'
  let statusSummary = 'Pemeriksaan telah dicatat dalam sistem MeaslesCare.'

  if (pakarResult?.safety_alert) {
    statusTitle = 'Perlu Penanganan Medis Segera'
    statusBadgeClass = 'border-red-400 text-red-900 bg-red-50'
    statusSummary =
      'Sistem mendeteksi adanya tanda bahaya pada pasien. Pasien disarankan segera mendapatkan penanganan medis di fasilitas kesehatan atau IGD.'
  } else if (reconciliationResult?.reconciliation_status === 'CONSISTENT') {
    if (measlesResult?.prediction === 'Measles') {
      statusTitle = 'Perlu Pemeriksaan Lanjutan'
      statusBadgeClass = 'border-amber-400 text-amber-900 bg-amber-50'
      statusSummary =
        'Hasil pengukuran suhu tubuh, analisis gambar ruam, dan informasi gejala saling mendukung adanya indikasi yang mengarah ke suspek campak. Segera lakukan pemeriksaan dokter lanjutan.'
    } else {
      statusTitle = 'Tidak Ditemukan Indikator yang Mengarah pada Pola Klinis Campak'
      statusBadgeClass = 'border-emerald-400 text-emerald-900 bg-emerald-50'
      statusSummary =
        'Seluruh hasil pemeriksaan saling mendukung bahwa kondisi saat ini tidak menunjukkan pola klinis campak.'
    }
  } else if (reconciliationResult?.reconciliation_status === 'CONFLICTING') {
    statusTitle = 'Terdapat Perbedaan Hasil Pemeriksaan'
    statusBadgeClass = 'border-amber-400 text-amber-900 bg-amber-50'
    statusSummary =
      'Terdapat perbedaan antara hasil pengamatan gambar dan riwayat gejala pasien. Pemeriksaan fisik langsung oleh tenaga kesehatan diperlukan untuk evaluasi akurat.'
  } else if (reconciliationResult?.reconciliation_status === 'INCOMPLETE') {
    statusTitle = 'Data Pemeriksaan Belum Lengkap'
    statusBadgeClass = 'border-slate-300 text-slate-800 bg-slate-100'
    statusSummary =
      'Beberapa data pemeriksaan belum tersedia secara lengkap sehingga evaluasi terpadu memerlukan tindak lanjut petugas.'
  }

  // Interpretasi Suhu
  const tempNum = parseFloat(temperature)
  const isFever = !isNaN(tempNum) && tempNum >= 37.8

  // Evaluasi Gejala Ramah Pasien
  let evaluasiGejalaText = 'Jawaban gejala belum memenuhi kombinasi pola klinis campak.'
  if (pakarResult?.forward_chaining?.kategori === 'CLINICAL_AND_SUSPECTED') {
    evaluasiGejalaText =
      'Kombinasi gejala yang dilaporkan (demam, ruam, dan keluhan penyerta) mengarah pada pola klinis yang perlu diperhatikan dokter.'
  } else if (pakarResult?.forward_chaining?.kategori === 'CLINICAL_PATTERN_ONLY') {
    evaluasiGejalaText =
      'Beberapa gejala menunjukkan pola klinis yang perlu diperhatikan, tetapi belum seluruh indikator skrining kasus terpenuhi.'
  } else if (pakarResult?.forward_chaining?.kategori === 'SUSPECTED_PATTERN_ONLY') {
    evaluasiGejalaText =
      'Ditemukan beberapa indikator gejala awal yang perlu dipantau oleh tenaga kesehatan.'
  }

  // Analisis Citra Ruam Ramah Pasien
  let imageAnalysisText = 'Foto ruam belum dianalisis atau tidak tersedia.'
  if (measlesResult?.prediction === 'Measles') {
    imageAnalysisText =
      'Sistem menemukan pola gambar yang memiliki kemiripan dengan ruam campak. Hasil ini perlu dikonfirmasi melalui pemeriksaan tenaga kesehatan.'
  } else if (measlesResult?.prediction === 'Healthy') {
    imageAnalysisText =
      'Pada gambar yang diperiksa, sistem tidak mendeteksi pola ruam patologis.'
  } else if (measlesResult?.prediction === 'Chickenpox') {
    imageAnalysisText =
      'Sistem menemukan pola gambar yang memiliki kemiripan dengan ruam cacar air.'
  } else if (measlesResult?.prediction === 'HFMD') {
    imageAnalysisText =
      'Sistem menemukan pola gambar yang memiliki kemiripan dengan flu singapura (HFMD).'
  } else if (measlesResult?.prediction) {
    imageAnalysisText = `Sistem mengidentifikasi pola ruam kulit khusus (${measlesResult.prediction}).`
  }

  return (
    <div className="screening-report-document mx-auto w-full max-w-[210mm] bg-white text-slate-900 print:max-w-none print:p-0">
      {/* 1. KOP / HEADER LAPORAN RESMI */}
      <div className="report-section border-b-2 border-slate-900 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-white font-extrabold text-xl print:bg-blue-800">
              +
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                MEASLESCARE
              </h1>
              <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
                Sistem Skrining Awal Berbasis IoT, Computer Vision, dan Expert System
              </p>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-600">
            <p className="font-semibold text-slate-800">Laporan Resmi Fasilitas Kesehatan</p>
            <p>Tanggal Cetak: {printDate}</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
            LAPORAN HASIL SKRINING AWAL CAMPAK
          </h2>
          <p className="text-[11px] text-slate-500">
            Dokumen Rekapitulasi Pemeriksaan Pasien di Fasilitas Pelayanan Kesehatan
          </p>
        </div>
      </div>

      {/* 2. IDENTITAS PASIEN */}
      <div className="report-section mt-5 rounded-lg border border-slate-300 p-4">
        <h3 className="border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          A. Identitas Pasien
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <div className="flex">
            <span className="w-32 font-semibold text-slate-600">Nama Pasien</span>
            <span className="font-bold text-slate-900">: {patient.name || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-32 font-semibold text-slate-600">ID Pemeriksaan</span>
            <span className="font-mono font-medium text-slate-900">: {idGejala || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-32 font-semibold text-slate-600">NIK Pasien</span>
            <span className="font-mono text-slate-800">
              : {patient.nik ? `${patient.nik.slice(0, 6)}******${patient.nik.slice(-4)}` : '-'}
            </span>
          </div>
          <div className="flex">
            <span className="w-32 font-semibold text-slate-600">Waktu Pemeriksaan</span>
            <span className="text-slate-800">: {printDate}</span>
          </div>
          <div className="flex">
            <span className="w-32 font-semibold text-slate-600">Tanggal Lahir</span>
            <span className="text-slate-800">: {patient.birthDate || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-32 font-semibold text-slate-600">Jenis Kelamin</span>
            <span className="text-slate-800">: {patient.gender || '-'}</span>
          </div>
        </div>
      </div>

      {/* 3. RINGKASAN HASIL PEMERIKSAAN (CERE) */}
      <div className="report-section mt-4 rounded-lg border border-slate-300 p-4">
        <h3 className="border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          B. Ringkasan Hasil Pemeriksaan
        </h3>
        <div className="mt-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">Status Skrining:</span>
            <span
              className={`inline-block rounded-md border px-3 py-1 text-xs font-bold ${statusBadgeClass}`}
            >
              {statusTitle}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-800 font-medium">
            {statusSummary}
          </p>
        </div>
      </div>

      {/* 4. RINCIAN HASIL PEMERIKSAAN */}
      <div className="report-section mt-4 rounded-lg border border-slate-300 p-4">
        <h3 className="border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          C. Rincian Hasil Pemeriksaan
        </h3>

        <div className="mt-3 grid grid-cols-2 gap-4">
          {/* Suhu Tubuh */}
          <div className="rounded border border-slate-200 p-3 bg-slate-50/50">
            <p className="text-[11px] font-semibold text-slate-600 uppercase">
              1. Pengukuran Suhu Tubuh
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-slate-900">
                {temperature ? `${temperature} °C` : 'Tidak Terukur'}
              </span>
              <span
                className={`text-xs font-bold ${
                  isFever ? 'text-red-700' : 'text-emerald-700'
                }`}
              >
                ({isFever ? 'Suhu Meningkat / Demam' : 'Rentang Normal'})
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Pengukuran non-kontak menggunakan sensor infra-merah kiosk.
            </p>
          </div>

          {/* Foto Ruam & Analisis Gambar */}
          <div className="rounded border border-slate-200 p-3 bg-slate-50/50">
            <p className="text-[11px] font-semibold text-slate-600 uppercase">
              2. Pemeriksaan Gambar Ruam
            </p>
            <p className="mt-1 text-xs font-bold text-slate-800">
              {photo ? 'Foto Pemeriksaan Berhasil Diambil' : 'Foto Belum Diambil'}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
              {imageAnalysisText}
            </p>
          </div>
        </div>

        {/* Gambar Ruam (Jika ada) */}
        {photo && (
          <div className="mt-3 flex items-center justify-center rounded border border-slate-200 bg-slate-100 p-2">
            <img
              src={photo}
              alt="Dokumentasi foto ruam pasien"
              className="max-h-36 w-auto rounded object-contain"
            />
          </div>
        )}

        {/* Tabel Indikator Gejala */}
        <div className="mt-4">
          <p className="text-[11px] font-semibold text-slate-600 uppercase mb-2">
            3. Indikator Gejala Pasien
          </p>
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-[11px] font-bold text-slate-700">
                <th className="py-1.5 px-3 w-10">No</th>
                <th className="py-1.5 px-3">Indikator Gejala yang Diperiksa</th>
                <th className="py-1.5 px-3 w-28 text-center">Jawaban Pasien</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {symptomsList.map((item, idx) => {
                const isYes = item.answer === 'yes'
                return (
                  <tr key={item.key} className={isYes && item.danger ? 'bg-red-50/50' : ''}>
                    <td className="py-1.5 px-3 text-slate-500 text-center font-mono">{idx + 1}</td>
                    <td className="py-1.5 px-3 text-slate-800">
                      {item.title}
                      {item.danger && (
                        <span className="ml-1.5 text-[10px] font-bold text-red-600">
                          (Tanda Bahaya)
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold ${
                          isYes
                            ? item.danger
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isYes ? 'Ya' : 'Tidak'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. EVALUASI GEJALA & SAFETY ALERT */}
      <div className="report-section mt-4 grid grid-cols-2 gap-4">
        {/* Evaluasi Gejala */}
        <div className="rounded-lg border border-slate-300 p-4">
          <h3 className="border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            D. Ringkasan Evaluasi Gejala
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-800">
            {evaluasiGejalaText}
          </p>
        </div>

        {/* Safety Alert */}
        <div
          className={`rounded-lg border p-4 ${
            pakarResult?.safety_alert
              ? 'border-red-400 bg-red-50/40'
              : 'border-slate-300 bg-white'
          }`}
        >
          <h3 className="border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            E. Tanda Bahaya (Safety Alert)
          </h3>
          <p className="mt-2 text-xs leading-relaxed">
            {pakarResult?.safety_alert ? (
              <span className="font-bold text-red-800">
                PERINGATAN: Terdapat tanda bahaya terdeteksi pada jawaban pasien. Pasien
                memerlukan penanganan segera oleh tenaga medis.
              </span>
            ) : (
              <span className="text-slate-700">
                Tidak ditemukan tanda bahaya berdasarkan jawaban pemeriksaan yang diberikan.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 6. SARAN TINDAK LANJUT */}
      <div className="report-section mt-4 rounded-lg border border-slate-300 p-4">
        <h3 className="border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          F. Saran Tindak Lanjut
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-800">
          {pakarResult?.safety_alert
            ? 'Segera arahkan pasien ke ruang tindakan gawat darurat (IGD) atau konsultasikan dengan dokter jaga tanpa penundaan.'
            : reconciliationResult?.reconciliation_status === 'CONSISTENT' &&
              measlesResult?.prediction === 'Measles'
              ? 'Konsultasikan hasil pemeriksaan ini kepada dokter di fasilitas kesehatan. Lakukan isolasi sementara dan jaga etika batuk untuk meminimalkan risiko penularan.'
              : 'Pantau kondisi tubuh dan konsultasikan hasil pemeriksaan kepada tenaga kesehatan. Jika kondisi memburuk atau muncul gejala yang mengkhawatirkan, segera cari bantuan medis.'}
        </p>
      </div>

      {/* 7. CATATAN BATASAN MEDIS */}
      <div className="report-section mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[10px] leading-relaxed text-slate-600">
        <p className="font-bold text-slate-800 uppercase tracking-wide">
          G. Catatan Batasan Medis:
        </p>
        <p className="mt-1">
          MeaslesCare merupakan sistem skrining awal yang membantu mengidentifikasi indikator gejala
          dan pola gambar yang perlu diperhatikan. Hasil pemeriksaan ini bukan diagnosis medis
          definitif. Penentuan diagnosis dan penanganan tetap memerlukan pemeriksaan oleh dokter
          atau tenaga kesehatan profesional.
        </p>
      </div>

      {/* 8. PENGESAHAN & TANDA TANGAN */}
      <div className="report-section mt-6 pt-2">
        <div className="flex justify-between items-end text-xs text-slate-700">
          <div className="space-y-1 text-[11px] text-slate-500">
            <p>Dicetak otomatis oleh Sistem Kiosk MeaslesCare</p>
            <p>No. Dokumen: MC-SCR-{idGejala || '000000'}</p>
          </div>
          <div className="text-center w-52">
            <p className="text-xs text-slate-600">Petugas / Fasilitas Kesehatan,</p>
            <div className="h-16" />
            <p className="border-t border-slate-400 font-bold text-slate-900 pt-1">
              ( Tenaga Medis Pemeriksa )
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

