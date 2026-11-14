
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface Patient {
  name: string
  nik: string
  birthDate: string
  gender: string
  source: 'rfid' | 'face' | 'manual'
}

type Step = 'photo' | 'temperature' | 'symptoms' | 'result'
type Answer = 'yes' | 'no' | ''

interface Symptoms {
  fever: Answer
  cough: Answer
  coryza: Answer
  conjunctivitis: Answer
  rash: Answer
  generalizedRash: Answer
  koplikSpots: Answer
  diarrhea: Answer
  breathingDifficulty: Answer
  seizure: Answer
  alteredConsciousness: Answer
}

const initialSymptoms: Symptoms = {
  fever: '',
  cough: '',
  coryza: '',
  conjunctivitis: '',
  rash: '',
  generalizedRash: '',
  koplikSpots: '',
  diarrhea: '',
  breathingDifficulty: '',
  seizure: '',
  alteredConsciousness: '',
}

const questions: {
  key: keyof Symptoms
  title: string
  description: string
  danger?: boolean
}[] = [
    {
      key: 'fever',
      title: 'Apakah pasien mengalami demam?',
      description: 'Pasien merasa suhu tubuh meningkat atau mengalami demam dalam beberapa hari terakhir.',
    },
    {
      key: 'cough',
      title: 'Apakah pasien mengalami batuk?',
      description: 'Batuk kering maupun berdahak.',
    },
    {
      key: 'coryza',
      title: 'Apakah pasien mengalami pilek?',
      description: 'Hidung berair atau tersumbat.',
    },
    {
      key: 'conjunctivitis',
      title: 'Apakah mata pasien tampak merah?',
      description: 'Mata merah, berair, atau mengalami iritasi.',
    },
    {
      key: 'rash',
      title: 'Apakah terdapat ruam pada kulit?',
      description: 'Bercak atau bintik kemerahan yang muncul pada kulit.',
    },
    {
      key: 'generalizedRash',
      title: 'Apakah ruam menyebar ke beberapa bagian tubuh?',
      description: 'Misalnya wajah, leher, badan, hingga anggota gerak.',
    },
    {
      key: 'koplikSpots',
      title: 'Apakah terdapat bintik putih di bagian dalam pipi?',
      description: 'Bintik putih kecil yang dikenal sebagai Koplik spots.',
    },
    {
      key: 'diarrhea',
      title: 'Apakah pasien mengalami diare?',
      description: 'Buang air besar lebih sering atau dengan konsistensi cair.',
    },
    {
      key: 'breathingDifficulty',
      title: 'Apakah pasien mengalami kesulitan bernapas?',
      description: 'Napas terasa berat, cepat, atau sesak.',
      danger: true,
    },
    {
      key: 'seizure',
      title: 'Apakah pasien mengalami kejang?',
      description: 'Gerakan tubuh tidak terkendali atau kehilangan kesadaran saat kejang.',
      danger: true,
    },
    {
      key: 'alteredConsciousness',
      title: 'Apakah kesadaran pasien menurun?',
      description: 'Pasien sulit dibangunkan, kebingungan berat, atau tidak merespons seperti biasa.',
      danger: true,
    },
  ]

function Icon({
  name,
  size = 20,
}: {
  name: 'camera' | 'back' | 'check' | 'thermometer' | 'alert' | 'arrow' | 'refresh' | 'info' | 'user' | 'shield'
  size?: number
}) {
  const common = {
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
    case 'camera':
      return (
        <svg {...common}>
          <path d="M4 7h3l1.5-2h7L17 7h3a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 4 7Z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
      )
    case 'back':
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6M9 12h12" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      )
    case 'thermometer':
      return (
        <svg {...common}>
          <path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0Z" />
          <path d="M12 11v6" />
        </svg>
      )
    case 'alert':
      return (
        <svg {...common}>
          <path d="M10.3 3.9 2.5 17.4A1.8 1.8 0 0 0 4 20h16a1.8 1.8 0 0 0 1.5-2.6L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      )
    case 'arrow':
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )
    case 'refresh':
      return (
        <svg {...common}>
          <path d="M20 7v5h-5M4 17v-5h5" />
          <path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3" />
        </svg>
      )
    case 'info':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 21c.5-4 2.8-6 7-6s6.5 2 7 6" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
  }
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
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#175CD3] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#124FB8] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function evaluateScreening(temperature: number, symptoms: Symptoms) {
  const hasFever = symptoms.fever === 'yes' || temperature >= 38

  const hasClinicalPattern =
    hasFever &&
    symptoms.generalizedRash === 'yes' &&
    (
      symptoms.cough === 'yes' ||
      symptoms.coryza === 'yes' ||
      symptoms.conjunctivitis === 'yes'
    )

  const dangerSigns =
    symptoms.breathingDifficulty === 'yes' ||
    symptoms.seizure === 'yes' ||
    symptoms.alteredConsciousness === 'yes'

  if (dangerSigns) {
    return {
      status: 'Perlu Penanganan Segera',
      category: 'danger',
      description:
        'Terdapat gejala tanda bahaya yang membutuhkan penilaian medis segera.',
      recommendation:
        'Segera bawa pasien ke fasilitas pelayanan kesehatan atau IGD. Jangan menunda pemeriksaan.',
    }
  }

  if (hasClinicalPattern) {
    return {
      status: 'Pola Gejala Mengarah ke Suspek Campak',
      category: 'warning',
      description:
        'Gejala yang dilaporkan sesuai dengan pola klinis suspek campak berdasarkan definisi surveilans.',
      recommendation:
        'Segera konsultasikan pasien ke tenaga kesehatan untuk pemeriksaan dan evaluasi lebih lanjut. Hindari kontak dekat dengan orang lain sementara waktu.',
    }
  }

  return {
    status: 'Pola Gejala Belum Memenuhi Kriteria Suspek',
    category: 'normal',
    description:
      'Data yang dimasukkan belum menunjukkan kombinasi gejala utama sesuai pola klinis suspek campak.',
    recommendation:
      'Tetap pantau kondisi pasien. Jika demam, ruam, atau gejala lain muncul atau memburuk, segera konsultasikan ke tenaga kesehatan.',
  }
}

export default function SkriningPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const patient = (
    location.state as { patient?: Patient } | null
  )?.patient

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [step, setStep] = useState<Step>('photo')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [temperature, setTemperature] = useState('')
  const [symptoms, setSymptoms] = useState<Symptoms>(initialSymptoms)

  const [cameraLoading, setCameraLoading] = useState(false)

  useEffect(() => {
    if (!patient) {
      navigate('/user/skrining/identifikasi', { replace: true })
    }
  }, [patient, navigate])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraActive(false)
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const startCamera = async () => {
    setCameraError('')
    setCameraLoading(true)

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          'Browser tidak mendukung akses kamera. Gunakan browser modern melalui HTTPS atau localhost.',
        )
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraActive(true)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Kamera tidak dapat diakses.'

      setCameraError(
        message.includes('Permission')
          ? 'Izin kamera ditolak. Aktifkan izin kamera melalui pengaturan browser.'
          : message,
      )
    } finally {
      setCameraLoading(false)
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas || !video.videoWidth) {
      setCameraError('Kamera belum siap. Coba aktifkan kamera kembali.')
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    setPhoto(canvas.toDataURL('image/jpeg', 0.88))
    stopCamera()
  }

  const retakePhoto = () => {
    setPhoto(null)
    setCameraError('')
  }

  const answeredCount = useMemo(
    () => Object.values(symptoms).filter((value) => value !== '').length,
    [symptoms],
  )

  const screeningResult = useMemo(() => {
    if (!temperature || Object.values(symptoms).some((value) => value === '')) {
      return null
    }

    return evaluateScreening(Number(temperature), symptoms)
  }, [temperature, symptoms])

  const updateAnswer = (key: keyof Symptoms, value: Answer) => {
    setSymptoms((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  const goBack = () => {
    if (step === 'temperature') {
      setStep('photo')
    } else if (step === 'symptoms') {
      setStep('temperature')
    } else if (step === 'result') {
      setStep('symptoms')
    }
  }

  const finishScreening = () => {
    if (!photo || !temperature || !screeningResult) return
    stopCamera()
    setStep('result')
  }

  if (!patient) return null

  const stepNumber = {
    photo: 1,
    temperature: 2,
    symptoms: 3,
    result: 4,
  }[step]

  const progress = step === 'result' ? 100 : (stepNumber / 3) * 100

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#f7faff] text-[#183b5b]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-36 -top-36 size-[340px] rounded-full bg-[#dce7ff]/55 blur-2xl" />
        <div className="absolute -top-48 left-[38%] h-[390px] w-[460px] rounded-[45%] bg-[#a4e9df]/45 blur-2xl" />
        <div className="absolute -right-36 top-[35%] size-[300px] rounded-full bg-[#b8eee8]/35 blur-2xl" />
        <div className="absolute -bottom-48 -left-20 h-[300px] w-[400px] rounded-full bg-[#9db6f5]/30 blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-none flex-col px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        {/* HEADER */}
        <header className="flex shrink-0 items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              stopCamera()
              if (step === 'photo') {
                navigate('/user/skrining/identifikasi')
              } else {
                goBack()
              }
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#647990] transition hover:text-[#175CD3]"
          >
            <Icon name="back" size={18} />
            {step === 'photo' ? 'Kembali' : 'Langkah Sebelumnya'}
          </button>

          <span className="rounded-full bg-white/85 px-3 py-2 text-xs font-semibold text-[#175CD3] shadow-sm">
            {step === 'result' ? 'Skrining Selesai' : `Tahap ${stepNumber} dari 3`}
          </span>
        </header>

        {/* PROGRESS TAHAP PEMERIKSAAN */}
        <div className="mx-auto mt-3 w-full max-w-none shrink-0">
          <div className="h-1.5 overflow-hidden rounded-full bg-[#dce6f3]">
            <div
              className="h-full rounded-full bg-[#175CD3] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {step !== 'result' && (
            <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#8291a5] sm:text-xs">
              <span className={step === 'photo' ? 'text-[#175CD3]' : ''}>Foto Ruam</span>
              <span className={step === 'temperature' ? 'text-[#175CD3]' : ''}>Suhu Tubuh</span>
              <span className={step === 'symptoms' ? 'text-[#175CD3]' : ''}>Gejala</span>
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden py-2">
          {/* STEP 1: CAMERA */}
          {step === 'photo' && (
            <section className="grid h-full min-h-0 grid-cols-1 gap-3 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white bg-[#10233c] shadow-lg">
                <div className="relative flex min-h-0 flex-1 items-center justify-center">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Foto ruam kulit pasien"
                      className="h-full max-h-[420px] w-full object-contain"
                    />
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className={`absolute inset-0 h-full w-full object-cover ${cameraActive ? 'block' : 'hidden'
                          }`}
                      />
                      {!cameraActive && (
                        <div className="px-6 text-center text-white">
                          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white/10 text-white">
                            <Icon name="camera" size={34} />
                          </span>
                          <p className="mt-4 text-base font-bold">Kamera belum aktif</p>
                          <p className="mt-1 text-xs text-white/65">
                            Aktifkan kamera untuk mengambil foto area kulit.
                          </p>
                        </div>
                      )}
                      {cameraActive && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="h-[65%] w-[70%] rounded-3xl border-2 border-dashed border-white/80 shadow-[0_0_0_999px_rgba(10,25,45,0.12)]" />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 bg-[#0b1c30] px-4 py-3">
                  <span className="text-xs text-white/70">
                    {photo ? 'Foto berhasil diambil' : cameraActive ? 'Kamera aktif' : 'Preview kamera'}
                  </span>
                  {photo ? (
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
                    >
                      <Icon name="refresh" size={15} />
                      Ambil Ulang
                    </button>
                  ) : cameraActive ? (
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#175CD3] hover:bg-[#eaf1fd]"
                    >
                      <Icon name="camera" size={16} />
                      Ambil Foto
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={cameraLoading}
                      className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#175CD3] hover:bg-[#eaf1fd] disabled:opacity-50"
                    >
                      <Icon name="camera" size={16} />
                      {cameraLoading ? 'Mengaktifkan...' : 'Aktifkan Kamera'}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white bg-white/90 p-4 shadow-sm sm:p-5">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf1fd] px-3 py-1.5 text-[10px] font-bold text-[#175CD3]">
                    <Icon name="camera" size={14} />
                    LANGKAH 1 · FOTO RUAM
                  </span>
                  <h1 className="mt-1 text-lg font-extrabold leading-tight sm:text-xl">
                    Ambil Foto Area Kulit
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-[#647990]">
                    Gunakan kamera untuk mengambil foto area kulit yang memiliki ruam atau bercak kemerahan.
                  </p>
                </div>

                <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                  {[
                    'Pastikan area kulit terlihat jelas.',
                    'Gunakan pencahayaan yang cukup.',
                    'Hindari bayangan dan foto yang buram.',
                    'Ambil foto dari jarak yang sesuai.',
                  ].map((item, index) => (
                    <div key={item} className="flex items-start gap-3 text-xs leading-snug text-[#647990]">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#eaf1fd] text-[11px] font-bold text-[#175CD3]">
                        {index + 1}
                      </span>
                      {item}
                    </div>
                  ))}
                </div>

                {cameraError && (
                  <div className="mt-4 rounded-xl border border-[#fecdca] bg-[#fef3f2] p-3 text-xs leading-relaxed text-[#b42318]">
                    {cameraError}
                  </div>
                )}

                <div className="shrink-0 pt-3">
                  <div className="mb-3 flex items-start gap-2 rounded-xl bg-[#f2f7ff] p-2.5 text-[10px] leading-snug text-[#526b8d]">
                    <Icon name="info" size={16} />
                    Foto hanya digunakan sebagai input awal. Analisis Computer Vision belum dihubungkan pada tahap ini.
                  </div>
                  <PrimaryButton
                    onClick={() => setStep('temperature')}
                    disabled={!photo}
                  >
                    Lanjut ke Pengukuran Suhu
                    <Icon name="arrow" size={17} />
                  </PrimaryButton>
                </div>
              </div>
            </section>
          )}

          {/* STEP 2: TEMPERATURE */}
          {step === 'temperature' && (
            <section className="mx-auto flex h-full min-h-0 w-full max-w-none flex-col overflow-hidden rounded-2xl border border-white bg-white/90 p-3 shadow-lg sm:p-4">
              <div className="flex shrink-0 items-center justify-center gap-3 text-center">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1fd] text-[#175CD3]">
                  <Icon name="thermometer" size={24} />
                </span>
                <div className="text-left">
                  <span className="inline-flex rounded-full bg-[#eaf1fd] px-3 py-1 text-[9px] font-bold text-[#175CD3]">
                    LANGKAH 2 · SUHU TUBUH
                  </span>
                  <h1 className="mt-1 text-lg font-extrabold leading-tight sm:text-xl">
                    Pengukuran Suhu Tubuh
                  </h1>
                  <p className="mt-1 text-xs leading-relaxed text-[#647990]">
                    Masukkan hasil pengukuran menggunakan termometer.
                  </p>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 items-center justify-center py-3">
                <div className="w-full max-w-xl shrink-0">
                  <label htmlFor="temperature" className="mb-2 block text-sm font-bold">
                    Suhu tubuh pasien
                  </label>
                  <div className="relative">
                    <input
                      id="temperature"
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="30"
                      max="45"
                      placeholder="Contoh: 38.2"
                      value={temperature}
                      onChange={(event) => setTemperature(event.target.value)}
                      className="w-full rounded-xl border border-[#d8e0ea] bg-white px-5 py-3 pr-16 text-center text-3xl font-extrabold text-[#183b5b] outline-none transition focus:border-[#175CD3] sm:py-4"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#647990]">
                      °C
                    </span>
                  </div>
                  <p className="mt-2 text-center text-xs text-[#8291a5]">
                    Masukkan angka sesuai hasil termometer.
                  </p>
                  {temperature && (
                    <div className={`mt-2 rounded-lg p-2 text-center text-xs font-semibold ${Number(temperature) >= 38
                        ? 'bg-[#fef3f2] text-[#b42318]'
                        : 'bg-[#e6f4ea] text-[#067647]'
                      }`}>
                      {Number(temperature) >= 38
                        ? 'Suhu berada pada 38°C atau lebih.'
                        : 'Suhu yang dimasukkan di bawah 38°C.'}
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 rounded-lg bg-[#fff8e8] p-2 text-[11px] leading-snug text-[#8a5b12]">
                <div className="flex items-start gap-2">
                  <Icon name="info" size={15} />
                  <span>Pengukuran suhu masih dilakukan secara manual. Integrasi sensor akan ditambahkan pada tahap pengembangan berikutnya.</span>
                </div>
              </div>

              <div className="mt-2 flex shrink-0 items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="min-h-10 rounded-xl border border-[#175CD3] px-5 py-2 text-sm font-bold text-[#175CD3] hover:bg-[#eaf1fd]"
                >
                  Kembali
                </button>
                <PrimaryButton
                  onClick={() => setStep('symptoms')}
                  disabled={
                    !temperature ||
                    Number(temperature) < 30 ||
                    Number(temperature) > 45
                  }
                >
                  Lanjut ke Pertanyaan Gejala
                  <Icon name="arrow" size={17} />
                </PrimaryButton>
              </div>
            </section>
          )}

          {/* STEP 3: QUESTIONNAIRE */}
          {step === 'symptoms' && (
            <section className="mx-auto flex h-full min-h-0 w-full max-w-none flex-col rounded-2xl border border-white bg-white/90 shadow-lg">
              <div className="shrink-0 border-b border-[#edf1f6] px-4 py-3 sm:px-5 sm:py-3">
                <span className="inline-flex rounded-full bg-[#eaf1fd] px-3 py-1.5 text-[10px] font-bold text-[#175CD3]">
                  LANGKAH 3 · KUESIONER GEJALA
                </span>
                <h1 className="mt-3 text-xl font-extrabold sm:text-2xl">
                  Pertanyaan Gejala Pasien
                </h1>
                <p className="mt-1 text-xs leading-snug text-[#647990]">
                  Jawab seluruh pertanyaan berdasarkan kondisi pasien saat ini.
                </p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#183b5b]">
                    {answeredCount} dari {questions.length} pertanyaan terjawab
                  </span>
                  <span className="font-bold text-[#175CD3]">
                    {Math.round((answeredCount / questions.length) * 100)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e6edf6]">
                  <div
                    className="h-full rounded-full bg-[#175CD3] transition-all"
                    style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-3 overflow-y-auto overscroll-contain p-3 sm:grid-cols-2 sm:gap-4 sm:p-4">
                {questions.map((question, index) => (
                  <div
                    key={question.key}
                    className={`flex min-h-[148px] flex-col justify-between rounded-xl border p-3 sm:min-h-[158px] sm:p-4 ${question.danger
                        ? 'border-[#fecdca] bg-[#fffafa]'
                        : 'border-[#e1e9f4] bg-white'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold tracking-wide text-[#8291a5]">
                          PERTANYAAN {index + 1}
                        </p>
                        <h2 className="mt-1 text-base font-bold leading-snug text-[#183b5b]">
                          {question.title}
                        </h2>
                        <p className="mt-1 text-[13px] leading-relaxed text-[#647990]">
                          {question.description}
                        </p>
                      </div>
                      {question.danger && (
                        <span className="shrink-0 rounded-full bg-[#fef3f2] px-2 py-1 text-[9px] font-bold text-[#b42318]">
                          Tanda bahaya
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {(['yes', 'no'] as const).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateAnswer(question.key, value)}
                          className={`min-h-12 rounded-xl border px-3 py-3 text-sm font-bold transition ${symptoms[question.key] === value
                              ? value === 'yes'
                                ? 'border-[#175CD3] bg-[#eaf1fd] text-[#175CD3]'
                                : 'border-[#067647] bg-[#e6f4ea] text-[#067647]'
                              : 'border-[#d8e0ea] bg-white text-[#647990] hover:border-[#175CD3]'
                            }`}
                        >
                          {value === 'yes' ? 'Ya' : 'Tidak'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="shrink-0 border-t border-[#edf1f6] px-3 py-2 sm:px-5">
                <p className="mb-2 text-[10px] leading-snug text-[#526b8d]">
                  Tanda bahaya seperti sesak napas, kejang, atau penurunan kesadaran memerlukan pertolongan medis segera.
                </p>
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={goBack}
                    className="min-h-10 rounded-xl border border-[#175CD3] px-5 py-2 text-sm font-bold text-[#175CD3] hover:bg-[#eaf1fd]"
                  >
                    Kembali
                  </button>
                  <PrimaryButton
                    onClick={finishScreening}
                    disabled={
                      answeredCount !== questions.length ||
                      !temperature ||
                      !photo
                    }
                  >
                    Selesaikan Skrining
                    <Icon name="arrow" size={17} />
                  </PrimaryButton>
                </div>
              </div>
            </section>
          )}

          {/* STEP 4: RESULT */}
          {step === 'result' && screeningResult && (
            <section className="mx-auto max-h-full w-full max-w-none overflow-y-auto rounded-3xl border border-white bg-white/95 p-5 shadow-lg sm:p-7">
              <div className="text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#eaf1fd] text-[#175CD3]">
                  <Icon name="shield" size={30} />
                </span>
                <p className="mt-3 text-[10px] font-bold tracking-wider text-[#175CD3]">
                  HASIL PEMERIKSAAN AWAL
                </p>
                <h1 className="mt-1 text-2xl font-extrabold">
                  Hasil Skrining MeaslesCare
                </h1>
                <p className="mt-1 text-xs text-[#647990]">
                  Hasil awal berdasarkan data yang telah dimasukkan.
                </p>
              </div>

              <div className={`mt-5 rounded-2xl border p-5 ${screeningResult.category === 'danger'
                  ? 'border-[#fecdca] bg-[#fef3f2]'
                  : screeningResult.category === 'warning'
                    ? 'border-[#fedf89] bg-[#fffaeb]'
                    : 'border-[#abefc6] bg-[#ecfdf3]'
                }`}>
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 ${screeningResult.category === 'danger'
                      ? 'text-[#b42318]'
                      : screeningResult.category === 'warning'
                        ? 'text-[#b54708]'
                        : 'text-[#067647]'
                    }`}>
                    <Icon name="alert" size={24} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#647990]">
                      Status skrining
                    </p>
                    <h2 className="mt-1 text-lg font-extrabold">
                      {screeningResult.status}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-[#526174]">
                      {screeningResult.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-2xl border border-[#e1e9f4] p-4">
                  <h3 className="text-sm font-bold">Ringkasan Pemeriksaan</h3>
                  <div className="mt-3 space-y-3 text-xs">
                    <div>
                      <p className="text-[#8291a5]">Suhu Tubuh</p>
                      <p className="mt-0.5 font-bold">{temperature} °C</p>
                    </div>
                    <div>
                      <p className="text-[#8291a5]">Foto Ruam</p>
                      <p className="mt-0.5 font-bold text-[#067647]">Berhasil diambil</p>
                    </div>
                  </div>
                  {photo && (
                    <img
                      src={photo}
                      alt="Dokumentasi foto ruam"
                      className="mt-4 aspect-video w-full rounded-xl object-cover"
                    />
                  )}
                </div>

                <div className="rounded-2xl border border-[#e1e9f4] p-4">
                  <h3 className="text-sm font-bold">Indikator Gejala</h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {questions.map((question) => (
                      <div
                        key={question.key}
                        className="flex items-center justify-between gap-2 rounded-xl bg-[#f7faff] px-3 py-2"
                      >
                        <span className="text-[11px] text-[#526174]">
                          {question.title.replace('Apakah pasien ', '').replace('Apakah terdapat ', '').replace('Apakah ruam ', '').replace('Apakah mata ', '')}
                        </span>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${symptoms[question.key] === 'yes'
                            ? question.danger
                              ? 'bg-[#fef3f2] text-[#b42318]'
                              : 'bg-[#fff4e5] text-[#b54708]'
                            : 'bg-[#e6f4ea] text-[#067647]'
                          }`}>
                          {symptoms[question.key] === 'yes' ? 'Ya' : 'Tidak'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#dbe7f5] bg-[#f2f7ff] p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#175CD3]">
                  <Icon name="info" size={17} />
                  Rekomendasi Tindak Lanjut
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#526b8d]">
                  {screeningResult.recommendation}
                </p>
              </div>

              <div className="mt-4 rounded-xl bg-[#f8fafc] p-3 text-[10px] leading-relaxed text-[#647990]">
                <strong>Catatan:</strong> Hasil ini merupakan skrining awal, bukan diagnosis medis. Pola gejala digunakan sebagai indikator untuk membantu menentukan tindak lanjut. Foto belum dianalisis oleh model Computer Vision. Penentuan diagnosis memerlukan pemeriksaan tenaga kesehatan.
              </div>

              <div className="mt-5 flex flex-col-reverse justify-between gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate('/user')}
                  className="rounded-xl border border-[#175CD3] px-5 py-3 text-sm font-bold text-[#175CD3] hover:bg-[#eaf1fd]"
                >
                  Kembali ke Beranda
                </button>
                <PrimaryButton
                  onClick={() => window.print()}
                >
                  Cetak Hasil
                </PrimaryButton>
              </div>
            </section>
          )}
        </div>

        <p className="shrink-0 pt-2 text-center text-[10px] text-[#8291a5]">
          MeaslesCare · Sistem Skrining Awal Campak
        </p>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </main>
  )
}
