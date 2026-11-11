interface FungsiItem {
  title: string
  description: string
  image: string
  alt: string
}

const FUNGSI_ITEMS: FungsiItem[] = [
  {
    title: 'Mengenali Identitas Pasien',
    description: 'Pasien cukup menempelkan kartu yang telah terdaftar.',
    image: '/images/reference/function-identity.png',
    alt: 'Ikon kartu identitas pasien',
  },
  {
    title: 'Mengambil Foto Ruam Kulit',
    description: 'Mengambil foto area kulit untuk melihat kondisi ruam secara lebih jelas.',
    image: '/images/reference/function-camera.png',
    alt: 'Ikon kamera',
  },
  {
    title: 'Mengukur Suhu Tubuh',
    description: 'Mengukur suhu tubuh secara cepat dan tanpa kontak langsung.',
    image: '/images/reference/function-temperature.png',
    alt: 'Ikon termometer',
  },
  {
    title: 'Mencatat Gejala',
    description: 'Mengumpulkan informasi gejala yang dirasakan melalui pertanyaan sederhana.',
    image: '/images/reference/function-symptoms.png',
    alt: 'Ikon checklist gejala',
  },
  {
    title: 'Menampilkan Hasil Skrining',
    description: 'Memberikan hasil skrining awal beserta saran tindak lanjut.',
    image: '/images/reference/function-result.png',
    alt: 'Ikon centang hasil skrining',
  },
]

export default function FungsiAlatPage() {
  return (
    <main className="relative min-h-[calc(100dvh-88px)] overflow-hidden bg-[linear-gradient(120deg,#fff_0%,#f4f7ff_55%,#fff_100%)]">
      <div aria-hidden="true" className="absolute -left-24 top-44 -z-0 size-[500px] rounded-full bg-[radial-gradient(circle,#dbeafe_0%,transparent_70%)] opacity-60" />
      <div className="mx-auto max-w-[1600px] px-5 py-9 sm:px-8 lg:px-12 lg:py-12">
        <div className="grid items-center gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14">
          <section className="relative z-10">
            <p className="text-sm font-bold tracking-wide text-[#0860F5]">FUNGSI ALAT</p>
            <h1 className="mt-4 max-w-[620px] text-3xl font-extrabold leading-[1.13] text-[#101f59] sm:text-4xl lg:text-[42px]">
              Apa yang Bisa Dilakukan Kios MeaslesCare?
            </h1>
            <p className="mt-5 max-w-[620px] text-base leading-relaxed text-[#354b78] sm:text-lg">
              Kios skrining campak yang membantu proses pemeriksaan awal secara cepat, mudah, dan mandiri.
            </p>

            <div className="relative mt-7 flex justify-center lg:mt-8">
              <img
                src="/images/reference/kiosk-device-reference.png"
                alt="Perangkat kios MeaslesCare dengan kamera dan layar sentuh"
                className="h-[330px] w-auto max-w-full object-contain sm:h-[390px] lg:h-[450px]"
              />
            </div>
          </section>

          <section aria-label="Daftar fungsi kios MeaslesCare" className="relative z-10 flex flex-col gap-3.5">
            {FUNGSI_ITEMS.map((item) => (
              <article
                key={item.title}
                className="flex min-h-[112px] items-center gap-5 rounded-[24px] border border-white bg-white/90 px-4 py-3 shadow-[0_5px_16px_rgba(31,91,190,0.09)] sm:gap-7 sm:px-6"
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className="h-[76px] w-[116px] shrink-0 rounded-[16px] object-cover sm:h-[96px] sm:w-[146px]"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <h2 className="text-base font-bold leading-tight text-[#101f59] sm:text-xl">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#354b78] sm:text-base">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </main>
  )
}
