import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { kioskApi, kioskSessionApi } from '@/api/endpoints'

function Icon({
    name,
    size = 28,
}: {
    name: 'face' | 'card' | 'keyboard' | 'arrow' | 'check' | 'camera' | 'back' | 'user' | 'info' | 'scan'
    size?: number
}) {
    const props = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        'aria-hidden': true as const,
    }

    switch (name) {
        case 'face':
            return (
                <svg {...props}>
                    <path d="M3 9V5a2 2 0 0 1 2-2h4M15 3h4a2 2 0 0 1 2 2v4M21 15v4a2 2 0 0 1-2 2h-4M9 21H5a2 2 0 0 1-2-2v-4" />
                    <circle cx="12" cy="10" r="3" />
                    <path d="M7.5 18c.8-2.1 2.3-3 4.5-3s3.7.9 4.5 3" />
                </svg>
            )
        case 'card':
            return (
                <svg {...props}>
                    <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
                    <circle cx="9" cy="10" r="2" />
                    <path d="M5.8 16c.5-1.5 1.5-2.2 3.2-2.2s2.7.7 3.2 2.2M15 9h4M15 13h4" />
                </svg>
            )
        case 'keyboard':
            return (
                <svg {...props}>
                    <rect x="2.5" y="5" width="19" height="14" rx="2" />
                    <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h.01M18 13h.01M8 16h8" />
                </svg>
            )
        case 'arrow':
            return (
                <svg {...props}>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
            )
        case 'check':
            return (
                <svg {...props}>
                    <path d="m5 12 4 4L19 6" />
                </svg>
            )
        case 'camera':
            return (
                <svg {...props}>
                    <path d="M4 7h3l1.5-2h7L17 7h3a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 4 7Z" />
                    <circle cx="12" cy="13" r="3.5" />
                </svg>
            )
        case 'back':
            return (
                <svg {...props}>
                    <path d="m15 18-6-6 6-6M9 12h12" />
                </svg>
            )
        case 'user':
            return (
                <svg {...props}>
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 21c.5-4 2.8-6 7-6s6.5 2 7 6" />
                </svg>
            )
        case 'info':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v5M12 8h.01" />
                </svg>
            )
        case 'scan':
            return (
                <svg {...props}>
                    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                </svg>
            )
    }
}

type IdentificationMethod = 'rfid' | 'face'
type ScreenState = 'rfid' | 'face_direct' | 'email' | 'face_rfid' | 'confirm'

export default function IdentifikasiPage() {
    const navigate = useNavigate()
    const [method, setMethod] = useState<IdentificationMethod>('rfid')
    const [screen, setScreen] = useState<ScreenState>('rfid')
    const [patient, setPatient] = useState<{
        name: string
        nik: string
        birthDate: string
        gender: string
        source: 'rfid' | 'face'
        email?: string
        bloodType?: string | null
        address?: string | null
        confidence?: number | null
    } | null>(null)
    const [rfidUid, setRfidUid] = useState('')
    const [email, setEmail] = useState('')
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState<'info' | 'error' | 'success'>('info')
    const [cameraReady, setCameraReady] = useState(false)
    const [stored, setStored] = useState(0)
    const [target, setTarget] = useState(100)
    const [kioskSessionToken, setKioskSessionToken] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    // Camera lifecycle: Active during face verification (RFID path) or face direct identification
    const isCameraActive = screen === 'face_direct' || screen === 'face_rfid'

    useEffect(() => {
        if (!isCameraActive) return
        let cancelled = false
        const start = async () => {
            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error('Kamera memerlukan koneksi aman (HTTPS atau localhost).')
                }
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                    audio: false,
                })
                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop())
                    return
                }
                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    await videoRef.current.play()
                    setCameraReady(true)
                }
            } catch (e) {
                setMessage(e instanceof Error ? e.message : 'Kamera tidak dapat diakses atau diblokir.')
                setMessageType('error')
            }
        }
        void start()
        return () => {
            cancelled = true
            streamRef.current?.getTracks().forEach((t) => t.stop())
            streamRef.current = null
            setCameraReady(false)
        }
    }, [isCameraActive])

    const captureFrame = () => {
        const video = videoRef.current
        if (!video || !video.videoWidth || !video.videoHeight) {
            throw new Error('Kamera belum siap atau tidak aktif.')
        }
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Tidak dapat memproses frame kamera.')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const image = canvas.toDataURL('image/jpeg', 0.82).split(',')[1]
        if (!image) throw new Error('Gagal mengambil gambar dari kamera.')
        return image
    }

    // Switch between RFID and Face Recognition modes
    const handleSelectMethod = (newMethod: IdentificationMethod) => {
        if (busy) return
        setMethod(newMethod)
        setMessage('')
        setMessageType('info')
        if (newMethod === 'rfid') {
            setScreen('rfid')
        } else {
            setScreen('face_direct')
        }
    }

    // ==========================================
    // FLOW A: RFID IDENTIFICATION
    // ==========================================
    const identifyRFID = async (uid: string) => {
        setBusy(true)
        setMessage('Mencari data pasien dari UID RFID...')
        setMessageType('info')
        try {
            const data = await kioskApi.identifyRFID(uid.trim())
            setPatient({
                name: data.Name,
                nik: data.NIK,
                birthDate: data.Tempat_Tgl_Lahir ?? '',
                gender: '',
                source: 'rfid',
                email: data.Email ?? '',
                bloodType: data.Golongan_darah,
                address: data.Alamat,
                confidence: null,
            })
            setEmail(data.Email ?? '')
            setStored(data.face_samples)
            setTarget(data.face_target)
            setScreen('email')
            setMessage('')
        } catch (e) {
            setMessage(e instanceof Error ? e.message : 'Kartu RFID tidak dapat dikenali atau belum terdaftar.')
            setMessageType('error')
        } finally {
            setBusy(false)
        }
    }

    const saveEmail = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!patient) return
        setBusy(true)
        setMessage('Menyimpan email pasien...')
        setMessageType('info')
        try {
            await kioskApi.saveEmail(patient.nik, email.trim())
            setPatient({ ...patient, email: email.trim() })
            setScreen('face_rfid')
            setMessage('Email tersimpan. Silakan hadapkan wajah ke kamera untuk verifikasi.')
            setMessageType('success')
        } catch (e) {
            setMessage(e instanceof Error ? e.message : 'Email gagal disimpan.')
            setMessageType('error')
        } finally {
            setBusy(false)
        }
    }

    const verifyOrEnrollFaceForRFID = async () => {
        if (!patient) return
        setBusy(true)
        setMessage('Memeriksa kecocokan wajah dengan identitas RFID...')
        setMessageType('info')
        try {
            const first = await kioskApi.recognize(patient.nik, captureFrame())
            if (first.recognized && first.match && first.user_id === patient.nik) {
                setMessage('Wajah cocok. Membuat sesi skrining...')
                const session = await kioskSessionApi.create(patient.nik, captureFrame())
                setKioskSessionToken(session.access_token)
                setMessage('Wajah cocok dan sesi skrining berhasil dibuat.')
                setMessageType('success')
                setScreen('confirm')
                return
            }
            if (first.recognized && !first.match) {
                throw new Error('Wajah yang terdeteksi terdaftar atas identitas lain. Skrining dihentikan.')
            }

            setMessage('Wajah belum terdaftar. Memulai pendaftaran wajah untuk identitas RFID ini...')
            let current = stored
            while (current < target) {
                const result = await kioskApi.capture(patient.nik, captureFrame())
                current = result.stored
                setStored(current)
                if (!result.face_detected) {
                    await new Promise((resolve) => setTimeout(resolve, 450))
                    continue
                }
                setMessage(`Mengambil sampel wajah: ${current}/${target}`)
                await new Promise((resolve) => setTimeout(resolve, 350))
            }
            setMessage('Sampel lengkap. Melatih model pengenalan wajah...')
            await kioskApi.train(patient.nik)
            setMessage('Wajah terdaftar. Membuat sesi skrining...')
            const session = await kioskSessionApi.create(patient.nik, captureFrame())
            setKioskSessionToken(session.access_token)
            setMessage('Pendaftaran wajah dan sesi skrining berhasil dibuat.')
            setMessageType('success')
            setScreen('confirm')
        } catch (e) {
            setMessage(e instanceof Error ? e.message : 'Proses Face Recognition gagal.')
            setMessageType('error')
        } finally {
            setBusy(false)
        }
    }

    // ==========================================
    // FLOW B: FACE-ONLY IDENTIFICATION
    // ==========================================
    const identifyFaceOnly = async () => {
        setBusy(true)
        setMessage('Menganalisis wajah melalui server-side Face Recognition...')
        setMessageType('info')
        try {
            const frameB64 = captureFrame()
            // Direct face identification & session creation on backend
            const res = await kioskSessionApi.identifyFace(frameB64)
            setPatient({
                name: res.patient.Name,
                nik: res.patient.NIK,
                birthDate: res.patient.Tempat_Tgl_Lahir ?? '',
                gender: '',
                source: 'face',
                email: res.patient.Email ?? '',
                bloodType: res.patient.Golongan_darah,
                address: res.patient.Alamat,
                confidence: res.confidence,
            })
            setKioskSessionToken(res.access_token)
            setMessage(`Wajah dikenali: ${res.patient.Name}. Sesi skrining aktif.`)
            setMessageType('success')
            setScreen('confirm')
        } catch (e) {
            setMessage(
                e instanceof Error
                    ? e.message
                    : 'Wajah tidak dikenali atau belum terdaftar. Silakan coba lagi atau gunakan metode Kartu RFID.',
            )
            setMessageType('error')
        } finally {
            setBusy(false)
        }
    }

    const reset = () => {
        setScreen(method === 'rfid' ? 'rfid' : 'face_direct')
        setPatient(null)
        setRfidUid('')
        setEmail('')
        setStored(0)
        setMessage('')
        setMessageType('info')
        setKioskSessionToken(null)
    }

    const continueScreening = () => {
        if (!patient || !kioskSessionToken) {
            setMessage('Sesi skrining belum tersedia. Silakan ulangi identifikasi.')
            setMessageType('error')
            return
        }
        navigate('/user/skrining/pemeriksaan', {
            state: {
                patient: {
                    name: patient.name,
                    nik: patient.nik,
                    birthDate: patient.birthDate,
                    gender: patient.gender,
                    source: patient.source,
                },
                kioskSessionToken,
            },
        })
    }

    return (
        <main className="relative min-h-dvh w-full overflow-y-auto bg-[#f7faff]">
            {/* Background blur blobs */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-36 -top-36 size-[340px] rounded-full bg-[#dce7ff]/55 blur-2xl" />
                <div className="absolute -top-48 left-[38%] h-[390px] w-[460px] rounded-[45%] bg-[#a4e9df]/45 blur-2xl" />
                <div className="absolute -right-36 top-[35%] size-[300px] rounded-full bg-[#b8eee8]/35 blur-2xl" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1000px] flex-col px-5 py-6 sm:px-8">
                {/* Header Navigation */}
                <div className="mb-6 flex items-center justify-between">
                    <Link to="/user" className="text-sm font-semibold text-[#647990] hover:text-[#175CD3]">
                        ← Kembali ke Beranda
                    </Link>
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#175CD3] shadow-sm">
                        Identifikasi Pasien Kiosk
                    </span>
                </div>

                {/* Method Selector Tabs (Visible before patient confirmation) */}
                {screen !== 'confirm' && screen !== 'email' && (
                    <section aria-label="Pilih Metode Identifikasi" className="mx-auto mb-6 w-full max-w-[620px]">
                        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white/90 p-2 shadow-sm border border-[#e1e9f4]">
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleSelectMethod('rfid')}
                                className={`flex items-center justify-center gap-2.5 rounded-xl py-3 px-4 text-sm font-bold transition-all ${
                                    method === 'rfid'
                                        ? 'bg-[#175CD3] text-white shadow-md'
                                        : 'text-[#647990] hover:bg-[#edf4ff] hover:text-[#175CD3]'
                                }`}
                            >
                                <Icon name="card" size={20} />
                                <span>Kartu RFID</span>
                            </button>
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleSelectMethod('face')}
                                className={`flex items-center justify-center gap-2.5 rounded-xl py-3 px-4 text-sm font-bold transition-all ${
                                    method === 'face'
                                        ? 'bg-[#175CD3] text-white shadow-md'
                                        : 'text-[#647990] hover:bg-[#edf4ff] hover:text-[#175CD3]'
                                }`}
                            >
                                <Icon name="face" size={20} />
                                <span>Pengenalan Wajah</span>
                            </button>
                        </div>
                    </section>
                )}

                {/* METHOD A: RFID INPUT */}
                {screen === 'rfid' && (
                    <section className="m-auto w-full max-w-[620px] rounded-3xl border border-white bg-white/95 p-6 shadow-lg sm:p-9">
                        <div className="text-center">
                            <span className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#eaf1fd] text-[#175CD3]">
                                <Icon name="card" size={34} />
                            </span>
                            <h1 className="text-2xl font-extrabold text-[#183b5b]">Identifikasi dengan Kartu RFID</h1>
                            <p className="mt-2 text-sm text-[#647990]">
                                Tempelkan kartu RFID terdaftar pada reader atau masukkan UID uji di bawah ini.
                            </p>
                        </div>

                        <div className="my-6 rounded-2xl bg-[#edf4ff] p-6 text-center border border-[#d8e7ff]">
                            <Icon name="card" size={44} />
                            <p className="mt-3 font-bold text-[#183b5b]">Menunggu kartu RFID...</p>
                            <p className="mt-1 text-xs text-[#647990]">
                                Mode simulasi aktif sampai pembaca fisik Orange Pi terhubung
                            </p>
                        </div>

                        <label className="mb-2 block text-xs font-semibold text-[#183b5b]" htmlFor="rfid-uid">
                            UID Kartu RFID (Input Pengujian)
                        </label>
                        <input
                            id="rfid-uid"
                            value={rfidUid}
                            onChange={(e) => setRfidUid(e.target.value)}
                            placeholder="Contoh: SYNTH_RFID_ANDI_VALID atau tempelkan kartu"
                            className="w-full rounded-xl border border-[#d8e0ea] px-4 py-3 text-sm outline-none focus:border-[#175CD3] focus:ring-2 focus:ring-[#175CD3]/15"
                        />
                        <button
                            type="button"
                            disabled={busy || !rfidUid.trim()}
                            onClick={() => void identifyRFID(rfidUid)}
                            className="mt-4 w-full rounded-xl bg-[#175CD3] px-5 py-3 font-bold text-white transition hover:bg-[#154fb7] disabled:opacity-50"
                        >
                            {busy ? 'Memverifikasi RFID...' : 'Baca & Verifikasi Kartu RFID'}
                        </button>
                        <p className="mt-3 text-center text-[11px] text-[#8291a5]">
                            Kartu harus sudah terhubung dengan data NIK pasien pada sistem.
                        </p>
                    </section>
                )}

                {/* METHOD B: FACE RECOGNITION DIRECT */}
                {screen === 'face_direct' && (
                    <section className="m-auto w-full max-w-[700px] rounded-3xl border border-white bg-white/95 p-6 shadow-lg sm:p-8">
                        <div className="text-center">
                            <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-[#eaf1fd] text-[#175CD3]">
                                <Icon name="face" size={32} />
                            </span>
                            <h1 className="text-2xl font-extrabold text-[#183b5b]">Identifikasi Pengenalan Wajah</h1>
                            <p className="mt-1 text-sm text-[#647990]">
                                Hadapkan wajah Anda tepat di tengah area kamera untuk identifikasi langsung.
                            </p>
                        </div>

                        <div className="relative mx-auto my-5 aspect-video max-w-[540px] overflow-hidden rounded-2xl bg-[#183b5b]/5 border-2 border-[#d8e7ff] shadow-inner">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className="h-full w-full object-cover"
                            />
                            {/* Face guide overlay */}
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="h-44 w-36 rounded-full border-2 border-dashed border-[#175CD3]/60 shadow-[0_0_0_9999px_rgba(24,59,91,0.25)]" />
                            </div>
                            {!cameraReady && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 text-white text-xs font-semibold backdrop-blur-sm">
                                    Menghubungkan kamera kiosk...
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            disabled={!cameraReady || busy}
                            onClick={() => void identifyFaceOnly()}
                            className="w-full rounded-xl bg-[#175CD3] px-5 py-3.5 font-bold text-white shadow-md transition hover:bg-[#154fb7] disabled:opacity-50"
                        >
                            {busy ? 'Mengenali wajah di server...' : 'Pindai & Identifikasi Wajah'}
                        </button>

                        <div className="mt-4 flex items-center justify-between text-xs text-[#8291a5]">
                            <span>✓ Verifikasi biometrik OpenCV LBPH server-side</span>
                            <span>✓ Enkripsi sesi kiosk 20 menit</span>
                        </div>
                    </section>
                )}

                {/* RFID SUB-FLOW: EMAIL VERIFICATION */}
                {screen === 'email' && patient && (
                    <section className="m-auto w-full max-w-[620px] rounded-3xl border border-white bg-white/95 p-6 shadow-lg sm:p-9">
                        <h1 className="text-center text-2xl font-extrabold text-[#183b5b]">Data Pasien Ditemukan</h1>
                        <p className="mt-1 text-center text-sm text-[#647990]">Identitas kartu RFID terverifikasi.</p>

                        <div className="my-5 rounded-2xl border border-[#e1e9f4] bg-[#f8fbff] p-4">
                            <p className="text-lg font-bold text-[#183b5b]">{patient.name}</p>
                            <p className="text-sm text-[#647990]">NIK: {patient.nik}</p>
                            <p className="mt-1 text-sm text-[#647990]">Tempat/Tgl Lahir: {patient.birthDate || '-'}</p>
                            <p className="text-sm text-[#647990]">Golongan darah: {patient.bloodType || '-'}</p>
                        </div>

                        <form onSubmit={saveEmail}>
                            <label htmlFor="patient-email" className="mb-2 block text-sm font-bold text-[#183b5b]">
                                Email konfirmasi hasil skrining
                            </label>
                            <input
                                id="patient-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                className="w-full rounded-xl border border-[#d8e0ea] px-4 py-3 text-sm outline-none focus:border-[#175CD3]"
                            />
                            <button
                                type="submit"
                                disabled={busy}
                                className="mt-4 w-full rounded-xl bg-[#175CD3] px-5 py-3 font-bold text-white transition hover:bg-[#154fb7] disabled:opacity-50"
                            >
                                {busy ? 'Menyimpan...' : 'Simpan Email dan Lanjutkan'}
                            </button>
                        </form>
                    </section>
                )}

                {/* RFID SUB-FLOW: FACE ENROLLMENT / VERIFICATION */}
                {screen === 'face_rfid' && patient && (
                    <section className="m-auto w-full max-w-[760px] rounded-3xl border border-white bg-white/95 p-6 shadow-lg sm:p-8">
                        <h1 className="text-center text-2xl font-extrabold text-[#183b5b]">Verifikasi Wajah Pasien</h1>
                        <p className="mt-2 text-center text-sm text-[#647990]">
                            Wajah akan dicocokkan dengan NIK ({patient.nik}) yang dibaca dari RFID.
                        </p>
                        <div className="relative mx-auto my-5 aspect-video max-w-[560px] overflow-hidden rounded-2xl bg-[#eaf1fd]">
                            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                        </div>
                        {stored > 0 && stored < target && (
                            <p className="mb-3 text-center text-xs text-[#647990]">Sampel wajah: {stored}/{target}</p>
                        )}
                        {stored >= target && (
                            <p className="mb-3 text-center text-xs text-[#067647]">Sampel wajah sudah lengkap.</p>
                        )}
                        <button
                            type="button"
                            disabled={!cameraReady || busy}
                            onClick={() => void verifyOrEnrollFaceForRFID()}
                            className="w-full rounded-xl bg-[#175CD3] px-5 py-3 font-bold text-white transition hover:bg-[#154fb7] disabled:opacity-50"
                        >
                            {busy ? 'Memproses wajah...' : 'Verifikasi / Daftarkan Wajah'}
                        </button>
                    </section>
                )}

                {/* COMMON CONFIRMATION: SESSION ESTABLISHED */}
                {screen === 'confirm' && patient && (
                    <section className="m-auto w-full max-w-[620px] rounded-3xl border border-white bg-white/95 p-6 shadow-lg sm:p-9">
                        <div className="text-center">
                            <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-[#e6f4ea] text-[#067647]">
                                <Icon name="check" size={32} />
                            </span>
                            <h1 className="text-2xl font-extrabold text-[#183b5b]">Identitas Pasien Terverifikasi</h1>
                            <p className="mt-1 text-sm text-[#647990]">
                                Sesi pemeriksaan kiosk aktif dan terikat secara aman.
                            </p>
                        </div>

                        <div className="my-6 rounded-2xl border border-[#e1e9f4] bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between border-b border-[#edf2f8] pb-3 mb-3">
                                <span className="text-xs font-semibold text-[#647990]">Metode Identifikasi:</span>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-bold text-[#175CD3]">
                                    {patient.source === 'face' ? (
                                        <>
                                            <Icon name="face" size={14} /> Pengenalan Wajah
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="card" size={14} /> Kartu RFID
                                        </>
                                    )}
                                </span>
                            </div>

                            <p className="text-xl font-bold text-[#183b5b]">{patient.name}</p>
                            <p className="mt-1 text-sm text-[#647990]">NIK: {patient.nik}</p>
                            {patient.email && <p className="text-sm text-[#647990]">Email: {patient.email}</p>}
                            {patient.birthDate && (
                                <p className="text-sm text-[#647990]">Tempat/Tgl Lahir: {patient.birthDate}</p>
                            )}
                            {patient.bloodType && (
                                <p className="text-sm text-[#647990]">Golongan darah: {patient.bloodType}</p>
                            )}
                            {patient.confidence !== null && patient.confidence !== undefined && (
                                <p className="mt-2 text-xs text-[#067647] font-semibold">
                                    Skor Jarak Biometrik LBPH: {patient.confidence} (Threshold: &le; 70)
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={continueScreening}
                            className="w-full rounded-xl bg-[#175CD3] px-5 py-3.5 font-bold text-white shadow-md transition hover:bg-[#154fb7]"
                        >
                            Lanjut ke Skrining Gejala & Citra Ruam
                        </button>
                    </section>
                )}

                {/* Status / Error Toast Message */}
                {message && (
                    <p
                        role="status"
                        className={`mx-auto mt-4 max-w-[760px] rounded-xl p-3 text-center text-xs font-semibold ${
                            messageType === 'error'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : messageType === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-[#eaf1fd] text-[#365d94] border border-[#d3e3fa]'
                        }`}
                    >
                        {message}
                    </p>
                )}

                {/* Back / Reset Option */}
                {screen !== 'rfid' && screen !== 'face_direct' && (
                    <button
                        type="button"
                        onClick={reset}
                        className="mx-auto mt-5 text-sm font-semibold text-[#647990] hover:text-[#175CD3] transition"
                    >
                        ← Batalkan dan ganti metode identifikasi
                    </button>
                )}
            </div>
        </main>
    )
}
