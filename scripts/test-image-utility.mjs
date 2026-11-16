// Phase 6.2: Image Conversion Utility Test Suite
// MeaslesWatch AI — Huawei ICT Competition 2026–2027 | Team Inovexa
// Run with: node --experimental-strip-types scripts/test-image-utility.mjs

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

// Dynamically import tested modules after hook registration
const {
  dataUrlToBlob,
  SUPPORTED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} = await import(pathToFileURL(path.resolve(scriptDir, '../src/lib/image.ts')).href)

const { measlesApi } = await import(
  pathToFileURL(path.resolve(scriptDir, '../src/api/endpoints.ts')).href
)
const { API_BASE } = await import(
  pathToFileURL(path.resolve(scriptDir, '../src/api/client.ts')).href
)

// Helper: Convert Uint8Array to Base64 in Node/Browser
function uint8ToBase64(bytes) {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
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

// -----------------------------------------------------------------------------
// TEST 1 — VALID JPEG DATA URL
// -----------------------------------------------------------------------------
test('Test 1 — Valid JPEG Data URL: Converts to Blob with image/jpeg and matching bytes', async () => {
  // Standard JPEG magic bytes: FF D8 FF E0 00 10 4A 46 49 46
  const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])
  const base64Str = uint8ToBase64(jpegBytes)
  const dataUrl = `data:image/jpeg;base64,${base64Str}`

  const blob = dataUrlToBlob(dataUrl)

  assert.ok(blob instanceof Blob, 'Output must be an instance of Blob')
  assert.equal(blob.type, 'image/jpeg')
  assert.equal(blob.size, jpegBytes.length)

  const arrayBuffer = await blob.arrayBuffer()
  const resultBytes = new Uint8Array(arrayBuffer)
  assert.deepEqual(Array.from(resultBytes), Array.from(jpegBytes))
})

// -----------------------------------------------------------------------------
// TEST 2 — VALID PNG DATA URL
// -----------------------------------------------------------------------------
test('Test 2 — Valid PNG Data URL: Converts to Blob with image/png and matching bytes', async () => {
  // Standard PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const base64Str = uint8ToBase64(pngBytes)
  const dataUrl = `data:image/png;base64,${base64Str}`

  const blob = dataUrlToBlob(dataUrl)

  assert.ok(blob instanceof Blob)
  assert.equal(blob.type, 'image/png')
  assert.equal(blob.size, pngBytes.length)

  const arrayBuffer = await blob.arrayBuffer()
  const resultBytes = new Uint8Array(arrayBuffer)
  assert.deepEqual(Array.from(resultBytes), Array.from(pngBytes))
})

// -----------------------------------------------------------------------------
// TEST 3 — VALID WEBP DATA URL
// -----------------------------------------------------------------------------
test('Test 3 — Valid WebP Data URL: Converts to Blob with image/webp and matching bytes', async () => {
  // Standard WebP RIFF...WEBP header bytes
  const webpBytes = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  ])
  const base64Str = uint8ToBase64(webpBytes)
  const dataUrl = `data:image/webp;base64,${base64Str}`

  const blob = dataUrlToBlob(dataUrl)

  assert.ok(blob instanceof Blob)
  assert.equal(blob.type, 'image/webp')
  assert.equal(blob.size, webpBytes.length)

  const arrayBuffer = await blob.arrayBuffer()
  const resultBytes = new Uint8Array(arrayBuffer)
  assert.deepEqual(Array.from(resultBytes), Array.from(webpBytes))
})

// -----------------------------------------------------------------------------
// TEST 4 — EMPTY INPUT
// -----------------------------------------------------------------------------
test('Test 4 — Empty Input: Rejects empty and whitespace-only strings', () => {
  assert.throws(() => dataUrlToBlob(''), {
    name: 'Error',
    message: /Data URL tidak boleh kosong/,
  })
  assert.throws(() => dataUrlToBlob('   '), {
    name: 'Error',
    message: /Data URL tidak boleh kosong/,
  })
  assert.throws(() => dataUrlToBlob('\t\n'), {
    name: 'Error',
    message: /Data URL tidak boleh kosong/,
  })
})

// -----------------------------------------------------------------------------
// TEST 5 — INVALID DATA URL
// -----------------------------------------------------------------------------
test('Test 5 — Invalid Data URL: Rejects non-strings, plain text, missing comma, and non-data schemas', () => {
  // Non-string types
  assert.throws(() => dataUrlToBlob(null), { name: 'TypeError' })
  assert.throws(() => dataUrlToBlob(undefined), { name: 'TypeError' })
  assert.throws(() => dataUrlToBlob(12345), { name: 'TypeError' })
  assert.throws(() => dataUrlToBlob({}), { name: 'TypeError' })

  // Plain strings
  assert.throws(() => dataUrlToBlob('plain text string'), {
    name: 'Error',
    message: /harus diawali dengan "data:"/,
  })
  assert.throws(() => dataUrlToBlob('https://example.com/photo.jpg'), {
    name: 'Error',
    message: /harus diawali dengan "data:"/,
  })

  // Missing comma separator
  assert.throws(() => dataUrlToBlob('data:image/jpeg;base64'), {
    name: 'Error',
    message: /tidak ditemukan pemisah tanda koma/,
  })
})

// -----------------------------------------------------------------------------
// TEST 6 — UNSUPPORTED MIME TYPE
// -----------------------------------------------------------------------------
test('Test 6 — Unsupported MIME Type: Rejects SVG, HTML, PDF, and missing MIME types', () => {
  const dummyB64 = btoa('dummy content')

  // SVG
  assert.throws(() => dataUrlToBlob(`data:image/svg+xml;base64,${dummyB64}`), {
    name: 'Error',
    message: /Tipe MIME "image\/svg\+xml" tidak didukung/,
  })

  // HTML
  assert.throws(() => dataUrlToBlob(`data:text/html;base64,${dummyB64}`), {
    name: 'Error',
    message: /Tipe MIME "text\/html" tidak didukung/,
  })

  // Application/PDF
  assert.throws(() => dataUrlToBlob(`data:application/pdf;base64,${dummyB64}`), {
    name: 'Error',
    message: /Tipe MIME "application\/pdf" tidak didukung/,
  })

  // Missing MIME type (data:;base64,...)
  assert.throws(() => dataUrlToBlob(`data:;base64,${dummyB64}`), {
    name: 'Error',
    message: /Tipe MIME tidak ditemukan/,
  })
})

// -----------------------------------------------------------------------------
// TEST 7 — MISSING BASE64 MARKER
// -----------------------------------------------------------------------------
test('Test 7 — Missing Base64 Marker: Rejects Data URLs without ;base64 indicator', () => {
  assert.throws(() => dataUrlToBlob('data:image/jpeg;utf8,sampletextdata'), {
    name: 'Error',
    message: /harus menggunakan pengodean Base64/,
  })
  assert.throws(() => dataUrlToBlob('data:image/jpeg,sampletextdata'), {
    name: 'Error',
    message: /harus menggunakan pengodean Base64/,
  })
  assert.throws(() => dataUrlToBlob('data:image/png;charset=utf-8,somecontent'), {
    name: 'Error',
    message: /harus menggunakan pengodean Base64/,
  })
})

// -----------------------------------------------------------------------------
// TEST 8 — MALFORMED BASE64
// -----------------------------------------------------------------------------
test('Test 8 — Malformed Base64: Rejects invalid characters and corrupted padding', () => {
  // Invalid characters (@, !, whitespace)
  assert.throws(() => dataUrlToBlob('data:image/jpeg;base64,inv@lid!ch@rs=='), {
    name: 'Error',
    message: /Format payload Base64 tidak valid/,
  })
  assert.throws(() => dataUrlToBlob('data:image/jpeg;base64,abc def='), {
    name: 'Error',
    message: /Format payload Base64 tidak valid/,
  })

  // Invalid padding
  assert.throws(() => dataUrlToBlob('data:image/jpeg;base64,===='), {
    name: 'Error',
    message: /Format payload Base64 tidak valid/,
  })
  assert.throws(() => dataUrlToBlob('data:image/jpeg;base64,a==='), {
    name: 'Error',
    message: /Format payload Base64 tidak valid/,
  })
  assert.throws(() => dataUrlToBlob('data:image/jpeg;base64,ab=c'), {
    name: 'Error',
    message: /Format payload Base64 tidak valid/,
  })

  // Invalid length (not a multiple of 4)
  assert.throws(() => dataUrlToBlob('data:image/jpeg;base64,a'), {
    name: 'Error',
    message: /Format payload Base64 tidak valid/,
  })
  assert.throws(() => dataUrlToBlob('data:image/jpeg;base64,abc'), {
    name: 'Error',
    message: /Format payload Base64 tidak valid/,
  })
})

// -----------------------------------------------------------------------------
// TEST 9 — EMPTY PAYLOAD
// -----------------------------------------------------------------------------
test('Test 9 — Empty Payload: Rejects Data URL with no Base64 data after comma', () => {
  assert.throws(() => dataUrlToBlob('data:image/jpeg;base64,'), {
    name: 'Error',
    message: /Payload Base64 pada Data URL kosong/,
  })
  assert.throws(() => dataUrlToBlob('data:image/png;base64,   '), {
    name: 'Error',
    message: /Payload Base64 pada Data URL kosong/,
  })
})

// -----------------------------------------------------------------------------
// TEST 10 — BLOB INTEGRITY
// -----------------------------------------------------------------------------
test('Test 10 — Blob Integrity: Verifies exact byte decoding across 256 byte permutations', async () => {
  // 256 distinct bytes covering 0x00 through 0xFF
  const testBytes = new Uint8Array(256)
  for (let i = 0; i < 256; i++) {
    testBytes[i] = i
  }

  const b64 = uint8ToBase64(testBytes)
  const dataUrl = `data:image/jpeg;base64,${b64}`

  const blob = dataUrlToBlob(dataUrl)

  assert.equal(blob.size, 256, 'Blob size must exactly equal 256 bytes')
  assert.equal(blob.type, 'image/jpeg')

  const arrayBuffer = await blob.arrayBuffer()
  const actualBytes = new Uint8Array(arrayBuffer)
  assert.equal(actualBytes.length, 256)

  for (let i = 0; i < 256; i++) {
    assert.equal(actualBytes[i], i, `Byte at index ${i} must match`)
  }
})

// -----------------------------------------------------------------------------
// TEST 11 — API COMPATIBILITY WITH measlesApi.predict(blob)
// -----------------------------------------------------------------------------
test('Test 11 — API Compatibility: Converted Blob works seamlessly with measlesApi.predict', withMockFetch(async () => {
  let capturedUrl = null
  let capturedInit = null

  // Mock globalThis.fetch to intercept the request without network activity
  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return new Response(
      JSON.stringify({
        prediction: 'Measles',
        class_index: 4,
        confidence: 0.98,
        probabilities: {
          Chickenpox: 0.002,
          Cowpox: 0.003,
          HFMD: 0.005,
          Healthy: 0.005,
          Measles: 0.98,
          Monkeypox: 0.005,
        },
        inference_time_ms: 35.6,
        disclaimer: 'Estimasi AI awal',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 1. Generate Blob from realistic camera Data URL
  const cameraDummyBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x11, 0x22, 0x33, 0x44])
  const cameraDataUrl = `data:image/jpeg;base64,${uint8ToBase64(cameraDummyBytes)}`
  const blob = dataUrlToBlob(cameraDataUrl)

  // 2. Call measlesApi.predict(blob)
  const response = await measlesApi.predict(blob)

  // 3. Verify FormData construction and request parameters
  assert.equal(capturedUrl, `${API_BASE}/v1/measles/predict`)
  assert.equal(capturedInit.method, 'POST')
  assert.ok(capturedInit.body instanceof FormData, 'Body must be FormData')

  const attachedField = capturedInit.body.get('file')
  assert.ok(attachedField, 'Form field "file" must exist')
  assert.equal(attachedField.name, 'lesion.jpg', 'Default filename for Blob must be "lesion.jpg"')
  assert.equal(attachedField.type, 'image/jpeg', 'MIME type must match Blob type image/jpeg')
  assert.equal(attachedField.size, cameraDummyBytes.length)

  // 4. Verify parsed API response
  assert.equal(response.prediction, 'Measles')
  assert.equal(response.confidence, 0.98)
}))

// -----------------------------------------------------------------------------
// TEST 12 — SIZE LIMIT GUARD (5 MB)
// -----------------------------------------------------------------------------
test('Test 12 — Size Limit Guard: Rejects payloads exceeding MAX_IMAGE_SIZE_BYTES (5 MB)', () => {
  // 5 MB = 5 * 1024 * 1024 = 5,242,880 bytes
  assert.equal(MAX_IMAGE_SIZE_BYTES, 5 * 1024 * 1024)

  // Construct a simulated base64 string whose decoded byte count is (5 MB + 4 bytes)
  const oversizeBytesCount = 5 * 1024 * 1024 + 4
  // We can simulate oversized binary string efficiently in Base64:
  // Each 3 bytes = 4 base64 chars. 5,242,884 bytes = 1,747,628 blocks of 4 chars
  const oversizeBlock = 'AAAA'.repeat(1747628)
  const oversizeDataUrl = `data:image/jpeg;base64,${oversizeBlock}`

  assert.throws(() => dataUrlToBlob(oversizeDataUrl), {
    name: 'Error',
    message: /Ukuran citra.*melebihi batas maksimum 5 MB/,
  })
})

console.log('ALL PHASE 6.2 IMAGE UTILITY TESTS REGISTERED SUCCESSFULLY')
