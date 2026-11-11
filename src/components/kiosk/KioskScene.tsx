
import { Component, Suspense, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  useGLTF,
} from '@react-three/drei'

const MODEL_URL = '/models/screening-kiosk.glb'

useGLTF.preload(MODEL_URL)

function KioskModel() {
  const { scene } = useGLTF(MODEL_URL)

  return (
    <group
      position={[0, -1.21, 0]}
      scale={1.55}
    >
      <primitive object={scene} />
    </group>
  )
}

function LoadingIndicator() {
  return (
    <div
      role="status"
      aria-label="Memuat model 3D"
      className="absolute left-1/2 top-1/2 z-10 size-8 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-[3px] border-[#dce8f5] border-t-[#319fba]"
    />
  )
}

interface ErrorBoundaryState {
  hasError: boolean
}

class KioskErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center p-6 text-center">
          <p className="max-w-xs text-sm text-[#647990]">
            Model 3D belum dapat ditampilkan. Silakan periksa dukungan
            WebGL pada browser.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

function ReadySignal({
  onReady,
}: {
  onReady: () => void
}) {
  useEffect(() => {
    onReady()
  }, [onReady])

  return null
}

export default function KioskScene() {
  const [ready, setReady] = useState(false)

  return (
    <div className="relative h-full w-full">
      {!ready && <LoadingIndicator />}

      <KioskErrorBoundary>
        <Canvas
          camera={{
            position: [0.4, 0.1, 3.3],
            fov: 42,
            near: 0.1,
            far: 100,
          }}
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            alpha: true,
          }}
          style={{
            width: '100%',
            height: '100%',
            touchAction: 'none',
          }}
          onCreated={({ camera }) => {
            camera.lookAt(0, 0, 0)
          }}
        >
          {/* Pencahayaan */}
          <ambientLight intensity={0.8} />

          <directionalLight
            position={[3, 5, 4]}
            intensity={1.7}
          />

          <directionalLight
            position={[-4, 2, -3]}
            intensity={0.6}
          />

          <Suspense fallback={null}>
            {/* Model kios diperbesar */}
            <KioskModel />

            {/* Bayangan alas */}
            <ContactShadows
              position={[0, -1.2, 0]}
              opacity={0.28}
              scale={3}
              blur={2.5}
              far={1.5}
            />

            {/* Environment lighting */}
            <Environment resolution={64} frames={1}>
              <Lightformer
                intensity={2}
                position={[0, 5, 0]}
                rotation-x={Math.PI / 2}
                scale={[10, 10, 1]}
              />

              <Lightformer
                intensity={1.4}
                position={[-5, 1, -1]}
                scale={[6, 2, 1]}
              />

              <Lightformer
                intensity={1.2}
                position={[5, 1, 0]}
                scale={[6, 2, 1]}
              />
            </Environment>

            {/* Rotasi 3D bebas */}
            <OrbitControls
              makeDefault
              enableRotate
              enablePan={false}
              enableZoom={false}
              enableDamping
              dampingFactor={0.08}
              rotateSpeed={0.8}
              minPolarAngle={0.15}
              maxPolarAngle={Math.PI - 0.15}
              minAzimuthAngle={-Infinity}
              maxAzimuthAngle={Infinity}
              target={[0, 0, 0]}
            />

            <ReadySignal onReady={() => setReady(true)} />
          </Suspense>
        </Canvas>
      </KioskErrorBoundary>

      {/* Petunjuk interaksi */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
        <span className="rounded-full border border-white/80 bg-white/75 px-4 py-2 text-center text-xs font-medium text-[#647990] shadow-sm backdrop-blur-sm">
          Geser ke segala arah untuk melihat model 3D
        </span>
      </div>
    </div>
  )
}
