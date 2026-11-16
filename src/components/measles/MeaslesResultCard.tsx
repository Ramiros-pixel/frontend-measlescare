import { cn } from '@/lib/cn'
import type { MeaslesClass, MeaslesPredictResponse } from '@/api/types'
import { BarList, type BarItem } from '@/components/ui/Chart'
import { Icon, type IconName } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { MedicalDisclaimerBanner } from './MedicalDisclaimerBanner'

export interface MeaslesResultCardProps {
  result: MeaslesPredictResponse
  showDisclaimer?: boolean
  className?: string
}

/**
 * Daftar 6 kelas penyakit kulit MeaslesWatch AI dalam urutan kanonikal backend:
 * 0: Chickenpox, 1: Cowpox, 2: HFMD, 3: Healthy, 4: Measles, 5: Monkeypox.
 */
export const MEASLES_CLASSES: readonly MeaslesClass[] = [
  'Chickenpox',
  'Cowpox',
  'HFMD',
  'Healthy',
  'Measles',
  'Monkeypox',
] as const

export interface ClassPresentationMeta {
  labelId: string
  labelEn: string
  description: string
  tone: 'danger' | 'warning' | 'success' | 'info'
  icon: IconName
}

/**
 * Pemetaan presentasi visual untuk masing-masing kelas hasil prediksi backend.
 */
export const MEASLES_CLASS_META: Record<MeaslesClass, ClassPresentationMeta> = {
  Chickenpox: {
    labelId: 'Cacar Air',
    labelEn: 'Chickenpox',
    description: 'Infeksi virus Varicella zoster dengan vesikel/lenting gatal berair.',
    tone: 'warning',
    icon: 'info',
  },
  Cowpox: {
    labelId: 'Cacar Sapi',
    labelEn: 'Cowpox',
    description: 'Penyakit kulit langka akibat infeksi virus Orthopoxvirus.',
    tone: 'warning',
    icon: 'info',
  },
  HFMD: {
    labelId: 'Flu Singapura',
    labelEn: 'HFMD',
    description: 'Penyakit tangan, kaki, dan mulut akibat infeksi Enterovirus.',
    tone: 'warning',
    icon: 'info',
  },
  Healthy: {
    labelId: 'Kulit Sehat',
    labelEn: 'Healthy',
    description: 'Tidak terdeteksi adanya lesi atau ruam kulit patologis.',
    tone: 'success',
    icon: 'ceklis',
  },
  Measles: {
    labelId: 'Campak',
    labelEn: 'Measles',
    description: 'Ruam makulopapular kemerahan khas infeksi virus Morbilli.',
    tone: 'danger',
    icon: 'peringatan',
  },
  Monkeypox: {
    labelId: 'Cacar Monyet',
    labelEn: 'Monkeypox',
    description: 'Infeksi virus Mpox dengan lesi pustular mendalam.',
    tone: 'warning',
    icon: 'peringatan',
  },
}

/**
 * Menyiapkan daftar item probabilitas 6 kelas sesuai urutan backend untuk komponen BarList.
 */
export function prepareBarItems(
  probabilities: Record<MeaslesClass, number> | undefined
): BarItem[] {
  return MEASLES_CLASSES.map((cls) => {
    const prob = probabilities?.[cls] ?? 0
    const percent = Number((prob * 100).toFixed(2))
    return {
      label: MEASLES_CLASS_META[cls]?.labelId ?? cls,
      value: prob,
      percent,
    }
  })
}

/**
 * Memformat skor keyakinan model secara bertanggung jawab tanpa menyebutnya
 * sebagai kepastian diagnosis medis klinis.
 */
export function formatConfidenceScore(confidence: number): {
  percentFormatted: string
  label: string
  footnote: string
} {
  return {
    percentFormatted: `${(confidence * 100).toFixed(1).replace('.', ',')}%`,
    label: 'Skor Keyakinan Model',
    footnote:
      '*Nilai ini merupakan skor keyakinan komputasional model AI (AI model confidence score) berdasarkan analisis citra ruam, bukan probabilitas kepastian diagnosis medis klinis.',
  }
}

/**
 * Komponen kartu presentasi hasil analisis citra ruam MeaslesWatch AI.
 * Menampilkan kelas terprediksi, skor keyakinan model, distribusi probabilitas 6 kelas,
 * serta banner peringatan batasan medis.
 */
export function MeaslesResultCard({
  result,
  showDisclaimer = true,
  className,
}: MeaslesResultCardProps) {
  const meta = MEASLES_CLASS_META[result.prediction] ?? {
    labelId: result.prediction,
    labelEn: result.prediction,
    description: 'Hasil klasifikasi estimasi citra model AI.',
    tone: 'info',
    icon: 'info',
  }

  const barItems = prepareBarItems(result.probabilities)
  const confidenceInfo = formatConfidenceScore(result.confidence)

  return (
    <div
      className={cn(
        'rounded-2xl border border-border-soft bg-surface p-5 shadow-card',
        className
      )}
    >
      {/* 1. Header Hasil Prediksi & Status Badge */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Hasil Klasifikasi AI Citra Ruam
          </p>
          <h3 className="mt-1 text-xl font-extrabold text-text">
            {meta.labelId}{' '}
            <span className="text-sm font-normal text-muted">({result.prediction})</span>
          </h3>
          <p className="mt-1 text-xs text-muted">{meta.description}</p>
        </div>
        <StatusBadge
          tone={meta.tone}
          icon={<Icon name={meta.icon} className="size-3.5" />}
          label={`${meta.labelId} (${result.prediction})`}
        />
      </div>

      {/* 2. Bagian Skor Keyakinan Model */}
      <div className="mt-4 rounded-xl bg-surface-muted p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold text-muted">
            {confidenceInfo.label}
          </span>
          <span className="text-2xl font-black text-text">
            {confidenceInfo.percentFormatted}
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          {confidenceInfo.footnote}
        </p>
      </div>

      {/* 3. Distribusi Probabilitas 6 Kelas menggunakan BarList */}
      <div className="mt-5 border-t border-border-soft pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
            Distribusi Probabilitas (6 Kelas)
          </h4>
          <span className="text-[11px] text-muted">Estimasi Softmax</span>
        </div>
        <BarList items={barItems} />
      </div>

      {/* 4. Metadata Inferensi Teknis */}
      {result.inference_time_ms !== undefined && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-soft pt-3 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <Icon name="jam" className="size-3.5" />
            Waktu inferensi: <strong className="text-text">{result.inference_time_ms} ms</strong>
          </span>
          <span>Model: MobileNetV3 Small (ONNX CPU)</span>
        </div>
      )}

      {/* 5. Medical Disclaimer Banner */}
      {showDisclaimer && (
        <div className="mt-5">
          <MedicalDisclaimerBanner disclaimer={result.disclaimer} />
        </div>
      )}
    </div>
  )
}
