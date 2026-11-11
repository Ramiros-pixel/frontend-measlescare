import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/* ────────────── Slide data ────────────── */
interface HeroSlide {
  label: string
  title: string
  description: string
}

const SLIDES: HeroSlide[] = [
  {
    label: 'KIOS SKRINING CAMPAK',
    title: 'Deteksi dini campak, lebih cepat dan mudah.',
    description:
      'Lakukan skrining awal campak secara mandiri melalui kios MeaslesCare. Cukup gunakan kartu identitas, ambil foto ruam, dan isi gejala.',
  },
  {
    label: 'TEKNOLOGI IoT',
    title: 'Sensor canggih, hasil skrining lebih akurat.',
    description:
      'MeaslesCare menggunakan kamera dan sensor suhu infrared yang terhubung secara IoT untuk membantu mendeteksi gejala awal campak.',
  },
  {
    label: 'MANDIRI & CEPAT',
    title: 'Skrining tanpa antre, kapan saja.',
    description:
      'Cukup datang ke kios MeaslesCare di fasilitas publik terdekat. Ikuti petunjuk di layar sentuh, dan dapatkan hasil skrining awal Anda.',
  },
]

/* ────────────── Component ────────────── */
export default function BerandaPage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)

  const goNext = useCallback(() => setCurrent((p) => (p + 1) % SLIDES.length), [])
  const goPrev = useCallback(() => setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length), [])

  // Auto-advance every 6 seconds
  useEffect(() => {
    const id = setInterval(goNext, 6000)
    return () => clearInterval(id)
  }, [goNext])

  const slide = SLIDES[current]

  return (
    <main>
      {/* ═══════ Hero Section ═══════ */}
      <section className="relative isolate min-h-[620px] overflow-hidden lg:min-h-[calc(100dvh-88px)]">
        {/* Foto keramaian TransJakarta dari referensi desain, diposisikan di sisi kanan. */}
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 -z-20 w-full bg-cover bg-center lg:w-[68%]"
          style={{ backgroundImage: "url('/images/reference/jakarta-crowd-reference.jpg')" }}
        />

        {/* Perangkat yang sama dengan halaman Fungsi Alat; gambar dipotong dari PNG referensi. */}
        <img
          src="/images/reference/kiosk-device-reference.png"
          alt="Perangkat kios MeaslesCare"
          className="pointer-events-none absolute bottom-0 right-[2%] z-0 hidden h-[min(76%,560px)] w-auto object-contain lg:block"
        />

        {/* Overlay putih menjaga teks tetap terbaca seperti desain referensi. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.98) 27%, rgba(255,255,255,0.84) 43%, rgba(255,255,255,0.24) 65%, rgba(255,255,255,0.02) 100%)',
          }}
        />

        {/* Wave decoration at bottom */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10">
          <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" className="block h-20 w-full lg:h-28">
            <path d="M0 80 C 360 20, 720 120, 1080 60 S 1440 80, 1440 80 V 120 H 0 Z" fill="#e8f0fe" fillOpacity="0.7" />
            <path d="M0 90 C 400 40, 800 110, 1200 70 S 1440 90, 1440 90 V 120 H 0 Z" fill="#dbeafe" fillOpacity="0.5" />
          </svg>
        </div>

        {/* Content grid */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
          {/* Left column – text */}
          <div className="relative z-10 max-w-xl py-8 lg:py-16">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#0860F5]">
              {slide.label}
            </p>
            <h1
              className="mt-4 text-3xl font-extrabold leading-tight text-[#0a1f44] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
              key={`title-${current}`}
              style={{ animation: 'fadeUp 0.5s ease-out' }}
            >
              {slide.title}
            </h1>
            <p
              className="mt-5 text-base leading-relaxed text-[#4a5568] sm:text-lg"
              key={`desc-${current}`}
              style={{ animation: 'fadeUp 0.5s ease-out 0.1s both' }}
            >
              {slide.description}
            </p>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => navigate('/periksa')}
              className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-[#0860F5] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-[#074dd4] hover:shadow-xl hover:shadow-blue-200 active:scale-[0.97]"
            >
              {/* RFID icon */}
              <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
                <path d="M8 8a5.66 5.66 0 0 0 0 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 8a5.66 5.66 0 0 1 0 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M5.5 5.5a9.96 9.96 0 0 0 0 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M18.5 5.5a9.96 9.96 0 0 1 0 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Mulai Skrining
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 transition-transform group-hover:translate-x-1" aria-hidden>
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

        </div>

        {/* Carousel controls at bottom-right */}
        <div className="absolute bottom-8 right-8 z-10 flex items-center gap-3 lg:bottom-16 lg:right-16">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                className={`rounded-full transition-all ${
                  i === current
                    ? 'h-3 w-3 bg-[#0860F5]'
                    : 'h-3 w-3 bg-[#0860F5]/30 hover:bg-[#0860F5]/50'
                }`}
              />
            ))}
          </div>
          {/* Prev/Next */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Slide sebelumnya"
              className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition-colors hover:border-[#0860F5] hover:text-[#0860F5]"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Slide berikutnya"
              className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition-colors hover:border-[#0860F5] hover:text-[#0860F5]"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}

