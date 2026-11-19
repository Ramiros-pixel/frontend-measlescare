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

const CLASS_NAMES: Record<string, { id: string; en: string }> = {
  Chickenpox: { id: 'Cacar Air', en: 'Chickenpox' },
  Cowpox: { id: 'Cacar Sapi', en: 'Cowpox' },
  HFMD: { id: 'Flu Singapura', en: 'HFMD' },
  Healthy: { id: 'Kulit Sehat', en: 'Healthy' },
  Measles: { id: 'Campak', en: 'Measles' },
  Monkeypox: { id: 'Cacar Monyet', en: 'Monkeypox' },
}

function toPercent(value: number): number {
  return value <= 1 ? value * 100 : value
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
  const tempNum = parseFloat(temperature)
  const isFever = !Number.isNaN(tempNum) && tempNum >= 37.8

  let statusTitle = 'Pemeriksaan Selesai'
  let statusClass = 'border-slate-300 bg-slate-50 text-slate-800'
  let statusSummary = 'Pemeriksaan telah dicatat dalam sistem MeaslesCare.'

  if (pakarResult?.safety_alert) {
    statusTitle = 'Perlu Penanganan Medis Segera'
    statusClass = 'border-red-400 bg-red-50 text-red-900'
    statusSummary =
      'Ditemukan tanda bahaya berdasarkan jawaban pemeriksaan. Segera dapatkan penanganan medis.'
  } else if (reconciliationResult?.reconciliation_status === 'CONSISTENT') {
    if (measlesResult?.prediction === 'Measles') {
      statusTitle = 'Perlu Pemeriksaan Lanjutan'
      statusClass = 'border-amber-400 bg-amber-50 text-amber-900'
      statusSummary =
        'Hasil pengukuran suhu, analisis gambar, dan informasi gejala saling mendukung indikasi yang perlu diperhatikan.'
    } else {
      statusTitle = 'Tidak Ditemukan Indikator yang Mengarah pada Pola Klinis Campak'
      statusClass = 'border-emerald-400 bg-emerald-50 text-emerald-900'
      statusSummary =
        'Hasil pemeriksaan yang tersedia tidak menunjukkan indikator yang mengarah pada pola klinis campak.'
    }
  } else if (reconciliationResult?.reconciliation_status === 'CONFLICTING') {
    statusTitle = 'Terdapat Perbedaan Hasil Pemeriksaan'
    statusClass = 'border-amber-400 bg-amber-50 text-amber-900'
    statusSummary =
      'Hasil analisis gambar dan informasi gejala menunjukkan perbedaan. Pemeriksaan fisik lebih lanjut diperlukan.'
  } else if (reconciliationResult?.reconciliation_status === 'INCOMPLETE') {
    statusTitle = 'Data Pemeriksaan Belum Lengkap'
    statusClass = 'border-slate-300 bg-slate-100 text-slate-800'
    statusSummary =
      'Beberapa data pemeriksaan belum tersedia sehingga hasil belum dapat dinilai secara menyeluruh.'
  }

  let cereSummary = statusSummary
  if (reconciliationResult?.reconciliation_status === 'CONFLICTING') {
    if (measlesResult?.prediction === 'Healthy') {
      cereSummary =
        'Analisis gambar tidak mendeteksi pola ruam patologis, sedangkan beberapa informasi gejala perlu diperhatikan.'
    } else if (measlesResult?.prediction === 'Measles') {
      cereSummary =
        'Analisis gambar menunjukkan kemiripan dengan pola campak, tetapi informasi gejala belum menunjukkan seluruh indikator yang digunakan dalam skrining.'
    }
  }

  const prediction = measlesResult?.prediction
  const predictionName = prediction ? CLASS_NAMES[prediction] : null
  let imageSummary = 'Foto ruam belum dianalisis atau tidak tersedia.'
  if (prediction === 'Measles') {
    imageSummary =
      'Sistem menemukan pola gambar yang memiliki kemiripan dengan kelas campak. Hasil ini merupakan skrining awal dan perlu dikonfirmasi oleh tenaga kesehatan.'
  } else if (prediction === 'Healthy') {
    imageSummary =
      'Pada gambar yang diperiksa, sistem tidak mendeteksi pola ruam patologis.'
  } else if (prediction === 'Chickenpox') {
    imageSummary =
      'Sistem menemukan pola gambar yang memiliki kemiripan dengan kelas cacar air.'
  } else if (prediction === 'HFMD') {
    imageSummary =
      'Sistem menemukan pola gambar yang memiliki kemiripan dengan kelas flu singapura (HFMD).'
  } else if (prediction === 'Cowpox') {
    imageSummary =
      'Sistem menemukan pola gambar yang memiliki kemiripan dengan kelas cacar sapi.'
  } else if (prediction === 'Monkeypox') {
    imageSummary =
      'Sistem menemukan pola gambar yang memiliki kemiripan dengan kelas cacar monyet.'
  }

  const distribution = Object.entries(measlesResult?.probabilities ?? {})
    .map(([name, value]) => ({ name, percent: toPercent(Number(value)) }))
    .filter((item) => item.percent > 30)
    .sort((a, b) => b.percent - a.percent)

  let expertTitle = 'Indikator Skrining Kasus Belum Terpenuhi'
  let expertSummary =
    'Belum seluruh indikator yang digunakan dalam skrining kasus terpenuhi.'
  if (pakarResult?.forward_chaining.kategori === 'CLINICAL_AND_SUSPECTED') {
    expertTitle = 'Pola Klinis Terpenuhi'
    expertSummary =
      'Beberapa gejala menunjukkan pola klinis yang perlu diperhatikan berdasarkan jawaban pemeriksaan.'
  } else if (pakarResult?.forward_chaining.kategori === 'CLINICAL_PATTERN_ONLY') {
    expertTitle = 'Beberapa Pola Gejala Perlu Diperhatikan'
    expertSummary =
      'Beberapa gejala menunjukkan pola klinis, tetapi belum seluruh indikator skrining kasus terpenuhi.'
  } else if (pakarResult?.forward_chaining.kategori === 'SUSPECTED_PATTERN_ONLY') {
    expertTitle = 'Indikator Awal Perlu Dipantau'
    expertSummary =
      'Ditemukan beberapa indikator awal yang perlu dipantau lebih lanjut.'
  }

  return (
    <div className="screening-report-document mx-auto w-full max-w-[210mm] bg-white text-slate-900 print:max-w-none print:p-0">
      <div className="report-section border-b-2 border-slate-900 pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-xl font-extrabold text-white">
              +
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">MEASLESCARE</h1>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                Sistem Skrining Awal Campak
              </p>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-600">
            <p className="font-bold text-slate-800">LAPORAN HASIL SKRINING AWAL CAMPAK</p>
            <p>Tanggal cetak: {printDate}</p>
          </div>
        </div>
      </div>

      <div className="report-section mt-3 rounded-lg border border-slate-300 p-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
          A. Identitas Pasien
        </h2>
        <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1.5 text-[11px]">
          <p><strong>Nama:</strong> {patient.name || '-'}</p>
          <p><strong>ID pemeriksaan:</strong> {idGejala || '-'}</p>
          <p><strong>Tanggal lahir:</strong> {patient.birthDate || '-'}</p>
          <p><strong>Jenis kelamin:</strong> {patient.gender || '-'}</p>
          <p><strong>Tanggal pemeriksaan:</strong> {printDate}</p>
          <p><strong>NIK:</strong> {patient.nik ? `${patient.nik.slice(0, 6)}******${patient.nik.slice(-4)}` : '-'}</p>
        </div>
      </div>

      <div className="report-section mt-3 rounded-lg border border-slate-300 p-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
          B. Ringkasan Hasil Pemeriksaan
        </h2>
        <div className={`mt-2 rounded-md border px-3 py-2 ${statusClass}`}>
          <p className="text-[10px] font-bold uppercase text-slate-600">Status skrining</p>
          <p className="mt-0.5 text-sm font-extrabold">{statusTitle}</p>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-700">{cereSummary}</p>
      </div>

      <div className="report-section mt-3 rounded-lg border border-slate-300 p-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
          C. Hasil Utama Analisis Gambar Ruam
        </h2>
        {predictionName ? (
          <>
            <p className="mt-2 text-xl font-extrabold text-slate-950">
              {predictionName.id} <span className="text-sm text-slate-500">/ {predictionName.en}</span>
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-700">{imageSummary}</p>
          </>
        ) : (
          <p className="mt-2 text-[11px] text-slate-700">Hasil analisis gambar belum tersedia.</p>
        )}
      </div>

      <div className="report-section mt-3 rounded-lg border border-slate-300 p-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
          D. Distribusi Hasil Klasifikasi Gambar
        </h2>
        {distribution.length > 0 ? (
          <div className="mt-2 space-y-2">
            {distribution.map((item) => {
              const names = CLASS_NAMES[item.name] ?? { id: item.name, en: item.name }
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="w-[48%] text-[10px] font-semibold">
                    {names.id} / {names.en}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-blue-700" style={{ width: `${Math.min(item.percent, 100)}%` }} />
                  </div>
                  <span className="w-12 text-right text-[10px] font-bold">
                    {item.percent.toFixed(1).replace('.', ',')}%
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-2 text-[10px] text-slate-700">
            Tidak terdapat kelas dengan nilai distribusi di atas ambang tampilan 30%.
          </p>
        )}
        <p className="mt-2 text-[9px] leading-relaxed text-slate-500">
          Distribusi ini menunjukkan tingkat keyakinan komputasional model terhadap masing-masing kelas berdasarkan gambar yang dianalisis, bukan probabilitas diagnosis klinis.
        </p>
      </div>

      <div className="report-section mt-3 rounded-lg border border-slate-300 p-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
          E. Ringkasan Evaluasi Gejala
        </h2>
        <p className="mt-1.5 text-[12px] font-extrabold text-slate-900">{expertTitle}</p>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-700">{expertSummary}</p>
      </div>

      <div className="report-page-break" />

      <div className="report-section mt-0 rounded-lg border border-slate-300 p-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
          F. Rincian Pemeriksaan
        </h2>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div className="rounded border border-slate-200 p-2">
            <p className="text-[9px] font-bold uppercase text-slate-600">1. Pengukuran Suhu Tubuh</p>
            <p className="mt-1 text-lg font-extrabold">
              {temperature ? `${temperature} °C` : 'Tidak Terukur'}
            </p>
            <p className={`text-[10px] font-bold ${isFever ? 'text-red-700' : 'text-emerald-700'}`}>
              {isFever ? 'Suhu Meningkat / Demam' : 'Rentang Normal'}
            </p>
          </div>
          <div className="rounded border border-slate-200 p-2">
            <p className="text-[9px] font-bold uppercase text-slate-600">2. Pemeriksaan Foto Ruam</p>
            <p className="mt-1 text-[10px] font-bold">
              {photo ? 'Foto pemeriksaan berhasil diambil' : 'Foto belum diambil'}
            </p>
            {photo && (
              <img
                src={photo}
                alt="Foto ruam pasien"
                className="mt-2 max-h-28 w-full rounded object-contain"
              />
            )}
          </div>
        </div>
      </div>

      <div className="report-section mt-3 rounded-lg border border-slate-300 p-3">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-700">
          3. Indikator Gejala
        </h2>
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr className="border-b border-slate-300 bg-slate-100">
              <th className="px-2 py-1 text-left">No</th>
              <th className="px-2 py-1 text-left">Indikator</th>
              <th className="w-20 px-2 py-1 text-center">Jawaban</th>
            </tr>
          </thead>
          <tbody>
            {symptomsList.map((item, index) => (
              <tr key={item.key} className={item.answer === 'yes' && item.danger ? 'bg-red-50' : 'border-b border-slate-200'}>
                <td className="px-2 py-1">{index + 1}</td>
                <td className="px-2 py-1">
                  {item.title}
                  {item.danger && <span className="ml-1 font-bold text-red-700">(Tanda Bahaya)</span>}
                </td>
                <td className="px-2 py-1 text-center font-bold">
                  {item.answer === 'yes' ? 'Ya' : 'Tidak'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`report-section mt-3 rounded-lg border p-3 ${pakarResult?.safety_alert ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}>
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">G. Safety Alert</h2>
        <p className={`mt-1.5 text-[11px] leading-relaxed ${pakarResult?.safety_alert ? 'font-bold text-red-800' : 'text-slate-700'}`}>
          {pakarResult?.safety_alert
            ? 'Terdapat tanda bahaya. Segera bawa pasien ke fasilitas pelayanan kesehatan darurat atau konsultasikan dengan dokter jaga.'
            : 'Tidak ditemukan tanda bahaya berdasarkan jawaban pemeriksaan yang diberikan.'}
        </p>
      </div>

      <div className="report-section mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">H. Saran Tindak Lanjut</h2>
        <p className="mt-1.5 text-[10px] leading-relaxed text-slate-800">
          {pakarResult?.safety_alert
            ? 'Segera arahkan pasien ke ruang tindakan gawat darurat (IGD) atau konsultasikan dengan dokter jaga tanpa penundaan.'
            : reconciliationResult?.reconciliation_status === 'CONSISTENT' && measlesResult?.prediction === 'Measles'
              ? 'Konsultasikan hasil pemeriksaan kepada tenaga kesehatan untuk evaluasi lebih lanjut.'
              : 'Pantau kondisi tubuh dan konsultasikan hasil pemeriksaan kepada tenaga kesehatan. Jika kondisi memburuk atau muncul gejala yang mengkhawatirkan, segera cari bantuan medis.'}
        </p>
      </div>

      <div className="report-section mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[9px] leading-relaxed text-slate-600">
        <p className="font-bold uppercase tracking-wide text-slate-800">I. Catatan Batasan Medis</p>
        <p className="mt-1">
          MeaslesCare merupakan sistem skrining awal yang membantu mengidentifikasi indikator gejala
          dan pola gambar yang perlu diperhatikan. Hasil pemeriksaan ini bukan diagnosis medis
          definitif. Penentuan diagnosis dan penanganan tetap memerlukan pemeriksaan oleh dokter
          atau tenaga kesehatan profesional.
        </p>
      </div>

      <footer className="mt-3 flex justify-between border-t border-slate-300 pt-2 text-[9px] text-slate-500">
        <span>MEASLESCARE</span>
        <span>{printDate}</span>
      </footer>
    </div>
  )
}
