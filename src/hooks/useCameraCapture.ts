import { useCallback, useEffect, useRef, useState } from 'react'

export type CameraPhase = 'idle' | 'starting' | 'live' | 'denied' | 'unavailable' | 'error'

interface UseCameraCaptureResult {
  phase: CameraPhase
  facing: 'environment' | 'user'
  start: (facing?: 'environment' | 'user') => Promise<void>
  stop: () => void
  snap: () => string | null
  switchFacing: () => void
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

// Stream kamera hanya hidup saat dibutuhkan dan selalu dihentikan pada unmount
// agar lampu kamera tidak menyala diam-diam.
export function useCameraCapture(): UseCameraCaptureResult {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [phase, setPhase] = useState<CameraPhase>('idle')
  const [facing, setFacing] = useState<'environment' | 'user'>('environment')

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    // Fase kembali ke idle agar tombol "Aktifkan kamera" muncul lagi;
    // tanpa ini tombol kamera tetap tampil padahal stream sudah mati.
    setPhase('idle')
  }, [])

  const start = useCallback(
    async (want: 'environment' | 'user' = 'environment') => {
      if (!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) {
        setPhase('unavailable')
        return
      }
      setPhase('starting')
      stop()
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: want } },
          audio: false,
        })
        streamRef.current = stream
        setFacing(want)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => undefined)
        }
        setPhase('live')
      } catch (err) {
        if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError') setPhase('denied')
          else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') setPhase('unavailable')
          else setPhase('error')
        } else {
          setPhase('error')
        }
      }
    },
    [stop],
  )

  const snap = useCallback((): string | null => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) return null
    const w = video.videoWidth
    const h = video.videoHeight
    if (!w || !h) return null
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', 0.85)
  }, [])

  useEffect(() => stop, [stop])

  const switchFacing = useCallback(() => {
    void start(facing === 'environment' ? 'user' : 'environment')
  }, [facing, start])

  return { phase, facing, start, stop, snap, switchFacing, videoRef, canvasRef }
}
