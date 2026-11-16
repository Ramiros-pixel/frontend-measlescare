// Phase 6.4: Frontend Integration Test Suite
// MeaslesWatch AI — Huawei ICT Competition 2026–2027 | Team Inovexa
// Run with: node --experimental-strip-types scripts/test-measles-integration.mjs

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { register } from 'node:module'
import { pathToFileURL, fileURLToPath } from 'node:url'

// Register TypeScript resolver hook
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const loaderPath = pathToFileURL(path.join(scriptDir, 'ts-loader.mjs')).href
register(loaderPath, import.meta.url)

// Initialize mock localStorage in Node environment if missing
const storage = new Map()
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (k) => storage.get(k) ?? null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
    clear: () => storage.clear(),
  }
}

// Dynamically import modules after hook registration
const { dataUrlToBlob } = await import(
  pathToFileURL(path.resolve(rootDir, 'src/lib/image.ts')).href
)
const { measlesApi, pakarApi, gejalaApi } = await import(
  pathToFileURL(path.resolve(rootDir, 'src/api/endpoints.ts')).href
)
const { API_BASE, ApiError, isNetworkError } = await import(
  pathToFileURL(path.resolve(rootDir, 'src/api/client.ts')).href
)
// Helper logic corresponding to MeaslesResultCard.tsx
const MEASLES_CLASSES = ['Chickenpox', 'Cowpox', 'HFMD', 'Healthy', 'Measles', 'Monkeypox']
const MEASLES_CLASS_META = {
  Chickenpox: { labelId: 'Cacar Air' },
  Cowpox: { labelId: 'Cacar Sapi' },
  HFMD: { labelId: 'Flu Singapura' },
  Healthy: { labelId: 'Kulit Sehat' },
  Measles: { labelId: 'Campak' },
  Monkeypox: { labelId: 'Cacar Monyet' },
}

function prepareBarItems(probabilities) {
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

function formatConfidenceScore(confidence) {
  return {
    percentFormatted: `${(confidence * 100).toFixed(1).replace('.', ',')}%`,
    label: 'Skor Keyakinan Model',
    footnote:
      '*Nilai ini merupakan skor keyakinan komputasional model AI (AI model confidence score) berdasarkan analisis citra ruam, bukan probabilitas kepastian diagnosis medis klinis.',
  }
}

const DEFAULT_MEDICAL_DISCLAIMER =
  'Hasil analisis citra merupakan estimasi AI untuk skrining awal, bukan diagnosis medis definitif. Pengguna disarankan tetap berkonsultasi dengan tenaga medis profesional.'

function getEffectiveDisclaimer(disclaimer) {
  return disclaimer && disclaimer.trim() ? disclaimer.trim() : DEFAULT_MEDICAL_DISCLAIMER
}

// Helper to install mock fetch
function withMockFetch(fn) {
  return async (t) => {
    const originalFetch = globalThis.fetch
    try {
      await fn(t)
    } finally {
      globalThis.fetch = originalFetch
    }
  }
}

// Helper: Convert Uint8Array to Base64
function uint8ToBase64(bytes) {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Mock backend prediction response
const mockPredictResponse = {
  prediction: 'Measles',
  class_index: 4,
  confidence: 0.985421,
  probabilities: {
    Chickenpox: 0.0012,
    Cowpox: 0.0023,
    HFMD: 0.0034,
    Healthy: 0.0045,
    Measles: 0.985421,
    Monkeypox: 0.003179,
  },
  inference_time_ms: 38.45,
  disclaimer:
    'Hasil analisis citra merupakan estimasi AI untuk skrining awal, bukan diagnosis medis definitif. Pengguna disarankan tetap berkonsultasi dengan tenaga medis profesional.',
}

// -----------------------------------------------------------------------------
// TEST 1 — IMAGE PREPARATION & CONVERSION (Data URL -> Blob)
// -----------------------------------------------------------------------------
test('Test 1 — Image Preparation: Converts camera JPEG Data URL into binary Blob', async () => {
  const dummyJpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46])
  const dataUrl = `data:image/jpeg;base64,${uint8ToBase64(dummyJpegBytes)}`

  const blob = dataUrlToBlob(dataUrl)
  assert.ok(blob instanceof Blob, 'Output must be Blob')
  assert.equal(blob.type, 'image/jpeg')
  assert.equal(blob.size, dummyJpegBytes.length)

  const buffer = await blob.arrayBuffer()
  assert.deepEqual(Array.from(new Uint8Array(buffer)), Array.from(dummyJpegBytes))
})

// -----------------------------------------------------------------------------
// TEST 2 — FILE HANDLING FROM PHOTO PICKER
// -----------------------------------------------------------------------------
test('Test 2 — File Handling: Direct File instance can be forwarded to measlesApi.predict', withMockFetch(async () => {
  let capturedInit = null
  globalThis.fetch = async (url, init) => {
    capturedInit = init
    return new Response(JSON.stringify(mockPredictResponse), { status: 200 })
  }

  const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'lesion_upload.jpg', {
    type: 'image/jpeg',
  })

  const res = await measlesApi.predict(file)
  assert.ok(capturedInit.body instanceof FormData)
  const attached = capturedInit.body.get('file')
  assert.ok(attached)
  assert.equal(attached.name, 'lesion_upload.jpg')
  assert.equal(res.prediction, 'Measles')
}))

// -----------------------------------------------------------------------------
// TEST 3 — MULTIPART REQUEST FORM FIELD ('file') AND PATH RESOLUTION
// -----------------------------------------------------------------------------
test('Test 3 — Multipart Contract: Sends POST to /v1/measles/predict with form field "file"', withMockFetch(async () => {
  let capturedUrl = null
  let capturedInit = null

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return new Response(JSON.stringify(mockPredictResponse), { status: 200 })
  }

  const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' })
  await measlesApi.predict(blob)

  assert.equal(capturedUrl, `${API_BASE}/v1/measles/predict`)
  assert.equal(capturedInit.method, 'POST')
  assert.ok(capturedInit.body instanceof FormData)
  assert.ok(capturedInit.body.has('file'), 'FormData must contain "file" key')
  assert.equal(capturedInit.headers, undefined, 'Must not force Content-Type manually')
}))

// -----------------------------------------------------------------------------
// TEST 4 — RESPONSE TO RESULT CARD PROPS
// -----------------------------------------------------------------------------
test('Test 4 — Prediction Data Mapping: Formats into 6-class BarList items and confidence info', withMockFetch(async () => {
  globalThis.fetch = async () => new Response(JSON.stringify(mockPredictResponse), { status: 200 })

  const res = await measlesApi.predict(new Blob([new Uint8Array([1])], { type: 'image/jpeg' }))

  const barItems = prepareBarItems(res.probabilities)
  assert.equal(barItems.length, 6)
  assert.equal(barItems[4].label, 'Campak')
  assert.equal(barItems[4].percent, 98.54)

  const confInfo = formatConfidenceScore(res.confidence)
  assert.equal(confInfo.percentFormatted, '98,5%')
  assert.equal(confInfo.label, 'Skor Keyakinan Model')
  assert.ok(confInfo.footnote.includes('bukan probabilitas kepastian diagnosis'))
}))

// -----------------------------------------------------------------------------
// TEST 5 — LOADING STATE SIMULATION & ASYNC LIFECYCLE
// -----------------------------------------------------------------------------
test('Test 5 — Loading State: Correctly tracks pending inference and settles', withMockFetch(async () => {
  let resolveFetch
  globalThis.fetch = () =>
    new Promise((resolve) => {
      resolveFetch = () =>
        resolve(new Response(JSON.stringify(mockPredictResponse), { status: 200 }))
    })

  let isLoading = false
  let result = null

  // Simulate component state wrapper
  const runInference = async (blob) => {
    isLoading = true
    try {
      result = await measlesApi.predict(blob)
    } finally {
      isLoading = false
    }
  }

  const promise = runInference(new Blob([new Uint8Array([1])], { type: 'image/jpeg' }))
  assert.equal(isLoading, true, 'Loading must be true while in-flight')
  assert.equal(result, null, 'Result must be null while loading')

  resolveFetch()
  await promise

  assert.equal(isLoading, false, 'Loading must be false after completion')
  assert.equal(result.prediction, 'Measles')
}))

// -----------------------------------------------------------------------------
// TEST 6 — ERROR HANDLING AND USER-FRIENDLY MAPPING
// -----------------------------------------------------------------------------
test('Test 6 — Error Handling: Maps network failure and HTTP status codes cleanly', withMockFetch(async () => {
  // 1. Network Failure
  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch')
  }

  try {
    await measlesApi.predict(new Blob([new Uint8Array([1])], { type: 'image/jpeg' }))
    assert.fail('Should throw')
  } catch (err) {
    assert.ok(isNetworkError(err), 'Must be identified as network error')
  }

  // 2. HTTP 413 File Too Large
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ detail: 'Ukuran berkas melebihi batas maksimum 10 MB.' }), {
      status: 413,
    })

  try {
    await measlesApi.predict(new Blob([new Uint8Array([1])], { type: 'image/jpeg' }))
    assert.fail('Should throw')
  } catch (err) {
    assert.ok(err instanceof ApiError)
    assert.equal(err.status, 413)
    assert.equal(err.message, 'Ukuran berkas melebihi batas maksimum 10 MB.')
  }

  // 3. HTTP 503 Service Unavailable
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ detail: 'Layanan inferensi AI saat ini tidak tersedia.' }), {
      status: 503,
    })

  try {
    await measlesApi.predict(new Blob([new Uint8Array([1])], { type: 'image/jpeg' }))
    assert.fail('Should throw')
  } catch (err) {
    assert.ok(err instanceof ApiError)
    assert.equal(err.status, 503)
    assert.equal(err.message, 'Layanan inferensi AI saat ini tidak tersedia.')
  }
}))

// -----------------------------------------------------------------------------
// TEST 7 — RETRY CAPABILITY WITHOUT RESETTING SYSTEM STATE
// -----------------------------------------------------------------------------
test('Test 7 — Retry Capability: Recovers from failure upon subsequent attempt', withMockFetch(async () => {
  let attempt = 0
  globalThis.fetch = async () => {
    attempt++
    if (attempt === 1) {
      return new Response(JSON.stringify({ detail: 'Server busy' }), { status: 500 })
    }
    return new Response(JSON.stringify(mockPredictResponse), { status: 200 })
  }

  let measlesResult = null
  let measlesError = null

  const executeInference = async (blob) => {
    try {
      measlesResult = await measlesApi.predict(blob)
      measlesError = null
    } catch (e) {
      measlesError = e instanceof Error ? e.message : String(e)
    }
  }

  const blob = new Blob([new Uint8Array([1])], { type: 'image/jpeg' })

  // First attempt fails
  await executeInference(blob)
  assert.equal(measlesResult, null)
  assert.equal(measlesError, 'Server busy')

  // Retry succeeds
  await executeInference(blob)
  assert.equal(measlesError, null)
  assert.equal(measlesResult.prediction, 'Measles')
}))

// -----------------------------------------------------------------------------
// TEST 8 — STALE RESULT INVALIDATION & RACE CONDITION PREVENTION
// -----------------------------------------------------------------------------
test('Test 8 — Stale Invalidation: Changing photo clears result and ignores stale in-flight requests', withMockFetch(async () => {
  let resolveReq1
  let resolveReq2

  globalThis.fetch = async (url, init) => {
    const file = init.body.get('file')
    if (file.name === 'photo1.jpg') {
      return new Promise((r) => {
        resolveReq1 = () =>
          r(
            new Response(
              JSON.stringify({ ...mockPredictResponse, prediction: 'Healthy' }),
              { status: 200 }
            )
          )
      })
    } else {
      return new Promise((r) => {
        resolveReq2 = () =>
          r(
            new Response(
              JSON.stringify({ ...mockPredictResponse, prediction: 'Measles' }),
              { status: 200 }
            )
          )
      })
    }
  }

  let activeInferenceId = 0
  let displayedResult = null

  const triggerInference = async (file) => {
    const id = ++activeInferenceId
    displayedResult = null // clearing state for new photo

    const res = await measlesApi.predict(file)
    if (id === activeInferenceId) {
      displayedResult = res
    }
  }

  const f1 = new File([new Uint8Array([1])], 'photo1.jpg', { type: 'image/jpeg' })
  const f2 = new File([new Uint8Array([2])], 'photo2.jpg', { type: 'image/jpeg' })

  // User starts photo 1
  const p1 = triggerInference(f1)

  // User changes mind and takes photo 2
  const p2 = triggerInference(f2)
  assert.equal(displayedResult, null, 'Must be cleared on photo change')

  // Photo 2 completes first
  resolveReq2()
  await p2
  assert.equal(displayedResult.prediction, 'Measles')

  // Stale photo 1 completes afterwards -> must NOT overwrite photo 2 result
  resolveReq1()
  await p1
  assert.equal(displayedResult.prediction, 'Measles', 'Stale photo 1 must not overwrite photo 2')
}))

// -----------------------------------------------------------------------------
// TEST 9 — EXPERT SYSTEM PRESERVATION
// -----------------------------------------------------------------------------
test('Test 9 — Expert System Preservation: pakarApi and gejalaApi remain fully operational and separate', withMockFetch(async () => {
  let callPaths = []
  globalThis.fetch = async (url) => {
    callPaths.push(url)
    if (url.includes('/gejala')) {
      return new Response(JSON.stringify({ id_gejala: 'GEJALA-999' }), { status: 200 })
    }
    if (url.includes('/pakar/evaluasi')) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id_hasil: 1,
            id_gejala: 'GEJALA-999',
            hasil: 'Pola Gejala Mengarah ke Suspek Campak',
            forward_chaining: {
              kategori: 'CLINICAL_AND_SUSPECTED',
              aturan_aktif: ['R1', 'R2'],
              clinical_pattern: true,
              suspected_pattern: true,
            },
            decision_tree: { main_leaf: 'Suspek', safety_leaf: 'Normal', decision_path: [] },
            safety_alert: false,
            skor: 85,
            catatan: 'Observasi klinis.',
          },
        }),
        { status: 200 }
      )
    }
    return new Response(JSON.stringify(mockPredictResponse), { status: 200 })
  }

  // 1. gejalaApi.create
  const gejalaRes = await gejalaApi.create({ Suhu: 38.5, Batuk: null })
  assert.equal(gejalaRes.id_gejala, 'GEJALA-999')

  // 2. pakarApi.evaluasi
  const pakarRes = await pakarApi.evaluasi({
    id_gejala: 'GEJALA-999',
    jawaban: [{ kode_gejala: 'DEMAM', nilai: 1 }],
  })
  assert.equal(pakarRes.data.forward_chaining.kategori, 'CLINICAL_AND_SUSPECTED')

  // 3. measlesApi.predict
  const measlesRes = await measlesApi.predict(new Blob([new Uint8Array([1])], { type: 'image/jpeg' }))
  assert.equal(measlesRes.prediction, 'Measles')

  // Verify paths are completely separate endpoints
  assert.ok(callPaths.some((p) => p.includes('/gejala')))
  assert.ok(callPaths.some((p) => p.includes('/pakar/evaluasi')))
  assert.ok(callPaths.some((p) => p.includes('/v1/measles/predict')))
}))

// -----------------------------------------------------------------------------
// TEST 10 — STATIC AUDIT OF SkriningPage.tsx INTEGRATION
// -----------------------------------------------------------------------------
test('Test 10 — SkriningPage Integration Verification: Confirms code integration and expert system presence', () => {
  const skriningPath = path.join(rootDir, 'src/pages/user/SkriningPage.tsx')
  assert.ok(fs.existsSync(skriningPath), 'SkriningPage.tsx must exist')

  const code = fs.readFileSync(skriningPath, 'utf-8')

  // 1. Imports verified
  assert.ok(code.includes("import { gejalaApi, pakarApi, measlesApi } from '../../api/endpoints'"))
  assert.ok(
    /import\s*\{[\s\S]*?dataUrlToBlob[\s\S]*?\}\s*from\s*['"]\.\.\/\.\.\/lib\/image['"]/.test(code),
    'Must import dataUrlToBlob from ../../lib/image'
  )
  assert.ok(
    code.includes('SUPPORTED_IMAGE_MIME_TYPES') && code.includes('MAX_IMAGE_SIZE_BYTES'),
    'Must use centralized image constants from lib/image'
  )
  assert.ok(code.includes("import { MeaslesResultCard } from '../../components/measles/MeaslesResultCard'"))

  // 2. State & Inference Hook verified
  assert.ok(code.includes('runMeaslesInference'))
  assert.ok(code.includes('activeInferenceRef'))
  assert.ok(code.includes('measlesLoading'))
  assert.ok(code.includes('measlesError'))
  assert.ok(code.includes('measlesResult'))

  // 3. Photo Picker File Upload Option verified
  assert.ok(code.includes('handlePhotoPicked'))
  assert.ok(code.includes('Unggah Foto'))

  // 4. MeaslesResultCard Rendering verified
  assert.ok(code.includes('<MeaslesResultCard result={measlesResult} />'))

  // 5. Expert System Preservation verified
  assert.ok(code.includes('pakarApi.evaluasi'))
  assert.ok(code.includes('Hasil Evaluasi Sistem Pakar'))
  assert.ok(code.includes('pakarResult.forward_chaining'))
  assert.ok(code.includes('pakarResult.decision_tree'))

  // 6. Updated Catatan footnote verified
  assert.ok(
    code.includes('Hasil analisis citra oleh model AI MeaslesWatch dan hasil evaluasi Sistem Pakar')
  )
})

console.log('ALL PHASE 6.4 FRONTEND INTEGRATION TESTS REGISTERED SUCCESSFULLY')
