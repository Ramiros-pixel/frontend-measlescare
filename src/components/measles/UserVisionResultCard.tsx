import React from 'react'
import type { MeaslesPredictResponse } from '@/api/types'

export interface UserVisionResultCardProps {
  result: MeaslesPredictResponse
  className?: string
}

export const UserVisionResultCard: React.FC<UserVisionResultCardProps> = ({
  result,
  className = '',
}) => {
  const { prediction } = result

  let badgeColor = 'bg-slate-100 text-slate-800 border-slate-200'
  let labelId = 'Pemeriksaan Gambar Selesai'
  let description = ''

  switch (prediction) {
    case 'Measles':
      badgeColor = 'bg-rose-50 text-rose-800 border-rose-200'
      labelId = 'Kemiripan dengan Pola Campak'
      description =
        'Sistem menemukan pola gambar yang memiliki kemiripan dengan ruam campak. Hasil ini merupakan deteksi awal dan perlu dikonfirmasi melalui pemeriksaan langsung oleh tenaga kesehatan.'
      break

    case 'Healthy':
      badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200'
      labelId = 'Tidak Terdeteksi Ruam Patologis'
      description =
        'Pada gambar yang diperiksa, sistem tidak mendeteksi pola ruam patologis. Tetap perhatikan kondisi kulit dan pantau jika muncul keluhan baru.'
      break

    case 'Chickenpox':
      badgeColor = 'bg-amber-50 text-amber-800 border-amber-200'
      labelId = 'Kemiripan dengan Cacar Air'
      description =
        'Sistem menemukan pola gambar yang memiliki kemiripan dengan lenting cacar air. Konsultasikan dengan tenaga kesehatan untuk evaluasi diagnosis banding.'
      break

    case 'HFMD':
      badgeColor = 'bg-amber-50 text-amber-800 border-amber-200'
      labelId = 'Kemiripan dengan Flu Singapura (HFMD)'
      description =
        'Sistem menemukan karakteristik gambar yang menyerupai ruam flu singapura (tangan, kaki, atau mulut). Disarankan untuk berkonsultasi dengan dokter.'
      break

    case 'Cowpox':
    case 'Monkeypox':
      badgeColor = 'bg-amber-50 text-amber-800 border-amber-200'
      labelId = 'Kemiripan dengan Ruam Pox'
      description =
        'Sistem mendeteksi lesi ruam kulit khusus yang memerlukan pemeriksaan fisik langsung oleh tenaga medis profesional.'
      break

    default:
      badgeColor = 'bg-slate-50 text-slate-800 border-slate-200'
      labelId = 'Pola Ruam Teranalisis'
      description =
        'Gambar ruam telah berhasil dianalisis. Konsultasikan hasil pemeriksaan dengan dokter atau petugas kesehatan.'
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <h4 className="text-sm font-bold text-slate-900">Hasil Analisis Gambar Ruam</h4>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeColor}`}
        >
          {labelId}
        </span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-700">{description}</p>
    </div>
  )
}

