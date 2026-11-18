import React from 'react'
import { cn } from '@/lib/cn'
import type {
  ReconciliationResponse,
  ReconciliationStatus,
  EvidenceValidationStatus,
} from '@/api/types'

export interface ClinicalEvidenceCardProps {
  reconciliation: ReconciliationResponse
  className?: string
}

function getStatusBadge(status: ReconciliationStatus) {
  switch (status) {
    case 'CONSISTENT':
      return {
        label: 'Konsisten (Consistent)',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        border: 'border-emerald-200',
      }
    case 'CONFLICTING':
      return {
        label: 'Berkonflik (Conflicting)',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        border: 'border-amber-200',
      }
    case 'INCOMPLETE':
      return {
        label: 'Data Belum Lengkap (Incomplete)',
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        border: 'border-slate-200',
      }
  }
}

function getModalityBadge(status: EvidenceValidationStatus) {
  switch (status) {
    case 'VALID':
      return {
        label: 'Valid',
        className: 'bg-emerald-100 text-emerald-800',
      }
    case 'MISSING':
      return {
        label: 'Belum Ada',
        className: 'bg-slate-100 text-slate-600',
      }
    case 'INVALID':
      return {
        label: 'Tidak Valid',
        className: 'bg-rose-100 text-rose-800',
      }
    case 'FAILED':
      return {
        label: 'Gagal',
        className: 'bg-rose-100 text-rose-800',
      }
  }
}

export const ClinicalEvidenceCard: React.FC<ClinicalEvidenceCardProps> = ({
  reconciliation,
  className,
}) => {
  const meta = getStatusBadge(reconciliation.reconciliation_status)

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white p-5 shadow-sm transition-all',
        meta.border,
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 items-center justify-center">
              <span className={cn('h-2.5 w-2.5 rounded-full', meta.dot)} />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Rekonsiliasi Bukti Klinis (CERE)
            </h3>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {reconciliation.rule_version}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Clinical Evidence Reconciliation Engine — Sintesis Bukti Multimodal
          </p>
        </div>

        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
            meta.bg,
          )}
        >
          {meta.label}
        </span>
      </div>

      {/* Summary Box */}
      <div className="mt-4 rounded-xl bg-slate-50/80 p-3.5 text-sm text-slate-800">
        <strong className="font-semibold text-slate-900">Ringkasan Sintesis:</strong>{' '}
        {reconciliation.summary}
      </div>

      {/* Evidence Validation Modalities */}
      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Status Modalitas Bukti
        </h4>
        <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {/* Computer Vision */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3">
            <div>
              <p className="text-xs font-medium text-slate-700">Computer Vision</p>
              <p className="text-[11px] text-slate-500">
                {reconciliation.cv_prediction
                  ? `${reconciliation.cv_prediction} (${((reconciliation.cv_confidence ?? 0) * 100).toFixed(0)}%)`
                  : 'Citra Ruam Kulit'}
              </p>
            </div>
            {(() => {
              const b = getModalityBadge(reconciliation.evidence_validation.computer_vision)
              return (
                <span className={cn('rounded px-2 py-0.5 text-[10px] font-semibold', b.className)}>
                  {b.label}
                </span>
              )
            })()}
          </div>

          {/* Suhu Sensor */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3">
            <div>
              <p className="text-xs font-medium text-slate-700">Sensor Suhu (MLX90614)</p>
              <p className="text-[11px] text-slate-500">
                {reconciliation.measured_temp !== null && reconciliation.measured_temp !== undefined
                  ? `${reconciliation.measured_temp.toFixed(1)}°C`
                  : 'Pengukuran Suhu'}
              </p>
            </div>
            {(() => {
              const b = getModalityBadge(reconciliation.evidence_validation.body_temperature)
              return (
                <span className={cn('rounded px-2 py-0.5 text-[10px] font-semibold', b.className)}>
                  {b.label}
                </span>
              )
            })()}
          </div>

          {/* Sistem Pakar */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3">
            <div>
              <p className="text-xs font-medium text-slate-700">Sistem Pakar</p>
              <p className="text-[11px] text-slate-500">
                {reconciliation.expert_category
                  ? reconciliation.expert_category.replace(/_/g, ' ')
                  : 'Kuesioner Gejala'}
              </p>
            </div>
            {(() => {
              const b = getModalityBadge(reconciliation.evidence_validation.expert_system)
              return (
                <span className={cn('rounded px-2 py-0.5 text-[10px] font-semibold', b.className)}>
                  {b.label}
                </span>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Detailed Evidence Lists */}
      <div className="mt-4 space-y-3">
        {/* Supporting Evidence */}
        {reconciliation.supporting_evidence.length > 0 && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <span className="text-emerald-600">✓</span> Bukti Pendukung (Supporting Evidence)
            </h5>
            <ul className="mt-1.5 space-y-1 text-xs text-emerald-800">
              {reconciliation.supporting_evidence.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conflicting Evidence */}
        {reconciliation.conflicting_evidence.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <span className="text-amber-600">⚠</span> Bukti Berkonflik (Conflicting Evidence)
            </h5>
            <ul className="mt-1.5 space-y-1 text-xs text-amber-800">
              {reconciliation.conflicting_evidence.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing or Invalid Evidence */}
        {(reconciliation.missing_evidence.length > 0 ||
          reconciliation.invalid_evidence.length > 0) && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span className="text-slate-500">ℹ</span> Bukti Belum Lengkap / Tidak Valid
            </h5>
            <ul className="mt-1.5 space-y-1 text-xs text-slate-600">
              {reconciliation.missing_evidence.map((item, idx) => (
                <li key={`missing-${idx}`} className="flex items-start gap-1.5">
                  <span className="text-slate-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
              {reconciliation.invalid_evidence.map((item, idx) => (
                <li key={`invalid-${idx}`} className="flex items-start gap-1.5 text-rose-600">
                  <span>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Safety Alert Callout if present */}
      {reconciliation.safety_alert && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900">
          <span className="mt-0.5 text-base">🚨</span>
          <div>
            <strong className="font-bold">PERINGATAN TANDA BAHAYA TERDETEKSI:</strong>
            <p className="mt-0.5">
              Pasien teridentifikasi memiliki tanda kegawatan medis. Prioritaskan tindakan rujukan
              darurat atau konsultasi dokter segera!
            </p>
          </div>
        </div>
      )}

      {/* Explanation & Recommended Action */}
      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/40 p-3.5">
        <h5 className="text-xs font-bold text-blue-900">Penjelasan & Rekomendasi Klinis</h5>
        <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-blue-800">
          {reconciliation.explanation}
        </p>

        <div className="mt-3 rounded-lg bg-white p-3 border border-blue-200/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
            Rekomendasi Tindakan:
          </p>
          <p className="mt-1 text-xs font-medium text-slate-800">
            {reconciliation.recommended_action}
          </p>
        </div>
      </div>

      {/* Medical Disclaimer Banner */}
      <div className="mt-4 rounded-lg bg-slate-50 p-2.5 text-[11px] leading-relaxed text-slate-500">
        <strong>Pernyataan Batas Medis:</strong> {reconciliation.disclaimer}
      </div>
    </div>
  )
}

