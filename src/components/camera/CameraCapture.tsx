import { useEffect, useRef } from 'react'

interface CameraCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  active: boolean
}

// Elemen video/canvas dipasang di sini; seluruh logika stream ada di hook
// useCameraCapture agar komponen tetap presentasional.
export function CameraCapture({ videoRef, canvasRef, active }: CameraCaptureProps) {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return
    const el = wrapRef.current
    if (!el) return
    // Scroll ke kamera saat aktif supaya tidak tertutup keyboard layar (skill human).
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [active])

  return (
    <div ref={wrapRef} className="overflow-hidden rounded-lg border border-border bg-black">
      <video
        ref={videoRef}
        playsInline
        muted
        className={cnCamera(active)}
        aria-label="Pratinjau kamera"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

function cnCamera(active: boolean) {
  return active ? 'block aspect-[4/3] w-full object-cover' : 'hidden'
}
