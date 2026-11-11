
interface StepItem {
  number: number
  title: string
  description: string
  image: string
  alt: string
}

const STEPS: StepItem[] = [
  {
    number: 1,
    title: 'Tempelkan Kartu',
    description: 'Gunakan kartu yang telah terdaftar untuk memulai skrining.',
    image: '/images/reference/step-rfid.png',
    alt: 'Tangan menempelkan kartu RFID ke reader kios MeaslesCare',
  },
  {
    number: 2,
    title: 'Ambil Foto',
    description:
      'Arahkan wajah atau area kulit yang diminta ke kamera sesuai petunjuk di layar.',
    image: '/images/reference/step-camera.png',
    alt: 'Kamera pada perangkat kios MeaslesCare',
  },
  {
    number: 3,
    title: 'Isi Pertanyaan',
    description:
      'Jawab beberapa pertanyaan terkait gejala yang Anda rasakan.',
    image: '/images/reference/step-questions.png',
    alt: 'Layar kios menampilkan checklist pertanyaan gejala',
  },
  {
    number: 4,
    title: 'Lihat Hasil',
    description:
      'Dapatkan hasil skrining awal dan saran tindak lanjut.',
    image: '/images/reference/step-result.png',
    alt: 'Layar kios menampilkan tanda centang hasil skrining',
  },
]

function Arrow() {
  return (
    <div
      aria-hidden="true"
      className="hidden items-center justify-center text-[#0860F5] xl:flex"
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="none">
        <path
          d="m9 5 7 7-7 7"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export default function CaraPenggunaanPage() {
  return (
    <main className="relative -mt-[88px] h-dvh w-full overflow-hidden bg-[#f8faff] pt-[88px] max-lg:-mt-[72px] max-lg:h-auto max-lg:min-h-dvh max-lg:overflow-y-auto max-lg:pt-[72px]">

      {/* Background abstrak */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-36 -top-36 h-[340px] w-[340px] rounded-[42%_58%_55%_45%] bg-[#dce7ff]/45 blur-[3px]" />

        <div className="absolute -top-48 left-[35%] h-[370px] w-[450px] rotate-[-20deg] rounded-[38%_62%_55%_45%] bg-gradient-to-br from-[#a4e9df]/60 to-[#a5dce9]/50 blur-[3px]" />

        <div className="absolute -right-32 top-[38%] h-[240px] w-[300px] rounded-[45%_55%_60%_40%] bg-[#b8eee8]/40 blur-[3px]" />

        <div className="absolute -bottom-52 -left-28 h-[340px] w-[440px] rotate-12 rounded-[45%_55%_35%_65%] bg-gradient-to-br from-[#9db6f5]/45 to-[#c8d6ff]/35 blur-[3px]" />

        <div className="absolute -bottom-40 left-[43%] h-[220px] w-[320px] rounded-full bg-[#dce5ff]/40 blur-[3px]" />
      </div>

      {/* Konten utama */}
      <div className="relative z-10 mx-auto flex h-full min-h-0 max-w-[1600px] flex-col px-5 py-5 sm:px-8 lg:px-12 lg:py-6">

        {/* Judul halaman */}
        <header className="mb-6 shrink-0 lg:mb-7">
          <h1 className="text-[29px] font-extrabold leading-tight tracking-tight text-[#183b5b] sm:text-3xl lg:text-[34px]">
            Cara Menggunakan MeaslesCare
          </h1>

          <p className="mt-2 text-sm text-[#647990] sm:text-base">
            Ikuti 4 langkah mudah berikut untuk melakukan skrining campak.
          </p>
        </header>

        {/* Empat langkah penggunaan */}
        <section
          aria-label="Empat langkah penggunaan MeaslesCare"
          className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)_24px_minmax(0,1fr)_24px_minmax(0,1fr)] xl:gap-3"
        >
          {STEPS.map((step, index) => (
            <div key={step.number} className="contents">

              <article className="flex min-w-0 flex-col rounded-[22px] border border-white/90 bg-white/90 p-4 shadow-[0_5px_16px_rgba(31,91,190,0.08)] backdrop-blur-sm sm:p-5 xl:min-h-0">

                {/* Nomor dan judul */}
                <div className="flex min-h-10 shrink-0 items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0860F5] text-base font-bold text-white shadow-sm shadow-blue-200">
                    {step.number}
                  </span>

                  <h2 className="text-[15px] font-bold leading-tight text-[#183b5b] sm:text-base">
                    {step.title}
                  </h2>
                </div>

                {/* Gambar menggunakan ukuran dan rasio asli aset */}
                <img
                  src={step.image}
                  alt={step.alt}
                  className="mt-4 block h-auto w-full rounded-[15px]"
                  loading={index > 1 ? 'lazy' : 'eager'}
                />

                {/* Deskripsi */}
                <p className="mt-4 text-[13px] leading-[1.6] text-[#526b89] sm:text-sm">
                  {step.description}
                </p>
              </article>

              {index < STEPS.length - 1 && <Arrow />}
            </div>
          ))}
        </section>
      </div>

      {/* Dekorasi bawah */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 hidden h-5 bg-gradient-to-r from-[#9db6f5]/20 to-[#75ded2]/20 [clip-path:ellipse(65%_100%_at_50%_100%)] lg:block"
      />
    </main>
  )
}
