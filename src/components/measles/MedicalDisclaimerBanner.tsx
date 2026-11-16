import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

export interface MedicalDisclaimerBannerProps {
  disclaimer?: string
  className?: string
}

export const DEFAULT_MEDICAL_DISCLAIMER =
  'Hasil analisis citra merupakan estimasi AI untuk skrining awal, bukan diagnosis medis definitif. Pengguna disarankan tetap berkonsultasi dengan tenaga medis profesional.'

/**
 * Mengembalikan teks disclaimer yang efektif: menggunakan teks dari respons backend
 * jika tersedia, atau kembali ke default disclaimer resmi yang selaras dengan backend.
 */
export function getEffectiveDisclaimer(disclaimer?: string): string {
  return disclaimer && disclaimer.trim() ? disclaimer.trim() : DEFAULT_MEDICAL_DISCLAIMER
}

/**
 * Banner peringatan medis MeaslesWatch AI.
 * Menegaskan secara visual bahwa hasil prediksi AI hanyalah estimasi skrining awal
 * dan tidak menggantikan pemeriksaan langsung oleh tenaga kesehatan profesional.
 */
export function MedicalDisclaimerBanner({
  disclaimer,
  className,
}: MedicalDisclaimerBannerProps) {
  const text = getEffectiveDisclaimer(disclaimer)

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-warning bg-warning-soft p-4 text-warning shadow-xs',
        className
      )}
    >
      <span aria-hidden className="mt-0.5 shrink-0 text-warning">
        <Icon name="peringatan" className="size-5" />
      </span>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-warning">
          Peringatan Batasan Medis
        </h4>
        <p className="mt-1 text-xs leading-relaxed text-text">
          {text}
        </p>
      </div>
    </div>
  )
}
