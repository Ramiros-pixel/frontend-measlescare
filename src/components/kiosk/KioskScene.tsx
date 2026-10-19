import { Component, Suspense, useEffect, useRef, useState } from 'react'
import type { Dispatch, ReactNode, RefObject, SetStateAction } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, useGLTF } from '@react-three/drei'
import type { Group } from 'three'

const MODEL_URL = '/models/screening-kiosk.glb'

useGLTF.preload(MODEL_URL)

interface SceneProps {
  sectionRef: RefObject<HTMLElement | null>
}

// Progres 0..1 sepanjang bagian "tentang alat" dilewati scroll,
// dipakai untuk memutar kios mengikuti halaman.
function useScrollProgress(sectionRef: RefObject<HTMLElement | null>) {
  const progressRef = useRef(0)

  useEffect(() => {
    let raf = 0

    const update = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const total = rect.height + vh * 0.5
      const passed = vh * 0.75 - rect.top
      progressRef.current = Math.min(1, Math.max(0, passed / total))
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [sectionRef])

  return progressRef
}

function KioskModel({ progressRef }: { progressRef: RefObject<number> }) {
  const { scene } = useGLTF(MODEL_URL)
  const group = useRef<Group>(null)

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const spin = progressRef.current * Math.PI * 2.5
    g.rotation.y = -0.55 + spin + Math.sin(t * 0.35) * 0.06
    g.position.y = -0.78 + Math.sin(t * 0.9) * 0.012
  })

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}

function ReadySignal({ onReady }: { onReady: Dispatch<SetStateAction<boolean>> }) {
  useEffect(() => {
    onReady(true)
  }, [onReady])
  return null
}

interface BoundaryState {
  failed: boolean
}

// Kalau WebGL gagal diinisialisasi, tampilkan gambar render alat sebagai gantinya.
class KioskErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false }

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export default function KioskScene({ sectionRef }: SceneProps) {
  const [supported] = useState(hasWebGL)
  const [ready, setReady] = useState(false)
  const progressRef = useScrollProgress(sectionRef)

  if (!supported) {
    return (
      <img
        src="/images/kiosk-render.png"
        alt="Render 3D alat kios skrining campak"
        className="absolute inset-0 h-full w-full object-contain p-6"
        loading="lazy"
      />
    )
  }

  return (
    <>
      {!ready && (
        <div
          role="status"
          aria-label="Memuat model 3D"
          className="spinner absolute left-1/2 top-1/2 size-7 -translate-x-1/2 -translate-y-1/2"
        />
      )}
      <KioskErrorBoundary>
        <Canvas
          camera={{ position: [0.55, 0.15, 3.5], fov: 30 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
          style={{ touchAction: 'pan-y' }}
          onCreated={({ camera }) => camera.lookAt(0, -0.05, 0)}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 4]} intensity={1.6} />
          <directionalLight position={[-4, 2, -3]} intensity={0.5} />
          <Suspense fallback={null}>
            <KioskModel progressRef={progressRef} />
            <ContactShadows
              position={[0, -0.79, 0]}
              opacity={0.3}
              scale={3.2}
              blur={2.6}
              far={1.2}
            />
            <Environment resolution={64} frames={1}>
              <Lightformer intensity={2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
              <Lightformer intensity={1.4} position={[-5, 1, -1]} scale={[6, 2, 1]} />
              <Lightformer intensity={1.2} position={[5, 1, 0]} scale={[6, 2, 1]} />
            </Environment>
            <ReadySignal onReady={setReady} />
          </Suspense>
        </Canvas>
      </KioskErrorBoundary>
      {ready && (
        <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-muted">
          Geser halaman untuk memutar tampilan alat
        </p>
      )}
    </>
  )
}
