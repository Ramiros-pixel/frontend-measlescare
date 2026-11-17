
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { kioskApi, kioskSessionApi } from '@/api/endpoints'

function Icon({
    name,
    size = 28,
}: {
    name: 'face' | 'card' | 'keyboard' | 'arrow' | 'check' | 'camera' | 'back' | 'user' | 'info'
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
    }
}
export default function IdentifikasiPage() {
    const navigate = useNavigate()
    const [screen, setScreen] = useState<'rfid' | 'email' | 'face' | 'confirm'>('rfid')
    const [patient, setPatient] = useState<{
        name: string; nik: string; birthDate: string; gender: string;
        source: 'rfid'; email?: string; bloodType?: string | null; address?: string | null;
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

    useEffect(() => {
        if (screen !== 'face') return
        let cancelled = false
        const start = async () => {
            try {
                if (!navigator.mediaDevices?.getUserMedia) throw new Error('Kamera memerlukan HTTPS atau localhost.')
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false,
                })
                if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    await videoRef.current.play()
                    setCameraReady(true)
                }
            } catch (e) {
                setMessage(e instanceof Error ? e.message : 'Kamera tidak dapat dibuka.')
                setMessageType('error')
            }
        }
        void start()
        return () => {
            cancelled = true
            streamRef.current?.getTracks().forEach(t => t.stop())
            streamRef.current = null
            setCameraReady(false)
        }
    }, [screen])

    const captureFrame = () => {
        const video = videoRef.current
        if (!video || !video.videoWidth || !video.videoHeight) throw new Error('Kamera belum siap.')
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Tidak dapat memproses frame kamera.')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const image = canvas.toDataURL('image/jpeg', 0.82).split(',')[1]
        if (!image) throw new Error('Gagal mengambil gambar.')
        return image
    }

    const identifyRFID = async (uid: string) => {
        setBusy(true); setMessage('Mencari data pasien dari UID RFID...'); setMessageType('info')
        try {
            const data = await kioskApi.identifyRFID(uid.trim())
            setPatient({
                name: data.Name, nik: data.NIK, birthDate: data.Tempat_Tgl_Lahir ?? '',
                gender: '', source: 'rfid', email: data.Email ?? '',
                bloodType: data.Golongan_darah, address: data.Alamat,
            })
            setEmail(data.Email ?? '')
            setStored(data.face_samples); setTarget(data.face_target)
            setScreen('email'); setMessage('')
        } catch (e) {
            setMessage(e instanceof Error ? e.message : 'Kartu RFID tidak dapat dikenali.')
            setMessageType('error')
        } finally { setBusy(false) }
    }

    const saveEmail = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!patient) return
        setBusy(true); setMessage('Menyimpan email pasien...'); setMessageType('info')
        try {
            await kioskApi.saveEmail(patient.nik, email.trim())
            setPatient({ ...patient, email: email.trim() })
            setScreen('face'); setMessage('Email tersimpan. Silakan hadapkan wajah ke kamera.')
            setMessageType('success')
        } catch (e) {
            setMessage(e instanceof Error ? e.message : 'Email gagal disimpan.')
            setMessageType('error')
        } finally { setBusy(false) }
    }

    const verifyOrEnrollFace = async () => {
        if (!patient) return
        setBusy(true); setMessage('Memeriksa kecocokan wajah dengan identitas RFID...'); setMessageType('info')
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
                    await new Promise(resolve => setTimeout(resolve, 450))
                    continue
                }
                setMessage(`Mengambil sampel wajah: ${current}/${target}`)
                await new Promise(resolve => setTimeout(resolve, 350))
            }
            setMessage('Sampel lengkap. Melatih model pengenalan wajah...')
            await kioskApi.train(patient.nik)
            setMessage('Wajah terdaftar. Membuat sesi skrining...')
            const session = await kioskSessionApi.create(patient.nik, captureFrame())
            setKioskSessionToken(session.access_token)
            setMessage('Pendaftaran wajah dan sesi skrining berhasil.')
            setMessageType('success')
            setScreen('confirm')
        } catch (e) {
            setMessage(e instanceof Error ? e.message : 'Proses Face Recognition gagal.')
            setMessageType('error')
        } finally { setBusy(false) }
    }

    const reset = () => {
        setScreen('rfid'); setPatient(null); setRfidUid(''); setEmail('')
        setStored(0); setMessage(''); setMessageType('info')
    }

    const continueScreening = () => {
        if (!patient || !kioskSessionToken) {
            setMessage('Sesi skrining belum tersedia. Silakan verifikasi wajah kembali.')
            setMessageType('error')
            return
        }
        navigate('/user/skrining/pemeriksaan', {
            state: {
                patient: { name: patient.name, nik: patient.nik, birthDate: patient.birthDate, gender: patient.gender, source: 'rfid' },
                kioskSessionToken,
            },
        })
    }

    return (
        <main className="relative h-dvh w-full overflow-y-auto bg-[#f7faff]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-36 -top-36 size-[340px] rounded-full bg-[#dce7ff]/55 blur-2xl" />
                <div className="absolute -top-48 left-[38%] h-[390px] w-[460px] rounded-[45%] bg-[#a4e9df]/45 blur-2xl" />
                <div className="absolute -right-36 top-[35%] size-[300px] rounded-full bg-[#b8eee8]/35 blur-2xl" />
            </div>
            <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1000px] flex-col px-5 py-6 sm:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <Link to="/user" className="text-sm font-semibold text-[#647990] hover:text-[#175CD3]">← Kembali ke Beranda</Link>
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#175CD3] shadow-sm">Identifikasi Pasien</span>
                </div>

                {screen === 'rfid' && (
                    <section className="m-auto w-full max-w-[620px] rounded-3xl border border-white bg-white/95 p-6 shadow-lg sm:p-9">
                        <div className="text-center">
                            <span className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#eaf1fd] text-[#175CD3]"><Icon name="card" size={34} /></span>
                            <h1 className="text-2xl font-extrabold text-[#183b5b]">Identifikasi dengan RFID</h1>
                            <p className="mt-2 text-sm text-[#647990]">Tempelkan kartu RFID untuk mengambil data pasien yang sudah terdaftar.</p>
                        </div>
                        <div className="my-6 rounded-2xl bg-[#edf4ff] p-6 text-center">
                            <Icon name="card" size={44} />
                            <p className="mt-3 font-bold text-[#183b5b]">Menunggu kartu RFID...</p>
                            <p className="mt-1 text-xs text-[#647990]">Mode simulasi sampai reader Orange Pi terhubung</p>
                        </div>
                        <label className="mb-2 block text-xs font-semibold text-[#183b5b]" htmlFor="rfid-uid">UID RFID (simulasi)</label>
                        <input id="rfid-uid" value={rfidUid} onChange={e => setRfidUid(e.target.value)} placeholder="Masukkan UID kartu uji" className="w-full rounded-xl border border-[#d8e0ea] px-4 py-3 text-sm outline-none focus:border-[#175CD3]" />
                        <button disabled={busy || !rfidUid.trim()} onClick={() => void identifyRFID(rfidUid)} className="mt-4 w-full rounded-xl bg-[#175CD3] px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? 'Memproses...' : 'Baca UID RFID'}</button>
                        <p className="mt-3 text-center text-[11px] text-[#8291a5]">UID harus sudah terhubung dengan NIK pasien pada tabel patient_cards.</p>
                    </section>
                )}

                {screen === 'email' && patient && (
                    <section className="m-auto w-full max-w-[620px] rounded-3xl border border-white bg-white/95 p-6 shadow-lg sm:p-9">
                        <h1 className="text-center text-2xl font-extrabold text-[#183b5b]">Data Pasien Ditemukan</h1>
                        <div className="my-5 rounded-2xl border border-[#e1e9f4] p-4">
                            <p className="text-lg font-bold text-[#183b5b]">{patient.name}</p>
                            <p className="text-sm text-[#647990]">NIK: {patient.nik}</p>
                            <p className="mt-1 text-sm text-[#647990]">Tempat/Tgl Lahir: {patient.birthDate || '-'}</p>
                            <p className="text-sm text-[#647990]">Golongan darah: {patient.bloodType || '-'}</p>
                        </div>
                        <form onSubmit={saveEmail}>
                            <label htmlFor="patient-email" className="mb-2 block text-sm font-bold text-[#183b5b]">Email untuk hasil skrining dan follow-up</label>
                            <input id="patient-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" className="w-full rounded-xl border border-[#d8e0ea] px-4 py-3 text-sm outline-none focus:border-[#175CD3]" />
                            <button disabled={busy} className="mt-4 w-full rounded-xl bg-[#175CD3] px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? 'Menyimpan...' : 'Simpan dan Lanjutkan'}</button>
                        </form>
                    </section>
                )}

                {screen === 'face' && patient && (
                    <section className="m-auto w-full max-w-[760px] rounded-3xl border border-white bg-white/95 p-6 shadow-lg sm:p-8">
                        <h1 className="text-center text-2xl font-extrabold text-[#183b5b]">Verifikasi Wajah</h1>
                        <p className="mt-2 text-center text-sm text-[#647990]">Wajah akan dicocokkan dengan NIK yang dibaca dari RFID.</p>
                        <div className="mx-auto my-5 aspect-video max-w-[560px] overflow-hidden rounded-2xl bg-[#eaf1fd]">
                            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                        </div>
                        {stored > 0 && stored < target && <p className="mb-3 text-center text-xs text-[#647990]">Sampel wajah: {stored}/{target}</p>}
                        {stored >= target && <p className="mb-3 text-center text-xs text-[#067647]">Sampel wajah sudah lengkap.</p>}
                        <button disabled={!cameraReady || busy} onClick={() => void verifyOrEnrollFace()} className="w-full rounded-xl bg-[#175CD3] px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? 'Memproses wajah...' : 'Verifikasi / Daftarkan Wajah'}</button>
                    </section>
                )}

                {screen === 'confirm' && patient && (
                    <section className="m-auto w-full max-w-[620px] rounded-3xl border border-white bg-white/95 p-6 shadow-lg sm:p-9">
                        <div className="text-center">
                            <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-[#e6f4ea] text-[#067647]"><Icon name="check" size={32} /></span>
                            <h1 className="text-2xl font-extrabold text-[#183b5b]">Identitas Terverifikasi</h1>
                            <p className="mt-2 text-sm text-[#647990]">Data RFID dan hasil Face Recognition sudah diperiksa.</p>
                        </div>
                        <div className="my-6 rounded-2xl border border-[#e1e9f4] p-5">
                            <p className="text-lg font-bold text-[#183b5b]">{patient.name}</p>
                            <p className="mt-1 text-sm text-[#647990]">NIK: {patient.nik}</p>
                            <p className="text-sm text-[#647990]">Email: {patient.email}</p>
                            <p className="text-sm text-[#647990]">Golongan darah: {patient.bloodType || '-'}</p>
                        </div>
                        <button onClick={continueScreening} className="w-full rounded-xl bg-[#175CD3] px-5 py-3 font-bold text-white">Lanjut ke Skrining</button>
                    </section>
                )}

                {message && (
                    <p role="status" className={`mx-auto mt-4 max-w-[760px] rounded-xl p-3 text-center text-xs ${messageType === 'error' ? 'bg-red-50 text-red-700' : messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-[#eaf1fd] text-[#365d94]'}`}>{message}</p>
                )}
                {screen !== 'rfid' && (
                    <button onClick={reset} className="mx-auto mt-5 text-sm font-semibold text-[#647990] hover:text-[#175CD3]">Batalkan dan mulai ulang identifikasi</button>
                )}
            </div>
        </main>
    )
}
