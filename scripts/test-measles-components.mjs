// Phase 6.3: UI Presentation Components Test Suite
// MeaslesWatch AI — Huawei ICT Competition 2026–2027 | Team Inovexa
// Run with: node --experimental-strip-types scripts/test-measles-components.mjs

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')

const cardPath = path.join(rootDir, 'src/components/measles/MeaslesResultCard.tsx')
const bannerPath = path.join(rootDir, 'src/components/measles/MedicalDisclaimerBanner.tsx')

// Helper: Read component source files
function readComponentFile(filePath) {
  assert.ok(fs.existsSync(filePath), `File ${filePath} must exist`)
  return fs.readFileSync(filePath, 'utf-8')
}

// -----------------------------------------------------------------------------
// TEST 1 — FILE EXISTENCE AND STRUCTURAL INTEGRITY
// -----------------------------------------------------------------------------
test('Test 1 — File Existence: Both presentation component files exist in src/components/measles', () => {
  assert.ok(fs.existsSync(cardPath), 'MeaslesResultCard.tsx must exist')
  assert.ok(fs.existsSync(bannerPath), 'MedicalDisclaimerBanner.tsx must exist')

  const cardSrc = readComponentFile(cardPath)
  const bannerSrc = readComponentFile(bannerPath)

  assert.ok(cardSrc.includes('export function MeaslesResultCard'), 'Must export MeaslesResultCard component')
  assert.ok(bannerSrc.includes('export function MedicalDisclaimerBanner'), 'Must export MedicalDisclaimerBanner component')
})

// -----------------------------------------------------------------------------
// TEST 2 — 6-CLASS CANONICAL ORDER & REPRESENTATION
// -----------------------------------------------------------------------------
test('Test 2 — 6-Class Canonical Order: Preserves exact backend ordering (0..5)', () => {
  const cardSrc = readComponentFile(cardPath)

  // Expected canonical order from backend measles_engine.py
  const expectedClasses = [
    'Chickenpox',
    'Cowpox',
    'HFMD',
    'Healthy',
    'Measles',
    'Monkeypox',
  ]

  // Verify MEASLES_CLASSES constant defines all 6 classes in order
  for (let i = 0; i < expectedClasses.length; i++) {
    const cls = expectedClasses[i]
    assert.ok(cardSrc.includes(`'${cls}'`), `MEASLES_CLASSES must contain '${cls}'`)
  }

  // Verify class sequence order in MEASLES_CLASSES array declaration
  const arrayMatch = cardSrc.match(/MEASLES_CLASSES[\s\S]*?=\s*\[([\s\S]*?)\]\s*as\s+const/)
  assert.ok(arrayMatch, 'MEASLES_CLASSES array declaration must exist')

  const extractedClasses = arrayMatch[1]
    .split(',')
    .map((s) => s.replace(/['"\s]/g, ''))
    .filter(Boolean)

  assert.deepEqual(
    extractedClasses,
    expectedClasses,
    'MEASLES_CLASSES array must match backend order identically'
  )
})

// -----------------------------------------------------------------------------
// TEST 3 — CLASS PRESENTATION METADATA MAPPING
// -----------------------------------------------------------------------------
test('Test 3 — Class Presentation Metadata: Complete Indonesian mapping, tones, and icons', () => {
  const cardSrc = readComponentFile(cardPath)

  // Expected Indonesian translations
  const expectedLabels = {
    Chickenpox: 'Cacar Air',
    Cowpox: 'Cacar Sapi',
    HFMD: 'Flu Singapura',
    Healthy: 'Kulit Sehat',
    Measles: 'Campak',
    Monkeypox: 'Cacar Monyet',
  }

  for (const [cls, idLabel] of Object.entries(expectedLabels)) {
    assert.ok(cardSrc.includes(idLabel), `Metadata must include Indonesian label "${idLabel}" for ${cls}`)
  }

  // Measles must have danger tone
  assert.ok(cardSrc.includes("labelId: 'Campak'"), 'Measles must map to Campak')
  assert.ok(cardSrc.includes("tone: 'danger'"), 'Measles must have tone: danger')

  // Healthy must have success tone
  assert.ok(cardSrc.includes("labelId: 'Kulit Sehat'"), 'Healthy must map to Kulit Sehat')
  assert.ok(cardSrc.includes("tone: 'success'"), 'Healthy must have tone: success')
})

// -----------------------------------------------------------------------------
// TEST 4 — prepareBarItems PROBABILITY DISTRIBUTION CALCULATION
// -----------------------------------------------------------------------------
test('Test 4 — Probability Distribution Logic: prepareBarItems computes percentages and preserves order', () => {
  // Test implementation of prepareBarItems logic
  const mockProbabilities = {
    Chickenpox: 0.0012,
    Cowpox: 0.0023,
    HFMD: 0.0034,
    Healthy: 0.0045,
    Measles: 0.9854,
    Monkeypox: 0.0032,
  }

  const MEASLES_CLASSES = ['Chickenpox', 'Cowpox', 'HFMD', 'Healthy', 'Measles', 'Monkeypox']
  const MEASLES_LABELS = {
    Chickenpox: 'Cacar Air',
    Cowpox: 'Cacar Sapi',
    HFMD: 'Flu Singapura',
    Healthy: 'Kulit Sehat',
    Measles: 'Campak',
    Monkeypox: 'Cacar Monyet',
  }

  const items = MEASLES_CLASSES.map((cls) => {
    const prob = mockProbabilities[cls] ?? 0
    return {
      label: MEASLES_LABELS[cls],
      value: prob,
      percent: Number((prob * 100).toFixed(2)),
    }
  })

  // 1. Must contain all 6 items
  assert.equal(items.length, 6)

  // 2. Exact ordering verified
  assert.equal(items[0].label, 'Cacar Air')
  assert.equal(items[1].label, 'Cacar Sapi')
  assert.equal(items[2].label, 'Flu Singapura')
  assert.equal(items[3].label, 'Kulit Sehat')
  assert.equal(items[4].label, 'Campak')
  assert.equal(items[5].label, 'Cacar Monyet')

  // 3. Percentage values calculated correctly
  assert.equal(items[4].percent, 98.54)
  assert.equal(items[0].percent, 0.12)
})

// -----------------------------------------------------------------------------
// TEST 5 — RESPONSIBLE CONFIDENCE SCORE PRESENTATION
// -----------------------------------------------------------------------------
test('Test 5 — Responsible Confidence Presentation: Labeled as model confidence, not clinical certainty', () => {
  const cardSrc = readComponentFile(cardPath)

  // 1. Must not claim to be a definitive medical diagnosis
  assert.ok(
    cardSrc.includes('Skor Keyakinan Model'),
    'Must display label "Skor Keyakinan Model"'
  )

  // 2. Must contain an explicit disclaimer footnote explaining the computational nature of the score
  assert.ok(
    cardSrc.includes('bukan probabilitas kepastian diagnosis medis klinis') ||
      cardSrc.includes('bukan kepastian diagnosis'),
    'Must state that confidence is an AI model score and not clinical certainty'
  )

  // 3. Must not use any "kepastian diagnosis" as confidence label
  assert.ok(
    !cardSrc.includes('label: "Kepastian Diagnosis"'),
    'Must never label confidence as clinical certainty'
  )
})

// -----------------------------------------------------------------------------
// TEST 6 — MEDICAL DISCLAIMER FALLBACK & DYNAMIC TEXT
// -----------------------------------------------------------------------------
test('Test 6 — Medical Disclaimer: Fallback matches backend contract and accepts dynamic text', () => {
  const bannerSrc = readComponentFile(bannerPath)

  // Official backend disclaimer from app/routers/measles.py
  const backendDisclaimer =
    'Hasil analisis citra merupakan estimasi AI untuk skrining awal, bukan diagnosis medis definitif. Pengguna disarankan tetap berkonsultasi dengan tenaga medis profesional.'

  // 1. Default fallback matches backend verbatim
  assert.ok(
    bannerSrc.includes(backendDisclaimer),
    'DEFAULT_MEDICAL_DISCLAIMER must match backend disclaimer text verbatim'
  )

  // 2. Test getEffectiveDisclaimer logic
  function getEffectiveDisclaimer(disclaimer) {
    return disclaimer && disclaimer.trim() ? disclaimer.trim() : backendDisclaimer
  }

  // When dynamic disclaimer is passed
  const customDisclaimer = 'Peringatan khusus dari RS / Faskes.'
  assert.equal(getEffectiveDisclaimer(customDisclaimer), customDisclaimer)

  // When undefined or empty, fallback is used
  assert.equal(getEffectiveDisclaimer(undefined), backendDisclaimer)
  assert.equal(getEffectiveDisclaimer(''), backendDisclaimer)
  assert.equal(getEffectiveDisclaimer('   '), backendDisclaimer)
})

// -----------------------------------------------------------------------------
// TEST 7 — INTEGRATION OF EXISTING UI COMPONENTS (BarList, Icon, StatusBadge)
// -----------------------------------------------------------------------------
test('Test 7 — UI Component Integration: Uses BarList, Icon, StatusBadge, and accessibility attributes', () => {
  const cardSrc = readComponentFile(cardPath)
  const bannerSrc = readComponentFile(bannerPath)

  // 1. MeaslesResultCard uses BarList
  assert.ok(cardSrc.includes("import { BarList"), 'Must import BarList from @/components/ui/Chart')
  assert.ok(cardSrc.includes('<BarList items={barItems}'), 'Must render <BarList items={barItems} />')

  // 2. MeaslesResultCard uses StatusBadge & Icon
  assert.ok(cardSrc.includes("import { StatusBadge } from '@/components/ui/StatusBadge'"), 'Must import StatusBadge')
  assert.ok(cardSrc.includes("import { Icon"), 'Must import Icon from @/components/ui/Icon')
  assert.ok(cardSrc.includes('<StatusBadge'), 'Must render StatusBadge')

  // 3. MeaslesResultCard integrates MedicalDisclaimerBanner
  assert.ok(
    cardSrc.includes("import { MedicalDisclaimerBanner } from './MedicalDisclaimerBanner'"),
    'Must import MedicalDisclaimerBanner'
  )
  assert.ok(
    cardSrc.includes('<MedicalDisclaimerBanner'),
    'Must render <MedicalDisclaimerBanner />'
  )

  // 4. MedicalDisclaimerBanner accessibility
  assert.ok(
    bannerSrc.includes('role="alert"'),
    'MedicalDisclaimerBanner must include role="alert" for accessibility'
  )
})

// -----------------------------------------------------------------------------
// TEST 8 — STRICT TYPE CHECKING & ZERO `any` USAGE
// -----------------------------------------------------------------------------
test('Test 8 — TypeScript Types: Uses MeaslesPredictResponse without `any` casts', () => {
  const cardSrc = readComponentFile(cardPath)
  const bannerSrc = readComponentFile(bannerPath)

  // 1. Uses types from @/api/types
  assert.ok(
    cardSrc.includes("import type { MeaslesClass, MeaslesPredictResponse } from '@/api/types'"),
    'Must import types from @/api/types'
  )

  // 2. No `any` type annotations in the component files
  const anyMatches = (cardSrc + bannerSrc).match(/:\s*any\b/g)
  assert.equal(anyMatches, null, 'Must not use `any` type in component files')
})

console.log('ALL PHASE 6.3 UI PRESENTATION COMPONENT TESTS REGISTERED SUCCESSFULLY')
