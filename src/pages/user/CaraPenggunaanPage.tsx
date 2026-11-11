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
    description: 'Arahkan wajah / area kulit yang diminta ke kamera sesuai petunjuk di layar.',
    image: '/images/reference/step-camera.png',
    alt: 'Kamera pada perangkat kios MeaslesCare',
  },
  {
    number: 3,
    title: 'Isi Pertanyaan',
    description: 'Jawab beberapa pertanyaan terkait gejala yang Anda rasakan.',
    image: '/images/reference/step-questions.png',
    alt: 'Layar kios menampilkan checklist pertanyaan gejala',
  },
  {
    number: 4,
    title: 'Lihat Hasil',
    description: 'Dapatkan hasil skrining awal dan saran tindak lanjut.',
    image: '/images/reference/step-result.png',
    alt: 'Layar kios menampilkan tanda centang hasil skrining',
  },
]

const NOTES = [
  'Gunakan kartu yang sudah terdaftar.',
  'Ikuti petunjuk pada layar dengan runtut.',
  'Pastikan foto diambil dengan pencahayaan yang cukup dan sesuai arahan.',
]

function Arrow() {
  return (
    <div aria-hidden="true" className="hidden items-center justify-center text-[#0860F5] xl:flex">
      <svg viewBox="0 0 24 24" className="size-7" fill="none">
        <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export default function CaraPenggunaanPage() {
  return (
    <main className="relative min-h-[calc(100dvh-72px)] overflow-hidden bg-[linear-gradient(180deg,#fff_0%,#f2f6ff_55%,#fff_100%)]">
      <div className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 lg:px-12 lg:py-7">
        <header className="mb-7">
          <p className="text-sm font-bold tracking-wide text-[#0860F5]">CARA PENGGUNAAN</p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight text-[#101f59] sm:text-4xl lg:text-[42px]">
            Cara Menggunakan MeaslesCare
          </h1>
          <p className="mt-2 text-base text-[#354b78] sm:text-lg">
            Ikuti 4 langkah mudah berikut untuk melakukan skrining campak.
          </p>
        </header>

        <section aria-label="Empat langkah penggunaan MeaslesCare" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)_28px_minmax(0,1fr)_28px_minmax(0,1fr)]">
          {STEPS.map((step, index) => (
            <div key={step.number} className="contents">
              <article className="flex min-w-0 flex-col rounded-[28px] border border-white/90 bg-white/90 p-4 shadow-[0_5px_16px_rgba(31,91,190,0.10)] sm:p-5">
                <div className="flex min-h-11 items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0860F5] text-xl font-bold text-white shadow-sm shadow-blue-200">
                    {step.number}
                  </span>
                  <h2 className="text-lg font-bold leading-tight text-[#101f59] sm:text-xl">{step.title}</h2>
                </div>
                <img
                  src={step.image}
                  alt={step.alt}
                  className="mt-3 aspect-[320/228] w-full rounded-[18px] object-cover"
                  loading="lazy"
                />
                <p className="mt-4 flex-1 px-1 text-base leading-[1.5] text-[#354b78] sm:text-lg">
                  {step.description}
                </p>
              </article>
              {index < STEPS.length - 1 && <Arrow />}
            </div>
          ))}
        </section>

        <aside className="mt-8 rounded-[26px] bg-[#e7efff]/90 px-6 py-5 sm:px-9">
          <div className="grid gap-5 md:grid-cols-[minmax(260px,0.8fr)_2fr] md:items-center">
            <div className="flex items-center gap-4 border-b border-blue-200 pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-7">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#0860F5] text-[#0860F5]">
                <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden="true">
                  <path d="M12 10v6m0-9h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <h2 className="text-lg font-bold text-[#101f59] sm:text-xl">Hal yang Perlu Diperhatikan</h2>
            </div>
            <ul className="space-y-2">
              {NOTES.map((note) => (
                <li key={note} className="flex items-start gap-3 text-base text-[#243d73] sm:text-lg">
                  <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0 text-[#0860F5]" fill="none" aria-hidden="true">
                    <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-0 h-8 bg-[#dce9ff] [clip-path:ellipse(65%_100%_at_50%_100%)]" />
    </main>
  )
}
