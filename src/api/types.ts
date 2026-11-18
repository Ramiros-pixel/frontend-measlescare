
export interface User {
  NIK: string
  Name: string
  Tempat_Tgl_Lahir: string | null
  Alamat: string | null
  Golongan_darah: string | null
  Email: string | null
  id_Role: string
  role_name?: string
}

export interface CameraRecord {
  id_cam: string
  Status: string | null
  id_gejala: string
  Tanggal: string
}

export interface CameraCreate {
  Status: string | null
  id_gejala: string
}

export interface GejalaRecord {
  id_gejala: string
  NIK: string
  Batuk: string | null
  Suhu: number | null
  Tanggal: string
}

export interface GejalaCreate {
  Suhu?: number | null
  Batuk?: string | null
}

export interface HistoryCamera {
  id_cam: string
  Status: string | null
  Tanggal: string
  reports: { id_rept: string }[]
}

export interface HistoryItem {
  id_gejala: string
  NIK: string
  nama_user: string | null
  Batuk: string | null
  Suhu: number | null
  Tanggal: string
  cameras: HistoryCamera[]
}

export type Role = 'R1' | 'R2'

export function isAdmin(user: User | null | undefined): boolean {
  return user?.id_Role === 'R1'
}

export interface MasterGejala {
  kode_gejala: string
  nama_gejala: string
  deskripsi: string | null
  jenis: string
}

export interface JawabanGejalaInput {
  kode_gejala: string
  nilai: 0 | 1
}

export interface EvaluasiPakarRequest {
  id_gejala: string
  jawaban: JawabanGejalaInput[]
}

export interface ForwardChainingResult {
  kategori: string
  aturan_aktif: string[]
  clinical_pattern: boolean
  suspected_pattern: boolean
}

export interface DecisionTreeResult {
  main_leaf: string
  safety_leaf: string
  decision_path: string[]
}

export interface EvaluasiPakarResult {
  id_hasil: number
  id_gejala: string
  hasil: string
  forward_chaining: ForwardChainingResult
  decision_tree: DecisionTreeResult
  safety_alert: boolean
  skor: number | null
  catatan: string
}

export interface EvaluasiPakarResponse {
  success: boolean
  message: string
  data: EvaluasiPakarResult
}

export interface HasilPakarResponse {
  success: boolean
  data: {
    id_hasil: number
    id_gejala: string
    hasil: string
    skor: number | null
    ringkasan: {
      forward_chaining?: Record<string, unknown>
      decision_tree?: Record<string, unknown>
      catatan?: string
    }
    tanggal_evaluasi: string
  }
}

export type MeaslesClass =
  | 'Chickenpox'
  | 'Cowpox'
  | 'HFMD'
  | 'Healthy'
  | 'Measles'
  | 'Monkeypox'

export type MeaslesProbabilities = Record<MeaslesClass, number>

export interface MeaslesPredictResponse {
  prediction: MeaslesClass
  class_index: number
  confidence: number
  probabilities: MeaslesProbabilities
  inference_time_ms: number
  disclaimer: string
}

export interface FaceRecognizeRequest {
  image: string
}

export interface FaceRecognizeResponse {
  recognized: boolean
  user_id: string | null
  name: string | null
  confidence: number | null
}

export interface KioskPatient {
  NIK: string
  Name: string
  Tempat_Tgl_Lahir: string | null
  Golongan_darah: string | null
  Email: string | null
  Alamat: string | null
  face_samples: number
  face_target: number
}

export interface KioskFaceResponse {
  recognized: boolean
  match: boolean
  user_id: string | null
  name: string | null
  confidence: number | null
}

export interface KioskCaptureResponse {
  nik: string
  stored: number
  target: number
  face_detected: boolean
  completed: boolean
  message: string
}

export type ReconciliationStatus = 'CONSISTENT' | 'CONFLICTING' | 'INCOMPLETE'
export type EvidenceValidationStatus = 'VALID' | 'MISSING' | 'INVALID' | 'FAILED'

export interface EvidenceValidationDetail {
  computer_vision: EvidenceValidationStatus
  body_temperature: EvidenceValidationStatus
  expert_system: EvidenceValidationStatus
}

export interface EvidenceReconciliationEvaluateRequest {
  id_gejala: string
  cv_prediction?: string | null
  cv_confidence?: number | null
  cv_probabilities?: Record<string, number> | null
}

export interface ReconciliationResponse {
  id_reconciliation: string
  id_gejala: string
  reconciliation_status: ReconciliationStatus
  summary: string
  evidence_validation: EvidenceValidationDetail
  cv_prediction?: string | null
  cv_confidence?: number | null
  measured_temp?: number | null
  expert_category?: string | null
  safety_alert: boolean
  supporting_evidence: string[]
  conflicting_evidence: string[]
  missing_evidence: string[]
  invalid_evidence: string[]
  explanation: string
  recommended_action: string
  rule_version: string
  is_diagnosis: boolean
  disclaimer: string
  created_at?: string | null
}
