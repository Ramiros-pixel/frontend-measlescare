// Phase 6.1: API & Networking Layer Test Suite
// MeaslesWatch AI — Huawei ICT Competition 2026–2027 | Team Inovexa
// Run with: node --experimental-strip-types scripts/test-measles-api.mjs

import test from 'node:test'
import assert from 'node:assert/strict'
import { register } from 'node:module'
import { pathToFileURL, fileURLToPath } from 'node:url'
import path from 'node:path'

// Register TypeScript resolver hook for extensionless imports in src/
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
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

// Dynamically import API modules after hook registration
const {
  API_BASE,
  ApiError,
  describeError,
  getToken,
  setToken,
  isNetworkError,
  request,
  requestMultipart,
} = await import(pathToFileURL(path.resolve(scriptDir, '../src/api/client.ts')).href)

const {
  authApi,
  usersApi,
  gejalaApi,
  cameraApi,
  pakarApi,
  measlesApi,
} = await import(pathToFileURL(path.resolve(scriptDir, '../src/api/endpoints.ts')).href)

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

// -----------------------------------------------------------------------------
// TEST 1 — MULTIPART REQUEST CONSTRUCTION
// -----------------------------------------------------------------------------
test('Test 1 — Multipart Request Construction: POST, FormData direct body, no JSON Content-Type', withMockFetch(async () => {
  let interceptedUrl = null
  let interceptedInit = null

  globalThis.fetch = async (url, init) => {
    interceptedUrl = url
    interceptedInit = init
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const formData = new FormData()
  formData.append('file', new Blob([new Uint8Array([1, 2, 3])]), 'test.jpg')

  const res = await requestMultipart('/v1/measles/predict', formData)

  // 1. Verify URL resolution
  assert.equal(interceptedUrl, `${API_BASE}/v1/measles/predict`)
  // 2. Verify HTTP method is POST
  assert.equal(interceptedInit.method, 'POST')
  // 3. Verify FormData passed directly (not JSON.stringify-ed)
  assert.equal(interceptedInit.body, formData)
  assert.equal(typeof interceptedInit.body, 'object')
  // 4. Verify no manual Content-Type header exists (so browser/runtime sets multipart boundary)
  assert.equal(interceptedInit.headers, undefined)
  // 5. Verify response returned
  assert.deepEqual(res, { success: true })
}))

// -----------------------------------------------------------------------------
// TEST 2 — PUBLIC AUTHENTICATION BEHAVIOR
// -----------------------------------------------------------------------------
test('Test 2 — Public Authentication Behavior: No JWT attached by requestMultipart, preserved in request', withMockFetch(async () => {
  let multipartHeaders = null
  let jsonHeaders = null

  // Simulate logged-in user with active token
  setToken('jwt-super-secret-token-xyz')
  assert.equal(getToken(), 'jwt-super-secret-token-xyz')

  globalThis.fetch = async (url, init) => {
    if (init.body instanceof FormData) {
      multipartHeaders = init.headers
      return new Response(JSON.stringify({ prediction: 'Measles' }), { status: 200 })
    } else {
      jsonHeaders = init.headers
      return new Response(JSON.stringify({ NIK: '123' }), { status: 200 })
    }
  }

  // 1. requestMultipart must NOT attach Authorization header
  const formData = new FormData()
  await requestMultipart('/v1/measles/predict', formData)
  assert.equal(multipartHeaders, undefined)

  // 2. Standard request must attach Authorization header when token exists
  await request('/users/me')
  assert.ok(jsonHeaders)
  assert.equal(jsonHeaders['Authorization'], 'Bearer jwt-super-secret-token-xyz')

  // Cleanup token
  setToken(null)
  assert.equal(getToken(), null)
}))

// -----------------------------------------------------------------------------
// TEST 3 — RESPONSE PARSING
// -----------------------------------------------------------------------------
test('Test 3 — Response Parsing: Verify all backend schema contract fields parsed accurately', withMockFetch(async () => {
  const backendPayload = {
    prediction: 'Measles',
    class_index: 4,
    confidence: 0.985421,
    probabilities: {
      Chickenpox: 0.001234,
      Cowpox: 0.002345,
      HFMD: 0.003456,
      Healthy: 0.004567,
      Measles: 0.985421,
      Monkeypox: 0.002977,
    },
    inference_time_ms: 38.45,
    disclaimer: 'Hasil analisis citra merupakan estimasi AI untuk skrining awal, bukan diagnosis medis definitif. Pengguna disarankan tetap berkonsultasi dengan tenaga medis profesional.',
  }

  globalThis.fetch = async () => {
    return new Response(JSON.stringify(backendPayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const formData = new FormData()
  const result = await requestMultipart('/v1/measles/predict', formData)

  assert.equal(result.prediction, 'Measles')
  assert.equal(result.class_index, 4)
  assert.equal(result.confidence, 0.985421)
  assert.deepEqual(result.probabilities, backendPayload.probabilities)
  assert.equal(result.probabilities.Measles, 0.985421)
  assert.equal(result.inference_time_ms, 38.45)
  assert.equal(result.disclaimer, backendPayload.disclaimer)
}))

// -----------------------------------------------------------------------------
// TEST 4 — HTTP ERROR HANDLING (400, 413, 415, 422, 500, 503)
// -----------------------------------------------------------------------------
test('Test 4 — HTTP Error Handling: Status mapping and describeError integration', withMockFetch(async () => {
  const testCases = [
    {
      status: 400,
      body: { detail: 'Berkas gambar kosong (0 byte).' },
      expectedMsg: 'Berkas gambar kosong (0 byte).',
    },
    {
      status: 413,
      body: { detail: 'Ukuran berkas melebihi batas maksimum 10 MB.' },
      expectedMsg: 'Ukuran berkas melebihi batas maksimum 10 MB.',
    },
    {
      status: 415,
      body: { detail: 'Format berkas tidak didukung. Harap unggah citra dengan format JPEG, PNG, atau WebP.' },
      expectedMsg: 'Format berkas tidak didukung. Harap unggah citra dengan format JPEG, PNG, atau WebP.',
    },
    {
      status: 422,
      body: { detail: 'Berkas citra rusak atau tidak dapat didekode.' },
      expectedMsg: 'Berkas citra rusak atau tidak dapat didekode.',
    },
    {
      status: 422,
      body: { detail: [{ loc: ['body', 'file'], msg: 'Field required' }] },
      expectedMsg: 'Periksa kembali isian yang ditandai.',
      checkFields: (err) => assert.equal(err.fields?.file, 'Field required'),
    },
    {
      status: 500,
      body: { detail: 'Terjadi kesalahan saat memproses inferensi citra.' },
      expectedMsg: 'Terjadi kesalahan saat memproses inferensi citra.',
    },
    {
      status: 503,
      body: { detail: 'Layanan inferensi AI saat ini tidak tersedia.' },
      expectedMsg: 'Layanan inferensi AI saat ini tidak tersedia.',
    },
  ]

  for (const tc of testCases) {
    globalThis.fetch = async () => {
      return new Response(JSON.stringify(tc.body), {
        status: tc.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    try {
      await requestMultipart('/v1/measles/predict', new FormData())
      assert.fail(`Expected HTTP ${tc.status} error to be thrown`)
    } catch (err) {
      assert.ok(err instanceof ApiError, `Expected ApiError for status ${tc.status}`)
      assert.equal(err.status, tc.status)
      assert.equal(err.message, tc.expectedMsg)
      if (tc.checkFields) {
        tc.checkFields(err)
      }
    }
  }
}))

// -----------------------------------------------------------------------------
// TEST 5 — NETWORK AND TIMEOUT HANDLING
// -----------------------------------------------------------------------------
test('Test 5 — Network and Timeout Handling: AbortSignal and TypeError handling', withMockFetch(async () => {
  // 1. Manual AbortSignal cancellation
  const ac = new AbortController()
  globalThis.fetch = async (_url, init) => {
    return new Promise((_, reject) => {
      init.signal?.addEventListener('abort', () => {
        reject(new DOMException('Request dibatalkan', 'AbortError'))
      })
    })
  }

  const cancelPromise = requestMultipart('/v1/measles/predict', new FormData(), ac.signal)
  ac.abort()

  await assert.rejects(
    cancelPromise,
    (err) => err instanceof DOMException && err.name === 'AbortError' && err.message === 'Request dibatalkan',
    'Expected AbortError with "Request dibatalkan"'
  )

  // 2. Network connection failure
  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch')
  }

  await assert.rejects(
    requestMultipart('/v1/measles/predict', new FormData()),
    (err) => isNetworkError(err),
    'Expected TypeError identified as network error'
  )
}))

// -----------------------------------------------------------------------------
// TEST 6 — API ENDPOINT (measlesApi.predict)
// -----------------------------------------------------------------------------
test('Test 6 — API Endpoint: measlesApi.predict handles File, Blob, and AbortSignal', withMockFetch(async () => {
  let capturedUrl = null
  let capturedInit = null

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return new Response(JSON.stringify({
      prediction: 'Measles',
      class_index: 4,
      confidence: 0.95,
      probabilities: { Chickenpox: 0.01, Cowpox: 0.01, HFMD: 0.01, Healthy: 0.01, Measles: 0.95, Monkeypox: 0.01 },
      inference_time_ms: 42.1,
      disclaimer: 'Disclaimer text',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  // 1. Test with File instance
  const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'lesion_patient1.jpg', { type: 'image/jpeg' })
  const res1 = await measlesApi.predict(file)

  assert.equal(capturedUrl, `${API_BASE}/v1/measles/predict`)
  assert.equal(capturedInit.method, 'POST')
  assert.ok(capturedInit.body instanceof FormData)
  const attachedFile1 = capturedInit.body.get('file')
  assert.ok(attachedFile1)
  assert.equal(attachedFile1.name, 'lesion_patient1.jpg')
  assert.equal(res1.prediction, 'Measles')

  // 2. Test with Blob instance (default filename 'lesion.jpg')
  const blob = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' })
  const res2 = await measlesApi.predict(blob)

  const attachedFile2 = capturedInit.body.get('file')
  assert.ok(attachedFile2)
  assert.equal(attachedFile2.name, 'lesion.jpg')
  assert.equal(res2.prediction, 'Measles')

  // 3. Test AbortSignal forwarding
  const ac = new AbortController()
  globalThis.fetch = async (_url, init) => {
    assert.ok(init.signal, 'Expected init.signal to be present')
    return new Response(JSON.stringify({ prediction: 'Healthy' }), { status: 200 })
  }
  await measlesApi.predict(blob, ac.signal)
}))

// -----------------------------------------------------------------------------
// TEST 7 — REGRESSION (Existing API functionality and modules intact)
// -----------------------------------------------------------------------------
test('Test 7 — Regression: Existing client and endpoint groups remain fully intact', withMockFetch(async () => {
  // 1. Verify existing API objects exist and have expected methods
  assert.equal(typeof authApi.login, 'function')
  assert.equal(typeof authApi.register, 'function')
  assert.equal(typeof authApi.me, 'function')

  assert.equal(typeof usersApi.list, 'function')
  assert.equal(typeof usersApi.me, 'function')
  assert.equal(typeof usersApi.detail, 'function')

  assert.equal(typeof gejalaApi.create, 'function')
  assert.equal(typeof gejalaApi.history, 'function')
  assert.equal(typeof gejalaApi.detail, 'function')

  assert.equal(typeof cameraApi.create, 'function')
  assert.equal(typeof cameraApi.list, 'function')

  assert.equal(typeof pakarApi.masterGejala, 'function')
  assert.equal(typeof pakarApi.evaluasi, 'function')
  assert.equal(typeof pakarApi.hasil, 'function')

  assert.equal(typeof measlesApi.predict, 'function')

  // 2. Verify standard request JSON behavior
  let capturedInit = null
  globalThis.fetch = async (_url, init) => {
    capturedInit = init
    return new Response(JSON.stringify({ token: 'abc' }), { status: 200 })
  }

  await authApi.login({ NIK: '1234567890123456', password: 'password123' })
  assert.equal(capturedInit.method, 'POST')
  assert.equal(capturedInit.headers['Content-Type'], 'application/json')
  assert.equal(capturedInit.body, JSON.stringify({ NIK: '1234567890123456', password: 'password123' }))

  // 3. Verify 204 No Content returns undefined
  globalThis.fetch = async () => new Response(null, { status: 204 })
  const emptyRes = await request('/some/path')
  assert.equal(emptyRes, undefined)

  // 4. Verify describeError default fallbacks
  const err404 = describeError(404, null)
  assert.equal(err404.status, 404)
  assert.equal(err404.message, 'Data tidak ditemukan.')

  const err401 = describeError(401, null)
  assert.equal(err401.status, 401)
  assert.equal(err401.message, 'Sesi berakhir. Masuk kembali untuk melanjutkan.')
}))

console.log('ALL PHASE 6.1 API & NETWORKING TESTS REGISTERED SUCCESSFULLY')
