import React from 'react'
import type { MeaslesPredictResponse } from '@/api/types'

export interface UserVisionResultCardProps {
  result: MeaslesPredictResponse
  className?: string
}

const CLASS_NAMES: Record<MeaslesPredictResponse['prediction'], { id: string; en: string }> = {
  Chickenpox: { id: 'Cacar Air', en: 'Chickenpox' },
  Cowpox: { id: 'Cacar Sapi', en: 'Cowpox' },
  HFMD: { id: 'Flu Singapura', en: 'HFMD' },
  Healthy: { id: 'Kulit Sehat', en: 'Healthy' },
  Measles: { id: 'Campak', en: 'Measles' },
  Monkeypox: { id: 'Cacar Monyet', en: 'Monkeypox' },
}

function toDisplayPercent(value: number): number {
  return value <= 1 ? value * 100 : value
}

export const UserVisionResultCard: React.FC<UserVisionResultCardProps> = ({
  result,
  className = '',
}) => {
  const { prediction } = result
  const mainClass = CLASS_NAMES[prediction] ?? { id: prediction, en: prediction }

  let badgeColor = 'bg-slate-100 text-slate-800 border-slate-200'
  let description = ''

  switch (prediction) {
    case 'Measles':
      badgeColor = 'bg-rose-50 text-rose-800 border-rose-200'
      description =
        'Sistem menemukan pola gambar yang memiliki kemiripan dengan ruam campak. Hasil ini merupakan deteksi awal dan perlu dikonfirmasi melalui pemeriksaan langsung oleh tenaga kesehatan.'
      break

    case 'Healthy':
      badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200'
      description =
        'Pada gambar yang diperiksa, sistem tidak mendeteksi pola ruam patologis. Tetap perhatikan kondisi kulit dan pantau jika muncul keluhan baru.'
      break

    case 'Chickenpox':
      badgeColor = 'bg-amber-50 text-amber-800 border-amber-200'
      description =
        'Sistem menemukan pola gambar yang memiliki kemiripan dengan lenting cacar air. Konsultasikan dengan tenaga kesehatan untuk evaluasi diagnosis banding.'
      break

    case 'HFMD':
      badgeColor = 'bg-amber-50 text-amber-800 border-amber-200'
      description =
        'Sistem menemukan karakteristik gambar yang menyerupai ruam flu singapura (tangan, kaki, atau mulut). Disarankan untuk berkonsultasi dengan dokter.'
      break

    case 'Cowpox':
    case 'Monkeypox':
      badgeColor = 'bg-amber-50 text-amber-800 border-amber-200'
      description =
        'Sistem mendeteksi lesi ruam kulit khusus yang memerlukan pemeriksaan fisik langsung oleh tenaga medis profesional.'
      break

    default:
      badgeColor = 'bg-slate-50 text-slate-800 border-slate-200'
      description =
        'Gambar ruam telah berhasil dianalisis. Konsultasikan hasil pemeriksaan dengan dokter atau petugas kesehatan.'
  }

  const distribution = Object.entries(result.probabilities ?? {})
    .map(([name, value]) => {
      const percent = toDisplayPercent(Number(value))
      return {
        name: name as MeaslesPredictResponse['prediction'],
        percent,
      }
    })
    .filter((item) => item.percent > 30)
    .sort((a, b) => b.percent - a.percent)

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-base font-bold text-slate-900">Hasil Analisis Gambar Ruam</h4>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeColor}`}
        >
          Hasil Utama
        </span>
      </div>

      <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Kelas prediksi utama
      </p>
      <p className="mt-1 text-2xl font-extrabold text-slate-950">
        {mainClass.id} <span className="text-base font-bold text-slate-500">/ {mainClass.en}</span>
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-700">{description}</p>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <h5 className="text-sm font-bold text-slate-900">Distribusi Hasil Klasifikasi Gambar</h5>
        {distribution.length > 0 ? (
          <div className="mt-3 space-y-3">
            {distribution.map((item) => {
              const names = CLASS_NAMES[item.name]
              return (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-800">
                      {names.id} <span className="text-slate-500">/ {names.en}</span>
                    </span>
                    <span className="font-bold text-slate-900">{item.percent.toFixed(1).replace('.', ',')}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#175CD3]"
                      style={{ width: `${Math.min(item.percent, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-700">
            Tidak terdapat kelas dengan nilai distribusi di atas ambang tampilan 30%.
          </p>
        )}
        <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
          Distribusi ini menunjukkan tingkat keyakinan komputasional model terhadap masing-masing kelas berdasarkan gambar yang dianalisis, bukan probabilitas diagnosis klinis.
        </p>
      </div>
    </div>
  )
}

