
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type Screen = 'choose' | 'rfid' | 'face' | 'manual' | 'confirm' | 'screening'
type Method = 'face' | 'rfid' | 'manual'

interface Patient {
    name: string
    nik: string
    birthDate: string
    gender: string
    source: Method
}

const DEMO_PATIENT: Patient = {
    name: 'Aisyah Putri',
    nik: '3174********0001',
    birthDate: '2000-03-12',
    gender: 'Perempuan',
    source: 'rfid',
}

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

function MethodCard({
    icon,
    title,
    description,
    onClick,
}: {
    icon: 'face' | 'card' | 'keyboard'
    title: string
    description: string
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex h-full min-h-0 flex-col items-start rounded-2xl border border-[#e1e9f4] bg-white/95 p-4 text-left shadow-[0_5px_18px_rgba(31,91,190,0.06)] transition hover:-translate-y-1 hover:border-[#175CD3] hover:shadow-lg sm:p-5"
        >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#eaf1fd] text-[#175CD3] transition group-hover:bg-[#175CD3] group-hover:text-white">
                <Icon name={icon} size={30} />
            </span>

            <span className="mt-4 flex w-full items-center justify-between gap-2">
                <span className="text-base font-bold text-[#183b5b] sm:text-lg">{title}</span>
                <span className="shrink-0 text-[#175CD3]">
                    <Icon name="arrow" size={19} />
                </span>
            </span>

            <span className="mt-2 text-xs leading-relaxed text-[#647990] sm:text-sm">
                {description}
            </span>
        </button>
    )
}

function PrimaryButton({
    children,
    onClick,
    disabled = false,
}: {
    children: React.ReactNode
    onClick: () => void
    disabled?: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#175CD3] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#124FB8] disabled:cursor-not-allowed disabled:opacity-50"
        >
            {children}
        </button>
    )
}

export default function IdentifikasiPage() {
    const [screen, setScreen] = useState<Screen>('choose')
    const [patient, setPatient] = useState<Patient | null>(null)
    const navigate = useNavigate()
    const [manualData, setManualData] = useState({
        nik: '',
        name: '',
        birthDate: '',
        gender: '',
    })

    const goBack = () => {
        if (screen === 'screening') {
            setScreen('confirm')
            return
        }

        setScreen('choose')
        setPatient(null)
    }

    const startMethod = (method: Method) => {
        if (method === 'rfid') setScreen('rfid')
        if (method === 'face') setScreen('face')
        if (method === 'manual') setScreen('manual')
    }

    // Simulasi pembacaan RFID.
    // Nantinya diganti dengan respons dari RFID reader dan backend.
    const simulateRfid = () => {
        setPatient(DEMO_PATIENT)
        setScreen('confirm')
    }

    // Simulasi pencocokan wajah.
    // Nantinya diganti dengan hasil face recognition.
    const simulateFace = () => {
        setPatient({
            ...DEMO_PATIENT,
            source: 'face',
        })
        setScreen('confirm')
    }

    const submitManual = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (
            manualData.nik.length !== 16 ||
            !manualData.name.trim() ||
            !manualData.birthDate ||
            !manualData.gender
        ) {
            return
        }

        setPatient({
            name: manualData.name,
            nik: `${manualData.nik.slice(0, 4)}********${manualData.nik.slice(-4)}`,
            birthDate: manualData.birthDate,
            gender: manualData.gender,
            source: 'manual',
        })

        setScreen('confirm')
    }

    const dateLabel = (date: string) => {
        if (!date) return '-'

        return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
    }

    const sourceLabel = {
        rfid: 'Kartu RFID',
        face: 'Face Recognition',
        manual: 'Input Manual',
    }

    return (
        <main className="relative h-dvh w-full overflow-hidden bg-[#f7faff]">
            {/* Background dekoratif */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-36 -top-36 size-[340px] rounded-full bg-[#dce7ff]/55 blur-2xl" />
                <div className="absolute -top-48 left-[38%] h-[390px] w-[460px] rounded-[45%] bg-[#a4e9df]/45 blur-2xl" />
                <div className="absolute -right-36 top-[35%] size-[300px] rounded-full bg-[#b8eee8]/35 blur-2xl" />
                <div className="absolute -bottom-48 -left-20 h-[300px] w-[400px] rounded-full bg-[#9db6f5]/30 blur-2xl" />
            </div>

            <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col px-5 py-5 sm:px-8 sm:py-6 lg:px-14">
                {/* Header kecil tanpa navbar */}
                <div className="flex shrink-0 items-center justify-between gap-3">
                    {screen === 'choose' ? (
                        <Link
                            to="/user"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#647990] transition hover:text-[#175CD3]"
                        >
                            <Icon name="back" size={18} />
                            Kembali ke Beranda
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={goBack}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#647990] transition hover:text-[#175CD3]"
                        >
                            <Icon name="back" size={18} />
                            {screen === 'screening' ? 'Kembali' : 'Ganti Metode'}
                        </button>
                    )}

                    {screen !== 'choose' && (
                        <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-[#175CD3] shadow-sm">
                            {screen === 'screening' ? 'Tahap 2 · Pemeriksaan' : 'Tahap 1 · Identifikasi'}
                        </span>
                    )}
                </div>

                {/* PILIH METODE */}
                {screen === 'choose' && (
                    <section className="mx-auto flex min-h-0 w-full max-w-[1160px] flex-1 flex-col justify-center py-4">
                        <div className="mb-7 shrink-0 text-center sm:mb-9">
                            <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-[#eaf1fd] text-[#175CD3] sm:size-16">
                                <Icon name="user" size={32} />
                            </span>

                            <h1 className="text-2xl font-extrabold tracking-tight text-[#183b5b] sm:text-3xl lg:text-[34px]">
                                Pilih Metode Identifikasi
                            </h1>

                            <p className="mx-auto mt-2 whitespace-normal text-sm text-[#647990] sm:whitespace-nowrap sm:text-base">
                                Pilih cara untuk mengenali data Anda sebelum memulai skrining campak.
                            </p>
                        </div>

                        <div className="grid min-h-0 grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
                            <MethodCard
                                icon="face"
                                title="Identifikasi Wajah"
                                description="Untuk pasien yang sudah mendaftarkan data wajah sebelumnya."
                                onClick={() => startMethod('face')}
                            />

                            <MethodCard
                                icon="card"
                                title="Gunakan Kartu RFID"
                                description="Tempelkan kartu identitas yang sudah terdaftar pada reader."
                                onClick={() => startMethod('rfid')}
                            />

                            <MethodCard
                                icon="keyboard"
                                title="Input Data Manual"
                                description="Gunakan pilihan ini jika tidak membawa kartu identitas."
                                onClick={() => startMethod('manual')}
                            />
                        </div>

                        <div className="mx-auto mt-5 flex max-w-[850px] shrink-0 items-start gap-2 rounded-xl border border-[#dbe7f5] bg-white/75 p-3 text-xs leading-relaxed text-[#647990] sm:text-sm">
                            <span className="mt-0.5 shrink-0 text-[#175CD3]">
                                <Icon name="info" size={17} />
                            </span>
                            Data identitas akan digunakan untuk menghubungkan proses skrining dengan pasien yang sesuai.
                        </div>
                    </section>
                )}

                {/* RFID */}
                {screen === 'rfid' && (
                    <section className="mx-auto my-auto w-full max-w-[650px] rounded-3xl border border-white bg-white/90 p-5 shadow-lg sm:p-8">
                        <div className="text-center">
                            <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-[#eaf1fd] text-[#175CD3]">
                                <Icon name="card" size={32} />
                            </span>
                            <h1 className="text-xl font-extrabold text-[#183b5b] sm:text-2xl">
                                Tempelkan Kartu Identitas
                            </h1>
                            <p className="mt-2 text-sm text-[#647990]">
                                Tempelkan kartu RFID pada area card reader.
                            </p>
                        </div>

                        <div className="mx-auto my-5 flex min-h-[150px] max-w-sm flex-col items-center justify-center rounded-2xl bg-[#edf4ff] p-5">
                            <div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-[#175CD3]/50 bg-white text-[#175CD3]">
                                <Icon name="card" size={36} />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-[#183b5b]">
                                Menunggu kartu RFID...
                            </p>
                            <p className="mt-1 text-xs text-[#647990]">
                                Dekatkan kartu ke reader
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <PrimaryButton onClick={simulateRfid}>
                                Simulasikan Kartu Terbaca
                            </PrimaryButton>
                        </div>
                        <p className="mt-3 text-center text-[11px] text-[#8291a5]">
                            Tombol ini hanya untuk pengujian tampilan frontend.
                        </p>
                    </section>
                )}

                {/* FACE RECOGNITION */}
                {screen === 'face' && (
                    <section className="mx-auto my-auto w-full max-w-[760px] rounded-3xl border border-white bg-white/90 p-5 shadow-lg sm:p-8">
                        <div className="text-center">
                            <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-[#eaf1fd] text-[#175CD3]">
                                <Icon name="face" size={32} />
                            </span>
                            <h1 className="text-xl font-extrabold text-[#183b5b] sm:text-2xl">
                                Pindai Wajah Anda
                            </h1>
                            <p className="mt-2 text-sm text-[#647990]">
                                Posisikan wajah di depan kamera untuk mengenali identitas Anda.
                            </p>
                        </div>

                        <div className="mx-auto my-5 grid max-w-xl gap-4 sm:grid-cols-[1fr_0.85fr] sm:items-center">
                            <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border-2 border-dashed border-[#9bb9e7] bg-[#edf4ff]">
                                <div className="text-center text-[#175CD3]">
                                    <Icon name="camera" size={42} />
                                    <p className="mt-2 text-sm font-semibold">Area pemindaian wajah</p>
                                    <p className="mt-1 text-xs text-[#647990]">Kamera belum terhubung</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm font-bold text-[#183b5b]">Pastikan:</p>
                                {[
                                    'Wajah terlihat jelas',
                                    'Pencahayaan cukup',
                                    'Posisi wajah menghadap kamera',
                                ].map((item) => (
                                    <div key={item} className="flex items-start gap-2 text-sm text-[#647990]">
                                        <span className="mt-0.5 text-[#067647]">
                                            <Icon name="check" size={17} />
                                        </span>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <PrimaryButton onClick={simulateFace}>
                                Simulasikan Pencocokan Wajah
                            </PrimaryButton>
                        </div>
                        <p className="mt-3 text-center text-[11px] text-[#8291a5]">
                            Simulasi frontend. Kamera dan pengenalan wajah belum terhubung.
                        </p>
                    </section>
                )}

                {/* INPUT MANUAL */}
                {screen === 'manual' && (
                    <section className="mx-auto my-auto w-full max-w-[680px] rounded-3xl border border-white bg-white/90 p-5 shadow-lg sm:p-7">
                        <div className="mb-5 text-center">
                            <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-[#eaf1fd] text-[#175CD3]">
                                <Icon name="keyboard" size={28} />
                            </span>
                            <h1 className="text-xl font-extrabold text-[#183b5b] sm:text-2xl">
                                Input Data Pasien
                            </h1>
                            <p className="mt-1 text-sm text-[#647990]">
                                Lengkapi data berikut untuk identifikasi pasien.
                            </p>
                        </div>

                        <form onSubmit={submitManual} className="space-y-3">
                            <div>
                                <label htmlFor="nik" className="mb-1 block text-xs font-semibold text-[#183b5b]">
                                    Nomor Identitas
                                </label>
                                <input
                                    id="nik"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={16}
                                    minLength={16}
                                    value={manualData.nik}
                                    onChange={(event) =>
                                        setManualData({
                                            ...manualData,
                                            nik: event.target.value.replace(/\D/g, ''),
                                        })
                                    }
                                    placeholder="Masukkan 16 digit nomor identitas"
                                    className="w-full rounded-xl border border-[#d8e0ea] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#175CD3]"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="name" className="mb-1 block text-xs font-semibold text-[#183b5b]">
                                    Nama Lengkap
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={manualData.name}
                                    onChange={(event) =>
                                        setManualData({ ...manualData, name: event.target.value })
                                    }
                                    placeholder="Masukkan nama lengkap"
                                    className="w-full rounded-xl border border-[#d8e0ea] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#175CD3]"
                                    required
                                />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="birthDate" className="mb-1 block text-xs font-semibold text-[#183b5b]">
                                        Tanggal Lahir
                                    </label>
                                    <input
                                        id="birthDate"
                                        type="date"
                                        value={manualData.birthDate}
                                        onChange={(event) =>
                                            setManualData({ ...manualData, birthDate: event.target.value })
                                        }
                                        className="w-full rounded-xl border border-[#d8e0ea] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#175CD3]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="gender" className="mb-1 block text-xs font-semibold text-[#183b5b]">
                                        Jenis Kelamin
                                    </label>
                                    <select
                                        id="gender"
                                        value={manualData.gender}
                                        onChange={(event) =>
                                            setManualData({ ...manualData, gender: event.target.value })
                                        }
                                        className="w-full rounded-xl border border-[#d8e0ea] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#175CD3]"
                                        required
                                    >
                                        <option value="">Pilih jenis kelamin</option>
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>
                            </div>

                            <p className="rounded-lg bg-[#fff8e8] p-3 text-xs leading-relaxed text-[#8a5b12]">
                                Data yang dimasukkan secara manual tetap memerlukan proses verifikasi.
                            </p>

                            <div className="flex justify-end pt-1">
                                <PrimaryButton onClick={() => { }}>
                                    Lanjutkan <Icon name="arrow" size={17} />
                                </PrimaryButton>
                            </div>
                        </form>
                    </section>
                )}

                {/* KONFIRMASI IDENTITAS */}
                {screen === 'confirm' && patient && (
                    <section className="mx-auto my-auto w-full max-w-[700px] rounded-3xl border border-white bg-white/90 p-5 shadow-lg sm:p-8">
                        <div className="mb-5 text-center">
                            <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-[#e6f4ea] text-[#067647]">
                                <Icon name="check" size={32} />
                            </span>
                            <h1 className="text-xl font-extrabold text-[#183b5b] sm:text-2xl">
                                Identitas Berhasil Dikenali
                            </h1>
                            <p className="mt-2 text-sm text-[#647990]">
                                Periksa kembali informasi pasien sebelum memulai pemeriksaan.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#e1e9f4] bg-white p-4 sm:p-5">
                            <div className="grid gap-4 sm:grid-cols-[72px_1fr] sm:items-center">
                                <div className="flex size-16 items-center justify-center rounded-xl bg-[#eaf1fd] text-[#175CD3]">
                                    <Icon name="user" size={34} />
                                </div>

                                <div>
                                    <p className="text-lg font-bold text-[#183b5b]">{patient.name}</p>
                                    <p className="text-xs text-[#647990]">
                                        Metode identifikasi: {sourceLabel[patient.source]}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#edf1f6] pt-4 text-sm">
                                <div>
                                    <p className="text-xs text-[#8291a5]">Nomor Identitas</p>
                                    <p className="mt-1 font-semibold text-[#183b5b]">{patient.nik}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#8291a5]">Tanggal Lahir</p>
                                    <p className="mt-1 font-semibold text-[#183b5b]">{dateLabel(patient.birthDate)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#8291a5]">Jenis Kelamin</p>
                                    <p className="mt-1 font-semibold text-[#183b5b]">{patient.gender}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#8291a5]">Status Identifikasi</p>
                                    <p className="mt-1 font-semibold text-[#067647]">Data ditemukan</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#eaf1fd] p-3 text-xs leading-relaxed text-[#365d94]">
                            <Icon name="info" size={17} />
                            Pastikan data pasien sudah sesuai. Setelah dikonfirmasi, Anda akan langsung masuk ke tahap pemeriksaan.
                        </div>

                        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                            <button
                                type="button"
                                onClick={goBack}
                                className="rounded-xl border border-[#175CD3] px-5 py-3 text-sm font-bold text-[#175CD3] hover:bg-[#eaf1fd]"
                            >
                                Identifikasi Ulang
                            </button>

                            <PrimaryButton
                                onClick={() => {
                                    if (!patient) return

                                    navigate('/user/skrining/pemeriksaan', {
                                        state: { patient },
                                    })
                                }}
                            >
                                Konfirmasi dan Mulai Pemeriksaan
                                <Icon name="arrow" size={18} />
                            </PrimaryButton>
                        </div>
                    </section>
                )}

                {/* UI PEMERIKSAAN SETELAH IDENTIFIKASI */}
                {screen === 'screening' && patient && (
                    <section className="mx-auto flex min-h-0 w-full max-w-[1050px] flex-1 flex-col justify-center py-3">
                        <div className="mb-5 shrink-0 text-center">
                            <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-[#eaf1fd] text-[#175CD3]">
                                <Icon name="camera" size={30} />
                            </span>

                            <h1 className="text-2xl font-extrabold text-[#183b5b] sm:text-3xl">
                                Pemeriksaan Awal Campak
                            </h1>

                            <p className="mt-2 text-sm text-[#647990]">
                                Halo, {patient.name}. Ikuti tahapan pemeriksaan melalui kios MeaslesCare.
                            </p>
                        </div>

                        <div className="grid min-h-0 gap-5 md:grid-cols-[1.1fr_0.9fr]">
                            {/* Area kamera */}
                            <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#a9c2e7] bg-white/85 p-5 sm:min-h-[260px]">
                                <span className="flex size-16 items-center justify-center rounded-2xl bg-[#eaf1fd] text-[#175CD3]">
                                    <Icon name="camera" size={36} />
                                </span>
                                <h2 className="mt-4 text-lg font-bold text-[#183b5b]">
                                    Pengambilan Foto Ruam
                                </h2>
                                <p className="mt-2 max-w-sm text-center text-xs leading-relaxed text-[#647990]">
                                    Posisikan area kulit yang ingin diperiksa di depan kamera sesuai petunjuk pada layar.
                                </p>
                                <span className="mt-4 rounded-full bg-[#fff4e5] px-3 py-1.5 text-xs font-semibold text-[#b54708]">
                                    Kamera belum terhubung
                                </span>
                            </div>

                            {/* Instruksi */}
                            <div className="flex min-h-0 flex-col rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
                                <div className="mb-4">
                                    <p className="text-xs font-bold tracking-wide text-[#175CD3]">
                                        LANGKAH 1 DARI 3
                                    </p>
                                    <h2 className="mt-1 text-lg font-bold text-[#183b5b]">
                                        Ambil Foto Area Kulit
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        'Pastikan area kulit terlihat jelas.',
                                        'Gunakan pencahayaan yang cukup.',
                                        'Ikuti arahan posisi pada layar kios.',
                                    ].map((item, index) => (
                                        <div key={item} className="flex items-start gap-3 text-sm text-[#647990]">
                                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#eaf1fd] text-xs font-bold text-[#175CD3]">
                                                {index + 1}
                                            </span>
                                            {item}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto pt-5">
                                    <button
                                        type="button"
                                        disabled
                                        title="Fitur kamera akan dihubungkan pada tahap integrasi perangkat"
                                        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#175CD3] px-5 py-3 text-sm font-bold text-white opacity-60"
                                    >
                                        <Icon name="camera" size={18} />
                                        Ambil Foto
                                    </button>
                                    <p className="mt-2 text-center text-[11px] text-[#8291a5]">
                                        Integrasi kamera akan dilakukan pada tahap berikutnya.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress pemeriksaan */}
                        <div className="mt-5 grid shrink-0 grid-cols-3 gap-2 sm:gap-4">
                            {[
                                { number: '01', title: 'Foto Ruam', active: true },
                                { number: '02', title: 'Pertanyaan Gejala', active: false },
                                { number: '03', title: 'Hasil Skrining', active: false },
                            ].map((step) => (
                                <div
                                    key={step.number}
                                    className={`rounded-xl border p-3 text-center ${step.active
                                            ? 'border-[#175CD3] bg-[#eaf1fd]'
                                            : 'border-[#e1e9f4] bg-white/75'
                                        }`}
                                >
                                    <p className={`text-xs font-bold ${step.active ? 'text-[#175CD3]' : 'text-[#8291a5]'}`}>
                                        {step.number}
                                    </p>
                                    <p className={`mt-1 text-xs font-semibold sm:text-sm ${step.active ? 'text-[#183b5b]' : 'text-[#647990]'}`}>
                                        {step.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <p className="mt-auto shrink-0 pt-3 text-center text-[10px] text-[#8291a5]">
                    MeaslesCare · Sistem Skrining Awal Campak
                </p>
            </div>
        </main>
    )
}
