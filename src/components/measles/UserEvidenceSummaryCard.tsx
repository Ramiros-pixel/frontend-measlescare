import React from 'react'
import type { ReconciliationResponse } from '@/api/types'

export interface UserEvidenceSummaryCardProps {
  reconciliation: ReconciliationResponse
  className?: string
}

export const UserEvidenceSummaryCard: React.FC<UserEvidenceSummaryCardProps> = ({
  reconciliation,
  className = '',
}) => {
  const { reconciliation_status, cv_prediction, measured_temp, safety_alert } = reconciliation

  // Pemetaan status internal ke bahasa ramah pasien
  let statusBadge = {
    label: 'Hasil Pemeriksaan Saling Mendukung',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotColor: 'bg-emerald-500',
    borderColor: 'border-emerald-200',
    bgColor: 'bg-emerald-50/50',
  }

  let userSummary = ''
  let userExplanation = ''

  if (reconciliation_status === 'CONSISTENT') {
    if (cv_prediction === 'Measles') {
      statusBadge = {
        label: 'Hasil Pemeriksaan Saling Mendukung',
        className: 'bg-amber-50 text-amber-800 border-amber-200',
        dotColor: 'bg-amber-500',
        borderColor: 'border-amber-200',
        bgColor: 'bg-amber-50/40',
      }
      userSummary =
        'Hasil dari beberapa pemeriksaan (pengukuran suhu, analisis gambar ruam, dan keluhan gejala) menunjukkan indikator yang saling mendukung adanya kecurigaan pola klinis campak.'
      userExplanation =
        'Pemeriksaan suhu tubuh mengonfirmasi adanya demam, gambar ruam menunjukkan kemiripan dengan pola campak, dan jawaban gejala memenuhi indikator yang perlu diperhatikan dokter.'
    } else {
      statusBadge = {
        label: 'Hasil Pemeriksaan Saling Mendukung',
        className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotColor: 'bg-emerald-500',
        borderColor: 'border-emerald-200',
        bgColor: 'bg-emerald-50/40',
      }
      userSummary =
        'Hasil dari beberapa pemeriksaan menunjukkan informasi yang saling mendukung bahwa saat ini tidak ditemukan indikator yang mengarah pada pola klinis campak.'
      userExplanation =
        'Suhu tubuh terpantau dalam batas wajar, gambar ruam tidak menunjukkan pola campak aktif, dan gejala yang dilaporkan belum memenuhi kriteria campak.'
    }
  } else if (reconciliation_status === 'CONFLICTING') {
    statusBadge = {
      label: 'Terdapat Perbedaan Hasil Pemeriksaan',
      className: 'bg-amber-50 text-amber-800 border-amber-200',
      dotColor: 'bg-amber-500',
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50/40',
    }
    userSummary =
      'Hasil analisis gambar dan informasi gejala menunjukkan perbedaan. Pemeriksaan fisik langsung oleh dokter diperlukan untuk memastikan kondisi pasien.'
    
    // Penjelasan ramah pasien sumber perbedaan
    if (cv_prediction === 'Measles') {
      userExplanation =
        'Analisis gambar menemukan kemiripan bentuk ruam dengan pola campak, namun jawaban gejala belum menunjukkan riwayat demam atau keluhan khas campak secara lengkap.'
    } else if (cv_prediction === 'Healthy') {
      userExplanation =
        'Analisis gambar tidak mendeteksi pola ruam yang jelas pada area yang difoto, sedangkan informasi gejala menunjukkan beberapa keluhan yang perlu diperhatikan.'
    } else {
      userExplanation =
        'Terdapat perbedaan antara hasil pengamatan visual dan keluhan gejala yang dicatat. Evaluasi langsung oleh tenaga medis diperlukan untuk konfirmasi.'
    }
  } else {
    // INCOMPLETE
    statusBadge = {
      label: 'Data Pemeriksaan Belum Lengkap',
      className: 'bg-slate-100 text-slate-800 border-slate-200',
      dotColor: 'bg-slate-400',
      borderColor: 'border-slate-200',
      bgColor: 'bg-slate-50',
    }
    userSummary =
      'Beberapa data pemeriksaan belum tersedia sehingga hasil belum dapat dievaluasi secara menyeluruh.'
    userExplanation =
      'Lengkapi pemeriksaan yang belum dilakukan (foto ruam, pengukuran suhu, atau jawaban gejala) agar sistem dapat memberikan ringkasan yang lebih optimal.'
  }

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${statusBadge.borderColor} ${className}`}
    >
      {/* Header Bagian CERE */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Ringkasan Hasil Pemeriksaan
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Keterpaduan hasil dari pengukuran suhu, gambar ruam, dan informasi gejala pasien
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge.className}`}
        >
          <span className={`h-2 w-2 rounded-full ${statusBadge.dotColor}`} />
          {statusBadge.label}
        </span>
      </div>

      {/* Ringkasan Utama Ramah Pasien */}
      <div className={`mt-4 rounded-xl p-4 text-xs leading-relaxed text-slate-800 ${statusBadge.bgColor}`}>
        <p className="font-semibold text-slate-900">{userSummary}</p>
        <p className="mt-2 text-slate-700">{userExplanation}</p>
      </div>

      {/* Status Tiap Bagian Pemeriksaan yang Disederhanakan */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {/* Suhu Tubuh */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
          <p className="text-[11px] font-medium text-slate-500">Pemeriksaan Suhu</p>
          <p className="mt-1 text-xs font-bold text-slate-800">
            {measured_temp !== null && measured_temp !== undefined
              ? `${measured_temp.toFixed(1)} °C (${measured_temp >= 37.8 ? 'Demam' : 'Normal'})`
              : 'Belum Terukur'}
          </p>
        </div>

        {/* Gambar Ruam */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
          <p className="text-[11px] font-medium text-slate-500">Pemeriksaan Gambar Ruam</p>
          <p className="mt-1 text-xs font-bold text-slate-800">
            {cv_prediction === 'Measles'
              ? 'Terdapat Pola Khas Campak'
              : cv_prediction === 'Healthy'
                ? 'Tidak Ada Ruam Patologis'
                : cv_prediction
                  ? 'Pola Ruam Kulit Lainnya'
                  : 'Belum Ada Foto'}
          </p>
        </div>

        {/* Keluhan Gejala */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
          <p className="text-[11px] font-medium text-slate-500">Pemeriksaan Gejala</p>
          <p className="mt-1 text-xs font-bold text-slate-800">
            {safety_alert
              ? 'Perlu Perhatian Khusus'
              : reconciliation.expert_category === 'CLINICAL_AND_SUSPECTED'
                ? 'Gejala Mengarah ke Campak'
                : reconciliation.expert_category === 'CLINICAL_PATTERN_ONLY'
                  ? 'Beberapa Gejala Muncul'
                  : 'Gejala Belum Memenuhi Pola'}
          </p>
        </div>
      </div>
    </div>
  )
}

